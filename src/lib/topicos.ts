import { eq, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { sqlSomenteQuestoesReais } from "@/lib/questoes-reais";
import { isQuestaoRealIdecan } from "@/lib/questoes-reais-tags";
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
  },
  disciplina: Disciplina,
  progresso?: { tentativas: number; acertos: number },
): TopicoCatalogo {
  const tentativas = progresso?.tentativas ?? 0;
  const acertos = progresso?.acertos ?? 0;
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

async function fetchProgressoPorTopico(
  disciplina: Disciplina,
  userId: string,
): Promise<Map<string, { tentativas: number; acertos: number }>> {
  const rows = await db.execute<{
    topic_id: string;
    tentativas: number;
    acertos: number;
  }>(sql`
    SELECT
      q.topic_id,
      count(a.id)::int AS tentativas,
      count(*) FILTER (WHERE a.acertou)::int AS acertos
    FROM attempts a
    INNER JOIN questions q ON q.id = a.question_id
    INNER JOIN topics t ON t.id = q.topic_id
    WHERE a.user_id = ${userId}::uuid
      AND t.disciplina = ${disciplina}
    GROUP BY q.topic_id
  `);

  return new Map(
    rows.map((r) => [
      r.topic_id,
      { tentativas: r.tentativas, acertos: r.acertos },
    ]),
  );
}

async function fetchCatalogoBase(disciplina: Disciplina) {
  return db.execute<{
    id: string;
    slug: string;
    edital_ref: string | null;
    questoes_count: number;
    questoes_reais_count: number;
  }>(sql`
    SELECT
      t.id,
      t.nome AS slug,
      t.edital_ref,
      count(q.id)::int AS questoes_count,
      count(q.id) FILTER (WHERE ${sqlSomenteQuestoesReais("q.tags")})::int AS questoes_reais_count
    FROM topics t
    LEFT JOIN questions q ON q.topic_id = t.id
    WHERE t.disciplina = ${disciplina}
    GROUP BY t.id, t.nome, t.edital_ref
    ORDER BY t.edital_ref NULLS LAST, t.nome
  `);
}

/** Resumo síncrono do Anexo I — usado quando o banco demora ou falha. */
export function getTopicosResumoFallback(
  disciplina: Disciplina,
): TopicosDisciplinaResumo {
  return buildResumo(disciplina, topicosEstaticosEdital(disciplina));
}

/** Via PostgREST — evita contenção do pooler Postgres no dashboard. */
async function getTopicosPorDisciplinaRest(
  disciplina: Disciplina,
  userId?: string | null,
): Promise<TopicosDisciplinaResumo> {
  const supabase = await createClient();

  const { data: topicRows, error: topicsError } = await supabase
    .from("topics")
    .select("id, nome, edital_ref")
    .eq("disciplina", disciplina);

  if (topicsError) throw topicsError;
  if (!topicRows?.length) {
    throw new Error("[topicos] REST retornou zero tópicos");
  }

  topicRows.sort((a, b) => {
    const refA = a.edital_ref ?? "\uffff";
    const refB = b.edital_ref ?? "\uffff";
    if (refA !== refB) return refA.localeCompare(refB, "pt-BR");
    return a.nome.localeCompare(b.nome, "pt-BR");
  });

  const topicIds = topicRows.map((t) => t.id);

  const { data: questionRows, error: questionsError } = await supabase
    .from("questions")
    .select("id, topic_id, tags")
    .in("topic_id", topicIds);

  if (questionsError) throw questionsError;

  const countsByTopic = new Map<
    string,
    { questoes: number; reais: number }
  >();
  for (const t of topicRows) {
    countsByTopic.set(t.id, { questoes: 0, reais: 0 });
  }
  for (const q of questionRows ?? []) {
    const entry = countsByTopic.get(q.topic_id);
    if (!entry) continue;
    entry.questoes++;
    if (isQuestaoRealIdecan(q.tags)) entry.reais++;
  }

  const progresso = new Map<string, { tentativas: number; acertos: number }>();
  if (userId && questionRows?.length) {
    const questionIds = questionRows.map((q) => q.id);
    const { data: attemptRows } = await supabase
      .from("attempts")
      .select("acertou, question_id")
      .eq("user_id", userId)
      .in("question_id", questionIds);

    const topicByQuestion = new Map(
      questionRows.map((q) => [q.id, q.topic_id]),
    );
    for (const a of attemptRows ?? []) {
      const topicId = topicByQuestion.get(a.question_id);
      if (!topicId) continue;
      const p = progresso.get(topicId) ?? { tentativas: 0, acertos: 0 };
      p.tentativas++;
      if (a.acertou) p.acertos++;
      progresso.set(topicId, p);
    }
  }

  const topicos = topicRows.map((t) => {
    const counts = countsByTopic.get(t.id) ?? { questoes: 0, reais: 0 };
    const prog = progresso.get(t.id);
    const tentativas = prog?.tentativas ?? 0;
    const acertos = prog?.acertos ?? 0;
    return {
      id: t.id,
      slug: t.nome,
      label: labelTopicoEdital(t.nome),
      editalRef: t.edital_ref,
      grupo: grupoTopico(t.nome, disciplina),
      questoesCount: counts.questoes,
      questoesReaisCount: counts.reais,
      tentativas,
      acertos,
      taxaAcerto:
        tentativas > 0 ? Math.round((acertos / tentativas) * 100) : 0,
      estudavel: counts.questoes > 0,
    };
  });

  return buildResumo(disciplina, topicos);
}

async function getTopicosPorDisciplinaPostgres(
  disciplina: Disciplina,
  userId?: string | null,
): Promise<TopicosDisciplinaResumo> {
  const rows = await fetchCatalogoBase(disciplina);

  if (rows.length === 0) {
    throw new Error("[topicos] Postgres retornou zero tópicos");
  }

  const progresso =
    userId != null
      ? await fetchProgressoPorTopico(disciplina, userId).catch(
          () => new Map<string, { tentativas: number; acertos: number }>(),
        )
      : new Map<string, { tentativas: number; acertos: number }>();

  const topicos = rows.map((r) =>
    mapRowToTopico(r, disciplina, progresso.get(r.id)),
  );
  return buildResumo(disciplina, topicos);
}

export async function getTopicosPorDisciplina(
  disciplina: Disciplina,
  userId?: string | null,
): Promise<TopicosDisciplinaResumo> {
  const fallback = () => getTopicosResumoFallback(disciplina);

  try {
    return await getTopicosPorDisciplinaPostgres(disciplina, userId);
  } catch (error) {
    console.warn("[topicos] Postgres falhou, tentando REST", error);
  }

  try {
    return await getTopicosPorDisciplinaRest(disciplina, userId);
  } catch (error) {
    console.warn("[topicos] REST falhou", error);
  }

  return fallback();
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
