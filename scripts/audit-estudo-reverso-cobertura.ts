/**
 * Audita cobertura de estudo_reverso_visual no banco e nos JSONs locais.
 * Prioriza retrofit por volume de tentativas (Legislação de Trânsito primeiro).
 *
 * Uso: npx tsx scripts/audit-estudo-reverso-cobertura.ts
 */
import "dotenv/config";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = join(ROOT, "content/questoes");

const METAS_MVP: Record<string, number> = {
  legislacao_transito: 360,
  portugues: 80,
  direito_administrativo: 50,
  direito_constitucional: 50,
  informatica: 40,
  historia_cg_pb: 40,
  legislacao_etica_sp: 40,
};

function auditarJsonLocal() {
  const porDisciplina: Record<
    string,
    { total: number; comVisual: number; semVisual: number }
  > = {};

  for (const disciplina of readdirSync(CONTENT_DIR)) {
    const dir = join(CONTENT_DIR, disciplina);
    if (!existsSync(dir)) continue;

    let total = 0;
    let comVisual = 0;

    for (const arquivo of readdirSync(dir)) {
      if (!arquivo.endsWith(".json") || arquivo.startsWith("_")) continue;
      const raw = readFileSync(join(dir, arquivo), "utf8");
      const parsed = JSON.parse(raw) as unknown;
      const lista = Array.isArray(parsed) ? parsed : [parsed];
      for (const q of lista) {
        if (!q || typeof q !== "object") continue;
        const questao = q as { estudo_reverso_visual?: unknown };
        total += 1;
        if (
          questao.estudo_reverso_visual &&
          typeof questao.estudo_reverso_visual === "object"
        ) {
          comVisual += 1;
        }
      }
    }

    if (total > 0) {
      porDisciplina[disciplina] = {
        total,
        comVisual,
        semVisual: total - comVisual,
      };
    }
  }

  return porDisciplina;
}

async function auditarBanco() {
  const { sql, eq, isNull, desc } = await import("drizzle-orm");
  const { db } = await import("../src/lib/db");
  const { attempts, questions, topics } = await import("../src/lib/db/schema");

  const [totais] = await db
    .select({
      total: sql<number>`count(*)::int`,
      comVisual: sql<number>`count(*) filter (where ${questions.estudoReversoVisualJson} is not null)::int`,
    })
    .from(questions);

  const semVisual = await db
    .select({
      id: questions.id,
      enunciado: sql<string>`left(${questions.enunciado}, 80)`,
      topico: topics.nome,
      disciplina: topics.disciplina,
      tentativas: sql<number>`count(${attempts.id})::int`,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .leftJoin(attempts, eq(attempts.questionId, questions.id))
    .where(isNull(questions.estudoReversoVisualJson))
    .groupBy(questions.id, questions.enunciado, topics.nome, topics.disciplina)
    .orderBy(desc(sql`count(${attempts.id})`))
    .limit(25);

  return {
    total: totais?.total ?? 0,
    comVisual: totais?.comVisual ?? 0,
    semVisual: (totais?.total ?? 0) - (totais?.comVisual ?? 0),
    prioridadeRetrofit: semVisual,
  };
}

async function main() {
  console.log("=== Auditoria estudo reverso visual ===\n");

  const local = auditarJsonLocal();
  console.log("--- JSON local (content/questoes) ---");
  for (const [disc, stats] of Object.entries(local)) {
    const meta = METAS_MVP[disc];
    const pct = Math.round((stats.comVisual / stats.total) * 100);
    console.log(
      `${disc}: ${stats.comVisual}/${stats.total} com visual (${pct}%)` +
        (meta ? ` | meta MVP: ${meta}` : ""),
    );
  }

  try {
    const banco = await auditarBanco();
    console.log("\n--- Banco (questions) ---");
    console.log(
      `Total: ${banco.total} | com visual JSON: ${banco.comVisual} | sem visual: ${banco.semVisual}`,
    );

    if (banco.prioridadeRetrofit.length > 0) {
      console.log("\n--- Top 25 para retrofit (por tentativas) ---");
      for (const row of banco.prioridadeRetrofit) {
        console.log(
          `[${row.disciplina}] ${row.topico} | ${row.tentativas} tentativas | ${row.enunciado}…`,
        );
      }
    }
  } catch (err) {
    console.warn(
      "\nBanco indisponível (configure DATABASE_URL):",
      err instanceof Error ? err.message : err,
    );
  }

  console.log("\nPróximo passo: gerar lote com examinador-idecan + estudo-reverso-visual");
  console.log("Validar: npm run validate:estudo-reverso-visual -- content/questoes/...");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
