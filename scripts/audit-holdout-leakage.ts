/**
 * Auditoria de vazamento de holdout (Fase 5).
 *
 * Verifica se questões `assessment_pool = 'holdout'` aparecem em:
 * - study_sessions.planned_question_ids (sessões abertas / recentes)
 * - attempts com modo estudo/missão (exceto desafio holdout explícito)
 * - srs_cards ativos (repetição comum)
 *
 * Uso:
 *   npx tsx scripts/audit-holdout-leakage.ts
 *   npx tsx scripts/audit-holdout-leakage.ts --days 30
 *   npx tsx scripts/audit-holdout-leakage.ts --strict
 */
import { config } from "dotenv";
import { and, eq, gte, inArray, sql } from "drizzle-orm";

config({ path: ".env.local" });

function parseArgs(argv: string[]) {
  const daysIdx = argv.indexOf("--days");
  const days =
    daysIdx >= 0 && argv[daysIdx + 1]
      ? Number.parseInt(argv[daysIdx + 1], 10)
      : 90;
  return {
    days: Number.isFinite(days) && days > 0 ? days : 90,
    strict: argv.includes("--strict"),
  };
}

async function main() {
  const { days, strict } = parseArgs(process.argv.slice(2));
  const { getScriptDb, closeScriptDb } = await import("./script-db");
  const schema = await import("../src/lib/db/schema");
  const db = getScriptDb();

  const holdoutRows = await db
    .select({ id: schema.questions.id })
    .from(schema.questions)
    .where(eq(schema.questions.assessmentPool, "holdout"));

  const holdoutIds = holdoutRows.map((r) => r.id);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const report: {
    holdoutCount: number;
    days: number;
    leaks: {
      studySessions: Array<{ sessionId: string; userId: string; questionId: string }>;
      attemptsEstudo: Array<{ attemptId: string; userId: string; questionId: string; modo: string }>;
      srsCards: Array<{ cardId: string; userId: string; questionId: string }>;
    };
    ok: boolean;
  } = {
    holdoutCount: holdoutIds.length,
    days,
    leaks: {
      studySessions: [],
      attemptsEstudo: [],
      srsCards: [],
    },
    ok: true,
  };

  if (holdoutIds.length === 0) {
    console.log(
      JSON.stringify(
        {
          ...report,
          message:
            "Nenhuma questão holdout no banco — pool ainda não reservado (ok estrutural).",
        },
        null,
        2,
      ),
    );
    await closeScriptDb();
    process.exit(0);
    return;
  }

  const sessions = await db
    .select({
      id: schema.studySessions.id,
      userId: schema.studySessions.userId,
      plannedQuestionIds: schema.studySessions.plannedQuestionIds,
      startedAt: schema.studySessions.startedAt,
    })
    .from(schema.studySessions)
    .where(gte(schema.studySessions.startedAt, since));

  const holdoutSet = new Set(holdoutIds);
  for (const s of sessions) {
    for (const qid of s.plannedQuestionIds ?? []) {
      if (holdoutSet.has(qid)) {
        report.leaks.studySessions.push({
          sessionId: s.id,
          userId: s.userId,
          questionId: qid,
        });
      }
    }
  }

  const attemptRows = await db
    .select({
      id: schema.attempts.id,
      userId: schema.attempts.userId,
      questionId: schema.attempts.questionId,
      modo: schema.attempts.modo,
    })
    .from(schema.attempts)
    .where(
      and(
        inArray(schema.attempts.questionId, holdoutIds),
        gte(schema.attempts.createdAt, since),
        sql`${schema.attempts.modo} IN ('estudo', 'missao', 'auto', 'normal', 'revisoes', 'erros', 'pegadinha')`,
      ),
    );

  for (const a of attemptRows) {
    report.leaks.attemptsEstudo.push({
      attemptId: a.id,
      userId: a.userId,
      questionId: a.questionId,
      modo: a.modo,
    });
  }

  const srsRows = await db
    .select({
      id: schema.srsCards.id,
      userId: schema.srsCards.userId,
      questionId: schema.srsCards.questionId,
    })
    .from(schema.srsCards)
    .where(inArray(schema.srsCards.questionId, holdoutIds));

  for (const c of srsRows) {
    report.leaks.srsCards.push({
      cardId: c.id,
      userId: c.userId,
      questionId: c.questionId,
    });
  }

  const leakCount =
    report.leaks.studySessions.length +
    report.leaks.attemptsEstudo.length +
    report.leaks.srsCards.length;
  report.ok = leakCount === 0;

  console.log(JSON.stringify(report, null, 2));

  await closeScriptDb();

  if (!report.ok && strict) {
    process.exit(1);
  }
  process.exit(report.ok ? 0 : strict ? 1 : 0);
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
