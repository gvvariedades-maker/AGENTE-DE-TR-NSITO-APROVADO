import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { simulados } from "@/lib/db/schema";

const LIMITE_SIMULADOS_HISTORICO = 20;

export interface HistoricoSimuladoQuestoes {
  /** IDs usados em simulados anteriores (exclusão na 1ª passada). */
  excluirIds: Set<string>;
  /** Maior = usado mais recentemente (para LRU na 2ª passada). */
  lruRank: Map<string, number>;
}

/** Últimos simulados entregues do usuário — base para caderno inédito. */
export async function getHistoricoQuestoesSimulado(
  userId: string,
): Promise<HistoricoSimuladoQuestoes> {
  const excluirIds = new Set<string>();
  const lruRank = new Map<string, number>();

  try {
    const rows = await db
      .select({
        questionIds: simulados.questionIds,
      })
      .from(simulados)
      .where(eq(simulados.userId, userId))
      .orderBy(desc(simulados.createdAt))
      .limit(LIMITE_SIMULADOS_HISTORICO);

    const cronologico = [...rows].reverse();
    let rank = 0;
    for (const row of cronologico) {
      for (const id of row.questionIds ?? []) {
        excluirIds.add(id);
        lruRank.set(id, rank);
        rank += 1;
      }
    }
  } catch {
    return { excluirIds: new Set(), lruRank: new Map() };
  }

  return { excluirIds, lruRank };
}
