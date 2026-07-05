"use server";

import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { estudoReversoSessions, srsCards } from "@/lib/db/schema";
import {
  agendarProximaRevisao,
  criarCardInicial,
  type SrsCardState,
} from "@/lib/srs";
import { PROVA_DATA } from "@/types";
import { isQuestaoPersistivel } from "@/lib/estudo-reverso";

export interface RegistrarEstudoReversoPayload {
  questionId: string;
  attemptId?: string;
  telasVistas: string[];
  recallAcertou: boolean | null;
  tempoTotalSeg: number;
  concluido: boolean;
}

export interface RegistrarEstudoReversoResult {
  ok: boolean;
  demo?: boolean;
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
    state: row.state as SrsCardState["state"],
    lastReview: row.lastReview,
  };
}

export async function registrarEstudoReverso(
  payload: RegistrarEstudoReversoPayload,
): Promise<RegistrarEstudoReversoResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, demo: true };
  }

  if (!isQuestaoPersistivel(payload.questionId)) {
    return { ok: false, demo: true };
  }

  await db.insert(estudoReversoSessions).values({
    userId: user.id,
    questionId: payload.questionId,
    attemptId: payload.attemptId ?? null,
    telasVistas: payload.telasVistas,
    recallAcertou: payload.recallAcertou,
    tempoTotalSeg: payload.tempoTotalSeg,
    concluido: payload.concluido,
    concluidoEm: payload.concluido ? new Date() : null,
  });

  if (payload.concluido && payload.recallAcertou === true) {
    const now = new Date();
    const [existing] = await db
      .select()
      .from(srsCards)
      .where(
        and(
          eq(srsCards.userId, user.id),
          eq(srsCards.questionId, payload.questionId),
        ),
      )
      .limit(1);

    const cardState = existing
      ? rowToCardState(existing)
      : criarCardInicial();

    const scheduled = agendarProximaRevisao(cardState, true, now, {
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
        userId: user.id,
        questionId: payload.questionId,
        ...valores,
      });
    }
  }

  return { ok: true };
}
