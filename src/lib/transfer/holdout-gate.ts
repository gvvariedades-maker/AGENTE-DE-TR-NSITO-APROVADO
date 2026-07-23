/**
 * Gate de liberação de holdout (Fase 5).
 * Holdout só entra quando mastery_probability da skill primary ≥ limiar.
 */

import { MASTERED_MIN_SCORE } from "@/lib/mastery/mastery-state";

/**
 * Limiar de mastery_probability da skill primary para liberar holdout.
 * Alinhado ao piso de domínio (0.75); calibração baixa mantém holdout fechado.
 */
export const HOLDOUT_RELEASE_MASTERY_PROBABILITY = MASTERED_MIN_SCORE;

export type HoldoutGateInput = {
  assessmentPool: string | null | undefined;
  /** mastery_probability da skill primary; null = sem evidência / sem skill. */
  primaryMasteryProbability: number | null | undefined;
  /** Override opcional do limiar (testes). */
  threshold?: number;
};

export type HoldoutGateResult = {
  isHoldout: boolean;
  eligible: boolean;
  reason:
    | "not_holdout"
    | "no_primary_mastery"
    | "below_threshold"
    | "released";
  threshold: number;
  masteryProbability: number | null;
};

/**
 * Pure: decide se uma questão holdout pode ser exibida ao usuário.
 * Questões não-holdout sempre retornam eligible=true (não é papel deste gate).
 */
export function evaluateHoldoutGate(input: HoldoutGateInput): HoldoutGateResult {
  const threshold = input.threshold ?? HOLDOUT_RELEASE_MASTERY_PROBABILITY;
  const pool = input.assessmentPool ?? "learning";

  if (pool !== "holdout") {
    return {
      isHoldout: false,
      eligible: true,
      reason: "not_holdout",
      threshold,
      masteryProbability:
        input.primaryMasteryProbability == null
          ? null
          : input.primaryMasteryProbability,
    };
  }

  const mp = input.primaryMasteryProbability;
  if (mp == null || Number.isNaN(mp)) {
    return {
      isHoldout: true,
      eligible: false,
      reason: "no_primary_mastery",
      threshold,
      masteryProbability: null,
    };
  }

  if (mp < threshold) {
    return {
      isHoldout: true,
      eligible: false,
      reason: "below_threshold",
      threshold,
      masteryProbability: mp,
    };
  }

  return {
    isHoldout: true,
    eligible: true,
    reason: "released",
    threshold,
    masteryProbability: mp,
  };
}

export function canReleaseHoldout(input: HoldoutGateInput): boolean {
  return evaluateHoldoutGate(input).eligible;
}
