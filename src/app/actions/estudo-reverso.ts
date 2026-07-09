"use server";

import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { estudoReversoSessions } from "@/lib/db/schema";
import { isQuestaoPersistivel } from "@/lib/estudo-reverso";

export interface RegistrarEstudoReversoPayload {
  questionId: string;
  attemptId?: string;
  telasVistas: string[];
  tempoTotalSeg: number;
  concluido: boolean;
}

export interface RegistrarEstudoReversoResult {
  ok: boolean;
  demo?: boolean;
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
    recallAcertou: null,
    tempoTotalSeg: payload.tempoTotalSeg,
    concluido: payload.concluido,
    concluidoEm: payload.concluido ? new Date() : null,
  });

  return { ok: true };
}
