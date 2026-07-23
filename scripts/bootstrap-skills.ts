/**
 * Bootstrap Fase 2 — skills + question_skills (LT).
 *
 * 1. Upsert skills dos microtópicos LT do edital (+ órfãos no DB)
 * 2. Upsert clusters finos de alto ROI (SNT, EAR, gravidade, …)
 * 3. Primary skill = tópico para todas as questões LT
 * 4. Piloto (--pilot N, default 40): secondary via eixos + transfer T0–T3
 * 5. Liga misconceptions.skill_id / skill_code quando houver mapeamento
 *
 * Uso:
 *   npx tsx scripts/bootstrap-skills.ts
 *   npx tsx scripts/bootstrap-skills.ts --dry-run
 *   npx tsx scripts/bootstrap-skills.ts --pilot 50
 *   npx tsx scripts/bootstrap-skills.ts --limit 20
 */
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";
import { EDITAL_TOPICS } from "./edital-topics";
import {
  FINE_SKILLS_LT,
  MECHANISM_SKILL_CODE,
  MICROTOPICO_WEIGHT_BOOST,
} from "../src/lib/skills/catalog";
import { mapQuestaoToSkillLinks } from "../src/lib/skills/map-questao-skills";
import { labelTopicoEdital } from "../src/lib/edital-topicos";
import { closeScriptDb, scriptDb } from "./script-db";

if (existsSync(".env.local")) {
  config({ path: ".env.local" });
} else {
  config();
}

const LT_DIR = join(
  process.cwd(),
  "content",
  "questoes",
  "legislacao_transito",
);

const DEFAULT_PILOT = 40;

type LoteQuestao = {
  enunciado: string;
  topico: string;
  dificuldade?: number;
  tags?: string[];
  fundamento_slug?: string;
  meta?: {
    eixos_legais?: string[];
    near_transfer?: string;
    far_transfer?: string;
  };
  estudo_reverso_visual?: { fundamento_slug?: string };
  estudo_reverso_visual_completo?: {
    fundamento_slug?: string;
    meta?: { eixos_legais?: string[] };
  };
};

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run");
  const limitIdx = argv.indexOf("--limit");
  const limit =
    limitIdx >= 0 && argv[limitIdx + 1]
      ? Number.parseInt(argv[limitIdx + 1], 10)
      : undefined;
  const pilotIdx = argv.indexOf("--pilot");
  const pilotRaw =
    pilotIdx >= 0 && argv[pilotIdx + 1]
      ? Number.parseInt(argv[pilotIdx + 1], 10)
      : DEFAULT_PILOT;
  const pilot = Number.isFinite(pilotRaw) ? pilotRaw : DEFAULT_PILOT;
  const skipPilot = argv.includes("--no-pilot");
  return {
    dryRun,
    limit: Number.isFinite(limit) ? limit : undefined,
    pilot: skipPilot ? 0 : Math.min(50, Math.max(0, pilot)),
  };
}

function extractEixos(q: LoteQuestao): string[] {
  const fromMeta = q.meta?.eixos_legais ?? [];
  const fromAula = q.estudo_reverso_visual_completo?.meta?.eixos_legais ?? [];
  return [...new Set([...fromMeta, ...fromAula])];
}

function extractFundamento(q: LoteQuestao): string | undefined {
  return (
    q.fundamento_slug ??
    q.estudo_reverso_visual_completo?.fundamento_slug ??
    q.estudo_reverso_visual?.fundamento_slug
  );
}

async function loadLtQuestoes(): Promise<LoteQuestao[]> {
  const files = (await readdir(LT_DIR))
    .filter((f) => f.endsWith(".json") && f.includes("lote") && !f.startsWith("_"))
    .sort();

  const out: LoteQuestao[] = [];
  for (const file of files) {
    const raw = await readFile(join(LT_DIR, file), "utf8");
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      continue;
    }
    if (!Array.isArray(parsed)) continue;
    for (const item of parsed) {
      if (
        item &&
        typeof item === "object" &&
        typeof (item as LoteQuestao).enunciado === "string" &&
        typeof (item as LoteQuestao).topico === "string"
      ) {
        out.push(item as LoteQuestao);
      }
    }
  }
  return out;
}

