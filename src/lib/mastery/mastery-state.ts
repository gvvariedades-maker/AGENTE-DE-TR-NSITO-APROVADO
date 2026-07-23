/**
 * Estados e limiares do mastery enxuto (Fase 3).
 * mastered se min(recall,transfer) ≥ 0.75, ≥2 novel correct, ≥1 delayed,
 * sem high-conf error recente (7d).
 */

export type MasteryState =
  | "unseen"
  | "learning"
  | "consolidating"
  | "mastered"
  | "at_risk";

export const MASTERY_STATES: readonly MasteryState[] = [
  "unseen",
  "learning",
  "consolidating",
  "mastered",
  "at_risk",
] as const;

export const MASTERY_STATE_LABELS: Record<MasteryState, string> = {
  unseen: "Não visto",
  learning: "Aprendendo",
  consolidating: "Consolidando",
  mastered: "Dominado",
  at_risk: "Em risco",
};

/** Limiar de min(recall, transfer) para mastered. */
export const MASTERED_MIN_SCORE = 0.75;

/** Limiar de consolidação (caminho para mastered). */
export const CONSOLIDATING_MIN_SCORE = 0.5;

export const MASTERED_MIN_NOVEL_CORRECT = 2;
export const MASTERED_MIN_DELAYED_CORRECT = 1;

/** Janela de high-conf error que bloqueia mastered / força at_risk. */
export const HIGH_CONF_ERROR_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export type MasteryScores = {
  recallScore: number;
  transferScore: number;
  calibrationScore: number;
};

export type MasteryCounters = {
  novelCorrectCount: number;
  delayedCorrectCount: number;
  highConfidenceErrorCount: number;
};

export type ResolveMasteryStateInput = MasteryScores &
  MasteryCounters & {
    /** Houve evidência alguma vez? */
    hasEvidence: boolean;
    /** High-conf error nos últimos 7 dias (query ou tentativa atual). */
    hasRecentHighConfError: boolean;
    /** Estado anterior (para at_risk a partir de consolidating/mastered). */
    previousState?: MasteryState | null;
  };

export function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

/**
 * Domínio comprovado = min(recall, transfer) × calibração.
 * Calibração baixa (erro alta confiança) reduz a probabilidade.
 */
export function computeMasteryProbability(scores: MasteryScores): number {
  const floor = Math.min(
    clamp01(scores.recallScore),
    clamp01(scores.transferScore),
  );
  return clamp01(floor * clamp01(scores.calibrationScore));
}

export function resolveMasteryState(
  input: ResolveMasteryStateInput,
): MasteryState {
  if (!input.hasEvidence) return "unseen";

  const minScore = Math.min(
    clamp01(input.recallScore),
    clamp01(input.transferScore),
  );
  const prev = input.previousState ?? "unseen";

  if (input.hasRecentHighConfError) {
    if (
      prev === "mastered" ||
      prev === "consolidating" ||
      minScore >= CONSOLIDATING_MIN_SCORE
    ) {
      return "at_risk";
    }
    return "learning";
  }

  const qualifiesMastered =
    minScore >= MASTERED_MIN_SCORE &&
    input.novelCorrectCount >= MASTERED_MIN_NOVEL_CORRECT &&
    input.delayedCorrectCount >= MASTERED_MIN_DELAYED_CORRECT &&
    !input.hasRecentHighConfError;

  if (qualifiesMastered) return "mastered";

  if (minScore >= CONSOLIDATING_MIN_SCORE) return "consolidating";

  return "learning";
}

export function isMasteryState(value: unknown): value is MasteryState {
  return (
    typeof value === "string" &&
    (MASTERY_STATES as readonly string[]).includes(value)
  );
}
