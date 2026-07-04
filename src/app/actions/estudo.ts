"use server";

import { createClient } from "@/lib/supabase/server";
import {
  carregarIrmas,
  registrarTentativa,
  type ModoTentativa,
  type RegistrarTentativaResult,
} from "@/lib/estudo-reverso";

export interface TentativaPayload {
  questionId: string;
  resposta: string;
  acertou: boolean;
  modo: ModoTentativa;
  tempoSeg?: number;
}

export interface TentativaActionResult extends RegistrarTentativaResult {
  irmaAs?: Awaited<ReturnType<typeof carregarIrmas>>;
}

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

  const result = await registrarTentativa({
    userId: user.id,
    questionId: payload.questionId,
    resposta: payload.resposta,
    acertou: payload.acertou,
    modo: payload.modo,
    tempoSeg: payload.tempoSeg,
  });

  if (!result.ok || !result.irmaIds?.length) {
    return result;
  }

  const irmaAs = await carregarIrmas(result.irmaIds);
  return { ...result, irmaAs };
}
