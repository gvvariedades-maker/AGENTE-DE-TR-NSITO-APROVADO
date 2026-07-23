"use server";

import { createClient } from "@/lib/supabase/server";
import type { FsrsGrade } from "@/lib/srs";
import {
  registrarTentativa,
  type ModoTentativa,
  type RegistrarTentativaResult,
} from "@/lib/estudo-reverso";
import {
  isConfidenceLevel,
  type ConfidenceLevel,
} from "@/lib/srs/rating-policy";

export interface TentativaPayload {
  questionId: string;
  resposta: string;
  acertou: boolean;
  modo: ModoTentativa;
  tempoSeg?: number;
  sessionId?: string;
  /** Preferir `confidence` (Fase 1). Mantido para compatibilidade. */
  fsrsGrade?: FsrsGrade;
  confidence?: ConfidenceLevel;
  hintUsed?: boolean;
  answerChanged?: boolean;
  feedbackSeenBeforeAnswer?: boolean;
}

export type TentativaActionResult = RegistrarTentativaResult;

export async function salvarTentativa(
  payload: TentativaPayload,
): Promise<TentativaActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, demo: true };
  }

  const confidence = isConfidenceLevel(payload.confidence)
    ? payload.confidence
    : undefined;

  return registrarTentativa({
    userId: user.id,
    questionId: payload.questionId,
    resposta: payload.resposta,
    acertou: payload.acertou,
    modo: payload.modo,
    tempoSeg: payload.tempoSeg,
    sessionId: payload.sessionId,
    confidence,
    fsrsGrade: payload.fsrsGrade,
    hintUsed: payload.hintUsed,
    answerChanged: payload.answerChanged,
    feedbackSeenBeforeAnswer: payload.feedbackSeenBeforeAnswer,
  });
}
