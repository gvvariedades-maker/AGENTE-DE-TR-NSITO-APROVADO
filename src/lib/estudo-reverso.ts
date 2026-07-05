import { and, desc, eq, lte, ne, notInArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { attempts, questions, srsCards, topics } from "@/lib/db/schema";
import {
  agendarProximaRevisao,
  criarCardInicial,
  type FsrsState,
  type SrsCardState,
} from "@/lib/srs";
import { getQuestaoById, type QuestaoUI } from "@/lib/questoes";
import { PROVA_DATA, type ComentarioQuestao, type Disciplina } from "@/types";
import type { EstudoReversoVisual } from "@/types/estudo-reverso-visual";

export type TipoErro =
  | "decoreba"
  | "interpretacao"
  | "pegadinha_idecan"
  | "confusao_artigos";

export type ModoTentativa = "estudo" | "simulado";
export type ModoSessaoEstudo = "normal" | "erros";

export interface SessaoEstudoPreview {
  total: number;
  revisoesSrs: number;
  questoesPratica: number;
  modo: ModoSessaoEstudo;
  topicoSlug?: string;
  disciplina?: Disciplina;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isQuestaoPersistivel(questionId: string): boolean {
  return UUID_RE.test(questionId);
}

function rowToCardState(row: {
  difficulty: number;
  stability: number;
  reps: number;
  lapses: number;
  state: string;
  lastReview: Date | null;
}): SrsCardState {
  return {
    difficulty: row.difficulty,
    stability: row.stability,
    reps: row.reps,
    lapses: row.lapses,
    state: row.state as FsrsState,
    lastReview: row.lastReview,
  };
}

/** Heurística de produto para direcionar feedback (não taxonomia científica). */
export function classificarErro(
  estiloIdecan: string | null,
  disciplina: string,
): TipoErro {
  if (estiloIdecan?.includes("pegadinha")) return "pegadinha_idecan";
  if (disciplina === "portugues") return "interpretacao";
  if (estiloIdecan === "lei_seca" || disciplina === "legislacao_transito") {
    return "confusao_artigos";
  }
  return "decoreba";
}

/** Domínio = 2 acertos seguidos no mesmo microtópico, espaçados >= 1h (03-estudo-reverso.mdc). */
export async function verificarDominioTopico(
  userId: string,
  topicId: string,
): Promise<boolean> {
  const rows = await db
    .select({ acertou: attempts.acertou, createdAt: attempts.createdAt })
    .from(attempts)
    .innerJoin(questions, eq(attempts.questionId, questions.id))
    .where(and(eq(attempts.userId, userId), eq(questions.topicId, topicId)))
    .orderBy(desc(attempts.createdAt))
    .limit(2);

  if (rows.length < 2 || !rows.every((r) => r.acertou)) return false;

  const diffMs =
    rows[0].createdAt.getTime() - rows[1].createdAt.getTime();
  return diffMs >= 60 * 60 * 1000;
}

export interface RegistrarTentativaInput {
  userId: string;
  questionId: string;
  resposta: string;
  acertou: boolean;
  modo: ModoTentativa;
  tempoSeg?: number;
}

export interface RegistrarTentativaResult {
  ok: boolean;
  demo?: boolean;
  attemptId?: string;
  tipoErro?: TipoErro;
  dominioAlcancado?: boolean;
  irmaIds?: string[];
}

export async function registrarTentativa(
  input: RegistrarTentativaInput,
): Promise<RegistrarTentativaResult> {
  if (!isQuestaoPersistivel(input.questionId)) {
    return { ok: false, demo: true };
  }

  const [questaoRow] = await db
    .select({
      topicId: questions.topicId,
      estiloIdecan: questions.estiloIdecan,
      disciplina: topics.disciplina,
    })
    .from(questions)
    .innerJoin(topics, eq(questions.topicId, topics.id))
    .where(eq(questions.id, input.questionId))
    .limit(1);

  if (!questaoRow) {
    return { ok: false };
  }

  let tipoErro: TipoErro | undefined;
  if (!input.acertou && input.modo === "estudo") {
    tipoErro = classificarErro(
      questaoRow.estiloIdecan,
      questaoRow.disciplina,
    );
  }

  const [inserted] = await db
    .insert(attempts)
    .values({
      userId: input.userId,
      questionId: input.questionId,
      resposta: input.resposta,
      acertou: input.acertou,
      tempoSeg: input.tempoSeg ?? null,
      modo: input.modo,
      tipoErro: tipoErro ?? null,
    })
    .returning({ id: attempts.id });

  let dominioAlcancado = false;
  let irmaIds: string[] | undefined;

  if (input.modo === "estudo") {
    const now = new Date();

    const [existing] = await db
      .select()
      .from(srsCards)
      .where(
        and(
          eq(srsCards.userId, input.userId),
          eq(srsCards.questionId, input.questionId),
        ),
      )
      .limit(1);

    const cardState = existing
      ? rowToCardState(existing)
      : criarCardInicial();

    const scheduled = agendarProximaRevisao(cardState, input.acertou, now, {
      examDate: PROVA_DATA,
    });

    const valores = {
      nextReview: scheduled.nextReview,
      intervalDays: scheduled.intervalDays,
      difficulty: scheduled.difficulty,
      stability: scheduled.stability,
      reps: scheduled.reps,
      lapses: scheduled.lapses,
      state: scheduled.state,
      lastReview: scheduled.lastReview,
    };

    if (existing) {
      await db
        .update(srsCards)
        .set(valores)
        .where(eq(srsCards.id, existing.id));
    } else {
      await db.insert(srsCards).values({
        userId: input.userId,
        questionId: input.questionId,
        ...valores,
      });
    }

    if (input.acertou) {
      dominioAlcancado = await verificarDominioTopico(
        input.userId,
        questaoRow.topicId,
      );
    } else {
      irmaIds = await buscarIdsIrmas(questaoRow.topicId, input.questionId, 3);
    }
  }

  return {
    ok: true,
    attemptId: inserted.id,
    tipoErro,
    dominioAlcancado,
    irmaIds,
  };
}

/** Questões irmãs do mesmo microtópico (exclui a questão-mãe). */
export async function buscarIdsIrmas(
  topicId: string,
  excluirQuestionId: string,
  limit = 3,
): Promise<string[]> {
  const rows = await db
    .select({ id: questions.id })
    .from(questions)
    .where(
      and(eq(questions.topicId, topicId), ne(questions.id, excluirQuestionId)),
    )
    .orderBy(sql`random()`)
    .limit(limit);

  return rows.map((r) => r.id);
}

/** IDs de questões com revisão SRS vencida (prioridade na sessão de estudo). */
export async function buscarIdsRevisaoPendentes(
  userId: string,
  limit = 10,
  disciplina?: Disciplina,
  topicoSlug?: string,
): Promise<string[]> {
  const conditions = [
    eq(srsCards.userId, userId),
    lte(srsCards.nextReview, new Date()),
    disciplina ? eq(topics.disciplina, disciplina) : undefined,
    topicoSlug ? eq(topics.nome, topicoSlug) : undefined,
  ].filter(Boolean);

  const needsJoin = disciplina !== undefined || topicoSlug !== undefined;

  if (needsJoin) {
    const rows = await db
      .select({ questionId: srsCards.questionId })
      .from(srsCards)
      .innerJoin(questions, eq(srsCards.questionId, questions.id))
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(and(...conditions))
      .orderBy(srsCards.nextReview)
      .limit(limit);
    return rows.map((r) => r.questionId);
  }

  const rows = await db
    .select({ questionId: srsCards.questionId })
    .from(srsCards)
    .where(
      and(eq(srsCards.userId, userId), lte(srsCards.nextReview, new Date())),
    )
    .orderBy(srsCards.nextReview)
    .limit(limit);

  return rows.map((r) => r.questionId);
}

/** Resumo da sessão antes de iniciar (preview Tec-style). */
export async function previewSessaoEstudo(
  userId: string | undefined,
  limit = 20,
  disciplina?: Disciplina,
  topicoSlug?: string,
  modo: ModoSessaoEstudo = "normal",
): Promise<SessaoEstudoPreview> {
  const base: SessaoEstudoPreview = {
    total: 0,
    revisoesSrs: 0,
    questoesPratica: 0,
    modo,
    topicoSlug,
    disciplina,
  };

  if (!userId) return base;

  const idsRevisao = await buscarIdsRevisaoPendentes(
    userId,
    limit,
    disciplina,
    topicoSlug,
  );
  const revisoesSrs = idsRevisao.length;
  const faltam = limit - revisoesSrs;

  let questoesPratica = 0;
  if (faltam > 0) {
    if (modo === "erros") {
      const idsErro = await buscarIdsQuestoesErradas(
        userId,
        faltam,
        disciplina,
        topicoSlug,
        idsRevisao,
      );
      questoesPratica = idsErro.length;
    } else {
      questoesPratica = await contarQuestoesNovas(
        faltam,
        disciplina,
        idsRevisao,
        topicoSlug,
      );
    }
  }

  return {
    ...base,
    revisoesSrs,
    questoesPratica,
    total: revisoesSrs + questoesPratica,
  };
}

/** Monta sessão: revisões SRS vencidas primeiro, depois prática (novas ou erros). */
export async function montarSessaoEstudo(
  userId: string | undefined,
  limit = 20,
  disciplina?: Disciplina,
  topicoSlug?: string,
  modo: ModoSessaoEstudo = "normal",
): Promise<QuestaoUI[]> {
  const resultado: QuestaoUI[] = [];
  const idsUsados = new Set<string>();

  if (userId) {
    const idsRevisao = await buscarIdsRevisaoPendentes(
      userId,
      limit,
      disciplina,
      topicoSlug,
    );
    for (const id of idsRevisao) {
      const q = await getQuestaoById(id);
      if (q && (!disciplina || q.disciplina === disciplina)) {
        resultado.push(q);
        idsUsados.add(id);
      }
    }
  }

  const faltam = limit - resultado.length;
  if (faltam <= 0) return resultado;

  if (modo === "erros" && userId) {
    const idsErro = await buscarIdsQuestoesErradas(
      userId,
      faltam,
      disciplina,
      topicoSlug,
      [...idsUsados],
    );
    for (const id of idsErro) {
      const q = await getQuestaoById(id);
      if (q) resultado.push(q);
    }
    return resultado;
  }

  const novas = await buscarQuestoesNovas(
    faltam,
    disciplina,
    [...idsUsados],
    topicoSlug,
  );
  return [...resultado, ...novas];
}

/** Questões cuja última tentativa do usuário foi erro (caderno de erros). */
export async function buscarIdsQuestoesErradas(
  userId: string,
  limit: number,
  disciplina?: Disciplina,
  topicoSlug?: string,
  excluirIds: string[] = [],
): Promise<string[]> {
  try {
    const filtroDisciplina = disciplina
      ? sql`AND t.disciplina = ${disciplina}`
      : sql``;
    const filtroTopico = topicoSlug
      ? sql`AND t.nome = ${topicoSlug}`
      : sql``;
    const filtroExcluir =
      excluirIds.length > 0
        ? sql`AND latest.question_id NOT IN (${sql.join(
            excluirIds.map((id) => sql`${id}::uuid`),
            sql`, `,
          )})`
        : sql``;

    const rows = await db.execute<{ question_id: string }>(sql`
      SELECT latest.question_id
      FROM (
        SELECT DISTINCT ON (a.question_id)
          a.question_id,
          a.acertou
        FROM attempts a
        WHERE a.user_id = ${userId}::uuid
        ORDER BY a.question_id, a.created_at DESC
      ) latest
      INNER JOIN questions q ON q.id = latest.question_id
      INNER JOIN topics t ON t.id = q.topic_id
      WHERE latest.acertou = false
      ${filtroDisciplina}
      ${filtroTopico}
      ${filtroExcluir}
      ORDER BY random()
      LIMIT ${limit}
    `);

    return rows.map((r) => r.question_id);
  } catch {
    return [];
  }
}

async function contarQuestoesNovas(
  limit: number,
  disciplina?: Disciplina,
  excluirIds: string[] = [],
  topicoSlug?: string,
): Promise<number> {
  try {
    const filters = [
      disciplina ? eq(topics.disciplina, disciplina) : undefined,
      topicoSlug ? eq(topics.nome, topicoSlug) : undefined,
      excluirIds.length > 0 ? notInArray(questions.id, excluirIds) : undefined,
    ].filter(Boolean);

    const conditions = filters.length > 0 ? and(...filters) : undefined;

    const query = db
      .select({ count: sql<number>`count(*)::int` })
      .from(questions)
      .innerJoin(topics, eq(questions.topicId, topics.id));

    const [row] = await (conditions ? query.where(conditions) : query);
    const disponiveis = row?.count ?? 0;
    return Math.min(limit, disponiveis);
  } catch {
    return 0;
  }
}

async function buscarQuestoesNovas(
  limit: number,
  disciplina?: Disciplina,
  excluirIds: string[] = [],
  topicoSlug?: string,
): Promise<QuestaoUI[]> {
  try {
    const filters = [
      disciplina ? eq(topics.disciplina, disciplina) : undefined,
      topicoSlug ? eq(topics.nome, topicoSlug) : undefined,
      excluirIds.length > 0 ? notInArray(questions.id, excluirIds) : undefined,
    ].filter(Boolean);

    const conditions = filters.length > 0 ? and(...filters) : undefined;

    const query = db
      .select({
        id: questions.id,
        enunciado: questions.enunciado,
        altA: questions.altA,
        altB: questions.altB,
        altC: questions.altC,
        altD: questions.altD,
        altE: questions.altE,
        gabarito: questions.gabarito,
        comentarioJson: questions.comentarioJson,
        estudoReversoVisualJson: questions.estudoReversoVisualJson,
        disciplina: topics.disciplina,
      })
      .from(questions)
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .orderBy(sql`random()`)
      .limit(limit);

    const rows = await (conditions ? query.where(conditions) : query);

    return rows.map((row) => ({
      id: row.id,
      disciplina: row.disciplina,
      enunciado: row.enunciado,
      alternativas: {
        A: row.altA,
        B: row.altB,
        C: row.altC,
        D: row.altD,
        ...(row.altE ? { E: row.altE } : {}),
      },
      gabarito: row.gabarito,
      comentario: (row.comentarioJson as ComentarioQuestao) ?? null,
      estudoReversoVisual:
        (row.estudoReversoVisualJson as EstudoReversoVisual) ?? null,
    }));
  } catch {
    return [];
  }
}

/** Carrega questões irmãs completas para injeção intercalada na sessão. */
export async function carregarIrmas(ids: string[]): Promise<QuestaoUI[]> {
  const resultado: QuestaoUI[] = [];
  for (const id of ids) {
    const q = await getQuestaoById(id);
    if (q) resultado.push(q);
  }
  return resultado;
}
