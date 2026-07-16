import type { AtividadeDia } from "@/lib/retencao";
import type { FaseProva } from "@/lib/plano-prova-calc";
import type { Disciplina } from "@/types";

export interface TutorCalibracao {
  capacidadeQuestoes: number;
  /** Ajuste -0.3…+0.3 na proporção de revisões. */
  biasRevisao: number;
  boostDisciplinas: Partial<Record<Disciplina, number>>;
  updatedAt: string;
}

export const CALIBRACAO_PADRAO: TutorCalibracao = {
  capacidadeQuestoes: 20,
  biasRevisao: 0,
  boostDisciplinas: {},
  updatedAt: new Date(0).toISOString(),
};

const CAPACIDADE_MIN = 12;
const CAPACIDADE_MAX = 30;
const BIAS_MIN = -0.3;
const BIAS_MAX = 0.3;

function clampCapacidade(n: number): number {
  return Math.min(CAPACIDADE_MAX, Math.max(CAPACIDADE_MIN, Math.round(n)));
}

function clampBias(n: number): number {
  return Math.min(BIAS_MAX, Math.max(BIAS_MIN, Math.round(n * 100) / 100));
}

export interface HistoricoDiaCalib {
  data: string;
  metaQuestoes: number;
  questoesFeitas: number;
  espelhoNota?: number | null;
}

/** Monta histórico 7d para calibragem contínua. */
export function montarHistoricoCalib(
  atividade: AtividadeDia[],
  metaDiariaPadrao: number,
): HistoricoDiaCalib[] {
  return atividade.map((dia) => ({
    data: dia.data,
    metaQuestoes: metaDiariaPadrao,
    questoesFeitas: dia.total,
  }));
}

export interface RecalcularCalibracaoInput {
  atual: TutorCalibracao;
  historico: HistoricoDiaCalib[];
  fase: FaseProva;
  espelhoMedia: number | null;
  disciplinasEmRisco: Disciplina[];
}

/**
 * Recalcula params com janela 7–14 dias (Camada 3).
 * - meta cumprida cedo → ↑ capacidade
 * - meta crônica falha → ↓ capacidade ou ↑ bias revisão
 * - espelho caiu → ↑ bias revisão
 * - disciplina gap crônico → boost
 */
export function recalcularCalibracao(
  input: RecalcularCalibracaoInput,
): TutorCalibracao {
  const { atual, historico, espelhoMedia, disciplinasEmRisco } = input;
  let capacidade =
    atual.capacidadeQuestoes || CALIBRACAO_PADRAO.capacidadeQuestoes;
  let bias = atual.biasRevisao;
  const boost = { ...atual.boostDisciplinas };

  const diasComMeta = historico.filter((h) => h.metaQuestoes > 0);
  if (diasComMeta.length >= 3) {
    const cumpridos = diasComMeta.filter(
      (h) => h.questoesFeitas >= h.metaQuestoes,
    ).length;
    const ratio = cumpridos / diasComMeta.length;

    if (ratio >= 0.85) {
      capacidade = clampCapacidade(capacidade + 3);
    } else if (ratio <= 0.4) {
      capacidade = clampCapacidade(capacidade - 2);
      bias = clampBias(bias + 0.08);
    }
  }

  const ultimosEspelhos = historico
    .map((h) => h.espelhoNota)
    .filter((n): n is number => n !== null && n !== undefined);
  if (ultimosEspelhos.length >= 2) {
    const recente = ultimosEspelhos[ultimosEspelhos.length - 1];
    const anterior = ultimosEspelhos[ultimosEspelhos.length - 2];
    if (recente < anterior - 5) {
      bias = clampBias(bias + 0.1);
    }
  }

  if (espelhoMedia !== null && espelhoMedia < 50) {
    bias = clampBias(bias + 0.05);
  }

  for (const d of disciplinasEmRisco) {
    boost[d] = Math.min(1.5, (boost[d] ?? 1) + 0.1);
  }

  return {
    capacidadeQuestoes: capacidade,
    biasRevisao: bias,
    boostDisciplinas: boost,
    updatedAt: new Date().toISOString(),
  };
}
