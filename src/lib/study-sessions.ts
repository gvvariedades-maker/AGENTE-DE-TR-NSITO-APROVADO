import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { studySessions } from "@/lib/db/schema";
import type { Disciplina } from "@/types";

export interface IniciarSessaoInput {
  userId: string;
  modo: string;
  disciplina?: Disciplina;
  topicoSlug?: string;
  plannedCount: number;
  /** CTA missão do dia — grava a fila da IA. */
  missaoHoje?: boolean;
  plannedQuestionIds?: string[];
}

export interface SessaoMissaoHoje {
  id: string;
  plannedQuestionIds: string[];
  completed: boolean;
  disciplina: Disciplina | null;
}

function inicioDoDiaLocal(): Date {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return hoje;
}

/** Sessão de missão de hoje — opcionalmente filtrada pela disciplina foco. */
export async function buscarSessaoMissaoHoje(
  userId: string,
  disciplina?: Disciplina,
): Promise<SessaoMissaoHoje | null> {
  const condicoes = [
    eq(studySessions.userId, userId),
    eq(studySessions.missaoHoje, true),
    gte(studySessions.startedAt, inicioDoDiaLocal()),
  ];
  if (disciplina) {
    condicoes.push(eq(studySessions.disciplina, disciplina));
  }

  const [row] = await db
    .select({
      id: studySessions.id,
      plannedQuestionIds: studySessions.plannedQuestionIds,
      completed: studySessions.completed,
      disciplina: studySessions.disciplina,
    })
    .from(studySessions)
    .where(and(...condicoes))
    .orderBy(desc(studySessions.startedAt))
    .limit(1);

  if (!row || !row.plannedQuestionIds?.length) return null;

  return {
    id: row.id,
    plannedQuestionIds: row.plannedQuestionIds,
    completed: row.completed,
    disciplina: row.disciplina,
  };
}

/**
 * Encerra filas de missão de hoje com disciplina diferente do foco atual
 * e zera os IDs para não contarem no progresso.
 */
export async function invalidarFilasMissaoHojeOutrasDisciplinas(
  userId: string,
  disciplinaFoco: Disciplina,
): Promise<void> {
  const rows = await db
    .select({
      id: studySessions.id,
      disciplina: studySessions.disciplina,
    })
    .from(studySessions)
    .where(
      and(
        eq(studySessions.userId, userId),
        eq(studySessions.missaoHoje, true),
        gte(studySessions.startedAt, inicioDoDiaLocal()),
      ),
    );

  const ids = rows
    .filter((r) => r.disciplina !== disciplinaFoco)
    .map((r) => r.id);

  if (ids.length === 0) return;

  for (const id of ids) {
    await db
      .update(studySessions)
      .set({
        completed: true,
        endedAt: new Date(),
        plannedQuestionIds: [],
      })
      .where(eq(studySessions.id, id));
  }
}

export async function iniciarSessaoEstudo(
  input: IniciarSessaoInput,
): Promise<string> {
  const plannedIds = input.plannedQuestionIds ?? [];
  const [row] = await db
    .insert(studySessions)
    .values({
      userId: input.userId,
      modo: input.modo,
      disciplina: input.disciplina ?? null,
      topicoSlug: input.topicoSlug ?? null,
      plannedCount: input.plannedCount,
      missaoHoje: input.missaoHoje ?? false,
      plannedQuestionIds: plannedIds,
    })
    .returning({ id: studySessions.id });

  return row.id;
}

/**
 * Reusa a fila da missão do dia se já existir na mesma disciplina;
 * se a disciplina foco mudou, invalida filas antigas e cria outra.
 */
export async function obterOuIniciarSessaoMissaoHoje(input: {
  userId: string;
  modo: string;
  disciplina?: Disciplina;
  topicoSlug?: string;
  plannedQuestionIds: string[];
}): Promise<{ sessionId: string; plannedQuestionIds: string[]; reusada: boolean }> {
  if (input.disciplina) {
    await invalidarFilasMissaoHojeOutrasDisciplinas(
      input.userId,
      input.disciplina,
    );
  }

  const existente = await buscarSessaoMissaoHoje(
    input.userId,
    input.disciplina,
  );

  if (existente) {
    if (!existente.completed) {
      return {
        sessionId: existente.id,
        plannedQuestionIds: existente.plannedQuestionIds,
        reusada: true,
      };
    }

    const sessionId = await iniciarSessaoEstudo({
      userId: input.userId,
      modo: input.modo,
      disciplina: input.disciplina,
      topicoSlug: input.topicoSlug,
      plannedCount: existente.plannedQuestionIds.length,
      missaoHoje: true,
      plannedQuestionIds: existente.plannedQuestionIds,
    });

    return {
      sessionId,
      plannedQuestionIds: existente.plannedQuestionIds,
      reusada: true,
    };
  }

  const sessionId = await iniciarSessaoEstudo({
    userId: input.userId,
    modo: input.modo,
    disciplina: input.disciplina,
    topicoSlug: input.topicoSlug,
    plannedCount: input.plannedQuestionIds.length,
    missaoHoje: true,
    plannedQuestionIds: input.plannedQuestionIds,
  });

  return {
    sessionId,
    plannedQuestionIds: input.plannedQuestionIds,
    reusada: false,
  };
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

/** União dos IDs planejados nas sessões de missão de hoje. */
export async function idsFilaMissaoHoje(userId: string): Promise<string[]> {
  const rows = await db
    .select({
      plannedQuestionIds: studySessions.plannedQuestionIds,
    })
    .from(studySessions)
    .where(
      and(
        eq(studySessions.userId, userId),
        eq(studySessions.missaoHoje, true),
        gte(studySessions.startedAt, inicioDoDiaLocal()),
      ),
    )
    .orderBy(desc(studySessions.startedAt));

  const set = new Set<string>();
  for (const row of rows) {
    for (const id of row.plannedQuestionIds ?? []) {
      set.add(id);
    }
  }
  return [...set];
}
