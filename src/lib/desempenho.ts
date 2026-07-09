import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  attempts,
  questions,
  simulados,
  studySessions,
  topics,
} from "@/lib/db/schema";
import {
  isDisciplinaGeral,
  MIN_PONTOS_DISCIPLINA_ESPECIFICO,
  MIN_PONTOS_DISCIPLINA_GERAL,
  type ZonaSemaforo,
} from "@/lib/edital-constants";
import { getAtividadeSemanal, type AtividadeDia } from "@/lib/retencao";
import { getSemaforoData, type SemaforoData } from "@/lib/semaforo";
import { projetarPontosDisciplina } from "@/lib/semaforo-projecao";
import {
  DISCIPLINAS,
  DISCIPLINA_LABELS,
  SIMULADO_ESPELHO_DISTRIBUICAO,
  type Disciplina,
} from "@/types";

export interface DesempenhoDisciplina {
  disciplina: Disciplina;
  label: string;
  pontos: number;
  minimo: number;
  zona: ZonaSemaforo;
  tentativas: number;
  acertos: number;
  taxaAcerto: number;
  /** Tópicos com ao menos 1 questão no banco (estudáveis). */
  topicosTotal: number;
  /** Tópicos do Anexo I mapeados no banco (com ou sem questão). */
  topicosMapeados: number;
  topicosVistos: number;
  coberturaPct: number;
  questoesProva: number;
}

export interface DesempenhoTopico {
  topicId: string;
  slug: string;
  tentativas: number;
  acertos: number;
  taxaAcerto: number;
}

export interface SessaoEstudoResumo {
  id: string;
  modo: string;
  disciplina: Disciplina | null;
  topicoSlug: string | null;
  plannedCount: number;
  answeredCount: number;
  acertos: number;
  erros: number;
  completed: boolean;
  startedAt: Date;
}

export interface DesempenhoResumo {
  semaforo: SemaforoData;
  disciplinas: DesempenhoDisciplina[];
  coberturaEditalPct: number;
  /** Tópicos estudáveis (com questão no banco). */
  topicosTotal: number;
  topicosVistos: number;
  /** Todos os microtópicos do Anexo I no banco. */
  topicosMapeados: number;
  atividade: AtividadeDia[];
  sessoesRecentes: SessaoEstudoResumo[];
  hasData: boolean;
}

function calcularZonaDisciplina(
  pontos: number,
  disciplina: Disciplina,
  emRisco: boolean,
): ZonaSemaforo {
  const minimo = isDisciplinaGeral(disciplina)
    ? MIN_PONTOS_DISCIPLINA_GERAL
    : MIN_PONTOS_DISCIPLINA_ESPECIFICO;
  if (pontos < minimo || emRisco) return "vermelho";
  if (pontos < minimo * 2) return "amarelo";
  return "verde";
}

export async function getDesempenhoTopicos(
  userId: string,
  disciplina: Disciplina,
  limit = 50,
): Promise<DesempenhoTopico[]> {
  try {
    const rows = await db.execute<{
      topic_id: string;
      slug: string;
      tentativas: number;
      acertos: number;
    }>(sql`
      SELECT
        t.id AS topic_id,
        t.nome AS slug,
        count(a.id)::int AS tentativas,
        count(*) filter (where a.acertou)::int AS acertos
      FROM topics t
      LEFT JOIN questions q ON q.topic_id = t.id
      LEFT JOIN attempts a
        ON a.question_id = q.id AND a.user_id = ${userId}::uuid
      WHERE t.disciplina = ${disciplina}
      GROUP BY t.id, t.nome
      HAVING count(a.id) > 0
      ORDER BY
        count(*) filter (where not a.acertou) DESC,
        count(a.id) DESC
      LIMIT ${limit}
    `);

    return rows.map((r) => ({
      topicId: r.topic_id,
      slug: r.slug,
      tentativas: r.tentativas,
      acertos: r.acertos,
      taxaAcerto:
        r.tentativas > 0
          ? Math.round((r.acertos / r.tentativas) * 100)
          : 0,
    }));
  } catch {
    return [];
  }
}

