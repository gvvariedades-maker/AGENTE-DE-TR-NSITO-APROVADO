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
import {
  diagnosticarRespostasSimulado,
  gerarMissaoPosSimulado,
  type DiagnosticoSimuladoItem,
  type MissaoPosSimulado,
} from "@/lib/missao/missao-pos-simulado";

export interface FinalizarSimuladoPayload {
  respostas: RespostaSimuladoItem[];
  duracaoMin: number;
  tipo?: "simulado_espelho";
}

export interface FinalizarSimuladoResult {
  ok: boolean;
  demo?: boolean;
  resultado: ResultadoSimulado;
  semaforo?: Pick<
    SemaforoData,
    "gerais" | "especificos" | "total" | "disciplinasEmRisco"
  >;
  simuladoId?: string;
  /** Missão corretiva por valor (~14) — não reabre 60 aulas. */
  missaoCorretiva?: MissaoPosSimulado;
  diagnosticos?: DiagnosticoSimuladoItem[];
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

  const questionIds = payload.respostas
    .map((r) => r.questionId)
    .filter((id) => isQuestaoPersistivel(id));

  const [inserted] = await db
    .insert(simulados)
    .values({
      userId: user.id,
      tipo: payload.tipo ?? "simulado_espelho",
      notaTotal: resultado.notaTotal,
      notasDisciplinaJson: resultado.notasDisciplina,
      zerouDisciplina: resultado.zerouDisciplina,
      duracaoMin: payload.duracaoMin,
      questionIds,
    })
    .returning({ id: simulados.id });

  /** Mastery já atualizado por salvarTentativa durante a prova; aqui: diagnóstico + missão. */
  const [diagnosticos, missaoCorretiva] = await Promise.all([
    diagnosticarRespostasSimulado(user.id, payload.respostas),
    gerarMissaoPosSimulado(user.id, payload.respostas),
  ]);

  const errosComDiagnostico = diagnosticos.filter(
    (d) => !d.acertou && d.diagnostics?.feedbackSummary,
  ).length;

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
    missaoCorretiva: {
      ...missaoCorretiva,
      errosComDiagnostico,
    },
    diagnosticos,
  };
}
