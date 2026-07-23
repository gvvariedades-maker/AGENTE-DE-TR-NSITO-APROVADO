/**
 * Seletores near/far (Fase 5).
 * 1) question_relations por tipo/distância
 * 2) Fallback: mesmo topic_id + transfer_level maior + não vista
 */

import { and, eq, inArray, ne, notInArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  attempts,
  questionRelations,
  questionSkills,
  questions,
  userSkillMastery,
} from "@/lib/db/schema";
import {
  isHoldoutPool,
  isStudyEligiblePool,
} from "@/lib/transfer/assessment-pool";
import {
  canReleaseHoldout,
  HOLDOUT_RELEASE_MASTERY_PROBABILITY,
} from "@/lib/transfer/holdout-gate";
import {
  rankTransferFallback,
  relationMatchesKind,
  transferLevelRank,
  type RelationKind,
} from "@/lib/transfer/rank-fallback";

export type SelectTransferOptions = {
  userId: string;
  sourceQuestionId: string;
  limit?: number;
  excludeIds?: string[];
  /** Inclui holdout liberado pelo gate de mastery. Default false. */
  includeReleasedHoldout?: boolean;
};

async function loadPrimarySkill(questionId: string): Promise<{
  skillId: string | null;
  transferLevel: string;
  topicId: string | null;
}> {
  const [q] = await db
    .select({
      topicId: questions.topicId,
      skillId: questionSkills.skillId,
      transferLevel: questionSkills.transferLevel,
    })
    .from(questions)
    .leftJoin(
      questionSkills,
      and(
        eq(questionSkills.questionId, questions.id),
        eq(questionSkills.role, "primary"),
      ),
    )
    .where(eq(questions.id, questionId))
    .limit(1);

  return {
    skillId: q?.skillId ?? null,
    transferLevel: q?.transferLevel ?? "T1",
    topicId: q?.topicId ?? null,
  };
}

async function seenQuestionIds(
  userId: string,
  questionIds: string[],
): Promise<Set<string>> {
  if (questionIds.length === 0) return new Set();
  const rows = await db
    .selectDistinct({ questionId: attempts.questionId })
    .from(attempts)
    .where(
      and(
        eq(attempts.userId, userId),
        inArray(attempts.questionId, questionIds),
      ),
    );
  return new Set(rows.map((r) => r.questionId));
}

async function filterPoolEligible(
  userId: string,
  ids: string[],
  includeReleasedHoldout: boolean,
): Promise<string[]> {
  if (ids.length === 0) return [];

  const rows = await db
    .select({
      id: questions.id,
      pool: questions.assessmentPool,
      skillId: questionSkills.skillId,
    })
    .from(questions)
    .leftJoin(
      questionSkills,
      and(
        eq(questionSkills.questionId, questions.id),
        eq(questionSkills.role, "primary"),
      ),
    )
    .where(inArray(questions.id, ids));

  const skillIds = [
    ...new Set(rows.map((r) => r.skillId).filter((id): id is string => !!id)),
  ];

  const masteryBySkill = new Map<string, number>();
  if (includeReleasedHoldout && skillIds.length > 0) {
    const masteryRows = await db
      .select({
        skillId: userSkillMastery.skillId,
        masteryProbability: userSkillMastery.masteryProbability,
      })
      .from(userSkillMastery)
      .where(
        and(
          eq(userSkillMastery.userId, userId),
          inArray(userSkillMastery.skillId, skillIds),
        ),
      );
    for (const m of masteryRows) {
      masteryBySkill.set(m.skillId, m.masteryProbability);
    }
  }

  const byId = new Map(rows.map((r) => [r.id, r]));
  const out: string[] = [];
  for (const id of ids) {
    const row = byId.get(id);
    if (!row) continue;
    if (isStudyEligiblePool(row.pool)) {
      out.push(id);
      continue;
    }
    if (
      includeReleasedHoldout &&
      isHoldoutPool(row.pool) &&
      canReleaseHoldout({
        assessmentPool: row.pool,
        primaryMasteryProbability: row.skillId
          ? (masteryBySkill.get(row.skillId) ?? null)
          : null,
        threshold: HOLDOUT_RELEASE_MASTERY_PROBABILITY,
      })
    ) {
      out.push(id);
    }
  }
  return out;
}

async function selectFromRelations(
  opts: SelectTransferOptions,
  kind: RelationKind,
): Promise<string[]> {
  const limit = opts.limit ?? 5;
  const exclude = new Set(opts.excludeIds ?? []);
  exclude.add(opts.sourceQuestionId);

  const relations = await db
    .select({
      targetId: questionRelations.targetQuestionId,
      relationType: questionRelations.relationType,
      distance: questionRelations.distance,
    })
    .from(questionRelations)
    .where(eq(questionRelations.sourceQuestionId, opts.sourceQuestionId));

  const ordered = relations
    .filter((r) =>
      relationMatchesKind(r.relationType, r.distance, kind),
    )
    .sort((a, b) => a.distance - b.distance)
    .map((r) => r.targetId)
    .filter((id) => !exclude.has(id));

  const eligible = await filterPoolEligible(
    opts.userId,
    ordered,
    opts.includeReleasedHoldout ?? false,
  );
  return eligible.slice(0, limit);
}

