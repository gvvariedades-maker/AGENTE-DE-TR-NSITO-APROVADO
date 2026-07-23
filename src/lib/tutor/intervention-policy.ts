/**
 * Política de intervenção pós-resposta (Fase 4).
 * Escolhe o path pedagógico a partir de evidência da tentativa + mastery.
 */

import type { ConfidenceLevel } from "@/lib/srs/rating-policy";
import { isLowConfidenceCorrect } from "@/lib/srs/rating-policy";
import {
  MASTERED_MIN_SCORE,
  type MasteryState,
} from "@/lib/mastery/mastery-state";
import type { InterventionPath } from "@/types/pedagogy";

export type InterventionPolicyInput = {
  acertou: boolean;
  confidence?: ConfidenceLevel | null;
  /** Há misconception / mecanismo na alternativa errada. */
  hasMisconception: boolean;
  /** Novice-gate: 0 evidência em pré-requisito. */
  isNovice: boolean;
  /** Estado da skill primary (após update da tentativa). */
  primaryMasteryState?: MasteryState | null;
  /** Probabilidade de domínio da skill primary. */
  primaryMasteryProbability?: number | null;
};

export type InterventionPolicyResult = {
  path: InterventionPath;
  reason: string;
};

/**
 * Prioridade:
 * 1. novice → prerequisite_repair
 * 2. erro + misconception → misconception_repair
 * 3. erro → guided_learning
 * 4. acerto na dúvida → uncertain_correct
 * 5. acerto confiante + mastery alto → fast_confirmation
 * 6. acerto confiante + consolidando → transfer_challenge
 * 7. demais acertos → guided_learning
 */
export function selectIntervention(
  input: InterventionPolicyInput,
): InterventionPolicyResult {
  if (input.isNovice) {
    return {
      path: "prerequisite_repair",
      reason: "Pré-requisito sem evidência (novice-gate).",
    };
  }

  if (!input.acertou) {
    if (input.hasMisconception) {
      return {
        path: "misconception_repair",
        reason: "Erro com misconception/mecanismo identificado.",
      };
    }
    return {
      path: "guided_learning",
      reason: "Erro sem diagnóstico fino — aula guiada completa.",
    };
  }

  if (isLowConfidenceCorrect(true, input.confidence)) {
    return {
      path: "uncertain_correct",
      reason: "Acerto com baixa confiança.",
    };
  }

  const state = input.primaryMasteryState ?? "unseen";
  const prob = input.primaryMasteryProbability ?? 0;
  const highMastery =
    state === "mastered" ||
    (state === "consolidating" && prob >= MASTERED_MIN_SCORE);

  if (
    input.confidence === 3 &&
    highMastery
  ) {
    return {
      path: "fast_confirmation",
      reason: "Acerto confiante com mastery alto.",
    };
  }

  if (input.confidence === 3 && state === "consolidating") {
    return {
      path: "transfer_challenge",
      reason: "Acerto confiante em consolidação — reforço de transferência.",
    };
  }

  return {
    path: "guided_learning",
    reason: "Acerto em fase inicial — trilha completa.",
  };
}
