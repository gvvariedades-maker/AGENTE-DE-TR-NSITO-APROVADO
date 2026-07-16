import { getDesempenhoResumo } from "@/lib/desempenho";
import { getRetencaoResumo } from "@/lib/retencao";
import { getSemaforoData } from "@/lib/semaforo";
import { getDominioResumo, type DominioResumo } from "@/lib/tutor/dominio-resumo";
import { diasParaProva } from "@/lib/prova-data";
import {
  montarPlanoProvaResumo,
  type FaseProva,
  type PacoteDia,
  type PlanoProvaResumo,
  type ZonaChegada,
  calcularFase,
  calcularDebitoDiario,
  calcularDiasAtraso,
  calcularGapEdital,
  calcularSemaforoChegada,
  labelFase,
  orientacaoFase,
  montarPacoteDia,
  proporcaoRevisoesSessao,
  alocarSlotsSessaoAuto,
  permitirNovasAleatorias,
} from "@/lib/plano-prova-calc";

export type { FaseProva, PacoteDia, PlanoProvaResumo, ZonaChegada };
export {
  calcularFase,
  calcularDebitoDiario,
  calcularDiasAtraso,
  calcularGapEdital,
  calcularSemaforoChegada,
  labelFase,
  orientacaoFase,
  montarPacoteDia,
  montarPlanoProvaResumo,
  proporcaoRevisoesSessao,
  alocarSlotsSessaoAuto,
  permitirNovasAleatorias,
};

export function planoProvaFallback(): PlanoProvaResumo {
  const dias = diasParaProva();
  return montarPlanoProvaResumo({
    dias,
    topicosTotal: 0,
    topicosVistos: 0,
    coberturaEditalPct: 0,
    revisoesHoje: 0,
    memoriaAindaFrescas: 0,
    espelhoMedia: null,
    espelhoQuantidade: 0,
    hasData: false,
  });
}

export async function getPlanoProvaResumo(
  userId?: string | null,
  dominioPreload?: DominioResumo,
): Promise<PlanoProvaResumo> {
  const dias = diasParaProva();

  if (!userId) {
    return planoProvaFallback();
  }

  try {
    const dominioPromise = dominioPreload
      ? Promise.resolve(dominioPreload)
      : getDominioResumo(userId);

    const [desempenho, retencao, semaforo, dominio] = await Promise.all([
      getDesempenhoResumo(userId),
      getRetencaoResumo(userId),
      getSemaforoData(userId),
      dominioPromise,
    ]);

    const disciplinaPrioritaria =
      semaforo.disciplinasEmRisco[0]?.disciplina ??
      (desempenho.coberturaEditalPct < 50
        ? "legislacao_transito"
        : undefined);

    return montarPlanoProvaResumo({
      dias,
      topicosTotal: desempenho.topicosTotal,
      topicosVistos: desempenho.topicosVistos,
      topicosBacklog: dominio.backlog,
      coberturaEditalPct: desempenho.coberturaEditalPct,
      revisoesHoje: retencao.revisoesHoje,
      memoriaAindaFrescas: retencao.aprendendo,
      espelhoMedia: semaforo.espelho.media,
      espelhoQuantidade: semaforo.espelho.quantidade,
      disciplinaPrioritaria,
      disciplinas: desempenho.disciplinas.map((d) => ({
        disciplina: d.disciplina,
        acertos: d.acertos,
        tentativas: d.tentativas,
      })),
      disciplinasEmRisco: semaforo.disciplinasEmRisco,
      dominioGlobal: dominio.global,
      hasData:
        desempenho.hasData ||
        retencao.hasData ||
        semaforo.espelho.quantidade > 0 ||
        dominio.hasData,
    });
  } catch {
    return planoProvaFallback();
  }
}
