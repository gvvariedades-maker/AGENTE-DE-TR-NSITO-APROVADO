import { getDesempenhoResumo, getAtividadeHoje, getProgressoMissaoHoje, type DesempenhoResumo } from "@/lib/desempenho";
import { getRetencaoResumo, type RetencaoResumo } from "@/lib/retencao";
import { getQuestoesCount } from "@/lib/questoes";
import { getContagemQuestoesReais } from "@/lib/questoes-reais";
import { getPioresTopicos } from "@/lib/piores-topicos";
import { withTimeout } from "@/lib/with-timeout";
import { getPlanoProvaResumo, planoProvaFallback } from "@/lib/plano-prova";
import type { PlanoProvaResumo } from "@/lib/plano-prova-calc";
import {
  montarSemanaChegada,
  semanaChegadaFallback,
  type SemanaChegadaResumo,
} from "@/lib/semana-chegada";
import {
  dominioResumoVazio,
  getDominioResumo,
} from "@/lib/tutor/dominio-resumo";
import {
  getPainelDominioEvidencias,
  painelDominioVazio,
} from "@/lib/mastery/painel-dominio-evidencias";
import {
  montarHistoricoCalib,
  recalcularCalibracao,
} from "@/lib/tutor/calibracao";
import {
  getTutorCalibracao,
  salvarTutorCalibracao,
} from "@/lib/tutor/calibracao-store";
import { decidirMetaQuestoes } from "@/lib/tutor/politica";
import { carregarTutorContexto } from "@/lib/tutor/contexto";
import { diasParaProva } from "@/lib/prova-data";
import { DISCIPLINA_LABELS, DISCIPLINAS, SIMULADO_ESPELHO_DISTRIBUICAO } from "@/types";
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

export function desempenhoFallback(): DesempenhoResumo {
  const dias = diasParaProva();
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
      espelho: {
        janela: 3,
        quantidade: 0,
        ultimo: null,
        media: null,
        melhor: null,
      },
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

export function buildSemanaChegadaResumo(input: {
  plano: PlanoProvaResumo;
  desempenho: DesempenhoResumo;
  atividadeHoje: { questoes: number };
  pioresTopicos: DashboardResumo["pioresTopicos"];
  calibracao?: Awaited<ReturnType<typeof getTutorCalibracao>>;
}): SemanaChegadaResumo {
  try {
    return montarSemanaChegada({
      plano: input.plano,
      atividadeHoje: input.atividadeHoje,
      disciplinasEmRisco: input.desempenho.semaforo.disciplinasEmRisco,
      disciplinas: input.desempenho.disciplinas.map((d) => ({
        disciplina: d.disciplina,
        coberturaPct: d.coberturaPct,
      })),
      espelho: input.desempenho.semaforo.espelho,
      pioresTopicos: input.pioresTopicos,
      calibracao: input.calibracao,
    });
  } catch {
    return semanaChegadaFallback(input.plano);
  }
}

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
  const progressoMissaoHoje = await withTimeout(
    getProgressoMissaoHoje(userId),
    QUERY_MS,
    { questoes: 0, acertos: 0, filaSize: 0 },
    "progressoMissaoHoje",
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
  const dominio = await withTimeout(
    getDominioResumo(userId),
    QUERY_MS,
    dominioResumoVazio(),
    "dominio",
  );
  const dominioEvidencias = await withTimeout(
    getPainelDominioEvidencias(userId),
    QUERY_MS,
    painelDominioVazio(),
    "dominioEvidencias",
  );
  const calibracaoRaw = await withTimeout(
    getTutorCalibracao(userId),
    QUERY_MS,
    await getTutorCalibracao(null),
    "calibracao",
  );
  const plano = await withTimeout(
    getPlanoProvaResumo(userId, dominio),
    QUERY_MS,
    planoProvaFallback(),
    "plano",
  );

  const ctxCalib = carregarTutorContexto({
    plano,
    dominio,
    desempenho,
    retencao,
    atividadeHoje,
    calibracao: calibracaoRaw,
  });
  const metaPadrao = decidirMetaQuestoes(ctxCalib, calibracaoRaw);
  const historico = montarHistoricoCalib(desempenho.atividade, metaPadrao);
  const calibracao = recalcularCalibracao({
    atual: calibracaoRaw,
    historico,
    fase: plano.fase,
    espelhoMedia: plano.espelhoMedia,
    disciplinasEmRisco: desempenho.semaforo.disciplinasEmRisco.map(
      (r) => r.disciplina,
    ),
  });
  if (userId) {
    const mudou =
      calibracao.capacidadeQuestoes !== calibracaoRaw.capacidadeQuestoes ||
      calibracao.biasRevisao !== calibracaoRaw.biasRevisao ||
      JSON.stringify(calibracao.boostDisciplinas) !==
        JSON.stringify(calibracaoRaw.boostDisciplinas);
    if (mudou) {
      await salvarTutorCalibracao(userId, calibracao).catch(() => undefined);
    }
  }

  const semana = buildSemanaChegadaResumo({
    plano,
    desempenho,
    atividadeHoje: { questoes: progressoMissaoHoje.questoes },
    pioresTopicos,
    calibracao,
  });

  return {
    desempenho,
    retencao,
    plano,
    semana,
    dominio,
    dominioEvidencias,
    calibracao,
    atividadeHoje,
    questoesCount,
    questoesReaisCount,
    pioresTopicos,
  };
}
