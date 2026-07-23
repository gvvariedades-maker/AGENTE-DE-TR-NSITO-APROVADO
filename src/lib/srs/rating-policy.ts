import type { FsrsGrade } from "@/lib/srs";

/**
 * Confiança subjetiva na UI da Fase 1: dois botões → 1 (dúvida) | 3 (certeza).
 * Escala completa 0–3 fica reservada para fases seguintes.
 */
export type ConfidenceLevel = 1 | 3;

export type RatingPolicyInput = {
  acertou: boolean;
  confidence: ConfidenceLevel;
};

export type RatingPolicyResult = {
  confidence: ConfidenceLevel;
  fsrsRating: FsrsGrade;
};

/**
 * Política confidence × FSRS (Motor de Evidências Fase 1).
 *
 * | Resultado            | confidence | fsrsRating |
 * |----------------------|------------|------------|
 * | Errou                | qualquer   | 1 (Again)  |
 * | Acertou na dúvida    | 1          | 2 (Hard)   |
 * | Acertou com certeza  | 3          | 4 (Easy)   |
 */
export function resolveFsrsRating(input: RatingPolicyInput): FsrsGrade {
  if (!input.acertou) return 1;
  if (input.confidence === 1) return 2;
  return 4;
}

export function resolveRatingPolicy(
  input: RatingPolicyInput,
): RatingPolicyResult {
  return {
    confidence: input.confidence,
    fsrsRating: resolveFsrsRating(input),
  };
}

/** Erro com certeza alta — evidência de misconception / calibração quebrada. */
export function isHighConfidenceError(
  acertou: boolean,
  confidence: ConfidenceLevel | null | undefined,
): boolean {
  return !acertou && confidence === 3;
}

/** Acerto com dúvida — evidência frágil (não promove mastery cedo). */
export function isLowConfidenceCorrect(
  acertou: boolean,
  confidence: ConfidenceLevel | null | undefined,
): boolean {
  return acertou && confidence === 1;
}

export function isConfidenceLevel(value: unknown): value is ConfidenceLevel {
  return value === 1 || value === 3;
}
