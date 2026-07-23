import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  attempts,
  questions,
  srsCards,
  studySessions,
  topics,
} from "@/lib/db/schema";
import { diagnoseAttempt } from "@/lib/diagnostics/diagnose-attempt";
import type { AttemptDiagnostics } from "@/lib/diagnostics/diagnose-attempt";
import { isQuestaoPersistivel } from "@/lib/estudo-reverso";
import {
  rankCandidatosMissaoCorretiva,
  type ItemMissaoCorretiva,
} from "@/lib/missao/rank-missao-corretiva";
import { MISSAO_POS_SIMULADO_META } from "@/lib/motor-ata-terms";
import { retrievability } from "@/lib/srs";
import type { RespostaSimuladoItem } from "@/lib/simulado-nota";
import { DISCIPLINA_LABELS, type Disciplina } from "@/types";

export const MODO_MISSAO_CORRETIVA = "corretiva_pos_simulado";

export type DiagnosticoSimuladoItem = {
  questionId: string;
  disciplina: Disciplina;
  acertou: boolean;
  resposta?: string;
  diagnostics: AttemptDiagnostics | null;
};

export type MissaoPosSimulado = {
  questionIds: string[];
  meta: number;
  items: ItemMissaoCorretiva[];
  href: string;
  sessionId: string | null;
  titulo: string;
  motivo: string;
  errosComDiagnostico: number;
};

function inicioDoDiaLocal(): Date {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje;
}

function forgettingRisk01(
  lastReview: Date | null,
  stability: number | null,
  now: Date,
): number {
  if (!lastReview || stability === null || stability <= 0) return 0;
  const elapsed =
    (now.getTime() - lastReview.getTime()) / (24 * 60 * 60 * 1000);
  const r = retrievability(elapsed, stability);
  return Math.max(0, Math.min(1, 1 - r));
}

/**
 * Diagnóstico em lote das alternativas do simulado (erros).
 * Preferência: diagnostics_json já gravado na tentativa; senão diagnoseAttempt.
 */
export async function diagnosticarRespostasSimulado(
  userId: string,
  respostas: RespostaSimuladoItem[],
): Promise<DiagnosticoSimuladoItem[]> {
  const persistiveis = respostas.filter((r) =>
    isQuestaoPersistivel(r.questionId),
  );
  if (persistiveis.length === 0) return [];

  const ids = persistiveis.map((r) => r.questionId);
  const recentAttempts = await db
    .select({
      questionId: attempts.questionId,
      diagnosticsJson: attempts.diagnosticsJson,
      createdAt: attempts.createdAt,
    })
    .from(attempts)
    .where(
      and(
        eq(attempts.userId, userId),
        eq(attempts.modo, "simulado"),
        inArray(attempts.questionId, ids),
      ),
    )
    .orderBy(desc(attempts.createdAt));

  const diagByQuestion = new Map<string, AttemptDiagnostics>();
  for (const row of recentAttempts) {
    if (diagByQuestion.has(row.questionId)) continue;
    const raw = row.diagnosticsJson;
    if (raw && typeof raw === "object") {
      diagByQuestion.set(row.questionId, raw as AttemptDiagnostics);
    }
  }

  const out: DiagnosticoSimuladoItem[] = [];
  for (const r of persistiveis) {
    if (r.acertou) {
      out.push({
        questionId: r.questionId,
        disciplina: r.disciplina,
        acertou: true,
        resposta: r.resposta,
        diagnostics: null,
      });
      continue;
    }

    let diagnostics = diagByQuestion.get(r.questionId) ?? null;
    if (!diagnostics && r.resposta) {
      diagnostics = await diagnoseAttempt({
        questionId: r.questionId,
        resposta: r.resposta,
        acertou: false,
      });
    }
    out.push({
      questionId: r.questionId,
      disciplina: r.disciplina,
      acertou: false,
      resposta: r.resposta,
      diagnostics,
    });
  }
  return out;
}

type MasteryRow = {
  questionId: string;
  masteryProbability: number | null;
  recallScore: number | null;
  transferScore: number | null;
  highConfidenceErrorCount: number;
  state: string | null;
};

async function loadPrimaryMastery(
  userId: string,
  questionIds: string[],
): Promise<Map<string, MasteryRow>> {
  if (questionIds.length === 0) return new Map();

  const rows = await db.execute<{
    question_id: string;
    mastery_probability: number | null;
    recall_score: number | null;
    transfer_score: number | null;
    high_confidence_error_count: number | null;
    state: string | null;
  }>(sql`
    SELECT DISTINCT ON (qs.question_id)
      qs.question_id,
      usm.mastery_probability,
      usm.recall_score,
      usm.transfer_score,
      usm.high_confidence_error_count,
      usm.state
    FROM question_skills qs
    LEFT JOIN user_skill_mastery usm
      ON usm.skill_id = qs.skill_id AND usm.user_id = ${userId}::uuid
    WHERE qs.question_id IN (${sql.join(
      questionIds.map((id) => sql`${id}::uuid`),
      sql`, `,
    )})
      AND qs.role = 'primary'
    ORDER BY qs.question_id, qs.weight DESC
  `);

  const map = new Map<string, MasteryRow>();
  for (const r of rows) {
    map.set(r.question_id, {
      questionId: r.question_id,
      masteryProbability: r.mastery_probability,
      recallScore: r.recall_score,
      transferScore: r.transfer_score,
      highConfidenceErrorCount: r.high_confidence_error_count ?? 0,
      state: r.state,
    });
  }
  return map;
}

/**
 * Gera fila de ~14 atividades por valor esperado (não reabre as 60 aulas).
 * Cria study_session com modo corretiva_pos_simulado.
 */
