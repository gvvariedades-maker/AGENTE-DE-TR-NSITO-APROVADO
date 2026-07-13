import { eq, sql } from "drizzle-orm";
import { sqlSomenteQuestoesReais } from "@/lib/questoes-reais";
import { EDITAL_TOPICS } from "../../scripts/edital-topics";
import { db } from "@/lib/db";
import { questions, topics } from "@/lib/db/schema";
import { labelTopicoEdital } from "@/lib/edital-topicos";
import {
  grupoTopico,
  type TopicoCatalogo,
  type TopicosDisciplinaResumo,
} from "@/lib/topicos-catalogo-shared";
import type { Disciplina } from "@/types";

export type { TopicoCatalogo, TopicosDisciplinaResumo };
export { agruparTopicos, grupoTopico } from "@/lib/topicos-catalogo-shared";

function buildResumo(
  disciplina: Disciplina,
  topicos: TopicoCatalogo[],
): TopicosDisciplinaResumo {
  const estudaveis = topicos.filter((t) => t.estudavel);
  const totalEstudaveis = estudaveis.length;
  const totalVistos = estudaveis.filter((t) => t.tentativas > 0).length;

  const totalReais = topicos.reduce((acc, t) => acc + t.questoesReaisCount, 0);

  return {
    disciplina,
    topicos,
    totalMapeados: topicos.length,
    totalEstudaveis,
    totalReais,
    totalVistos,
    coberturaPct:
      totalEstudaveis > 0
        ? Math.round((totalVistos / totalEstudaveis) * 100)
        : 0,
  };
}

function topicosEstaticosEdital(disciplina: Disciplina): TopicoCatalogo[] {
  return EDITAL_TOPICS.filter((t) => t.disciplina === disciplina).map(
    (t) => ({
      id: `edital-${t.slug}`,
      slug: t.slug,
      label: labelTopicoEdital(t.slug),
      editalRef: t.editalRef,
      grupo: grupoTopico(t.slug, disciplina),
      questoesCount: 0,
      questoesReaisCount: 0,
      tentativas: 0,
      acertos: 0,
      taxaAcerto: 0,
      estudavel: false,
    }),
  );
}

function mapRowToTopico(
  r: {
    id: string;
    slug: string;
    edital_ref: string | null;
    questoes_count: number;
    questoes_reais_count: number;
    tentativas: number;
    acertos: number;
  },
  disciplina: Disciplina,
): TopicoCatalogo {
  const tentativas = r.tentativas;
  const acertos = r.acertos;
  return {
    id: r.id,
    slug: r.slug,
    label: labelTopicoEdital(r.slug),
    editalRef: r.edital_ref,
    grupo: grupoTopico(r.slug, disciplina),
    questoesCount: r.questoes_count,
    questoesReaisCount: r.questoes_reais_count,
    tentativas,
    acertos,
    taxaAcerto:
      tentativas > 0 ? Math.round((acertos / tentativas) * 100) : 0,
    estudavel: r.questoes_count > 0,
  };
}

export async function getTopicosPorDisciplina(
  disciplina: Disciplina,
  userId?: string | null,
): Promise<TopicosDisciplinaResumo> {
  const fallback = () =>
    buildResumo(disciplina, topicosEstaticosEdital(disciplina));

  try {
    const rows = userId
      ? await db.execute<{
          id: string;
          slug: string;
          edital_ref: string | null;
          questoes_count: number;
          questoes_reais_count: number;
          tentativas: number;
          acertos: number;
        }>(sql`
          SELECT
            t.id,
            t.nome AS slug,
            t.edital_ref,
            count(DISTINCT q.id)::int AS questoes_count,
            count(DISTINCT CASE WHEN ${sqlSomenteQuestoesReais("q.tags")} THEN q.id END)::int AS questoes_reais_count,
            count(a.id)::int AS tentativas,
            count(*) FILTER (WHERE a.acertou)::int AS acertos
          FROM topics t
          LEFT JOIN questions q ON q.topic_id = t.id
          LEFT JOIN attempts a
            ON a.question_id = q.id AND a.user_id = ${userId}::uuid
          WHERE t.disciplina = ${disciplina}
          GROUP BY t.id, t.nome, t.edital_ref
          ORDER BY t.edital_ref NULLS LAST, t.nome
        `)
      : await db.execute<{
          id: string;
          slug: string;
          edital_ref: string | null;
          questoes_count: number;
          questoes_reais_count: number;
          tentativas: number;
          acertos: number;
        }>(sql`
          SELECT
            t.id,
            t.nome AS slug,
            t.edital_ref,
            count(DISTINCT q.id)::int AS questoes_count,
            count(DISTINCT CASE WHEN ${sqlSomenteQuestoesReais("q.tags")} THEN q.id END)::int AS questoes_reais_count,
            0::int AS tentativas,
            0::int AS acertos
          FROM topics t
          LEFT JOIN questions q ON q.topic_id = t.id
          WHERE t.disciplina = ${disciplina}
          GROUP BY t.id, t.nome, t.edital_ref
          ORDER BY t.edital_ref NULLS LAST, t.nome
        `);

    if (rows.length === 0) {
      return fallback();
    }

    const topicos = rows.map((r) => mapRowToTopico(r, disciplina));
    return buildResumo(disciplina, topicos);
  } catch {
    return fallback();
  }
}

/** Contagem rápida de microtópicos mapeados por disciplina (sem progresso). */
export async function getContagemTopicosPorDisciplina(): Promise<
  Map<Disciplina, { mapeados: number; estudaveis: number }>
> {
  try {
    const rows = await db
      .select({
        disciplina: topics.disciplina,
        mapeados: sql<number>`count(distinct ${topics.id})::int`,
        estudaveis: sql<number>`count(distinct ${topics.id}) filter (where ${questions.id} is not null)::int`,
      })
      .from(topics)
      .leftJoin(questions, eq(questions.topicId, topics.id))
      .groupBy(topics.disciplina);

    return new Map(
      rows.map((r) => [
        r.disciplina,
        { mapeados: r.mapeados, estudaveis: r.estudaveis },
      ]),
    );
  } catch {
    return new Map();
  }
}
