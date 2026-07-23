/**
 * Painel de domínio comprovado (Fase 6) — separado do semáforo de aprovação.
 * Semáforo = só simulados entregues; este painel = evidências de skill/mastery.
 */

import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { skills, userSkillMastery } from "@/lib/db/schema";
import {
  isMasteryState,
  MASTERY_STATE_LABELS,
  type MasteryState,
} from "@/lib/mastery/mastery-state";

/** Reps FSRS altas + mastery baixa = memorização sem domínio. */
export const MEMORIZED_WITHOUT_MASTERY_MIN_REPS = 5;
export const MEMORIZED_WITHOUT_MASTERY_MAX_P = 0.45;

export type SkillDominioResumo = {
  skillId: string;
  skillCode: string;
  skillName: string;
  state: MasteryState;
  stateLabel: string;
  masteryProbability: number;
  recallScore: number;
  transferScore: number;
  calibrationScore: number;
  delayedCorrectCount: number;
  highConfidenceErrorCount: number;
};

export type MemorizadaSemDominio = {
  questionId: string;
  reps: number;
  masteryProbability: number | null;
  skillCode: string | null;
};

export type PainelDominioEvidencias = {
  /** Skills com evidência. */
  totalSkills: number;
  byState: Record<MasteryState, number>;
  /** Domínio comprovado (mastered). */
  masteredCount: number;
  /** Retenção atrasada: delayed_correct_count ≥ 1. */
  delayedRetentionCount: number;
  /** Transferência: transfer_score ≥ 0.5. */
  transferReadyCount: number;
  /** Erros alta confiança acumulados. */
  highConfErrorSkills: number;
  /** Em risco ou learning sem evidência forte. */
  atRiskCount: number;
  withoutEvidenceCount: number;
  /** Questões com reps altas e mastery baixa. */
  memorizedWithoutMastery: MemorizadaSemDominio[];
  topAtRisk: SkillDominioResumo[];
  hasData: boolean;
};

function emptyByState(): Record<MasteryState, number> {
  return {
    unseen: 0,
    learning: 0,
    consolidating: 0,
    mastered: 0,
    at_risk: 0,
  };
}

export function painelDominioVazio(): PainelDominioEvidencias {
  return {
    totalSkills: 0,
    byState: emptyByState(),
    masteredCount: 0,
    delayedRetentionCount: 0,
    transferReadyCount: 0,
    highConfErrorSkills: 0,
    atRiskCount: 0,
    withoutEvidenceCount: 0,
    memorizedWithoutMastery: [],
    topAtRisk: [],
    hasData: false,
  };
}

/**
 * Agrega evidências de domínio para o dashboard — independente do semáforo.
 */
export async function getPainelDominioEvidencias(
  userId?: string | null,
): Promise<PainelDominioEvidencias> {
  if (!userId) return painelDominioVazio();

  try {
    const rows = await db
      .select({
        skillId: userSkillMastery.skillId,
        skillCode: skills.code,
        skillName: skills.name,
        state: userSkillMastery.state,
        masteryProbability: userSkillMastery.masteryProbability,
        recallScore: userSkillMastery.recallScore,
        transferScore: userSkillMastery.transferScore,
        calibrationScore: userSkillMastery.calibrationScore,
        delayedCorrectCount: userSkillMastery.delayedCorrectCount,
        highConfidenceErrorCount: userSkillMastery.highConfidenceErrorCount,
      })
      .from(userSkillMastery)
      .innerJoin(skills, eq(userSkillMastery.skillId, skills.id))
      .where(eq(userSkillMastery.userId, userId));

    const byState = emptyByState();
    let delayedRetentionCount = 0;
    let transferReadyCount = 0;
    let highConfErrorSkills = 0;
    const mapped: SkillDominioResumo[] = [];

    for (const r of rows) {
      const state: MasteryState = isMasteryState(r.state) ? r.state : "unseen";
      byState[state] += 1;
      if (r.delayedCorrectCount >= 1) delayedRetentionCount += 1;
      if (r.transferScore >= 0.5) transferReadyCount += 1;
      if (r.highConfidenceErrorCount > 0) highConfErrorSkills += 1;
      mapped.push({
        skillId: r.skillId,
        skillCode: r.skillCode,
        skillName: r.skillName,
        state,
        stateLabel: MASTERY_STATE_LABELS[state],
        masteryProbability: r.masteryProbability,
        recallScore: r.recallScore,
        transferScore: r.transferScore,
        calibrationScore: r.calibrationScore,
        delayedCorrectCount: r.delayedCorrectCount,
        highConfidenceErrorCount: r.highConfidenceErrorCount,
      });
    }

    const topAtRisk = mapped
      .filter((s) => s.state === "at_risk" || s.state === "learning")
      .sort((a, b) => a.masteryProbability - b.masteryProbability)
      .slice(0, 8);

    const memRows = await db.execute<{
      question_id: string;
      reps: number;
      mastery_probability: number | null;
      skill_code: string | null;
    }>(sql`
      SELECT
        sc.question_id,
        sc.reps,
        pm.mastery_probability,
        pm.skill_code
      FROM srs_cards sc
      LEFT JOIN LATERAL (
        SELECT
          usm.mastery_probability,
          sk.code AS skill_code
        FROM question_skills qs
        INNER JOIN user_skill_mastery usm
          ON usm.skill_id = qs.skill_id AND usm.user_id = sc.user_id
        INNER JOIN skills sk ON sk.id = qs.skill_id
        WHERE qs.question_id = sc.question_id AND qs.role = 'primary'
        ORDER BY qs.weight DESC
        LIMIT 1
      ) pm ON true
      WHERE sc.user_id = ${userId}::uuid
        AND sc.reps >= ${MEMORIZED_WITHOUT_MASTERY_MIN_REPS}
        AND (
          pm.mastery_probability IS NULL
          OR pm.mastery_probability < ${MEMORIZED_WITHOUT_MASTERY_MAX_P}
        )
      ORDER BY sc.reps DESC
      LIMIT 12
    `);

    const memorizedWithoutMastery: MemorizadaSemDominio[] = memRows.map(
      (r) => ({
        questionId: r.question_id,
        reps: r.reps,
        masteryProbability: r.mastery_probability,
        skillCode: r.skill_code,
      }),
    );

    return {
      totalSkills: mapped.length,
      byState,
      masteredCount: byState.mastered,
      delayedRetentionCount,
      transferReadyCount,
      highConfErrorSkills,
      atRiskCount: byState.at_risk,
      withoutEvidenceCount: byState.unseen,
      memorizedWithoutMastery,
      topAtRisk,
      hasData: mapped.length > 0 || memorizedWithoutMastery.length > 0,
    };
  } catch {
    return painelDominioVazio();
  }
}
