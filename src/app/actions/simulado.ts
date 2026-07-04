"use server";

import { db } from "@/lib/db";
import { simulados } from "@/lib/db/schema";
import { calcularDeSimulado } from "@/lib/semaforo";
import {
  calcularResultadoSimulado,
  type RespostaSimuladoItem,
  type ResultadoSimulado,
} from "@/lib/simulado-nota";
import { createClient } from "@/lib/supabase/server";
import { isQuestaoPersistivel } from "@/lib/estudo-reverso";
import type { SemaforoData } from "@/lib/semaforo";

export interface FinalizarSimuladoPayload {
  respostas: RespostaSimuladoItem[];
  duracaoMin: number;
  tipo?: "simulado_espelho";
}

export interface FinalizarSimuladoResult {
  ok: boolean;
  demo?: boolean;
  resultado: ResultadoSimulado;
  semaforo?: Pick<SemaforoData, "gerais" | "especificos" | "total" | "disciplinasEmRisco">;
  simuladoId?: string;
}

export async function finalizarSimulado(
  payload: FinalizarSimuladoPayload,
): Promise<FinalizarSimuladoResult> {
  const resultado = calcularResultadoSimulado(payload.respostas);

  const semaforoParcial = calcularDeSimulado(
    resultado.notaTotal,
    resultado.notasDisciplina,
  );

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const temQuestoesReais = payload.respostas.some((r) =>
    isQuestaoPersistivel(r.questionId),
  );

  if (!user || !temQuestoesReais) {
    return {
      ok: true,
      demo: true,
      resultado,
      semaforo: {
        gerais: semaforoParcial.gerais,
        especificos: semaforoParcial.especificos,
        total: semaforoParcial.total,
        disciplinasEmRisco: semaforoParcial.disciplinasEmRisco,
      },
    };
  }

  const [inserted] = await db
    .insert(simulados)
    .values({
      userId: user.id,
      tipo: payload.tipo ?? "simulado_espelho",
      notaTotal: resultado.notaTotal,
      notasDisciplinaJson: resultado.notasDisciplina,
      zerouDisciplina: resultado.zerouDisciplina,
      duracaoMin: payload.duracaoMin,
    })
    .returning({ id: simulados.id });

  return {
    ok: true,
    resultado,
    simuladoId: inserted?.id,
    semaforo: {
      gerais: semaforoParcial.gerais,
      especificos: semaforoParcial.especificos,
      total: semaforoParcial.total,
      disciplinasEmRisco: semaforoParcial.disciplinasEmRisco,
    },
  };
}