export async function gerarMissaoPosSimulado(
  userId: string,
  respostas: RespostaSimuladoItem[],
  opts?: { meta?: number; now?: Date },
): Promise<MissaoPosSimulado> {
  const meta = opts?.meta ?? MISSAO_POS_SIMULADO_META;
  const now = opts?.now ?? new Date();

  const erros = respostas.filter(
    (r) => !r.acertou && isQuestaoPersistivel(r.questionId),
  );
  const erroIds = new Set(erros.map((r) => r.questionId));

  /** Seeds: erros do caderno + questões de skills at_risk / lacuna alta. */
  const seedIds = [...erroIds];

  const gapRows = await db.execute<{ question_id: string; disciplina: Disciplina }>(
    sql`
      SELECT q.id AS question_id, t.disciplina
      FROM questions q
      INNER JOIN topics t ON t.id = q.topic_id
      INNER JOIN question_skills qs
        ON qs.question_id = q.id AND qs.role = 'primary'
      INNER JOIN user_skill_mastery usm
        ON usm.skill_id = qs.skill_id AND usm.user_id = ${userId}::uuid
      WHERE q.assessment_pool <> 'holdout'
        AND (
          usm.state IN ('at_risk', 'learning')
          OR usm.mastery_probability < 0.5
          OR usm.high_confidence_error_count > 0
        )
      ORDER BY usm.mastery_probability ASC NULLS FIRST
      LIMIT 40
    `,
  );

  for (const row of gapRows) {
    if (!seedIds.includes(row.question_id)) seedIds.push(row.question_id);
  }

  if (seedIds.length === 0) {
    return {
      questionIds: [],
      meta,
      items: [],
      href: "/estudo?modo=auto",
      sessionId: null,
      titulo: "Sem fila corretiva",
      motivo:
        "Nenhum erro persistível nem skill em risco — continue no plano do dia.",
      errosComDiagnostico: 0,
    };
  }

  const [masteryMap, srsRows, topicRows] = await Promise.all([
    loadPrimaryMastery(userId, seedIds),
    db
      .select({
        questionId: srsCards.questionId,
        lastReview: srsCards.lastReview,
        stability: srsCards.stability,
      })
      .from(srsCards)
      .where(
        and(
          eq(srsCards.userId, userId),
          inArray(srsCards.questionId, seedIds),
        ),
      ),
    db
      .select({
        id: questions.id,
        disciplina: topics.disciplina,
      })
      .from(questions)
      .innerJoin(topics, eq(questions.topicId, topics.id))
      .where(inArray(questions.id, seedIds)),
  ]);

  const srsByQ = new Map(
    srsRows.map((r) => [r.questionId, r] as const),
  );
  const discByQ = new Map(
    topicRows.map((r) => [r.id, r.disciplina] as const),
  );

  const disciplinaErro = new Map(
    erros.map((e) => [e.questionId, e.disciplina] as const),
  );

  const candidatos = seedIds.map((qid) => {
    const m = masteryMap.get(qid);
    const srs = srsByQ.get(qid);
    const disciplina =
      disciplinaErro.get(qid) ?? discByQ.get(qid) ?? "legislacao_transito";
    const recall = m?.recallScore ?? null;
    const transfer = m?.transferScore ?? null;
    const transferPending =
      recall !== null &&
      transfer !== null &&
      recall - transfer >= 0.2;

    return {
      questionId: qid,
      disciplina,
      errouNoSimulado: erroIds.has(qid),
      masteryProbability: m?.masteryProbability ?? null,
      highConfError:
        (m?.highConfidenceErrorCount ?? 0) > 0 || m?.state === "at_risk",
      transferPending,
      forgettingRisk01: forgettingRisk01(
        srs?.lastReview ?? null,
        srs?.stability ?? null,
        now,
      ),
    };
  });

  const ranked = rankCandidatosMissaoCorretiva(candidatos, meta);
  const questionIds = ranked.map((i) => i.questionId);

  let sessionId: string | null = null;
  if (questionIds.length > 0) {
    const [row] = await db
      .insert(studySessions)
      .values({
        userId,
        modo: MODO_MISSAO_CORRETIVA,
        plannedCount: questionIds.length,
        missaoHoje: true,
        plannedQuestionIds: questionIds,
      })
      .returning({ id: studySessions.id });
    sessionId = row?.id ?? null;
  }

  const topDisc = ranked[0]?.disciplina;
  const label = topDisc ? DISCIPLINA_LABELS[topDisc] : "edital";
  const href =
    questionIds.length > 0
      ? `/estudo?missao=corretiva&limit=${questionIds.length}`
      : "/estudo?modo=auto";

  return {
    questionIds,
    meta,
    items: ranked,
    href,
    sessionId,
    titulo: `Missão corretiva · ${questionIds.length}`,
    motivo: `Fila de ${questionIds.length} atividades por valor esperado (edital × lacuna) — foco ${label}. Sem reabrir as 60 aulas do espelho.`,
    errosComDiagnostico: 0,
  };
}

/** Sessão corretiva de hoje (mais recente). */
export async function buscarSessaoMissaoCorretiva(
  userId: string,
): Promise<{ id: string; plannedQuestionIds: string[] } | null> {
  const [row] = await db
    .select({
      id: studySessions.id,
      plannedQuestionIds: studySessions.plannedQuestionIds,
      completed: studySessions.completed,
    })
    .from(studySessions)
    .where(
      and(
        eq(studySessions.userId, userId),
        eq(studySessions.modo, MODO_MISSAO_CORRETIVA),
        gte(studySessions.startedAt, inicioDoDiaLocal()),
      ),
    )
    .orderBy(desc(studySessions.startedAt))
    .limit(1);

  if (!row || !row.plannedQuestionIds?.length) return null;
  return {
    id: row.id,
    plannedQuestionIds: row.plannedQuestionIds,
  };
}
