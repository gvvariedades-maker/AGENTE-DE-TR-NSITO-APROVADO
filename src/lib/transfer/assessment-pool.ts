/**
 * Tipos e helpers de assessment_pool (Fase 5 — transfer + holdout).
 */

export const ASSESSMENT_POOLS = [
  "learning",
  "transfer",
  "holdout",
  "simulation",
] as const;

export type AssessmentPool = (typeof ASSESSMENT_POOLS)[number];

/** Pools permitidos em estudo / revisão / missão (sem holdout). */
export const STUDY_ASSESSMENT_POOLS: readonly AssessmentPool[] = [
  "learning",
  "transfer",
] as const;

/** Pools no simulado espelho (holdout permanece reservado). */
export const SIMULADO_ASSESSMENT_POOLS: readonly AssessmentPool[] = [
  "learning",
  "transfer",
  "simulation",
] as const;

export function isAssessmentPool(value: unknown): value is AssessmentPool {
  return (
    typeof value === "string" &&
    (ASSESSMENT_POOLS as readonly string[]).includes(value)
  );
}

export function isHoldoutPool(pool: string | null | undefined): boolean {
  return pool === "holdout";
}

/** True se o pool pode entrar em fila de estudo/repetição comum. */
export function isStudyEligiblePool(pool: string | null | undefined): boolean {
  const p = pool ?? "learning";
  return (STUDY_ASSESSMENT_POOLS as readonly string[]).includes(p);
}

/** True se o pool pode entrar em caderno de simulado. */
export function isSimuladoEligiblePool(pool: string | null | undefined): boolean {
  const p = pool ?? "learning";
  return (SIMULADO_ASSESSMENT_POOLS as readonly string[]).includes(p);
}
