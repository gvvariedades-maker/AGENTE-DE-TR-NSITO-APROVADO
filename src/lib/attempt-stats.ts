import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import type { Disciplina } from "@/types";

export interface AttemptStatsDisciplina {
  disciplina: Disciplina;
  tentativas: number;
  acertos: number;
}

export interface AttemptOverview {
  total: number;
  acertos: number;
  erros: number;
  taxaAcerto: number;
}

function filtroDesde(since: Date | null | undefined) {
  if (!since) return sql``;
  return sql`AND a.created_at >= ${since}`;
}

function filtroModo(modo?: string) {
  if (!modo) return sql``;
  return sql`AND a.modo = ${modo}`;
}

export async function getAttemptStatsByDisciplina(
  userId: string,
  since?: Date | null,
  modo?: string,
): Promise<AttemptStatsDisciplina[]> {
  try {
    return await db.execute<{
      disciplina: Disciplina;
      tentativas: number;
      acertos: number;
    }>(sql`
      SELECT
        t.disciplina,
        count(*)::int AS tentativas,
        count(*) filter (where a.acertou)::int AS acertos
      FROM attempts a
      INNER JOIN questions q ON a.question_id = q.id
      INNER JOIN topics t ON q.topic_id = t.id
      WHERE a.user_id = ${userId}::uuid
        ${filtroDesde(since)}
        ${filtroModo(modo)}
      GROUP BY t.disciplina
    `);
  } catch {
    return [];
  }
}

export async function getAttemptOverview(
  userId: string,
  since?: Date | null,
  modo?: string,
): Promise<AttemptOverview> {
  const vazio: AttemptOverview = {
    total: 0,
    acertos: 0,
    erros: 0,
    taxaAcerto: 0,
  };

  try {
    const [row] = await db.execute<{
      total: number;
      acertos: number;
    }>(sql`
      SELECT
        count(*)::int AS total,
        count(*) filter (where acertou)::int AS acertos
      FROM attempts a
      WHERE a.user_id = ${userId}::uuid
        ${filtroDesde(since)}
        ${filtroModo(modo)}
    `);

    const total = row?.total ?? 0;
    const acertos = row?.acertos ?? 0;
    return {
      total,
      acertos,
      erros: Math.max(0, total - acertos),
      taxaAcerto: total > 0 ? Math.round((acertos / total) * 100) : 0,
    };
  } catch {
    return vazio;
  }
}

export async function countAttempts(
  userId: string,
  since?: Date | null,
): Promise<number> {
  try {
    const [row] = await db.execute<{ total: number }>(sql`
      SELECT count(*)::int AS total
      FROM attempts a
      WHERE a.user_id = ${userId}::uuid
        ${filtroDesde(since)}
    `);
    return row?.total ?? 0;
  } catch {
    return 0;
  }
}
