import { and, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  attempts,
  questionSkills,
  skills,
  userSkillMastery,
} from "@/lib/db/schema";
import type { ConfidenceLevel } from "@/lib/srs/rating-policy";
import { isHighConfidenceError } from "@/lib/srs/rating-policy";
import type { SkillRole, TransferLevel } from "@/lib/skills/catalog";
import { TRANSFER_LEVELS } from "@/lib/skills/catalog";
import {
  calibrationDelta,
  computeEvidenceWeight,
  type EvidenceMode,
} from "@/lib/mastery/evidence-weight";
import {
  clamp01,
  computeMasteryProbability,
  HIGH_CONF_ERROR_WINDOW_MS,
  isMasteryState,
  resolveMasteryState,
  type MasteryState,
} from "@/lib/mastery/mastery-state";

/** Ganho base de recall por evidência (antes do peso). */
const RECALL_STEP = 0.18;
/** Ganho base de transfer — escala com nível T0–T3. */
const TRANSFER_STEP: Record<TransferLevel, number> = {
  T0: 0.06,
  T1: 0.12,
  T2: 0.18,
  T3: 0.22,
};

const ROLE_WEIGHT: Record<SkillRole, number> = {
  primary: 1,
  secondary: 0.55,
  distractor: 0.25,
};

export type UpdateSkillMasteryInput = {
  userId: string;
  questionId: string;
  acertou: boolean;
  mode: EvidenceMode;
  confidence?: ConfidenceLevel | null;
  exposureCount: number;
  hintUsed?: boolean;
  answerChanged?: boolean;
  feedbackSeenBeforeAnswer?: boolean;
  now?: Date;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx?: any;
};

export type SkillMasterySnapshot = {
  skillId: string;
  skillCode: string;
  role: SkillRole;
  state: MasteryState;
  recallScore: number;
  transferScore: number;
  calibrationScore: number;
  masteryProbability: number;
  novelCorrectCount: number;
  delayedCorrectCount: number;
  highConfidenceErrorCount: number;
};

export type UpdateSkillMasteryResult = {
  updated: SkillMasterySnapshot[];
};

type LinkedSkill = {
  skillId: string;
  skillCode: string;
  role: SkillRole;
  transferLevel: TransferLevel;
  weight: number;
};

function parseTransferLevel(raw: string): TransferLevel {
  if ((TRANSFER_LEVELS as readonly string[]).includes(raw)) {
    return raw as TransferLevel;
  }
  return "T1";
}

function parseRole(raw: string): SkillRole {
  if (raw === "secondary" || raw === "distractor" || raw === "primary") {
    return raw;
  }
  return "primary";
}

async function loadLinkedSkills(
  questionId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
): Promise<LinkedSkill[]> {
  const rows = await client
    .select({
      skillId: questionSkills.skillId,
      skillCode: skills.code,
      role: questionSkills.role,
      transferLevel: questionSkills.transferLevel,
      weight: questionSkills.weight,
    })
    .from(questionSkills)
    .innerJoin(skills, eq(questionSkills.skillId, skills.id))
    .where(
      and(eq(questionSkills.questionId, questionId), eq(skills.active, true)),
    );

  return rows.map(
    (r: {
      skillId: string;
      skillCode: string;
      role: string;
      transferLevel: string;
      weight: number;
    }) => ({
      skillId: r.skillId,
      skillCode: r.skillCode,
      role: parseRole(r.role),
      transferLevel: parseTransferLevel(r.transferLevel),
      weight: r.weight > 0 ? r.weight : 1,
    }),
  );
}

async function hasRecentHighConfError(
  userId: string,
  skillId: string,
  now: Date,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  client: any,
): Promise<boolean> {
  const since = new Date(now.getTime() - HIGH_CONF_ERROR_WINDOW_MS);
  const rows = await client
    .select({ id: attempts.id })
    .from(attempts)
    .innerJoin(questionSkills, eq(attempts.questionId, questionSkills.questionId))
    .where(
      and(
        eq(attempts.userId, userId),
        eq(questionSkills.skillId, skillId),
        eq(attempts.acertou, false),
        eq(attempts.confidence, 3),
        gte(attempts.createdAt, since),
      ),
    )
    .limit(1);

  return rows.length > 0;
}

/**
 * Atualiza mastery de todas as skills ligadas à questão (question_skills).
 * Sem cobertura de skill → no-op (retorna []).
 */