async function getNotasSimuladoPorDisciplina(
  userId: string,
): Promise<Partial<Record<Disciplina, number>> | null> {
  try {
    const [ultimo] = await db
      .select({ notasDisciplinaJson: simulados.notasDisciplinaJson })
      .from(simulados)
      .where(eq(simulados.userId, userId))
      .orderBy(desc(simulados.createdAt))
      .limit(1);

    if (!ultimo) return null;
    return (ultimo.notasDisciplinaJson as Partial<Record<Disciplina, number>>) ?? null;
  } catch {
    return null;
  }
}

async function getCatalogoTopicos(): Promise<{
  topicosMapeados: number;
  topicosComQuestao: number;
}> {
  try {
    const [row] = await db.execute<{
      topicos_mapeados: number;
      topicos_com_questao: number;
    }>(sql`
      SELECT
        count(distinct t.id)::int AS topicos_mapeados,
        count(distinct t.id) FILTER (WHERE q.id IS NOT NULL)::int AS topicos_com_questao
      FROM topics t
      LEFT JOIN questions q ON q.topic_id = t.id
    `);

    return {
      topicosMapeados: row?.topicos_mapeados ?? 0,
      topicosComQuestao: row?.topicos_com_questao ?? 0,
    };
  } catch {
    return { topicosMapeados: 0, topicosComQuestao: 0 };
  }
}

