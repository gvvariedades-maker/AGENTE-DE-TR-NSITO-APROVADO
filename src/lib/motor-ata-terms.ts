/**
 * Termos de score do Motor ATA (Fase 6).
 * Prioridade rígida: revisões críticas → disciplina em risco → high-conf errors
 * → peso edital → transfer → novo → manutenção.
 *
 * Funções puras — testáveis sem DB; o SQL em motor-ata.ts espelha estes pesos.
 */

import { retrievability } from "@/lib/srs";

/** Pesos dos termos de evidência (Fase 6), por fase da prova. */
export type PesosEvidenciaAta = {
  masteryGap: number;
  highConfidenceError: number;
  transferPending: number;
  forgettingRisk: number;
};

export const PESOS_EVIDENCIA_FASE: Record<
  "exploracao" | "consolidacao" | "aperto" | "semana_final",
  PesosEvidenciaAta
> = {
  exploracao: {
    masteryGap: 180,
    highConfidenceError: 380,
    transferPending: 120,
    forgettingRisk: 140,
  },
  consolidacao: {
    masteryGap: 220,
    highConfidenceError: 420,
    transferPending: 150,
    forgettingRisk: 160,
  },
  aperto: {
    masteryGap: 260,
    highConfidenceError: 480,
    transferPending: 180,
    forgettingRisk: 200,
  },
  semana_final: {
    masteryGap: 280,
    highConfidenceError: 520,
    transferPending: 200,
    forgettingRisk: 220,
  },
};

export type MasteryGapInput = {
  /** 0–1; null = sem skill mapeada. */
  masteryProbability: number | null;
};

/** Lacuna de domínio: (1 − P) × peso. Sem skill → 0. */
export function scoreMasteryGap(
  input: MasteryGapInput,
  peso: number,
): number {
  if (input.masteryProbability === null) return 0;
  const gap = Math.max(0, Math.min(1, 1 - input.masteryProbability));
  return Math.round(gap * peso);
}

export type HighConfErrorInput = {
  highConfidenceErrorCount: number;
  state?: string | null;
  /** Tentativa recente com confidence alta + erro nesta questão. */
  recentHighConfErrorOnQuestion?: boolean;
};

/** Erro de alta confiança / skill at_risk — prioridade logo após disciplina em risco. */
export function scoreHighConfidenceErrorRisk(
  input: HighConfErrorInput,
  peso: number,
): number {
  if (input.recentHighConfErrorOnQuestion) return peso;
  if (input.state === "at_risk") return Math.round(peso * 0.9);
  if (input.highConfidenceErrorCount > 0) {
    return Math.round(peso * Math.min(1, 0.5 + input.highConfidenceErrorCount * 0.2));
  }
  return 0;
}

export type TransferPendingInput = {
  recallScore: number | null;
  transferScore: number | null;
  /** Questão marcada como pool de transferência. */
  isTransferPool?: boolean;
  /** Nível T2/T3 na skill primary. */
  transferLevelHigh?: boolean;
};

const TRANSFER_GAP_MIN = 0.2;

/**
 * Transferência pendente: recall à frente de transfer, ou pool/nível alto
 * ainda sem evidência de transferência.
 */
export function scoreTransferPending(
  input: TransferPendingInput,
  peso: number,
): number {
  if (input.isTransferPool) return peso;
  const recall = input.recallScore;
  const transfer = input.transferScore;
  if (recall !== null && transfer !== null && recall - transfer >= TRANSFER_GAP_MIN) {
    const gap = Math.min(1, recall - transfer);
    return Math.round(gap * peso);
  }
  if (
    input.transferLevelHigh &&
    (transfer === null || transfer < 0.4) &&
    recall !== null &&
    recall >= 0.5
  ) {
    return Math.round(peso * 0.7);
  }
  return 0;
}

export type ForgettingRiskInput = {
  /** Dias desde last_review; null = sem card / nunca revisado. */
  elapsedDays: number | null;
  stability: number | null;
};

/**
 * Risco de esquecimento = (1 − R) × peso, só quando há estabilidade > 0.
 * R = retrievability FSRS.
 */
export function scoreForgettingRisk(
  input: ForgettingRiskInput,
  peso: number,
): number {
  if (
    input.elapsedDays === null ||
    input.stability === null ||
    input.stability <= 0
  ) {
    return 0;
  }
  const r = retrievability(input.elapsedDays, input.stability);
  const risk = Math.max(0, Math.min(1, 1 - r));
  return Math.round(risk * peso);
}

/**
 * Valor esperado de uma atividade corretiva pós-simulado
 * (edital × lacuna × flags de risco). Escala relativa para ranking.
 */
export type ValorAtividadeInput = {
  /** Questões da disciplina no espelho / 60. */
  pesoEditalFrac: number;
  /** 1 pt gerais / 2 pts específicos. */
  pontosPorAcerto: number;
  errouNoSimulado: boolean;
  masteryProbability: number | null;
  highConfError: boolean;
  transferPending: boolean;
  forgettingRisk01: number;
};

export function valorAtividadeCorretiva(input: ValorAtividadeInput): number {
  const edital =
    input.pesoEditalFrac * 100 * input.pontosPorAcerto;
  const gap =
    input.masteryProbability === null
      ? 0.5
      : Math.max(0, 1 - input.masteryProbability);
  let score = edital * (0.4 + gap);
  if (input.errouNoSimulado) score += 40;
  if (input.highConfError) score += 35;
  if (input.transferPending) score += 20;
  score += input.forgettingRisk01 * 25;
  return Math.round(score * 10) / 10;
}

/** Meta padrão de atividades na missão corretiva pós-simulado. */
export const MISSAO_POS_SIMULADO_META = 14;
