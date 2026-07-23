/**
 * Ranking puro da missão corretiva pós-simulado (Fase 6).
 * Sem DB — usado por missao-pos-simulado.ts e testes.
 */

import { pesoAcerto } from "@/lib/edital-constants";
import {
  MISSAO_POS_SIMULADO_META,
  valorAtividadeCorretiva,
} from "@/lib/motor-ata-terms";
import { SIMULADO_ESPELHO_DISTRIBUICAO, type Disciplina } from "@/types";

export type CandidatoMissaoCorretiva = {
  questionId: string;
  disciplina: Disciplina;
  errouNoSimulado: boolean;
  masteryProbability: number | null;
  highConfError: boolean;
  transferPending: boolean;
  forgettingRisk01: number;
  /** Já respondida nesta sessão de missão — evita duplicata. */
  exclude?: boolean;
};

export type ItemMissaoCorretiva = CandidatoMissaoCorretiva & {
  valor: number;
};

export function rankCandidatosMissaoCorretiva(
  candidatos: CandidatoMissaoCorretiva[],
  meta: number = MISSAO_POS_SIMULADO_META,
): ItemMissaoCorretiva[] {
  const scored = candidatos
    .filter((c) => !c.exclude)
    .map((c) => {
      const qtd = SIMULADO_ESPELHO_DISTRIBUICAO[c.disciplina] ?? 0;
      const valor = valorAtividadeCorretiva({
        pesoEditalFrac: qtd / 60,
        pontosPorAcerto: pesoAcerto(c.disciplina),
        errouNoSimulado: c.errouNoSimulado,
        masteryProbability: c.masteryProbability,
        highConfError: c.highConfError,
        transferPending: c.transferPending,
        forgettingRisk01: c.forgettingRisk01,
      });
      return { ...c, valor };
    })
    .sort((a, b) => b.valor - a.valor || a.questionId.localeCompare(b.questionId));

  const seen = new Set<string>();
  const out: ItemMissaoCorretiva[] = [];
  for (const item of scored) {
    if (seen.has(item.questionId)) continue;
    seen.add(item.questionId);
    out.push(item);
    if (out.length >= meta) break;
  }
  return out;
}