export async function getDesempenhoResumo(
  userId?: string | null,
): Promise<DesempenhoResumo> {
  const [semaforo, atividade, catalogo] = await Promise.all([
    getSemaforoData(userId),
    getAtividadeSemanal(userId),
    getCatalogoTopicos(),
  ]);

  const vazio: DesempenhoResumo = {
    semaforo,
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
    coberturaEditalPct: 0,
    topicosTotal: catalogo.topicosComQuestao,
    topicosVistos: 0,
    topicosMapeados: catalogo.topicosMapeados,
    atividade,
    sessoesRecentes: [],
    hasData: false,
  };

  if (!userId) return vazio;

  try {
    const [statsRows, coberturaRows, sessoes, notasSimulado] = await Promise.all([
      db
        .select({
          disciplina: topics.disciplina,
          acertou: attempts.acertou,
        })
        .from(attempts)
        .innerJoin(questions, eq(attempts.questionId, questions.id))
        .innerJoin(topics, eq(questions.topicId, topics.id))
        .where(eq(attempts.userId, userId)),

      db.execute<{
        disciplina: Disciplina;
        topicos_mapeados: number;
        topicos_com_questao: number;
        topicos_vistos: number;
      }>(sql`
        SELECT
          t.disciplina,
          count(distinct t.id)::int AS topicos_mapeados,
          count(distinct t.id) FILTER (WHERE q.id IS NOT NULL)::int AS topicos_com_questao,
          count(distinct CASE WHEN a.id IS NOT NULL THEN t.id END)::int AS topicos_vistos
        FROM topics t
        LEFT JOIN questions q ON q.topic_id = t.id
        LEFT JOIN attempts a
          ON a.question_id = q.id AND a.user_id = ${userId}::uuid
        GROUP BY t.disciplina
      `),

      db
        .select({
          id: studySessions.id,
          modo: studySessions.modo,
          disciplina: studySessions.disciplina,
          topicoSlug: studySessions.topicoSlug,
          plannedCount: studySessions.plannedCount,
          answeredCount: studySessions.answeredCount,
          acertos: studySessions.acertos,
          erros: studySessions.erros,
          completed: studySessions.completed,
          startedAt: studySessions.startedAt,
        })
        .from(studySessions)
        .where(eq(studySessions.userId, userId))
        .orderBy(desc(studySessions.startedAt))
        .limit(8),

      getNotasSimuladoPorDisciplina(userId),
    ]);

    const coberturaMap = new Map(
      coberturaRows.map((r) => [r.disciplina, r]),
    );

    const porDisciplina = new Map<
      Disciplina,
      { acertos: number; tentativas: number }
    >();
    for (const row of statsRows) {
      const atual = porDisciplina.get(row.disciplina) ?? {
        acertos: 0,
        tentativas: 0,
      };
      atual.tentativas += 1;
      if (row.acertou) atual.acertos += 1;
      porDisciplina.set(row.disciplina, atual);
    }

    const emRiscoSet = new Set(
      semaforo.disciplinasEmRisco.map((r) => r.disciplina),
    );

    let topicosEstudaveisGeral = 0;
    let topicosVistosGeral = 0;

    const disciplinas: DesempenhoDisciplina[] = DISCIPLINAS.map((d) => {
      const stats = porDisciplina.get(d) ?? { acertos: 0, tentativas: 0 };
      const cob = coberturaMap.get(d);
      const topicosMapeados = cob?.topicos_mapeados ?? 0;
      const topicosTotal = cob?.topicos_com_questao ?? 0;
      const topicosVistos = cob?.topicos_vistos ?? 0;
      topicosEstudaveisGeral += topicosTotal;
      topicosVistosGeral += topicosVistos;

      const pontos =
        stats.tentativas > 0
          ? projetarPontosDisciplina(stats.acertos, stats.tentativas, d)
          : (notasSimulado?.[d] ?? 0);

      const minimo = isDisciplinaGeral(d)
        ? MIN_PONTOS_DISCIPLINA_GERAL
        : MIN_PONTOS_DISCIPLINA_ESPECIFICO;

      return {
        disciplina: d,
        label: DISCIPLINA_LABELS[d],
        pontos,
        minimo,
        zona: calcularZonaDisciplina(pontos, d, emRiscoSet.has(d)),
        tentativas: stats.tentativas,
        acertos: stats.acertos,
        taxaAcerto:
          stats.tentativas > 0
            ? Math.round((stats.acertos / stats.tentativas) * 100)
            : 0,
        topicosTotal,
        topicosMapeados,
        topicosVistos,
        coberturaPct:
          topicosTotal > 0
            ? Math.round((topicosVistos / topicosTotal) * 100)
            : 0,
        questoesProva: SIMULADO_ESPELHO_DISTRIBUICAO[d],
      };
    });

    const coberturaEditalPct =
      topicosEstudaveisGeral > 0
        ? Math.round((topicosVistosGeral / topicosEstudaveisGeral) * 100)
        : 0;

    return {
      semaforo,
      disciplinas,
      coberturaEditalPct,
      topicosTotal: topicosEstudaveisGeral,
      topicosVistos: topicosVistosGeral,
      topicosMapeados: catalogo.topicosMapeados,
      atividade,
      sessoesRecentes: sessoes.map((s) => ({
        id: s.id,
        modo: s.modo,
        disciplina: s.disciplina,
        topicoSlug: s.topicoSlug,
        plannedCount: s.plannedCount,
        answeredCount: s.answeredCount,
        acertos: s.acertos,
        erros: s.erros,
        completed: s.completed,
        startedAt: s.startedAt,
      })),
      hasData: statsRows.length > 0 || sessoes.length > 0 || notasSimulado !== null,
    };
  } catch {
    return vazio;
  }
}

export async function getAtividadeHoje(
  userId?: string | null,
): Promise<{ questoes: number; acertos: number }> {
  if (!userId) return { questoes: 0, acertos: 0 };

  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const [row] = await db
      .select({
        questoes: sql<number>`count(*)::int`,
        acertos: sql<number>`count(*) filter (where ${attempts.acertou})::int`,
      })
      .from(attempts)
      .where(
        and(eq(attempts.userId, userId), gte(attempts.createdAt, hoje)),
      );

    return {
      questoes: row?.questoes ?? 0,
      acertos: row?.acertos ?? 0,
    };
  } catch {
    return { questoes: 0, acertos: 0 };
  }
}

export { DISCIPLINA_LABELS };
