import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { simulados } from "@/lib/db/schema";
import {
  DISCIPLINAS_ESPECIFICOS,
  DISCIPLINAS_GERAIS,
  MAX_PONTOS_ESPECIFICOS,
  MAX_PONTOS_GERAIS,
  MIN_PONTOS_DISCIPLINA_ESPECIFICO,
  MIN_PONTOS_DISCIPLINA_GERAL,
  MIN_PONTOS_TOTAL,
  type ZonaSemaforo,
  isDisciplinaGeral,
} from "@/lib/edital-constants";
import { diasParaProva } from "@/lib/prova-data";
import { DISCIPLINA_LABELS, type Disciplina } from "@/types";

const JANELA_ESPELHO = 3;

export interface ZonaMetrica {
  label: string;
  pontos: number | null;
  maximo: number;
  minimo: number;
  zona: ZonaSemaforo;
  percentual: number;
  statusLabel: string;
}

export interface NotaEspelho {
  nota: number;
  createdAt: Date;
}

/** Último, média e melhor entre os últimos N simulados entregues. */
export interface EspelhoResumo {
  janela: number;
  quantidade: number;
  ultimo: NotaEspelho | null;
  media: number | null;
  melhor: number | null;
}

export interface SemaforoData {
  gerais: ZonaMetrica;
  especificos: ZonaMetrica;
  total: ZonaMetrica;
  hasData: boolean;
  diasParaProva: number;
  disciplinasEmRisco: { disciplina: Disciplina; pontos: number; minimo: number }[];
  /** Só espelhos entregues — nunca projeção de treino. */
  fonte: "simulado" | "vazio";
  espelho: EspelhoResumo;
}

function calcularZona(
  pontos: number | null,
  minimo: number,
  emRiscoDisciplina = false,
): ZonaSemaforo {
  if (pontos === null) return "vazio";
  if (pontos < minimo || emRiscoDisciplina) return "vermelho";
  if (pontos < minimo * 2) return "amarelo";
  return "verde";
}

function statusLabel(zona: ZonaSemaforo): string {
  switch (zona) {
    case "verde":
      return "Seguro";
    case "amarelo":
      return "Atenção";
    case "vermelho":
      return "Risco";
    case "vazio":
      return "Sem simulado";
  }
}

function buildZona(
  label: string,
  pontos: number | null,
  maximo: number,
  minimo: number,
  emRisco = false,
): ZonaMetrica {
  const zona = calcularZona(pontos, minimo, emRisco);
  const percentual =
    pontos !== null && maximo > 0 ? Math.min(100, (pontos / maximo) * 100) : 0;

  return {
    label,
    pontos,
    maximo,
    minimo,
    zona,
    percentual,
    statusLabel: statusLabel(zona),
  };
}

export function calcularDeSimulado(
  notaTotal: number,
  notasJson: Record<string, number>,
): Omit<SemaforoData, "diasParaProva" | "fonte" | "espelho"> {
  const pontosPorDisciplina = notasJson as Partial<Record<Disciplina, number>>;

  let pontosGerais = 0;
  let pontosEspecificos = 0;
  const disciplinasEmRisco: SemaforoData["disciplinasEmRisco"] = [];

  for (const d of DISCIPLINAS_GERAIS) {
    const pts = pontosPorDisciplina[d] ?? 0;
    pontosGerais += pts;
    if (pts < MIN_PONTOS_DISCIPLINA_GERAL) {
      disciplinasEmRisco.push({
        disciplina: d,
        pontos: pts,
        minimo: MIN_PONTOS_DISCIPLINA_GERAL,
      });
    }
  }

  for (const d of DISCIPLINAS_ESPECIFICOS) {
    const pts = pontosPorDisciplina[d] ?? 0;
    pontosEspecificos += pts;
    if (pts < MIN_PONTOS_DISCIPLINA_ESPECIFICO) {
      disciplinasEmRisco.push({
        disciplina: d,
        pontos: pts,
        minimo: MIN_PONTOS_DISCIPLINA_ESPECIFICO,
      });
    }
  }

  const emRiscoGerais = disciplinasEmRisco.some((r) =>
    isDisciplinaGeral(r.disciplina),
  );
  const emRiscoEspecificos = disciplinasEmRisco.some(
    (r) => !isDisciplinaGeral(r.disciplina),
  );

  return {
    gerais: buildZona(
      "Gerais",
      pontosGerais,
      MAX_PONTOS_GERAIS,
      MIN_PONTOS_DISCIPLINA_GERAL,
      emRiscoGerais,
    ),
    especificos: buildZona(
      "Específicos",
      pontosEspecificos,
      MAX_PONTOS_ESPECIFICOS,
      MIN_PONTOS_DISCIPLINA_ESPECIFICO,
      emRiscoEspecificos,
    ),
    total: buildZona("Total", notaTotal, 100, MIN_PONTOS_TOTAL),
    hasData: true,
    disciplinasEmRisco,
  };
}

