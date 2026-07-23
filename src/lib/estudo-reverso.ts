import { and, eq, lte, ne, notInArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { attempts, questions, srsCards, topics } from "@/lib/db/schema";
import {
  diagnoseAttempt,
  type AttemptDiagnostics,
} from "@/lib/diagnostics/diagnose-attempt";
import { appendLearningEvent } from "@/lib/learning-events/append";
import {
  updateSkillMastery,
  verificarDominioTopicoComMastery,
  type SkillMasterySnapshot,
} from "@/lib/mastery";
import {
  agendarProximaRevisao,
  criarCardInicial,
  type FsrsGrade,
  type FsrsState,
  type SrsCardState,
} from "@/lib/srs";
import {
  isConfidenceLevel,
  resolveFsrsRating,
  type ConfidenceLevel,
} from "@/lib/srs/rating-policy";
import { getQuestoesByIds, mapRowToQuestao, type QuestaoUI } from "@/lib/questoes";
import { sqlSomenteQuestoesReais } from "@/lib/questoes-reais";
import { parsePedagogyConfig } from "@/lib/tutor/pedagogy-config";
import { checkNoviceGate } from "@/lib/tutor/novice-gate-db";
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

/**
 * Domínio do tópico (Fase 3): agrega mastery das skills se cobertura ≥ 50%;
 * senão fallback à regra legada (2 acertos ≥ 1h).
 */
export async function verificarDominioTopico(
  userId: string,
  topicId: string,
): Promise<boolean> {
  return verificarDominioTopicoComMastery(userId, topicId);
}

export interface RegistrarTentativaInput {
  userId: string;
  questionId: string;
  resposta: string;
  acertou: boolean;
  modo: ModoTentativa;
  tempoSeg?: number;
  sessionId?: string;
  /**
   * Confiança subjetiva (Fase 1: 1|3). Se informada, deriva `fsrsRating`
   * via rating-policy (erro sempre Again).
   */
  confidence?: ConfidenceLevel;
  /**
   * Nota FSRS explícita (1–4). Preferir `confidence`; se ambos ausentes,
   * deriva de acertou (3/1). Em erro, sempre força 1.
   */
  fsrsGrade?: FsrsGrade;
  hintUsed?: boolean;
  answerChanged?: boolean;
  feedbackSeenBeforeAnswer?: boolean;
}

export interface RegistrarTentativaResult {
  ok: boolean;
  demo?: boolean;
  attemptId?: string;
  tipoErro?: TipoErro;
  dominioAlcancado?: boolean;
  confidence?: ConfidenceLevel;
  diagnostics?: AttemptDiagnostics;
  /** Snapshots de mastery atualizados nesta tentativa (Fase 3). */
  masteryUpdates?: SkillMasterySnapshot[];
  /** Novice-gate (Fase 4) — pré-requisito sem evidência. */
  isNovice?: boolean;
}

function resolverFsrsGrade(input: RegistrarTentativaInput): FsrsGrade {
  if (!input.acertou) return 1;
  if (isConfidenceLevel(input.confidence)) {
    return resolveFsrsRating({
      acertou: true,
      confidence: input.confidence,
    });
  }
  if (input.fsrsGrade === 1 || input.fsrsGrade === 2 || input.fsrsGrade === 3 || input.fsrsGrade === 4) {
    return input.fsrsGrade;
  }
  return 3;
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
      comentarioJson: questions.comentarioJson,
      pedagogyJson: questions.pedagogyJson,
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

  const passoAPasso = Array.isArray(
    (questaoRow.comentarioJson as { passo_a_passo?: unknown } | null)
      ?.passo_a_passo,
  )
    ? (
        (questaoRow.comentarioJson as { passo_a_passo: string[] })
          .passo_a_passo
      )
    : null;

  const diagnostics = await diagnoseAttempt({
    questionId: input.questionId,
    resposta: input.resposta,
    acertou: input.acertou,
    passoAPasso,
  });

  const confidence = isConfidenceLevel(input.confidence)
    ? input.confidence
    : undefined;
  const fsrsRating = resolverFsrsGrade(input);

  const [{ count: priorCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(attempts)
    .where(
      and(
        eq(attempts.userId, input.userId),
        eq(attempts.questionId, input.questionId),
      ),
    );

  const exposureCount = priorCount ?? 0;

  const { attemptId, dominioAlcancado, masteryUpdates } = await db.transaction(
    async (tx) => {
      const [inserted] = await tx
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
          confidence: confidence ?? null,
          fsrsRating,
          exposureCount,
          hintUsed: input.hintUsed ?? false,
          answerChanged: input.answerChanged ?? false,
          feedbackSeenBeforeAnswer: input.feedbackSeenBeforeAnswer ?? false,
          diagnosticsJson: diagnostics,
        })
        .returning({ id: attempts.id });

      await appendLearningEvent({
        userId: input.userId,
        eventType: "question_answered",
        questionId: input.questionId,
        sessionId: input.sessionId,
        payload: {
          attemptId: inserted.id,
          acertou: input.acertou,
          resposta: input.resposta,
          modo: input.modo,
          exposureCount,
          diagnostics,
        },
        tx,
      });

      if (confidence !== undefined) {
        await appendLearningEvent({
          userId: input.userId,
          eventType: "confidence_recorded",
          questionId: input.questionId,
          sessionId: input.sessionId,
          payload: {
            attemptId: inserted.id,
            confidence,
            fsrsRating,
            acertou: input.acertou,
          },
          tx,
        });
      }

      const masteryResult = await updateSkillMastery({
        userId: input.userId,
        questionId: input.questionId,
        acertou: input.acertou,
        mode: input.modo,
        confidence,
        exposureCount,
        hintUsed: input.hintUsed,
        answerChanged: input.answerChanged,
        feedbackSeenBeforeAnswer: input.feedbackSeenBeforeAnswer,
        tx,
      });

      let dominio = false;

      if (input.modo === "estudo") {
        const now = new Date();

        const [existing] = await tx
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

        const scheduled = agendarProximaRevisao(cardState, fsrsRating, now, {
          examDate: PROVA_DATA,
          requestedRetention:
            calcularFase(diasParaProva()) === "semana_final"
              ? 0.92
              : undefined,
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
          await tx
            .update(srsCards)
            .set(valores)
            .where(eq(srsCards.id, existing.id));
        } else {
          await tx.insert(srsCards).values({
            userId: input.userId,
            questionId: input.questionId,
            ...valores,
          });
        }

        if (input.acertou) {
          dominio = await verificarDominioTopicoComMastery(
            input.userId,
            questaoRow.topicId,
            tx,
          );
        }
      }

      return {
        attemptId: inserted.id,
        dominioAlcancado: dominio,
        masteryUpdates: masteryResult.updated,
      };
    },
  );

  if (input.sessionId && input.modo === "estudo") {
    await registrarRespostaSessao(input.sessionId, input.acertou);
  }

  const pedagogy = parsePedagogyConfig(questaoRow.pedagogyJson);
  let isNovice = false;
  if (pedagogy?.prerequisiteSkillCodes?.length) {
    try {
      isNovice = await checkNoviceGate({
        userId: input.userId,
        pedagogy,
      });
    } catch {
      isNovice = false;
    }
  }

  return {
    ok: true,
    attemptId,
    tipoErro,
    dominioAlcancado,
    confidence,
    diagnostics,
    masteryUpdates,
    isNovice,
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
    /** Fase 5: holdout fora de repetição comum. */
    ne(questions.assessmentPool, "holdout"),
    disciplina ? eq(topics.disciplina, disciplina) : undefined,
    topicoSlug ? eq(topics.nome, topicoSlug) : undefined,
    somenteReaisIdecan ? sqlSomenteQuestoesReais("questions.tags") : undefined,
  ].filter(Boolean);

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
      /** Fase 5: holdout fora de “novas aleatórias”. */
      ne(questions.assessmentPool, "holdout"),
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
