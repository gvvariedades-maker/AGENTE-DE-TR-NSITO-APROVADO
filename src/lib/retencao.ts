import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { attempts, estudoReversoSessions, srsCards } from "@/lib/db/schema";

export type EstadoRetencao = "aprendendo" | "jovem" | "maduro";

export interface RetencaoResumo {
  aprendendo: number;
  jovem: number;
  maduro: number;
  revisoesHoje: number;
  hasData: boolean;
}

export interface AtividadeDia {
  data: string;
  total: number;
}

export interface EstudoReversoResumo {
  sessoesTotal: number;
  sessoesConcluidas: number;
  taxaConclusao: number;
  /** Taxa de acerto na tentativa imediatamente anterior ao visual concluído. */
  taxaAcertoPreVisual: number | null;
  /** Taxa de acerto na próxima tentativa após visual concluído. */
  taxaAcertoPosVisual: number | null;
  /** Diferença em pontos percentuais (pós − pré). */
  deltaAcerto: number | null;
  /** Amostras usadas no cálculo pós-visual. */
  amostrasPosVisual: number;
  hasData: boolean;
}

/** Limiares de maturidade (convenção Anki/FSRS por estabilidade em dias). */
const MATURE_DIAS = 21;
const JOVEM_DIAS = 7;

function classificarEstado(stabilityDias: number): EstadoRetencao {
  if (stabilityDias >= MATURE_DIAS) return "maduro";
  if (stabilityDias >= JOVEM_DIAS) return "jovem";
  return "aprendendo";
}

export async function getRetencaoResumo(
  userId?: string | null,
): Promise<RetencaoResumo> {
  const vazio: RetencaoResumo = {
    aprendendo: 0,
    jovem: 0,
    maduro: 0,
    revisoesHoje: 0,
    hasData: false,
  };

  if (!userId) return vazio;

  try {
    const cards = await db
      .select({ stability: srsCards.stability })
      .from(srsCards)
      .where(eq(srsCards.userId, userId));

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const [revisoes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(srsCards)
      .where(
        and(
          eq(srsCards.userId, userId),
          lte(srsCards.nextReview, new Date()),
        ),
      );

    if (cards.length === 0) {
      return { ...vazio, revisoesHoje: revisoes?.count ?? 0 };
    }

    const resumo = { aprendendo: 0, jovem: 0, maduro: 0 };
    for (const card of cards) {
      const estado = classificarEstado(card.stability);
      resumo[estado] += 1;
    }

    return {
      ...resumo,
      revisoesHoje: revisoes?.count ?? 0,
      hasData: true,
    };
  } catch {
    return vazio;
  }
}

export async function getAtividadeSemanal(
  userId?: string | null,
): Promise<AtividadeDia[]> {
  const dias: AtividadeDia[] = [];
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    dias.push({
      data: d.toISOString().slice(0, 10),
      total: 0,
    });
  }

  if (!userId) return dias;

  try {
    const inicio = new Date(hoje);
    inicio.setDate(inicio.getDate() - 6);

    const rows = await db
      .select({
        dia: sql<string>`date(${attempts.createdAt})::text`,
        total: sql<number>`count(*)::int`,
      })
      .from(attempts)
      .where(
        and(
          eq(attempts.userId, userId),
          gte(attempts.createdAt, inicio),
        ),
      )
      .groupBy(sql`date(${attempts.createdAt})`);

    const mapa = new Map(rows.map((r) => [r.dia, r.total]));
    return dias.map((d) => ({
      ...d,
      total: mapa.get(d.data) ?? 0,
    }));
  } catch {
    return dias;
  }
}

