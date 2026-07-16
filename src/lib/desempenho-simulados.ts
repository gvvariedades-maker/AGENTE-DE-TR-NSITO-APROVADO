import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { simulados } from "@/lib/db/schema";
import {
  isDisciplinaGeral,
  MIN_PONTOS_DISCIPLINA_ESPECIFICO,
  MIN_PONTOS_DISCIPLINA_GERAL,
  MIN_PONTOS_TOTAL,
} from "@/lib/edital-constants";
import {
  getAttemptOverview,
  getAttemptStatsByDisciplina,
} from "@/lib/attempt-stats";
import type { DesempenhoDisciplina, DesempenhoOverview } from "@/lib/desempenho";
import { calcularDeSimulado, type SemaforoData } from "@/lib/semaforo";
import { PROVA_DATA } from "@/types";
import {
  DISCIPLINAS,
  DISCIPLINA_LABELS,
  SIMULADO_ESPELHO_DISTRIBUICAO,
  type Disciplina,
} from "@/types";

export interface SimuladoHistoricoItem {
  id: string;
  notaTotal: number;
  zerouDisciplina: boolean;
  aprovado: boolean;
  duracaoMin: number | null;
  createdAt: Date;
}

export interface DesempenhoSimuladosResumo {
  semaforo: SemaforoData;
  overview: DesempenhoOverview;
  disciplinas: DesempenhoDisciplina[];
  historico: SimuladoHistoricoItem[];
  totalSimulados: number;
  melhorNota: number | null;
  ultimoSimulado: SimuladoHistoricoItem | null;
  hasData: boolean;
}

const OVERVIEW_VAZIO: DesempenhoOverview = {
  total: 0,
  acertos: 0,
  erros: 0,
  taxaAcerto: 0,
};

