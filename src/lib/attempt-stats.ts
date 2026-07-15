import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import type { Disciplina } from "@/types";

export interface AttemptStatsDisciplina {
  disciplina: Disciplina;
  tentativas: number;
  acertos: number;
}

export async function getAttemptStatsByDisciplina(
  userId: string,
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
      GROUP BY t.disciplina
    `);
  } catch {
    return [];
  }
}

export async function countAttempts(userId: string): Promise<number> {
  try {
    const [row] = await db.execute<{ total: number }>(sql`
      SELECT count(*)::int AS total
      FROM attempts
      WHERE user_id = ${userId}::uuid
    `);
    return row?.total ?? 0;
  } catch {
    return 0;
  }
}
