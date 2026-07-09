import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  attempts,
  estudoReversoSessions,
  simulados,
  srsCards,
  studySessions,
} from "@/lib/db/schema";

export interface DesempenhoResetContagem {
  estudoReverso: number;
  tentativas: number;
  srs: number;
  simulados: number;
  sessoes: number;
}

export async function resetDesempenhoUsuario(
  userId: string,
): Promise<DesempenhoResetContagem> {
  return db.transaction(async (tx) => {
    const estudoReverso = await tx
      .delete(estudoReversoSessions)
      .where(eq(estudoReversoSessions.userId, userId))
      .returning({ id: estudoReversoSessions.id });

    const tentativas = await tx
      .delete(attempts)
      .where(eq(attempts.userId, userId))
      .returning({ id: attempts.id });

    const srs = await tx
      .delete(srsCards)
      .where(eq(srsCards.userId, userId))
      .returning({ id: srsCards.id });

    const simuladosRemovidos = await tx
      .delete(simulados)
      .where(eq(simulados.userId, userId))
      .returning({ id: simulados.id });

    const sessoes = await tx
      .delete(studySessions)
      .where(eq(studySessions.userId, userId))
      .returning({ id: studySessions.id });

    return {
      estudoReverso: estudoReverso.length,
      tentativas: tentativas.length,
      srs: srs.length,
      simulados: simuladosRemovidos.length,
      sessoes: sessoes.length,
    };
  });
}
