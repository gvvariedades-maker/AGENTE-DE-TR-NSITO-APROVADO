/**
 * Novice-gate: abre prerequisite_repair se não há evidência nos pré-requisitos.
 * Funções puras aqui; I/O em `novice-gate-db.ts` (evita carregar DATABASE_URL nos testes).
 */

import {
  isMasteryState,
  type MasteryState,
} from "@/lib/mastery/mastery-state";
import type { PedagogyConfig } from "@/types/pedagogy";

export type PrerequisiteMasterySnapshot = {
  skillCode: string;
  state: MasteryState;
  novelCorrectCount: number;
};

export type NoviceGateInput = {
  prerequisiteSkillCodes: string[];
  /** Mastery conhecido por código (pode ser parcial). */
  masteryByCode: ReadonlyMap<string, PrerequisiteMasterySnapshot | undefined>;
};

/**
 * True se algum pré-requisito está ausente ou `unseen`
 * (0 evidência útil).
 */
export function evaluateNoviceGate(input: NoviceGateInput): boolean {
  const codes = input.prerequisiteSkillCodes.filter((c) => c.trim().length > 0);
  if (codes.length === 0) return false;

  return codes.some((code) => {
    const row = input.masteryByCode.get(code);
    if (!row) return true;
    return row.state === "unseen" || row.novelCorrectCount <= 0;
  });
}

export function noviceGateFromPedagogy(
  pedagogy: PedagogyConfig | null | undefined,
  masteryByCode: ReadonlyMap<string, PrerequisiteMasterySnapshot | undefined>,
): boolean {
  if (!pedagogy?.prerequisiteSkillCodes?.length) return false;
  return evaluateNoviceGate({
    prerequisiteSkillCodes: pedagogy.prerequisiteSkillCodes,
    masteryByCode,
  });
}

export function snapshotFromRow(row: {
  skillCode: string;
  state: string;
  novelCorrectCount: number;
}): PrerequisiteMasterySnapshot {
  const state: MasteryState = isMasteryState(row.state) ? row.state : "unseen";
  return {
    skillCode: row.skillCode,
    state,
    novelCorrectCount: row.novelCorrectCount,
  };
}
