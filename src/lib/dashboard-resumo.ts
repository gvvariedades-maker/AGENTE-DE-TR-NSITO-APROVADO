import { getDesempenhoResumo, getAtividadeHoje, type DesempenhoResumo } from "@/lib/desempenho";
import { getRetencaoResumo, type RetencaoResumo } from "@/lib/retencao";
import { getQuestoesCount } from "@/lib/questoes";
import { getContagemQuestoesReais } from "@/lib/questoes-reais";
import { getPioresTopicos } from "@/lib/piores-topicos";
import { withTimeout } from "@/lib/with-timeout";
import { DISCIPLINA_LABELS, DISCIPLINAS, PROVA_DATA, SIMULADO_ESPELHO_DISTRIBUICAO } from "@/types";
import type { DashboardResumo } from "@/types/dashboard-resumo";
import {
  isDisciplinaGeral,
  MAX_PONTOS_ESPECIFICOS,
  MAX_PONTOS_GERAIS,
  MIN_PONTOS_DISCIPLINA_ESPECIFICO,
  MIN_PONTOS_DISCIPLINA_GERAL,
} from "@/lib/edital-constants";

const QUERY_MS = 8_000;

/** Contagem de reais desconhecida → não desativar o card. */
export const REAIS_COUNT_UNKNOWN = -1;

function diasParaProvaFallback() {
  const diff = PROVA_DATA.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function desempenhoFallback(): DesempenhoResumo {
  const dias = diasParaProvaFallback();
  const zonaVazia = {
    pontos: null as number | null,
    maximo: 0,
    minimo: 0,
    zona: "vazio" as const,
    percentual: 0,
    statusLabel: "Sem dados",
  };
  return {
    semaforo: {
      gerais: {
        ...zonaVazia,
        label: "Gerais",
        maximo: MAX_PONTOS_GERAIS,
        minimo: MIN_PONTOS_DISCIPLINA_GERAL,
      },
      especificos: {
        ...zonaVazia,
        label: "Específicos",
        maximo: MAX_PONTOS_ESPECIFICOS,
        minimo: MIN_PONTOS_DISCIPLINA_ESPECIFICO,
      },
      total: { ...zonaVazia, label: "Total", maximo: 100, minimo: 50 },
      hasData: false,
      diasParaProva: dias,
      disciplinasEmRisco: [],
      fonte: "vazio",
    },
    disciplinas: DISCIPLINAS.map((d) => ({
      disciplina: d,
      label: DISCIPLINA_LABELS[d],
      pontos: 0,
      minimo: isDisciplinaGeral(d)
        ? MIN_PONTOS_DISCIPLINA_GERAL
        : MIN_PONTOS_DISCIPLINA_ESPECIFICO,
      zona: "vazio" as const,
      tentativas: 0,
      acertos: 0,
      taxaAcerto: 0,
      topicosTotal: 0,
      topicosMapeados: 0,
      topicosVistos: 0,
      coberturaPct: 0,
      questoesProva: SIMULADO_ESPELHO_DISTRIBUICAO[d],
    })),
    overview: { total: 0, acertos: 0, erros: 0, taxaAcerto: 0 },
    coberturaEditalPct: 0,
    topicosTotal: 0,
    topicosVistos: 0,
    topicosMapeados: 0,
    atividade: [],
    sessoesRecentes: [],
    hasData: false,
  };
}

export const retencaoFallback: RetencaoResumo = {
  aprendendo: 0,
  jovem: 0,
  maduro: 0,
  revisoesHoje: 0,
  hasData: false,
};

/** Uma query por vez — evita saturar pool Postgres (max:1) na Vercel. */
export async function loadDashboardResumo(
  userId?: string | null,
): Promise<DashboardResumo> {
  const desempenho = await withTimeout(
    getDesempenhoResumo(userId),
    QUERY_MS,
    desempenhoFallback(),
    "desempenho",
  );
  const retencao = await withTimeout(
    getRetencaoResumo(userId),
    QUERY_MS,
    retencaoFallback,
    "retencao",
  );
  const atividadeHoje = await withTimeout(
    getAtividadeHoje(userId),
    QUERY_MS,
    { questoes: 0, acertos: 0 },
    "atividadeHoje",
  );
  const questoesCount = await withTimeout(
    getQuestoesCount(),
    QUERY_MS,
    0,
    "questoesCount",
  );
  const questoesReaisCount = await withTimeout(
    getContagemQuestoesReais(),
    QUERY_MS,
    REAIS_COUNT_UNKNOWN,
    "questoesReais",
  );
  const pioresTopicos = await withTimeout(
    getPioresTopicos(userId),
    QUERY_MS,
    [],
    "pioresTopicos",
  );

  return {
    desempenho,
    retencao,
    atividadeHoje,
    questoesCount,
    questoesReaisCount,
    pioresTopicos,
  };
}
