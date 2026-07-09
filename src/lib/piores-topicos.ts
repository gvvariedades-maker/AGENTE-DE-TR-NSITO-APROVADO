import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { attempts, questions, topics } from "@/lib/db/schema";
import {
  labelTopicoEdital,
  TOPICOS_PRIORIDADE_EDITAL,
  type TopicoPrioridade,
} from "@/lib/edital-topicos";
import type { Disciplina } from "@/types";

export interface PiorTopico {
  topicId: string | null;
  slug: string;
  disciplina: Disciplina;
  erros: number;
  tentativas: number;
  taxaErro: number;
}

export async function getPioresTopicos(
  userId?: string | null,
  limit = 3,
): Promise<PiorTopico[]> {
  if (!userId) {
    return padroesPrioridade(limit);
  }

  try {
    const rows = await db
      .select({
        topicId: topics.id,
        slug: topics.nome,
        disciplina: topics.disciplina,
        erros: sql<number>`count(*) filter (where not ${attempts.acertou})::int`,
        tentativas: sql<number>`count(*)::int`,
      })
      .from(attempts)
      .innerJoin(questions, eq(attempts.questionId, questions.id))
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(eq(attempts.userId, userId))
      .groupBy(topics.id, topics.nome, topics.disciplina)
      .having(sql`count(*) >= 1`);

    if (rows.length === 0) {
      return padroesPrioridade(limit);
    }

    return rows
      .map((r) => ({
        topicId: r.topicId,
        slug: r.slug,
        disciplina: r.disciplina,
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
    return padroesPrioridade(limit);
  }
}

/** Tópicos prioritários: não estudados com questão no banco, ou defaults do edital. */
export async function getPrioridadeEdital(
  userId?: string | null,
  limit = 5,
): Promise<PiorTopico[]> {
  if (!userId) {
    return padroesPrioridade(limit);
  }

  try {
    const naoEstudados = await db.execute<{
      topic_id: string;
      slug: string;
      disciplina: Disciplina;
    }>(sql`
      SELECT
        t.id AS topic_id,
        t.nome AS slug,
        t.disciplina
      FROM topics t
      INNER JOIN questions q ON q.topic_id = t.id
      LEFT JOIN attempts a
        ON a.question_id = q.id AND a.user_id = ${userId}::uuid
      GROUP BY t.id, t.nome, t.disciplina
      HAVING count(a.id) = 0
    `);

    if (naoEstudados.length > 0) {
      const ordem = new Map(
        TOPICOS_PRIORIDADE_EDITAL.map((t, i) => [t.slug, i]),
      );

      const ordenados = naoEstudados
        .map((r) => ({
          topicId: r.topic_id,
          slug: r.slug,
          disciplina: r.disciplina,
          erros: 0,
          tentativas: 0,
          taxaErro: 0,
          ordem: ordem.get(r.slug) ?? 999,
        }))
        .sort((a, b) => a.ordem - b.ordem)
        .slice(0, limit);

      return ordenados.map(({ ordem: _o, ...rest }) => rest);
    }

    return padroesPrioridade(limit);
  } catch {
    return padroesPrioridade(limit);
  }
}

function padroesPrioridade(limit: number): PiorTopico[] {
  return TOPICOS_PRIORIDADE_EDITAL.slice(0, limit).map(
    ({ slug, disciplina }: TopicoPrioridade) => ({
      topicId: null,
      slug,
      disciplina,
      erros: 0,
      tentativas: 0,
      taxaErro: 0,
    }),
  );
}

export function labelPiorTopico(p: PiorTopico): string {
  const nome = labelTopicoEdital(p.slug);
  if (p.tentativas === 0) {
    return `${nome} — prioridade do edital`;
  }
  return `${nome} — ${p.taxaErro}% erros`;
}

export { hrefEstudoErros, hrefEstudoTopico } from "@/lib/estudo-links";