async function selectFallbackSameTopic(
  opts: SelectTransferOptions,
  kind: RelationKind,
): Promise<string[]> {
  const limit = opts.limit ?? 5;
  const exclude = new Set(opts.excludeIds ?? []);
  exclude.add(opts.sourceQuestionId);

  const source = await loadPrimarySkill(opts.sourceQuestionId);
  if (!source.topicId) return [];

  const minLevel =
    kind === "far"
      ? Math.max(transferLevelRank(source.transferLevel) + 1, 2)
      : transferLevelRank(source.transferLevel);

  const candidates = await db
    .select({
      questionId: questions.id,
      transferLevel: questionSkills.transferLevel,
      skillId: questionSkills.skillId,
      pool: questions.assessmentPool,
    })
    .from(questions)
    .innerJoin(
      questionSkills,
      and(
        eq(questionSkills.questionId, questions.id),
        eq(questionSkills.role, "primary"),
      ),
    )
    .where(
      and(
        eq(questions.topicId, source.topicId),
        ne(questions.id, opts.sourceQuestionId),
        sql`${questions.assessmentPool} <> 'holdout'`,
      ),
    )
    .limit(80);

  const ids = candidates.map((c) => c.questionId);
  const seen = await seenQuestionIds(opts.userId, ids);

  const ranked = rankTransferFallback(
    candidates
      .filter((c) => !exclude.has(c.questionId))
      .filter((c) => isStudyEligiblePool(c.pool))
      .filter((c) => {
        const rank = transferLevelRank(c.transferLevel);
        if (kind === "far") return rank >= minLevel;
        return rank >= transferLevelRank(source.transferLevel);
      })
      .map((c) => ({
        questionId: c.questionId,
        transferLevel: c.transferLevel ?? "T1",
        seen: seen.has(c.questionId),
        samePrimarySkill:
          source.skillId != null && c.skillId === source.skillId,
      })),
    source.transferLevel,
  );

  return ranked.slice(0, limit).map((c) => c.questionId);
}

/**
 * Near transfer: relations `near`/`variant` (distance≤1), senão fallback tópico.
 */
export async function selectNearTransfer(
  opts: SelectTransferOptions,
): Promise<string[]> {
  const limit = opts.limit ?? 5;
  try {
    const fromRel = await selectFromRelations(opts, "near");
    if (fromRel.length >= limit) return fromRel.slice(0, limit);

    const exclude = [...(opts.excludeIds ?? []), ...fromRel, opts.sourceQuestionId];
    const fallback = await selectFallbackSameTopic(
      { ...opts, excludeIds: exclude, limit: limit - fromRel.length },
      "near",
    );
    return [...fromRel, ...fallback].slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Far transfer: relations `far` ou distance≥2, senão fallback com nível maior.
 */
export async function selectFarTransfer(
  opts: SelectTransferOptions,
): Promise<string[]> {
  const limit = opts.limit ?? 5;
  try {
    const fromRel = await selectFromRelations(opts, "far");
    if (fromRel.length >= limit) return fromRel.slice(0, limit);

    const exclude = [...(opts.excludeIds ?? []), ...fromRel, opts.sourceQuestionId];
    const fallback = await selectFallbackSameTopic(
      { ...opts, excludeIds: exclude, limit: limit - fromRel.length },
      "far",
    );
    return [...fromRel, ...fallback].slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Holdout liberados para o usuário (skill primary ≥ limiar).
 * Não entra em Motor ATA — uso explícito (desafio / pós-domínio).
 */
export async function selectReleasedHoldout(
  userId: string,
  limit = 5,
  excludeIds: string[] = [],
): Promise<string[]> {
  if (limit <= 0) return [];
  try {
    const rows = await db
      .select({
        id: questions.id,
        skillId: questionSkills.skillId,
        masteryProbability: userSkillMastery.masteryProbability,
      })
      .from(questions)
      .innerJoin(
        questionSkills,
        and(
          eq(questionSkills.questionId, questions.id),
          eq(questionSkills.role, "primary"),
        ),
      )
      .innerJoin(
        userSkillMastery,
        and(
          eq(userSkillMastery.skillId, questionSkills.skillId),
          eq(userSkillMastery.userId, userId),
        ),
      )
      .where(
        and(
          eq(questions.assessmentPool, "holdout"),
          sql`${userSkillMastery.masteryProbability} >= ${HOLDOUT_RELEASE_MASTERY_PROBABILITY}`,
          excludeIds.length > 0
            ? notInArray(questions.id, excludeIds)
            : undefined,
        ),
      )
      .orderBy(sql`random()`)
      .limit(limit);

    return rows.map((r) => r.id);
  } catch {
    return [];
  }
}
