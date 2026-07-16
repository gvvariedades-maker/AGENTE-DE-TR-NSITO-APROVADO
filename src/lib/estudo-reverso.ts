import { and, desc, eq, lte, notInArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { attempts, questions, srsCards, topics } from "@/lib/db/schema";
import {
  agendarProximaRevisao,
  criarCardInicial,
  type FsrsGrade,
  type FsrsState,
  type SrsCardState,
} from "@/lib/srs";
import { getQuestoesByIds, mapRowToQuestao, type QuestaoUI } from "@/lib/questoes";
import { sqlSomenteQuestoesReais } from "@/lib/questoes-reais";
import { PROVA_DATA, type Disciplina } from "@/types";
import {
  buscarIdsPraticaPontuados,
  contarPraticaPontuada,
  resolverFiltrosMotor,
  type ModoSessaoEstudo,
} from "@/lib/motor-ata";
import {
  alocarSlotsSessaoAuto,
  calcularFase,
  permitirNovasAleatorias,
  type SlotsSessaoAuto,
} from "@/lib/plano-prova-calc";
import { diasParaProva } from "@/lib/prova-data";
import { registrarRespostaSessao } from "@/lib/study-sessions";
import type { TutorCalibracao } from "@/lib/tutor/calibracao";

function slotsSessaoAuto(limit: number, override?: SlotsSessaoAuto) {
  if (override) return override;
  return alocarSlotsSessaoAuto(calcularFase(diasParaProva()), limit);
}

export interface SessaoMissaoContext {
  slots?: SlotsSessaoAuto;
  disciplinaFoco?: Disciplina;
  boostDisciplinas?: TutorCalibracao["boostDisciplinas"];
  topicosPrioritarios?: string[];
}

function extrasMotorMissao(ctx?: SessaoMissaoContext) {
  if (!ctx) return undefined;
  return {
    disciplinaMissao: ctx.disciplinaFoco,
    boostDisciplinas: ctx.boostDisciplinas,
    topicosPrioritarios: ctx.topicosPrioritarios,
  };
}

export type { ModoSessaoEstudo };
export {
  labelModoSessao,
  parseModoSessao,
} from "@/lib/motor-ata";

export type TipoErro =
  | "decoreba"
  | "interpretacao"
  | "pegadinha_idecan"
  | "confusao_artigos";

export type ModoTentativa = "estudo" | "simulado";

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
  sessionId?: string;
  /** Nota FSRS explícita (1–4). Se omitida, deriva de acertou (3/1). */
  fsrsGrade?: FsrsGrade;
}

export interface RegistrarTentativaResult {
  ok: boolean;
  demo?: boolean;
  attemptId?: string;
  tipoErro?: TipoErro;
  dominioAlcancado?: boolean;
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
      sessionId: input.sessionId ?? null,
      resposta: input.resposta,
      acertou: input.acertou,
      tempoSeg: input.tempoSeg ?? null,
      modo: input.modo,
      tipoErro: tipoErro ?? null,
    })
    .returning({ id: attempts.id });

  if (input.sessionId && input.modo === "estudo") {
    await registrarRespostaSessao(input.sessionId, input.acertou);
  }

  let dominioAlcancado = false;

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

    const scheduled = agendarProximaRevisao(
      cardState,
      input.fsrsGrade ?? input.acertou,
      now,
      {
        examDate: PROVA_DATA,
        requestedRetention:
          calcularFase(diasParaProva()) === "semana_final" ? 0.92 : undefined,
      },
    );

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
    }
  }

  return {
    ok: true,
    attemptId: inserted.id,
    tipoErro,
    dominioAlcancado,
  };
}

/** IDs de questões com revisão SRS vencida (prioridade na sessão de estudo). */
export async function buscarIdsRevisaoPendentes(
  userId: string,
  limit = 10,
  disciplina?: Disciplina,
  topicoSlug?: string,
  somenteReaisIdecan = false,
): Promise<string[]> {
  const conditions = [
    eq(srsCards.userId, userId),
    lte(srsCards.nextReview, new Date()),
    disciplina ? eq(topics.disciplina, disciplina) : undefined,
    topicoSlug ? eq(topics.nome, topicoSlug) : undefined,
    somenteReaisIdecan ? sqlSomenteQuestoesReais("questions.tags") : undefined,
  ].filter(Boolean);

  const needsJoin =
    disciplina !== undefined ||
    topicoSlug !== undefined ||
    somenteReaisIdecan;

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
  missao?: SessaoMissaoContext,
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

  if (modo === "revisoes") {
    const idsRevisao = await buscarIdsRevisaoPendentes(
      userId,
      limit,
      disciplina,
      topicoSlug,
    );
    return {
      ...base,
      revisoesSrs: idsRevisao.length,
      questoesPratica: 0,
      total: idsRevisao.length,
    };
  }

  const slots =
    modo === "auto"
      ? slotsSessaoAuto(limit, missao?.slots)
      : { revisoes: limit, erros: 0, pratica: limit };
  const motorExtras = extrasMotorMissao(missao);
  const disciplinaEfetiva = disciplina ?? missao?.disciplinaFoco;
  const idsRevisao = await buscarIdsRevisaoPendentes(
    userId,
    slots.revisoes,
    disciplinaEfetiva,
    topicoSlug,
    modo === "reais_idecan",
  );
  const revisoesSrs = idsRevisao.length;
  const excluir = [...idsRevisao];
  let usados = revisoesSrs;

  let questoesPratica = 0;
  if (modo === "auto" && slots.erros > 0 && usados < limit) {
    const filtrosErros = await resolverFiltrosMotor(
      "erros",
      userId,
      disciplinaEfetiva,
      topicoSlug,
      motorExtras,
    );
    const idsErros = await buscarIdsPraticaPontuados(
      userId,
      Math.min(slots.erros, limit - usados),
      filtrosErros,
      excluir,
    );
    questoesPratica += idsErros.length;
    usados += idsErros.length;
    excluir.push(...idsErros);
  }

  const faltam = limit - usados;
  if (faltam > 0) {
    const filtros = await resolverFiltrosMotor(
      modo,
      userId,
      disciplinaEfetiva,
      topicoSlug,
      motorExtras,
    );
    questoesPratica += await contarPraticaPontuada(
      userId,
      faltam,
      filtros,
      excluir,
    );
  }

  return {
    ...base,
    revisoesSrs,
    questoesPratica,
    total: revisoesSrs + questoesPratica,
  };
}

