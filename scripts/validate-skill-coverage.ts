/**
 * Valida cobertura de skills em Legislação de Trânsito.
 *
 * Disco (default): % questões LT com primary mapeável (= topico) + gaps por microtópico edital.
 * DB (--db): % questões LT no banco com ≥1 question_skills.role = primary.
 *
 * Uso:
 *   npx tsx scripts/validate-skill-coverage.ts
 *   npx tsx scripts/validate-skill-coverage.ts --db
 *   npx tsx scripts/validate-skill-coverage.ts --min-primary 0.95
 */
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "dotenv";
import { EDITAL_TOPICS } from "./edital-topics";
import { FINE_SKILLS_LT } from "../src/lib/skills/catalog";
import {
  mapQuestaoToSkillLinks,
  matchFineSkills,
} from "../src/lib/skills/map-questao-skills";

const LT_DIR = join(
  process.cwd(),
  "content",
  "questoes",
  "legislacao_transito",
);

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
  const useDb = argv.includes("--db");
  const minIdx = argv.indexOf("--min-primary");
  const minPrimary =
    minIdx >= 0 && argv[minIdx + 1]
      ? Number.parseFloat(argv[minIdx + 1])
      : 0.95;
  return {
    useDb,
    minPrimary: Number.isFinite(minPrimary) ? minPrimary : 0.95,
  };
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

async function validateDisk(minPrimary: number): Promise<number> {
  const ltEdital = EDITAL_TOPICS.filter(
    (t) => t.disciplina === "legislacao_transito",
  );
  const editalSlugs = new Set(ltEdital.map((t) => t.slug));
  const lotes = await loadLtQuestoes();

  const byTopico = new Map<string, number>();
  let withPrimary = 0;
  let withFineSecondary = 0;
  const orphanTopicos = new Set<string>();

  for (const q of lotes) {
    byTopico.set(q.topico, (byTopico.get(q.topico) ?? 0) + 1);
    if (!editalSlugs.has(q.topico)) orphanTopicos.add(q.topico);

    const links = mapQuestaoToSkillLinks(
      {
        topico: q.topico,
        dificuldade: q.dificuldade,
        tags: q.tags,
        eixosLegais: extractEixos(q),
        fundamentoSlug: extractFundamento(q),
        hasNearTransfer: Boolean(q.meta?.near_transfer),
        hasFarTransfer: Boolean(q.meta?.far_transfer),
      },
      { includeSecondary: true, pilotTransfer: false },
    );

    if (links.some((l) => l.role === "primary" && l.skillCode === q.topico)) {
      withPrimary++;
    }
    if (matchFineSkills({
      topico: q.topico,
      tags: q.tags,
      eixosLegais: extractEixos(q),
      fundamentoSlug: extractFundamento(q),
    }).length > 0) {
      withFineSecondary++;
    }
  }

  const pct = lotes.length === 0 ? 0 : withPrimary / lotes.length;
  const gapsEdital = ltEdital
    .filter((t) => (byTopico.get(t.slug) ?? 0) === 0)
    .map((t) => t.slug);

  const report = {
    mode: "disk",
    totalQuestoes: lotes.length,
    comPrimaryMapeavel: withPrimary,
    pctPrimary: Number((pct * 100).toFixed(2)),
    comMatchClusterFino: withFineSecondary,
    fineSkillsCatalog: FINE_SKILLS_LT.length,
    microtopicosEdital: ltEdital.length,
    gapsEditalSemQuestoes: gapsEdital,
    orphanTopicos: [...orphanTopicos].sort(),
    contagemPorTopico: Object.fromEntries(
      [...byTopico.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    ),
    minPrimaryRequired: minPrimary,
    ok: pct >= minPrimary,
  };

  console.log(JSON.stringify(report, null, 2));
  return report.ok ? 0 : 1;
}

async function validateDb(minPrimary: number): Promise<number> {
  if (existsSync(".env.local")) {
    config({ path: ".env.local" });
  } else {
    config();
  }

  const { eq, sql } = await import("drizzle-orm");
  const { closeScriptDb, scriptDb } = await import("./script-db");
  const { questionSkills, questions, skills, topics } = await import(
    "../src/lib/db/schema"
  );
  const { EDITAL_TOPICS: topicsEdital } = await import("./edital-topics");

  try {
    const ltQuestions = await scriptDb
      .select({
        id: questions.id,
        topicNome: topics.nome,
      })
      .from(questions)
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(eq(topics.disciplina, "legislacao_transito"));

    const withPrimary = await scriptDb
      .select({
        questionId: questionSkills.questionId,
      })
      .from(questionSkills)
      .innerJoin(questions, eq(questionSkills.questionId, questions.id))
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(
        sql`${topics.disciplina} = 'legislacao_transito' AND ${questionSkills.role} = 'primary'`,
      );

    const primarySet = new Set(withPrimary.map((r) => r.questionId));
    const covered = ltQuestions.filter((q) => primarySet.has(q.id)).length;
    const pct =
      ltQuestions.length === 0 ? 0 : covered / ltQuestions.length;

    const byTopico = new Map<string, { total: number; withPrimary: number }>();
    for (const q of ltQuestions) {
      const cur = byTopico.get(q.topicNome) ?? { total: 0, withPrimary: 0 };
      cur.total++;
      if (primarySet.has(q.id)) cur.withPrimary++;
      byTopico.set(q.topicNome, cur);
    }

    const ltEdital = topicsEdital.filter(
      (t) => t.disciplina === "legislacao_transito",
    );
    const gaps = ltEdital
      .filter((t) => (byTopico.get(t.slug)?.withPrimary ?? 0) === 0)
      .map((t) => t.slug);

    const [{ count: skillCount }] = await scriptDb
      .select({ count: sql<number>`count(*)::int` })
      .from(skills)
      .where(eq(skills.active, true));

    const report = {
      mode: "db",
      totalQuestoesLt: ltQuestions.length,
      comPrimarySkill: covered,
      pctPrimary: Number((pct * 100).toFixed(2)),
      skillsAtivas: skillCount,
      gapsEditalSemPrimary: gaps,
      minPrimaryRequired: minPrimary,
      ok: pct >= minPrimary,
    };

    console.log(JSON.stringify(report, null, 2));
    return report.ok ? 0 : 1;
  } finally {
    await closeScriptDb();
  }
}

async function main() {
  const { useDb, minPrimary } = parseArgs(process.argv.slice(2));
  const code = useDb
    ? await validateDb(minPrimary)
    : await validateDisk(minPrimary);
  process.exit(code);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
