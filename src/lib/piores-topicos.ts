import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { attempts, questions, topics } from "@/lib/db/schema";
import {
  labelTopicoCTB,
  TOPICOS_CTB_PRIORIDADE,
} from "@/lib/ctb-topicos";

export interface PiorTopico {
  topicId: string | null;
  slug: string;
  erros: number;
  tentativas: number;
  taxaErro: number;
}

export async function getPioresTopicos(
  userId?: string | null,
  limit = 3,
): Promise<PiorTopico[]> {
  if (!userId) {
    return padroesCTB(limit);
  }

  try {
    const rows = await db
      .select({
        topicId: topics.id,
        slug: topics.nome,
        erros: sql<number>`count(*) filter (where not ${attempts.acertou})::int`,
        tentativas: sql<number>`count(*)::int`,
      })
      .from(attempts)
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(
        and(
          eq(attempts.userId, userId),
          eq(topics.disciplina, "legislacao_transito"),
        ),
      )
      .groupBy(topics.id, topics.nome)
      .having(sql`count(*) >= 1`);

    if (rows.length === 0) {
      return padroesCTB(limit);
    }

    return rows
      .map((r) => ({
        topicId: r.topicId,
        slug: r.slug,
        erros: r.erros,
        tentativas: r.tentativas,
        taxaErro: Math.round((r.erros / r.tentativas) * 100),
      }))
      .sort((a, b) => {
        if (b.taxaErro !== a.taxaErro) return b.taxaErro - a.taxaErro;
        return b.erros - a.erros;
      })
      .slice(0, limit);
  } catch {
    return padroesCTB(limit);
  }
}

function padroesCTB(limit: number): PiorTopico[] {
  return TOPICOS_CTB_PRIORIDADE.slice(0, limit).map((slug) => ({
    topicId: null,
    slug,
    erros: 0,
    tentativas: 0,
    taxaErro: 0,
  }));
}

export function labelPiorTopico(p: PiorTopico): string {
  const nome = labelTopicoCTB(p.slug);
  if (p.tentativas === 0) {
    return `${nome} — prioridade do edital`;
  }
  return `${nome} — ${p.taxaErro}% erros`;
}

export function hrefEstudoTopico(slug: string): string {
  return `/estudo?topico=${encodeURIComponent(slug)}`;
}

export function hrefEstudoErros(slug?: string): string {
  const params = new URLSearchParams({ modo: "erros" });
  if (slug) params.set("topico", slug);
  return `/estudo?${params.toString()}`;
}
