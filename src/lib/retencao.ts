import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { attempts, srsCards } from "@/lib/db/schema";

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

const MATURE_DIAS = 21;

function classificarEstado(intervalDays: number): EstadoRetencao {
  if (intervalDays >= MATURE_DIAS) return "maduro";
  if (intervalDays >= 7) return "jovem";
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
      .select({ intervalDays: srsCards.intervalDays })
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
      const estado = classificarEstado(card.intervalDays);
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