function diasParaProva() {
  const diff = PROVA_DATA.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function semaforoVazio(): SemaforoData {
  const dias = diasParaProva();
  return {
    gerais: {
      label: "Gerais",
      pontos: null,
      maximo: 20,
      minimo: MIN_PONTOS_DISCIPLINA_GERAL,
      zona: "vazio",
      percentual: 0,
      statusLabel: "Sem simulado",
    },
    especificos: {
      label: "Específicos",
      pontos: null,
      maximo: 80,
      minimo: MIN_PONTOS_DISCIPLINA_ESPECIFICO,
      zona: "vazio",
      percentual: 0,
      statusLabel: "Sem simulado",
    },
    total: {
      label: "Total",
      pontos: null,
      maximo: 100,
      minimo: MIN_PONTOS_TOTAL,
      zona: "vazio",
      percentual: 0,
      statusLabel: "Sem simulado",
    },
    hasData: false,
    diasParaProva: dias,
    disciplinasEmRisco: [],
    fonte: "vazio",
  };
}

function calcularZonaDisciplina(
  pontos: number,
  disciplina: Disciplina,
  emRisco: boolean,
) {
  const minimo = isDisciplinaGeral(disciplina)
    ? MIN_PONTOS_DISCIPLINA_GERAL
    : MIN_PONTOS_DISCIPLINA_ESPECIFICO;
  if (pontos < minimo || emRisco) return "vermelho" as const;
  if (pontos < minimo * 2) return "amarelo" as const;
  return "verde" as const;
}

function mapHistorico(row: {
  id: string;
  notaTotal: number;
  zerouDisciplina: boolean;
  duracaoMin: number | null;
  createdAt: Date;
}): SimuladoHistoricoItem {
  return {
    id: row.id,
    notaTotal: row.notaTotal,
    zerouDisciplina: row.zerouDisciplina,
    aprovado: row.notaTotal >= MIN_PONTOS_TOTAL && !row.zerouDisciplina,
    duracaoMin: row.duracaoMin,
    createdAt: row.createdAt,
  };
}

function buildVazio(): DesempenhoSimuladosResumo {
  return {
    semaforo: semaforoVazio(),
    overview: OVERVIEW_VAZIO,
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
    historico: [],
    totalSimulados: 0,
    melhorNota: null,
    ultimoSimulado: null,
    hasData: false,
  };
}

export function desempenhoSimuladosVazio(): DesempenhoSimuladosResumo {
  return buildVazio();
}

export async function getDesempenhoSimuladosResumo(
  userId?: string | null,
  options?: { since?: Date | null },
): Promise<DesempenhoSimuladosResumo> {
  const since = options?.since ?? null;
  const vazio = buildVazio();

  if (!userId) return vazio;

  try {
    const overview = await getAttemptOverview(userId, since, "simulado");
    const statsRows = await getAttemptStatsByDisciplina(
      userId,
      since,
      "simulado",
    );

    const whereSimulados = since
      ? and(eq(simulados.userId, userId), gte(simulados.createdAt, since))
      : eq(simulados.userId, userId);

    const simuladosRows = await db
      .select({
        id: simulados.id,
        notaTotal: simulados.notaTotal,
        notasDisciplinaJson: simulados.notasDisciplinaJson,
        zerouDisciplina: simulados.zerouDisciplina,
        duracaoMin: simulados.duracaoMin,
        createdAt: simulados.createdAt,
      })
      .from(simulados)
      .where(whereSimulados)
      .orderBy(desc(simulados.createdAt))
      .limit(20);

    const historico = simuladosRows.map(mapHistorico);
    const ultimoRow = simuladosRows[0] ?? null;
    const ultimoSimulado = ultimoRow ? mapHistorico(ultimoRow) : null;
    const melhorNota =
      simuladosRows.length > 0
        ? Math.max(...simuladosRows.map((s) => s.notaTotal))
        : null;

    let semaforo: SemaforoData = semaforoVazio();
    const notasUltimo =
      (ultimoRow?.notasDisciplinaJson as Partial<Record<Disciplina, number>>) ??
      {};

    if (ultimoRow) {
      const parcial = calcularDeSimulado(
        ultimoRow.notaTotal,
        ultimoRow.notasDisciplinaJson as Record<string, number>,
      );
      semaforo = {
        ...parcial,
        diasParaProva: diasParaProva(),
        fonte: "simulado",
      };
    }

    const emRiscoSet = new Set(
      semaforo.disciplinasEmRisco.map((r) => r.disciplina),
    );
    const statsMap = new Map(statsRows.map((r) => [r.disciplina, r]));

    const disciplinas: DesempenhoDisciplina[] = DISCIPLINAS.map((d) => {
      const stats = statsMap.get(d) ?? { acertos: 0, tentativas: 0 };
      const pontos = notasUltimo[d] ?? 0;
      const minimo = isDisciplinaGeral(d)
        ? MIN_PONTOS_DISCIPLINA_GERAL
        : MIN_PONTOS_DISCIPLINA_ESPECIFICO;

      return {
        disciplina: d,
        label: DISCIPLINA_LABELS[d],
        pontos,
        minimo,
        zona: ultimoRow
          ? calcularZonaDisciplina(pontos, d, emRiscoSet.has(d))
          : "vazio",
        tentativas: stats.tentativas,
        acertos: stats.acertos,
        taxaAcerto:
          stats.tentativas > 0
            ? Math.round((stats.acertos / stats.tentativas) * 100)
            : 0,
        topicosTotal: 0,
        topicosMapeados: 0,
        topicosVistos: 0,
        coberturaPct: 0,
        questoesProva: SIMULADO_ESPELHO_DISTRIBUICAO[d],
      };
    });

    return {
      semaforo,
      overview,
      disciplinas,
      historico,
      totalSimulados: simuladosRows.length,
      melhorNota,
      ultimoSimulado,
      hasData:
        overview.total > 0 ||
        simuladosRows.length > 0,
    };
  } catch {
    return vazio;
  }
}
