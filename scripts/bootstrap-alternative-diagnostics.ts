/**
 * Bootstrap de alternative_diagnostics a partir dos lotes LT validados.
 *
 * - Upsert misconceptions canônicas por slug IDECAN (`mech_*`)
 * - Para cada questão LT no DB (match por enunciado), cria linha por distrator
 *
 * Uso:
 *   npx tsx scripts/bootstrap-alternative-diagnostics.ts
 *   npx tsx scripts/bootstrap-alternative-diagnostics.ts --dry-run
 *   npx tsx scripts/bootstrap-alternative-diagnostics.ts --limit 50
 */
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { config } from "dotenv";
import { eq, sql } from "drizzle-orm";
import {
  LABEL_MECANISMO_DISTRATOR,
  MECANISMOS_DISTRATOR,
  type MecanismoDistrator,
} from "../src/lib/mecanismo-distrator-labels";
import { MECHANISM_SKILL_CODE } from "../src/lib/skills/catalog";
import {
  obterPasso2Mecanismos,
  passo2MecanismoPorLetra,
} from "../src/lib/validations/questao-mecanismo";
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

const MISCONCEPTION_SEED: Record<
  MecanismoDistrator,
  { name: string; mistaken: string; correct: string }
> = {
  numero_vizinho: {
    name: "Número vizinho",
    mistaken: "Troca o número legal por um vizinho plausível (prazo/valor/pontos).",
    correct: "Memorize o número exato do dispositivo — vizinhos são armadilha IDECAN.",
  },
  competencia_snt: {
    name: "Competência SNT",
    mistaken: "Atribui a competência ao órgão errado do Sistema Nacional de Trânsito.",
    correct: "Separe CONTRAN (normas), SENATRAN (execução federal) e DETRAN (estadual).",
  },
  gravidade: {
    name: "Gravidade trocada",
    mistaken: "Confunde a gravidade ou a pontuação da infração.",
    correct: "Grave ≠ gravíssima; confira art. 259 e a tipificação específica.",
  },
  regra_excecao: {
    name: "Regra/exceção inventada",
    mistaken: "Inventa requisito, exceção ou condição que a lei não traz.",
    correct: "Só vale o que está no texto legal — sem “quase” ou “exceto se”.",
  },
  termo_unico: {
    name: "Termo jurídico trocado",
    mistaken: "Troca um termo técnico por outro parecido (ex.: cassação × suspensão).",
    correct: "Cada termo tem regime próprio — não sinonimize.",
  },
};

type LoteQuestao = {
  enunciado: string;
  gabarito: string;
  alternativas: Record<string, string>;
  comentario?: { passo_a_passo?: string[] };
};

function parseArgs(argv: string[]) {
  const dryRun = argv.includes("--dry-run");
  const limitIdx = argv.indexOf("--limit");
  const limit =
    limitIdx >= 0 && argv[limitIdx + 1]
      ? Number.parseInt(argv[limitIdx + 1], 10)
      : undefined;
  return { dryRun, limit: Number.isFinite(limit) ? limit : undefined };
}

