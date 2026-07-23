import type { ConfidenceLevel } from "@/lib/srs/rating-policy";
import type { TransferLevel } from "@/lib/skills/catalog";

/** Modo da tentativa (espelha attempts.modo). */
export type EvidenceMode = "estudo" | "simulado";

export type EvidenceWeightInput = {
  acertou: boolean;
  /** Exposições prévias desta questão (0 = inédita). */
  exposureCount: number;
  /**
   * Ms desde a última evidência nesta skill (null = primeira).
   * Delayed forte ≥ 24h.
   */
  msSinceLastEvidence: number | null;
  transferLevel: TransferLevel;
  hintUsed?: boolean;
  answerChanged?: boolean;
  feedbackSeenBeforeAnswer?: boolean;
  mode: EvidenceMode;
  confidence?: ConfidenceLevel | null;
};

export type EvidenceWeightBreakdown = {
  novelty: number;
  delay: number;
  transfer: number;
  assistance: number;
  mode: number;
  /** Produto dos fatores (0–~1.2 antes do clamp). */
  raw: number;
  /** Peso final em [0.05, 1]. */
  weight: number;
  /** +1 acerto / −1 erro. */
  sign: 1 | -1;
  /** Delta assinado = sign × weight. */
  signedWeight: number;
  isNovel: boolean;
  isDelayed: boolean;
};

/** Intervalo mínimo para evidência “atrasada” (retenção). */
export const DELAYED_EVIDENCE_MS = 24 * 60 * 60 * 1000;

const TRANSFER_FACTOR: Record<TransferLevel, number> = {
  T0: 0.55,
  T1: 0.75,
  T2: 1.0,
  T3: 1.15,
};

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function noveltyFactor(exposureCount: number): { factor: number; isNovel: boolean } {
  if (exposureCount <= 0) return { factor: 1.0, isNovel: true };
  if (exposureCount === 1) return { factor: 0.7, isNovel: false };
  return { factor: 0.45, isNovel: false };
}

function delayFactor(msSinceLastEvidence: number | null): {
  factor: number;
  isDelayed: boolean;
} {
  if (msSinceLastEvidence === null) {
    return { factor: 1.0, isDelayed: true };
  }
  if (msSinceLastEvidence >= DELAYED_EVIDENCE_MS) {
    return { factor: 1.0, isDelayed: true };
  }
  if (msSinceLastEvidence >= 60 * 60 * 1000) {
    return { factor: 0.75, isDelayed: false };
  }
  return { factor: 0.5, isDelayed: false };
}

function assistanceFactor(input: EvidenceWeightInput): number {
  if (input.hintUsed || input.feedbackSeenBeforeAnswer) return 0.4;
  if (input.answerChanged) return 0.7;
  return 1.0;
}

function modeFactor(mode: EvidenceMode): number {
  return mode === "simulado" ? 1.0 : 0.85;
}

/**
 * Peso de evidência simplificado (briefing):
 * novelty × delay × transfer × assistance × mode.
 *
 * Evidência forte = inédita + atrasada + transferência + sem ajuda + modo simulado.
 */
export function computeEvidenceWeight(
  input: EvidenceWeightInput,
): EvidenceWeightBreakdown {
  const { factor: novelty, isNovel } = noveltyFactor(input.exposureCount);
  const { factor: delay, isDelayed } = delayFactor(input.msSinceLastEvidence);
  const transfer = TRANSFER_FACTOR[input.transferLevel] ?? TRANSFER_FACTOR.T1;
  const assistance = assistanceFactor(input);
  const mode = modeFactor(input.mode);

  const raw = novelty * delay * transfer * assistance * mode;
  const weight = clamp(raw, 0.05, 1);
  const sign: 1 | -1 = input.acertou ? 1 : -1;

  return {
    novelty,
    delay,
    transfer,
    assistance,
    mode,
    raw,
    weight,
    sign,
    signedWeight: sign * weight,
    isNovel,
    isDelayed,
  };
}

/**
 * Fator de atualização da calibração (0–1 delta relativo).
 * High-conf error → queda forte; low-conf correct → leve queda;
 * high-conf correct → leve alta; low-conf error → leve alta (bem calibrado).
 */
export function calibrationDelta(
  acertou: boolean,
  confidence: ConfidenceLevel | null | undefined,
  weight: number,
): number {
  if (confidence !== 1 && confidence !== 3) {
    return acertou ? 0.02 * weight : -0.03 * weight;
  }
  if (!acertou && confidence === 3) return -0.25 * weight;
  if (acertou && confidence === 1) return -0.06 * weight;
  if (acertou && confidence === 3) return 0.08 * weight;
  return 0.05 * weight; // errou com dúvida
}
