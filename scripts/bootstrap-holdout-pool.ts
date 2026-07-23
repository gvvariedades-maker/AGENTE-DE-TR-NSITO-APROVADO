/**
 * Reserva ~10% das questões LT inéditas como holdout (Fase 5).
 * Determinístico por hash do id (não re-sorteia a cada run).
 *
 * Uso:
 *   npx tsx scripts/bootstrap-holdout-pool.ts --dry-run
 *   npx tsx scripts/bootstrap-holdout-pool.ts --apply --ratio 0.1
 *   npx tsx scripts/bootstrap-holdout-pool.ts --apply --reset-learning
 */
import { createHash } from "node:crypto";
import { config } from "dotenv";
import { and, eq, inArray, ne, sql } from "drizzle-orm";

config({ path: ".env.local" });

function parseArgs(argv: string[]) {
  const ratioIdx = argv.indexOf("--ratio");
  const ratio =
    ratioIdx >= 0 && argv[ratioIdx + 1]
      ? Number.parseFloat(argv[ratioIdx + 1])
      : 0.1;
  return {
    dryRun: !argv.includes("--apply"),
    resetLearning: argv.includes("--reset-learning"),
    ratio: Number.isFinite(ratio) && ratio > 0 && ratio < 1 ? ratio : 0.1,
  };
}

/** Fração estável 0–1 a partir do UUID (não depende de random). */
function stableUnit(id: string): number {
  const hex = createHash("sha256").update(id).digest("hex").slice(0, 8);
  return Number.parseInt(hex, 16) / 0xffffffff;
}

async function main() {
  const { dryRun, resetLearning, ratio } = parseArgs(process.argv.slice(2));
  const { getScriptDb, closeScriptDb } = await import("./script-db");
  const schema = await import("../src/lib/db/schema");
  const db = getScriptDb();

  if (resetLearning && !dryRun) {
    await db
      .update(schema.questions)
      .set({ assessmentPool: "learning" })
      .where(eq(schema.questions.assessmentPool, "holdout"));
  }

  const ltRows = await db
    .select({
      id: schema.questions.id,
      pool: schema.questions.assessmentPool,
    })
    .from(schema.questions)
    .innerJoin(schema.topics, eq(schema.questions.topicId, schema.topics.id))
    .where(
      and(
        eq(schema.topics.disciplina, "legislacao_transito"),
        sql`NOT (COALESCE(${schema.questions.tags}, '{}') && ARRAY['real_idecan']::text[])`,
      ),
    );

  const selected = ltRows
    .filter((r) => stableUnit(r.id) < ratio)
    .map((r) => r.id);

  let updated = 0;
  if (!dryRun && selected.length > 0) {
    const result = await db
      .update(schema.questions)
      .set({ assessmentPool: "holdout" })
      .where(
        and(
          inArray(schema.questions.id, selected),
          ne(schema.questions.assessmentPool, "holdout"),
        ),
      )
      .returning({ id: schema.questions.id });
    updated = result.length;
  }

  const poolCounts = await db
    .select({
      pool: schema.questions.assessmentPool,
      n: sql<number>`count(*)::int`,
    })
    .from(schema.questions)
    .innerJoin(schema.topics, eq(schema.questions.topicId, schema.topics.id))
    .where(eq(schema.topics.disciplina, "legislacao_transito"))
    .groupBy(schema.questions.assessmentPool);

  const report = {
    dryRun,
    ratio,
    ltTotal: ltRows.length,
    selectedHoldout: selected.length,
    updated: dryRun ? 0 : updated,
    poolsAfter: poolCounts,
    sampleIds: selected.slice(0, 8),
  };

  console.log(JSON.stringify(report, null, 2));
  await closeScriptDb();
}

main().catch(async (err) => {
  console.error(err);
  try {
    const { closeScriptDb } = await import("./script-db");
    await closeScriptDb();
  } catch {
    /* ignore */
  }
  process.exit(1);
});
