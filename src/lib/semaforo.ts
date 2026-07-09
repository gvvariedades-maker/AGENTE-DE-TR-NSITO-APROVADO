import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { attempts, questions, simulados, topics } from "@/lib/db/schema";
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
import {
  DISCIPLINA_LABELS,
  PROVA_DATA,
  type Disciplina,
} from "@/types";
import { projetarPontosDisciplina } from "@/lib/semaforo-projecao";

export interface ZonaMetrica {
  label: string;
  pontos: number | null;
  maximo: number;
  minimo: number;
  zona: ZonaSemaforo;
  percentual: number;
  statusLabel: string;
}

export interface SemaforoData {
  gerais: ZonaMetrica;
  especificos: ZonaMetrica;
  total: ZonaMetrica;
  hasData: boolean;
  diasParaProva: number;
  disciplinasEmRisco: { disciplina: Disciplina; pontos: number; minimo: number }[];
  fonte: "simulado" | "attempts" | "vazio";
}

function diasParaProva() {
  const diff = PROVA_DATA.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
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
      return "Sem dados";
  }
}

function agregarPorDisciplina(
  rows: { disciplina: Disciplina; acertou: boolean }[],
): Map<Disciplina, { acertos: number; tentativas: number }> {
  const map = new Map<Disciplina, { acertos: number; tentativas: number }>();

  for (const row of rows) {
    const atual = map.get(row.disciplina) ?? { acertos: 0, tentativas: 0 };
    atual.tentativas += 1;
    if (row.acertou) atual.acertos += 1;
    map.set(row.disciplina, atual);
  }

  return map;
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
): Omit<SemaforoData, "diasParaProva" | "fonte"> {
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

function calcularDeAttempts(
  rows: { disciplina: Disciplina; acertou: boolean }[],
): Omit<SemaforoData, "diasParaProva" | "fonte"> {
  const porDisciplina = agregarPorDisciplina(rows);
  const disciplinasEmRisco: SemaforoData["disciplinasEmRisco"] = [];
  const pontosDisciplina = new Map<Disciplina, number>();

  for (const [disciplina, stats] of porDisciplina) {
    const pts = projetarPontosDisciplina(
      stats.acertos,
      stats.tentativas,
      disciplina,
    );
    pontosDisciplina.set(disciplina, pts);

    const minimo = isDisciplinaGeral(disciplina)
      ? MIN_PONTOS_DISCIPLINA_GERAL
      : MIN_PONTOS_DISCIPLINA_ESPECIFICO;

    if (pts < minimo) {
      disciplinasEmRisco.push({ disciplina, pontos: pts, minimo });
    }
  }

  let pontosGerais = 0;
  for (const d of DISCIPLINAS_GERAIS) {
    pontosGerais += pontosDisciplina.get(d) ?? 0;
  }

  let pontosEspecificos = 0;
  for (const d of DISCIPLINAS_ESPECIFICOS) {
    pontosEspecificos += pontosDisciplina.get(d) ?? 0;
  }

  const notaTotal = pontosGerais + pontosEspecificos;

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
    hasData: rows.length > 0,
    disciplinasEmRisco,
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
  };
}

export async function getSemaforoData(
  userId?: string | null,
): Promise<SemaforoData> {
  const dias = diasParaProva();

  if (!userId) {
    return { ...semaforoVazio(), diasParaProva: dias };
  }

  try {
    const [ultimoSimulado] = await db
      .select()
      .from(simulados)
      .where(eq(simulados.userId, userId))
      .orderBy(desc(simulados.createdAt))
      .limit(1);

    if (ultimoSimulado) {
      const notasJson =
        (ultimoSimulado.notasDisciplinaJson as Record<string, number>) ?? {};
      return {
        ...calcularDeSimulado(ultimoSimulado.notaTotal, notasJson),
        diasParaProva: dias,
        fonte: "simulado",
      };
    }

    const rows = await db
      .select({
        disciplina: topics.disciplina,
        acertou: attempts.acertou,
      })
      .from(attempts)
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(eq(attempts.userId, userId));

    if (rows.length === 0) {
      return { ...semaforoVazio(), diasParaProva: dias };
    }

    return {
      ...calcularDeAttempts(rows),
      diasParaProva: dias,
      fonte: "attempts",
    };
  } catch {
    return { ...semaforoVazio(), diasParaProva: dias };
  }
}

export { formatPontos } from "@/lib/semaforo-format";
export { DISCIPLINA_LABELS };