async function main() {
  const { dryRun, limit, pilot } = parseArgs(process.argv.slice(2));
  const {
    misconceptions,
    questionSkills,
    questions,
    skills,
    topics,
  } = await import("../src/lib/db/schema");

  console.log(
    `Bootstrap skills (LT)${dryRun ? " [dry-run]" : ""} pilot=${pilot}${
      limit !== undefined ? ` limit=${limit}` : ""
    }`,
  );

  const ltTopics = EDITAL_TOPICS.filter(
    (t) => t.disciplina === "legislacao_transito",
  );

  const dbTopics = await scriptDb
    .select({
      id: topics.id,
      nome: topics.nome,
      editalRef: topics.editalRef,
    })
    .from(topics)
    .where(eq(topics.disciplina, "legislacao_transito"));

  const topicByNome = new Map(dbTopics.map((t) => [t.nome, t]));

  // Skills a criar: edital + órfãos no DB + clusters
  const skillSeeds: Array<{
    code: string;
    topicId: string | null;
    name: string;
    kind: string;
    editalWeight: number;
  }> = [];

  for (const t of ltTopics) {
    const row = topicByNome.get(t.slug);
    skillSeeds.push({
      code: t.slug,
      topicId: row?.id ?? null,
      name: labelTopicoEdital(t.slug),
      kind: "microtopico",
      editalWeight: MICROTOPICO_WEIGHT_BOOST[t.slug] ?? 1,
    });
  }

  for (const row of dbTopics) {
    if (skillSeeds.some((s) => s.code === row.nome)) continue;
    skillSeeds.push({
      code: row.nome,
      topicId: row.id,
      name: labelTopicoEdital(row.nome),
      kind: "microtopico",
      editalWeight: MICROTOPICO_WEIGHT_BOOST[row.nome] ?? 1,
    });
  }

  for (const fine of FINE_SKILLS_LT) {
    const parent = topicByNome.get(fine.topicSlug);
    skillSeeds.push({
      code: fine.code,
      topicId: parent?.id ?? null,
      name: fine.name,
      kind: fine.kind,
      editalWeight: fine.editalWeight,
    });
  }

  const skillIdByCode = new Map<string, string>();

  for (const seed of skillSeeds) {
    const [existing] = await scriptDb
      .select({ id: skills.id, code: skills.code })
      .from(skills)
      .where(eq(skills.code, seed.code))
      .limit(1);

    if (existing) {
      skillIdByCode.set(seed.code, existing.id);
      if (!dryRun) {
        await scriptDb
          .update(skills)
          .set({
            topicId: seed.topicId,
            name: seed.name,
            kind: seed.kind,
            editalWeight: seed.editalWeight,
            active: true,
          })
          .where(eq(skills.id, existing.id));
      }
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] skill ${seed.code} (${seed.kind})`);
      skillIdByCode.set(seed.code, `dry-${seed.code}`);
      continue;
    }

    const [created] = await scriptDb
      .insert(skills)
      .values({
        code: seed.code,
        topicId: seed.topicId,
        name: seed.name,
        kind: seed.kind,
        editalWeight: seed.editalWeight,
        active: true,
      })
      .returning({ id: skills.id });
    skillIdByCode.set(seed.code, created.id);
  }

  console.log(`Skills upserted/known: ${skillIdByCode.size}`);

  // Misconceptions → skill_id
  let misconceptionsLinked = 0;
  for (const [mech, skillCode] of Object.entries(MECHANISM_SKILL_CODE)) {
    const code = `mech_${mech}`;
    const skillId = skillIdByCode.get(skillCode);
    if (!skillId || skillId.startsWith("dry-")) continue;

    const [row] = await scriptDb
      .select({ id: misconceptions.id })
      .from(misconceptions)
      .where(eq(misconceptions.code, code))
      .limit(1);
    if (!row) continue;

    if (!dryRun) {
      await scriptDb
        .update(misconceptions)
        .set({ skillCode, skillId })
        .where(eq(misconceptions.id, row.id));
    }
    misconceptionsLinked++;
  }

  const lotes = await loadLtQuestoes();
  const dbRows = await scriptDb
    .select({
      id: questions.id,
      enunciado: questions.enunciado,
      topicNome: topics.nome,
      tags: questions.tags,
      dificuldade: questions.dificuldade,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .where(eq(topics.disciplina, "legislacao_transito"));

  const byEnunciado = new Map(
    dbRows.map((r) => [
      r.enunciado,
      {
        id: r.id,
        topicNome: r.topicNome,
        tags: r.tags ?? [],
        dificuldade: r.dificuldade,
      },
    ] as const),
  );

  let matched = 0;
  let primaryLinks = 0;
  let secondaryLinks = 0;
  let pilotCount = 0;
  let skipped = 0;
  let coverageOnly = 0;
  const rowsToUpsert: Array<{
    questionId: string;
    skillId: string;
    role: string;
    weight: number;
    transferLevel: string;
  }> = [];
  const linkedQuestionIds = new Set<string>();

  async function ensureSkillId(code: string): Promise<string | null> {
    const existing = skillIdByCode.get(code);
    if (existing && !existing.startsWith("dry-")) return existing;
    if (dryRun) {
      skillIdByCode.set(code, `dry-${code}`);
      return null;
    }
    const topicRow = topicByNome.get(code);
    const [created] = await scriptDb
      .insert(skills)
      .values({
        code,
        topicId: topicRow?.id ?? null,
        name: labelTopicoEdital(code),
        kind: "microtopico",
        editalWeight: MICROTOPICO_WEIGHT_BOOST[code] ?? 1,
        active: true,
      })
      .onConflictDoNothing()
      .returning({ id: skills.id });
    if (created) {
      skillIdByCode.set(code, created.id);
      return created.id;
    }
    const [again] = await scriptDb
      .select({ id: skills.id })
      .from(skills)
      .where(eq(skills.code, code))
      .limit(1);
    if (again) {
      skillIdByCode.set(code, again.id);
      return again.id;
    }
    return null;
  }

  for (const q of lotes) {
    if (limit !== undefined && matched >= limit) break;

    const dbQ = byEnunciado.get(q.enunciado);
    if (!dbQ) {
      skipped++;
      continue;
    }

    matched++;
    const isPilot = pilot > 0 && pilotCount < pilot;
    if (isPilot) pilotCount++;

    const input = {
      topico: dbQ.topicNome || q.topico,
      dificuldade: q.dificuldade ?? dbQ.dificuldade,
      tags: q.tags?.length ? q.tags : dbQ.tags,
      eixosLegais: extractEixos(q),
      fundamentoSlug: extractFundamento(q),
      hasNearTransfer: Boolean(q.meta?.near_transfer),
      hasFarTransfer: Boolean(q.meta?.far_transfer),
    };

    const links = mapQuestaoToSkillLinks(input, {
      includeSecondary: isPilot,
      pilotTransfer: isPilot,
    });

    for (const link of links) {
      if (link.role === "primary") {
        await ensureSkillId(link.skillCode);
      }
      const resolved = skillIdByCode.get(link.skillCode);
      if (!resolved || resolved.startsWith("dry-")) continue;

      rowsToUpsert.push({
        questionId: dbQ.id,
        skillId: resolved,
        role: link.role,
        weight: link.weight,
        transferLevel: link.transferLevel,
      });
      if (link.role === "primary") primaryLinks++;
      else secondaryLinks++;
    }
    linkedQuestionIds.add(dbQ.id);
  }

  // Cobertura mínima: LT no DB sem match de enunciado no disco → só primary do tópico
  if (limit === undefined) {
    for (const row of dbRows) {
      if (linkedQuestionIds.has(row.id)) continue;
      await ensureSkillId(row.topicNome);
      const skillId = skillIdByCode.get(row.topicNome);
      if (!skillId || skillId.startsWith("dry-")) continue;
      rowsToUpsert.push({
        questionId: row.id,
        skillId,
        role: "primary",
        weight: 1,
        transferLevel: "T1",
      });
      primaryLinks++;
      coverageOnly++;
      linkedQuestionIds.add(row.id);
    }
  }

  if (!dryRun && rowsToUpsert.length > 0) {
    const CHUNK = 100;
    for (let i = 0; i < rowsToUpsert.length; i += CHUNK) {
      const chunk = rowsToUpsert.slice(i, i + CHUNK);
      await scriptDb
        .insert(questionSkills)
        .values(chunk)
        .onConflictDoUpdate({
          target: [questionSkills.questionId, questionSkills.skillId],
          set: {
            role: sql`excluded.role`,
            weight: sql`excluded.weight`,
            transferLevel: sql`excluded.transfer_level`,
          },
        });
    }
  }

  const [{ count: totalQs }] = dryRun
    ? [{ count: primaryLinks }]
    : await scriptDb
        .select({ count: sql<number>`count(*)::int` })
        .from(questionSkills)
        .where(eq(questionSkills.role, "primary"));

  console.log(
    JSON.stringify(
      {
        skills: skillIdByCode.size,
        matched,
        skippedNotInDb: skipped,
        coverageOnlyFromDb: coverageOnly,
        primaryLinks,
        secondaryLinks,
        pilotEnriched: pilotCount,
        misconceptionsLinked,
        questionSkillsPrimaryInDb: totalQs,
        dryRun,
      },
      null,
      2,
    ),
  );

  await closeScriptDb();
}

main().catch(async (err) => {
  console.error(err);
  await closeScriptDb();
  process.exit(1);
});
