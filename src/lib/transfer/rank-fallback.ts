/**
 * Ranking puro de candidatos de transferência (fallback sem relations).
 * Preferência: transfer_level maior → não vista → mesma skill primary.
 */

import type { TransferLevel } from "@/lib/skills/catalog";
import { TRANSFER_LEVELS } from "@/lib/skills/catalog";

const LEVEL_RANK: Record<TransferLevel, number> = {
  T0: 0,
  T1: 1,
  T2: 2,
  T3: 3,
};

export function transferLevelRank(level: string | null | undefined): number {
  if (
    typeof level === "string" &&
    (TRANSFER_LEVELS as readonly string[]).includes(level)
  ) {
    return LEVEL_RANK[level as TransferLevel];
  }
  return LEVEL_RANK.T1;
}

export type TransferFallbackCandidate = {
  questionId: string;
  /** transfer_level da skill primary (ou da skill alvo). */
  transferLevel: string;
  /** Já respondida pelo usuário. */
  seen: boolean;
  /** Mesma skill primary que a fonte. */
  samePrimarySkill: boolean;
};

/**
 * Ordena candidatos do fallback: mesmo tópico já filtrado pelo caller.
 * 1) transfer_level maior que o da fonte
 * 2) não vista
 * 3) mesma skill primary
 * 4) nível absoluto desc
 */
export function rankTransferFallback(
  candidates: TransferFallbackCandidate[],
  sourceTransferLevel: string,
): TransferFallbackCandidate[] {
  const sourceRank = transferLevelRank(sourceTransferLevel);
  return [...candidates].sort((a, b) => {
    const aHigher = transferLevelRank(a.transferLevel) > sourceRank ? 1 : 0;
    const bHigher = transferLevelRank(b.transferLevel) > sourceRank ? 1 : 0;
    if (aHigher !== bHigher) return bHigher - aHigher;

    if (a.seen !== b.seen) return a.seen ? 1 : -1;

    if (a.samePrimarySkill !== b.samePrimarySkill) {
      return a.samePrimarySkill ? -1 : 1;
    }

    return (
      transferLevelRank(b.transferLevel) - transferLevelRank(a.transferLevel)
    );
  });
}

export type RelationKind = "near" | "far";

export function relationMatchesKind(
  relationType: string,
  distance: number,
  kind: RelationKind,
): boolean {
  if (kind === "near") {
    return relationType === "near" || (relationType === "variant" && distance <= 1);
  }
  return relationType === "far" || distance >= 2;
}
