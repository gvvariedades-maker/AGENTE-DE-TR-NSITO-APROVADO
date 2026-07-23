import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { skills, userSkillMastery } from "@/lib/db/schema";
import {
  isMasteryState,
  MASTERY_STATE_LABELS,
  type MasteryState,
} from "@/lib/mastery/mastery-state";

export type UserSkillMasteryRow = {
  skillId: string;
  skillCode: string;
  skillName: string;
  skillKind: string;
  topicId: string | null;
  state: MasteryState;
  stateLabel: string;
  recallScore: number;
  transferScore: number;
  calibrationScore: number;
  masteryProbability: number;
  novelCorrectCount: number;
  delayedCorrectCount: number;
  highConfidenceErrorCount: number;
  lastEvidenceAt: Date | null;
  updatedAt: Date;
};

export type UserMasteryDebugSummary = {
  total: number;
  byState: Record<MasteryState, number>;
  rows: UserSkillMasteryRow[];
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

/**
 * Lista mastery do usuário para painel debug interno.
 */
export async function getUserMasteryDebug(
  userId: string,
): Promise<UserMasteryDebugSummary> {
  const rows = await db
    .select({
      skillId: userSkillMastery.skillId,
      skillCode: skills.code,
      skillName: skills.name,
      skillKind: skills.kind,
      topicId: skills.topicId,
      state: userSkillMastery.state,
      recallScore: userSkillMastery.recallScore,
      transferScore: userSkillMastery.transferScore,
      calibrationScore: userSkillMastery.calibrationScore,
      masteryProbability: userSkillMastery.masteryProbability,
      novelCorrectCount: userSkillMastery.novelCorrectCount,
      delayedCorrectCount: userSkillMastery.delayedCorrectCount,
      highConfidenceErrorCount: userSkillMastery.highConfidenceErrorCount,
      lastEvidenceAt: userSkillMastery.lastEvidenceAt,
      updatedAt: userSkillMastery.updatedAt,
    })
    .from(userSkillMastery)
    .innerJoin(skills, eq(userSkillMastery.skillId, skills.id))
    .where(eq(userSkillMastery.userId, userId))
    .orderBy(desc(userSkillMastery.updatedAt));

  const byState = emptyByState();
  const mapped: UserSkillMasteryRow[] = rows.map((r) => {
    const state: MasteryState = isMasteryState(r.state) ? r.state : "unseen";
    byState[state] += 1;
    return {
      skillId: r.skillId,
      skillCode: r.skillCode,
      skillName: r.skillName,
      skillKind: r.skillKind,
      topicId: r.topicId,
      state,
      stateLabel: MASTERY_STATE_LABELS[state],
      recallScore: r.recallScore,
      transferScore: r.transferScore,
      calibrationScore: r.calibrationScore,
      masteryProbability: r.masteryProbability,
      novelCorrectCount: r.novelCorrectCount,
      delayedCorrectCount: r.delayedCorrectCount,
      highConfidenceErrorCount: r.highConfidenceErrorCount,
      lastEvidenceAt: r.lastEvidenceAt,
      updatedAt: r.updatedAt,
    };
  });

  return {
    total: mapped.length,
    byState,
    rows: mapped,
  };
}
