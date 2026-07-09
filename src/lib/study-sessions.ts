import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { studySessions } from "@/lib/db/schema";
import type { Disciplina } from "@/types";

export interface IniciarSessaoInput {
  userId: string;
  modo: string;
  disciplina?: Disciplina;
  topicoSlug?: string;
  plannedCount: number;
}

export async function iniciarSessaoEstudo(
  input: IniciarSessaoInput,
): Promise<string> {
  const [row] = await db
    .insert(studySessions)
    .values({
      userId: input.userId,
      modo: input.modo,
      disciplina: input.disciplina ?? null,
      topicoSlug: input.topicoSlug ?? null,
      plannedCount: input.plannedCount,
    })
    .returning({ id: studySessions.id });

  return row.id;
}

export async function registrarRespostaSessao(
  sessionId: string,
  acertou: boolean,
): Promise<void> {
  await db
    .update(studySessions)
    .set({
      answeredCount: sql`${studySessions.answeredCount} + 1`,
      acertos: acertou
        ? sql`${studySessions.acertos} + 1`
        : studySessions.acertos,
      erros: acertou ? studySessions.erros : sql`${studySessions.erros} + 1`,
    })
    .where(eq(studySessions.id, sessionId));
}

export async function finalizarSessaoEstudo(sessionId: string): Promise<void> {
  await db
    .update(studySessions)
    .set({
      completed: true,
      endedAt: new Date(),
    })
    .where(eq(studySessions.id, sessionId));
}