function espelhoVazio(): EspelhoResumo {
  return {
    janela: JANELA_ESPELHO,
    quantidade: 0,
    ultimo: null,
    media: null,
    melhor: null,
  };
}

function montarEspelhoResumo(
  rows: { notaTotal: number; createdAt: Date }[],
): EspelhoResumo {
  if (rows.length === 0) return espelhoVazio();

  const notas = rows.map((r) => r.notaTotal);
  const ultimoRow = rows[0];
  const media =
    Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10;
  const melhor = Math.max(...notas);

  return {
    janela: JANELA_ESPELHO,
    quantidade: rows.length,
    ultimo: { nota: ultimoRow.notaTotal, createdAt: ultimoRow.createdAt },
    media,
    melhor,
  };
}

function semaforoVazio(): SemaforoData {
  const vazio = (label: string, maximo: number, minimo: number): ZonaMetrica =>
    buildZona(label, null, maximo, minimo);

  return {
    gerais: vazio("Gerais", MAX_PONTOS_GERAIS, MIN_PONTOS_DISCIPLINA_GERAL),
    especificos: vazio(
      "Específicos",
      MAX_PONTOS_ESPECIFICOS,
      MIN_PONTOS_DISCIPLINA_ESPECIFICO,
    ),
    total: vazio("Total", 100, MIN_PONTOS_TOTAL),
    hasData: false,
    diasParaProva: diasParaProva(),
    disciplinasEmRisco: [],
    fonte: "vazio",
    espelho: espelhoVazio(),
  };
}

/** Semáforo e notas de espelho — apenas simulados entregues (últimos 3). */
export async function getSemaforoData(
  userId?: string | null,
): Promise<SemaforoData> {
  const dias = diasParaProva();

  if (!userId) {
    return { ...semaforoVazio(), diasParaProva: dias };
  }

  try {
    const recentes = await db
      .select({
        notaTotal: simulados.notaTotal,
        notasDisciplinaJson: simulados.notasDisciplinaJson,
        createdAt: simulados.createdAt,
      })
      .from(simulados)
      .where(eq(simulados.userId, userId))
      .orderBy(desc(simulados.createdAt))
      .limit(JANELA_ESPELHO);

    if (recentes.length === 0) {
      return { ...semaforoVazio(), diasParaProva: dias };
    }

    const espelho = montarEspelhoResumo(
      recentes.map((r) => ({
        notaTotal: r.notaTotal,
        createdAt: r.createdAt,
      })),
    );

    const ultimo = recentes[0];
    const notasJson =
      (ultimo.notasDisciplinaJson as Record<string, number>) ?? {};

    return {
      ...calcularDeSimulado(ultimo.notaTotal, notasJson),
      diasParaProva: dias,
      fonte: "simulado",
      espelho,
    };
  } catch {
    return { ...semaforoVazio(), diasParaProva: dias };
  }
}

export { formatPontos } from "@/lib/semaforo-format";
export { DISCIPLINA_LABELS };