/** Monta sessão: revisões SRS, erros (fase), prática pontuada; novas só se permitido. */
export async function montarSessaoEstudo(
  userId: string | undefined,
  limit = 20,
  disciplina?: Disciplina,
  topicoSlug?: string,
  modo: ModoSessaoEstudo = "normal",
  missao?: SessaoMissaoContext,
): Promise<QuestaoUI[]> {
  const resultado: QuestaoUI[] = [];
  const idsUsados = new Set<string>();
  const fase = calcularFase(diasParaProva());
  const slots =
    modo === "auto"
      ? slotsSessaoAuto(limit, missao?.slots)
      : { revisoes: limit, erros: 0, pratica: limit };
  const motorExtras = extrasMotorMissao(missao);
  const disciplinaEfetiva = disciplina ?? missao?.disciplinaFoco;

  if (userId) {
    const idsRevisao = await buscarIdsRevisaoPendentes(
      userId,
      slots.revisoes,
      disciplinaEfetiva,
      topicoSlug,
      modo === "reais_idecan",
    );
    const revisao = await getQuestoesByIds(idsRevisao);
    for (const q of revisao) {
      if (!disciplinaEfetiva || q.disciplina === disciplinaEfetiva) {
        resultado.push(q);
        idsUsados.add(q.id);
      }
    }

    if (modo === "revisoes") {
      return resultado;
    }

    if (modo === "auto" && slots.erros > 0 && resultado.length < limit) {
      const filtrosErros = await resolverFiltrosMotor(
        "erros",
        userId,
        disciplinaEfetiva,
        topicoSlug,
        motorExtras,
      );
      const idsErros = await buscarIdsPraticaPontuados(
        userId,
        Math.min(slots.erros, limit - resultado.length),
        filtrosErros,
        [...idsUsados],
      );
      const erros = await getQuestoesByIds(idsErros);
      for (const q of erros) {
        if (!idsUsados.has(q.id)) {
          resultado.push(q);
          idsUsados.add(q.id);
        }
      }
    }
  }

  const faltam = limit - resultado.length;
  if (faltam <= 0) return resultado;

  let filtrosAuto: Awaited<ReturnType<typeof resolverFiltrosMotor>> | null =
    null;

  if (userId) {
    filtrosAuto = await resolverFiltrosMotor(
      modo,
      userId,
      disciplinaEfetiva,
      topicoSlug,
      motorExtras,
    );
    const idsPratica = await buscarIdsPraticaPontuados(
      userId,
      faltam,
      filtrosAuto,
      [...idsUsados],
    );
    const pratica = await getQuestoesByIds(idsPratica);
    for (const q of pratica) {
      if (!idsUsados.has(q.id)) {
        resultado.push(q);
        idsUsados.add(q.id);
      }
    }
    if (resultado.length >= limit) return resultado;
  }

  const modosEstritos: ModoSessaoEstudo[] = ["erros", "pegadinha", "revisoes"];
  if (modosEstritos.includes(modo)) return resultado;

  const temBuracoCritico = Boolean(
    filtrosAuto?.filtrarSomentePrioritarias &&
      (filtrosAuto.disciplinasPrioritarias?.length ?? 0) > 0,
  );
  if (
    modo === "auto" &&
    !permitirNovasAleatorias(fase, temBuracoCritico)
  ) {
    return resultado;
  }

  const novas = await buscarQuestoesNovas(
    limit - resultado.length,
    disciplina ??
      (temBuracoCritico
        ? filtrosAuto?.disciplinasPrioritarias?.[0]
        : undefined),
    [...idsUsados, ...resultado.map((q) => q.id)],
    topicoSlug,
    modo === "reais_idecan",
  );
  return [...resultado, ...novas];
}

async function buscarQuestoesNovas(
  limit: number,
  disciplina?: Disciplina,
  excluirIds: string[] = [],
  topicoSlug?: string,
  somenteReaisIdecan = false,
): Promise<QuestaoUI[]> {
  try {
    const filters = [
      disciplina ? eq(topics.disciplina, disciplina) : undefined,
      topicoSlug ? eq(topics.nome, topicoSlug) : undefined,
      excluirIds.length > 0 ? notInArray(questions.id, excluirIds) : undefined,
      somenteReaisIdecan ? sqlSomenteQuestoesReais("questions.tags") : undefined,
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
        estudoReversoVisualCompletoJson: questions.estudoReversoVisualCompletoJson,
        disciplina: topics.disciplina,
        tags: questions.tags,
      })
      .from(questions)
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .orderBy(sql`random()`)
      .limit(limit);

    const rows = await (conditions ? query.where(conditions) : query);

    return rows.map(mapRowToQuestao);
  } catch {
    return [];
  }
}
