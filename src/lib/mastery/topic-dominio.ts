import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { attempts, questions } from "@/lib/db/schema";
import {
  DOMINIO_INTERVALO_MS,
  classificarDominio,
} from "@/lib/dominio-topico";
import {
  isMasteryState,
  type MasteryState,
} from "@/lib/mastery/mastery-state";
import {
  aggregateFromEntries,
  coverageFromCounts,
  decidirDominioTopico,
  SKILL_COVERAGE_THRESHOLD,
  type TopicMasteryAggregate,
  type TopicSkillCoverage,
} from "@/lib/mastery/topic-dominio-policy";

export {
  SKILL_COVERAGE_THRESHOLD,
  decidirDominioTopico,
  coverageFromCounts,
  aggregateFromEntries,
  type TopicSkillCoverage,
  type TopicMasteryAggregate,
};

/**
 * % de questões do tópico com ≥1 question_skills.role = primary.
 */
export async function getTopicSkillCoverage(
  topicId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any = db,
): Promise<TopicSkillCoverage> {
  const rows = await client.execute(sql`
    SELECT
      count(DISTINCT q.id)::int AS question_count,
      count(DISTINCT q.id) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM question_skills qs
          WHERE qs.question_id = q.id AND qs.role = 'primary'
        )
      )::int AS with_primary
    FROM questions q
    WHERE q.topic_id = ${topicId}::uuid
  `);

  const list = Array.isArray(rows) ? rows : [...rows];
  const row = list[0] as
    | { question_count: number; with_primary: number }
    | undefined;
  return coverageFromCounts(
    Number(row?.question_count ?? 0),
    Number(row?.with_primary ?? 0),
  );
}

/**
 * Agrega mastery das skills primary ligadas a questões do tópico.
 * majority = ≥50% das skills com state=mastered;
 * minAbove = min(mastery_probability) ≥ 0.75.
 */
export async function aggregateTopicSkillMastery(
  userId: string,
  topicId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any = db,
): Promise<TopicMasteryAggregate | null> {
  const rows = await client.execute(sql`
    SELECT DISTINCT ON (s.id)
      s.id AS skill_id,
      usm.state,
      coalesce(usm.mastery_probability, 0)::real AS mastery_probability
    FROM skills s
    INNER JOIN question_skills qs
      ON qs.skill_id = s.id AND qs.role = 'primary'
    INNER JOIN questions q ON q.id = qs.question_id
    LEFT JOIN user_skill_mastery usm
      ON usm.skill_id = s.id AND usm.user_id = ${userId}::uuid
    WHERE q.topic_id = ${topicId}::uuid
      AND s.active = true
    ORDER BY s.id
  `);

  const list = (Array.isArray(rows) ? rows : [...rows]) as {
    skill_id: string;
    state: string | null;
    mastery_probability: number | null;
  }[];

  const entries = list.map((r) => {
    const state: MasteryState =
      r.state && isMasteryState(r.state) ? r.state : "unseen";
    return {
      state,
      masteryProbability: Number(r.mastery_probability ?? 0),
    };
  });

  return aggregateFromEntries(entries);
}

/** Regra legada: 2 acertos seguidos no microtópico, espaçados ≥ 1h. */
export async function verificarDominioTopicoLegado(
  userId: string,
  topicId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any = db,
): Promise<boolean> {
  const rows = await client
    .select({ acertou: attempts.acertou, createdAt: attempts.createdAt })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(and(eq(attempts.userId, userId), eq(questions.topicId, topicId)))
    .orderBy(desc(attempts.createdAt))
    .limit(2);

  if (rows.length < 2 || !rows.every((r: { acertou: boolean }) => r.acertou)) {
    return false;
  }

  const diffMs =
    rows[0].createdAt.getTime() - rows[1].createdAt.getTime();
  return diffMs >= DOMINIO_INTERVALO_MS;
}

/**
 * Domínio do tópico (Fase 3):
 * - se cobertura skill ≥ limiar → majority mastered OU min prob ≥ 0.75
 * - senão → regra legada 2 acertos ≥ 1h
 */
export async function verificarDominioTopicoComMastery(
  userId: string,
  topicId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any = db,
): Promise<boolean> {
  const coverage = await getTopicSkillCoverage(topicId, client);
  if (coverage.meetsThreshold) {
    const agg = await aggregateTopicSkillMastery(userId, topicId, client);
    return decidirDominioTopico({
      coverageMeetsThreshold: true,
      aggregate: agg,
      legadoDominado: false,
    });
  }

  const legadoDominado = await verificarDominioTopicoLegado(
    userId,
    topicId,
    client,
  );
  return decidirDominioTopico({
    coverageMeetsThreshold: false,
    aggregate: null,
    legadoDominado,
  });
}

/** Re-export legado classifier for callers that still want NivelDominio. */
export { classificarDominio };