async function ensureMisconceptions(dryRun: boolean) {
  const {
    misconceptions,
  } = await import("../src/lib/db/schema");

  const idByCode = new Map<string, string>();

  for (const slug of MECANISMOS_DISTRATOR) {
    const code = `mech_${slug}`;
    const seed = MISCONCEPTION_SEED[slug];
    const [existing] = await scriptDb
      .select({ id: misconceptions.id, code: misconceptions.code })
      .from(misconceptions)
      .where(eq(misconceptions.code, code))
      .limit(1);

    if (existing) {
      idByCode.set(code, existing.id);
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] misconception ${code}`);
      idByCode.set(code, `dry-${code}`);
      continue;
    }

    const [created] = await scriptDb
      .insert(misconceptions)
      .values({
        code,
        name: seed.name,
        mistakenBelief: seed.mistaken,
        correctRule: seed.correct,
        skillCode: MECHANISM_SKILL_CODE[slug] ?? null,
        repairStrategyJson: {
          mechanism: slug,
          label: LABEL_MECANISMO_DISTRATOR[slug],
        },
        active: true,
      })
      .returning({ id: misconceptions.id });

    idByCode.set(code, created.id);
  }

  return idByCode;
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
        typeof (item as LoteQuestao).gabarito === "string" &&
        (item as LoteQuestao).alternativas
      ) {
        out.push(item as LoteQuestao);
      }
    }
  }
  return out;
}

async function main() {
  const { dryRun, limit } = parseArgs(process.argv.slice(2));
  const {
    alternativeDiagnostics,
    questions,
    topics,
  } = await import("../src/lib/db/schema");

  console.log(
    `Bootstrap alternative_diagnostics (LT)${dryRun ? " [dry-run]" : ""}${
      limit ? ` limit=${limit}` : ""
    }`,
  );

  const idByCode = await ensureMisconceptions(dryRun);
  const lotes = await loadLtQuestoes();
  console.log(`Lotes LT: ${lotes.length} questões no disco`);

  const dbRows = await scriptDb
    .select({
      id: questions.id,
      gabarito: questions.gabarito,
      enunciado: questions.enunciado,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .where(eq(topics.disciplina, "legislacao_transito"));

  const byEnunciado = new Map(
    dbRows.map((r) => [r.enunciado, { id: r.id, gabarito: r.gabarito }] as const),
  );
  console.log(`DB LT: ${byEnunciado.size} questões`);

  let matched = 0;
  let upserted = 0;
  let skipped = 0;
  const rowsToUpsert: Array<{
    questionId: string;
    alternative: string;
    misconceptionId: string | null;
    errorType: string;
    mechanismSlug: string;
    feedbackJson: Record<string, unknown>;
  }> = [];

  for (const q of lotes) {
    if (limit !== undefined && matched >= limit) break;

    const dbQ = byEnunciado.get(q.enunciado);
    if (!dbQ) {
      skipped++;
      continue;
    }

    matched++;
    const passo = q.comentario?.passo_a_passo ?? [];
    const passo2 = obterPasso2Mecanismos(passo) ?? "";
    const gabarito = (dbQ.gabarito || q.gabarito).trim().toUpperCase();
    const letras = Object.keys(q.alternativas).filter(
      (l) => l.toUpperCase() !== gabarito,
    );

    for (const letraRaw of letras) {
      const letra = letraRaw.toUpperCase();
      const mechanism =
        passo2MecanismoPorLetra(passo2, letra) ??
        passo2MecanismoPorLetra(passo2, letraRaw);
      if (!mechanism) continue;

      const code = `mech_${mechanism}`;
      const misconceptionId = idByCode.get(code) ?? null;
      const label =
        LABEL_MECANISMO_DISTRATOR[mechanism as MecanismoDistrator] ??
        mechanism;
      const seed = MISCONCEPTION_SEED[mechanism as MecanismoDistrator];
      const feedbackJson = {
        summary: `Alternativa ${letra}: caiu em «${label}».`,
        mechanism_label: label,
        mistaken_belief: seed?.mistaken,
        correct_rule: seed?.correct,
      };

      const mid =
        misconceptionId && !misconceptionId.startsWith("dry-")
          ? misconceptionId
          : null;

      rowsToUpsert.push({
        questionId: dbQ.id,
        alternative: letra,
        misconceptionId: mid,
        errorType: "pegadinha_idecan",
        mechanismSlug: mechanism,
        feedbackJson,
      });
      upserted++;
    }
  }

  if (!dryRun && rowsToUpsert.length > 0) {
    const CHUNK = 100;
    for (let i = 0; i < rowsToUpsert.length; i += CHUNK) {
      const chunk = rowsToUpsert.slice(i, i + CHUNK);
      await scriptDb
        .insert(alternativeDiagnostics)
        .values(chunk)
        .onConflictDoUpdate({
          target: [
            alternativeDiagnostics.questionId,
            alternativeDiagnostics.alternative,
          ],
          set: {
            misconceptionId: sql`excluded.misconception_id`,
            errorType: sql`excluded.error_type`,
            mechanismSlug: sql`excluded.mechanism_slug`,
            feedbackJson: sql`excluded.feedback_json`,
          },
        });
    }
  }

  const [{ count: totalDiag }] = dryRun
    ? [{ count: upserted }]
    : await scriptDb
        .select({ count: sql<number>`count(*)::int` })
        .from(alternativeDiagnostics);

  console.log(
    JSON.stringify(
      {
        matched,
        skippedNotInDb: skipped,
        diagnosticRowsUpserted: upserted,
        totalAlternativeDiagnostics: totalDiag,
        misconceptions: idByCode.size,
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