export async function updateSkillMastery(
  input: UpdateSkillMasteryInput,
): Promise<UpdateSkillMasteryResult> {
  const client = input.tx ?? db;
  const now = input.now ?? new Date();
  const linked = await loadLinkedSkills(input.questionId, client);

  if (linked.length === 0) {
    return { updated: [] };
  }

  const updated: SkillMasterySnapshot[] = [];
  const highConfError = isHighConfidenceError(
    input.acertou,
    input.confidence ?? undefined,
  );

  for (const link of linked) {
    // Distrator só atualiza em erro (evidência de misconception).
    if (link.role === "distractor" && input.acertou) {
      continue;
    }

    const [existing] = await client
      .select()
      .from(userSkillMastery)
      .where(
        and(
          eq(userSkillMastery.userId, input.userId),
          eq(userSkillMastery.skillId, link.skillId),
        ),
      )
      .limit(1);

    const prevState: MasteryState = existing
      ? isMasteryState(existing.state)
        ? existing.state
        : "unseen"
      : "unseen";

    const msSinceLast = existing?.lastEvidenceAt
      ? now.getTime() - existing.lastEvidenceAt.getTime()
      : null;

    const evidence = computeEvidenceWeight({
      acertou: input.acertou,
      exposureCount: input.exposureCount,
      msSinceLastEvidence: msSinceLast,
      transferLevel: link.transferLevel,
      hintUsed: input.hintUsed,
      answerChanged: input.answerChanged,
      feedbackSeenBeforeAnswer: input.feedbackSeenBeforeAnswer,
      mode: input.mode,
      confidence: input.confidence,
    });

    const roleW = ROLE_WEIGHT[link.role] * link.weight;
    const applied = evidence.signedWeight * roleW;

    const prevRecall = existing?.recallScore ?? 0;
    const prevTransfer = existing?.transferScore ?? 0;
    const prevCalibration = existing?.calibrationScore ?? 0.5;

    const recallScore = clamp01(prevRecall + applied * RECALL_STEP);
    const transferScore = clamp01(
      prevTransfer + applied * TRANSFER_STEP[link.transferLevel],
    );
    const calibrationScore = clamp01(
      prevCalibration +
        calibrationDelta(
          input.acertou,
          input.confidence,
          evidence.weight * roleW,
        ),
    );

    let novelCorrectCount = existing?.novelCorrectCount ?? 0;
    let delayedCorrectCount = existing?.delayedCorrectCount ?? 0;
    let highConfidenceErrorCount = existing?.highConfidenceErrorCount ?? 0;

    if (input.acertou) {
      if (evidence.isNovel) novelCorrectCount += 1;
      if (evidence.isDelayed) delayedCorrectCount += 1;
    }
    if (highConfError) {
      highConfidenceErrorCount += 1;
    }

    const recentHighConf =
      highConfError ||
      (await hasRecentHighConfError(
        input.userId,
        link.skillId,
        now,
        client,
      ));

    const masteryProbability = computeMasteryProbability({
      recallScore,
      transferScore,
      calibrationScore,
    });

    const state = resolveMasteryState({
      recallScore,
      transferScore,
      calibrationScore,
      novelCorrectCount,
      delayedCorrectCount,
      highConfidenceErrorCount,
      hasEvidence: true,
      hasRecentHighConfError: recentHighConf,
      previousState: prevState,
    });

    const values = {
      recallScore,
      transferScore,
      calibrationScore,
      masteryProbability,
      state,
      novelCorrectCount,
      delayedCorrectCount,
      highConfidenceErrorCount,
      lastEvidenceAt: now,
      updatedAt: now,
    };

    if (existing) {
      await client
        .update(userSkillMastery)
        .set(values)
        .where(
          and(
            eq(userSkillMastery.userId, input.userId),
            eq(userSkillMastery.skillId, link.skillId),
          ),
        );
    } else {
      await client.insert(userSkillMastery).values({
        userId: input.userId,
        skillId: link.skillId,
        ...values,
      });
    }

    updated.push({
      skillId: link.skillId,
      skillCode: link.skillCode,
      role: link.role,
      state,
      recallScore,
      transferScore,
      calibrationScore,
      masteryProbability,
      novelCorrectCount,
      delayedCorrectCount,
      highConfidenceErrorCount,
    });
  }

  return { updated };
}