export async function getEstudoReversoResumo(
  userId?: string | null,
): Promise<EstudoReversoResumo> {
  const vazio: EstudoReversoResumo = {
    sessoesTotal: 0,
    sessoesConcluidas: 0,
    taxaConclusao: 0,
    taxaAcertoPreVisual: null,
    taxaAcertoPosVisual: null,
    deltaAcerto: null,
    amostrasPosVisual: 0,
    hasData: false,
  };

  if (!userId) return vazio;

  try {
    const [stats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        concluidas: sql<number>`count(*) filter (where ${estudoReversoSessions.concluido})::int`,
      })
      .from(estudoReversoSessions)
      .where(eq(estudoReversoSessions.userId, userId));

    const total = stats?.total ?? 0;
    const concluidas = stats?.concluidas ?? 0;

    const eficacia = await calcularEficaciaEstudoReverso(userId);

    return {
      sessoesTotal: total,
      sessoesConcluidas: concluidas,
      taxaConclusao: total > 0 ? Math.round((concluidas / total) * 100) : 0,
      taxaAcertoPreVisual: eficacia.taxaAcertoPreVisual,
      taxaAcertoPosVisual: eficacia.taxaAcertoPosVisual,
      deltaAcerto: eficacia.deltaAcerto,
      amostrasPosVisual: eficacia.amostrasPosVisual,
      hasData: total > 0,
    };
  } catch {
    return vazio;
  }
}

interface EficaciaInterna {
  taxaAcertoPreVisual: number | null;
  taxaAcertoPosVisual: number | null;
  deltaAcerto: number | null;
  amostrasPosVisual: number;
}

/**
 * Correlaciona sessões de estudo reverso concluídas com a tentativa
 * anterior e a próxima no mesmo questionId.
 */
async function calcularEficaciaEstudoReverso(
  userId: string,
): Promise<EficaciaInterna> {
  const vazio: EficaciaInterna = {
    taxaAcertoPreVisual: null,
    taxaAcertoPosVisual: null,
    deltaAcerto: null,
    amostrasPosVisual: 0,
  };

  const sessoes = await db
    .select({
      questionId: estudoReversoSessions.questionId,
      attemptId: estudoReversoSessions.attemptId,
      concluidoEm: estudoReversoSessions.concluidoEm,
    })
    .from(estudoReversoSessions)
    .where(
      and(
        eq(estudoReversoSessions.userId, userId),
        eq(estudoReversoSessions.concluido, true),
      ),
    );

  if (sessoes.length === 0) return vazio;

  let preAcertos = 0;
  let preTotal = 0;
  let posAcertos = 0;
  let posTotal = 0;

  for (const sessao of sessoes) {
    if (!sessao.attemptId || !sessao.concluidoEm) continue;

    const [tentativaAtual] = await db
      .select({ acertou: attempts.acertou, createdAt: attempts.createdAt })
      .from(attempts)
      .where(
        and(
          eq(attempts.id, sessao.attemptId),
          eq(attempts.userId, userId),
        ),
      )
      .limit(1);

    if (tentativaAtual) {
      preTotal += 1;
      if (tentativaAtual.acertou) preAcertos += 1;
    }

    const [proxima] = await db
      .select({ acertou: attempts.acertou })
      .from(attempts)
      .where(
        and(
          eq(attempts.userId, userId),
          eq(attempts.questionId, sessao.questionId),
          gte(attempts.createdAt, sessao.concluidoEm),
        ),
      )
      .orderBy(attempts.createdAt)
      .limit(1);

    if (proxima) {
      posTotal += 1;
      if (proxima.acertou) posAcertos += 1;
    }
  }

  if (preTotal === 0 && posTotal === 0) return vazio;

  const taxaAcertoPreVisual =
    preTotal > 0 ? Math.round((preAcertos / preTotal) * 100) : null;
  const taxaAcertoPosVisual =
    posTotal > 0 ? Math.round((posAcertos / posTotal) * 100) : null;
  const deltaAcerto =
    taxaAcertoPreVisual !== null && taxaAcertoPosVisual !== null
      ? taxaAcertoPosVisual - taxaAcertoPreVisual
      : null;

  return {
    taxaAcertoPreVisual,
    taxaAcertoPosVisual,
    deltaAcerto,
    amostrasPosVisual: posTotal,
  };
}
