import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  attempts,
  estudoReversoSessions,
  learningEvents,
  simulados,
  srsCards,
  studySessions,
  userSkillMastery,
} from "@/lib/db/schema";

export interface DesempenhoResetContagem {
  estudoReverso: number;
  tentativas: number;
  learningEvents: number;
  mastery: number;
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

    const events = await tx
      .delete(learningEvents)
      .where(eq(learningEvents.userId, userId))
      .returning({ id: learningEvents.id });

    const mastery = await tx
      .delete(userSkillMastery)
      .where(eq(userSkillMastery.userId, userId))
      .returning({ skillId: userSkillMastery.skillId });

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
      learningEvents: events.length,
      mastery: mastery.length,
      srs: srs.length,
      simulados: simuladosRemovidos.length,
      sessoes: sessoes.length,
    };
  });
}
