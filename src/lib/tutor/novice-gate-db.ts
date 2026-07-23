/**
 * Novice-gate — acesso ao banco (server-only).
 */

import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { skills, userSkillMastery } from "@/lib/db/schema";
import {
  evaluateNoviceGate,
  snapshotFromRow,
  type PrerequisiteMasterySnapshot,
} from "@/lib/tutor/novice-gate";
import type { PedagogyConfig } from "@/types/pedagogy";

/**
 * Carrega mastery dos pré-requisitos do usuário (server-side).
 */
export async function loadPrerequisiteMastery(
  userId: string,
  prerequisiteSkillCodes: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx?: any,
): Promise<Map<string, PrerequisiteMasterySnapshot>> {
  const codes = [...new Set(prerequisiteSkillCodes.filter((c) => c.trim()))];
  const map = new Map<string, PrerequisiteMasterySnapshot>();
  if (codes.length === 0) return map;

  const client = tx ?? db;
  const rows = await client
    .select({
      skillCode: skills.code,
      state: userSkillMastery.state,
      novelCorrectCount: userSkillMastery.novelCorrectCount,
    })
    .from(userSkillMastery)
    .innerJoin(skills, eq(userSkillMastery.skillId, skills.id))
    .where(
      and(eq(userSkillMastery.userId, userId), inArray(skills.code, codes)),
    );

  for (const row of rows) {
    map.set(row.skillCode, snapshotFromRow(row));
  }

  return map;
}

export async function checkNoviceGate(params: {
  userId: string;
  pedagogy: PedagogyConfig | null | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx?: any;
}): Promise<boolean> {
  const codes = params.pedagogy?.prerequisiteSkillCodes ?? [];
  if (codes.length === 0) return false;

  const masteryByCode = await loadPrerequisiteMastery(
    params.userId,
    codes,
    params.tx,
  );
  return evaluateNoviceGate({
    prerequisiteSkillCodes: codes,
    masteryByCode,
  });
}
