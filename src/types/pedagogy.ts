/**
 * Configuração pedagógica por questão (Fase 4 — player adaptativo).
 * Ausente/null em `questions.pedagogy_json` = comportamento legado (aula completa).
 */

export const INTERVENTION_PATHS = [
  "fast_confirmation",
  "uncertain_correct",
  "guided_learning",
  "misconception_repair",
  "transfer_challenge",
  "prerequisite_repair",
] as const;

export type InterventionPath = (typeof INTERVENTION_PATHS)[number];

export const INTERVENTION_PATH_LABELS: Record<InterventionPath, string> = {
  fast_confirmation: "Confirmação rápida",
  uncertain_correct: "Acerto na dúvida",
  guided_learning: "Aula guiada",
  misconception_repair: "Reparo de misconception",
  transfer_challenge: "Desafio de transferência",
  prerequisite_repair: "Pré-requisito",
};

/** Espelho leve de alternative_diagnostics para seleção offline. */
export type PedagogyAlternativeDiagnostic = {
  misconceptionCode?: string;
  mechanismSlug?: string;
  errorType?: string;
};

/**
 * Contrato `questions.pedagogy_json`.
 * Paths listam IDs de telas do `estudo_reverso_visual_completo`;
 * se omitidos, o builder usa heurística por seção.
 */
export type PedagogyConfig = {
  skillCodes?: string[];
  alternativeDiagnostics?: Record<string, PedagogyAlternativeDiagnostic>;
  /** IDs de tela por path de intervenção. */
  paths?: Partial<Record<InterventionPath, string[]>>;
  /** Telas introdutórias quando novice-gate dispara. */
  noviceIntro?: string[];
  /** Skills que devem ter evidência antes do conteúdo alvo. */
  prerequisiteSkillCodes?: string[];
};

export function isInterventionPath(value: unknown): value is InterventionPath {
  return (
    typeof value === "string" &&
    (INTERVENTION_PATHS as readonly string[]).includes(value)
  );
}

/** Paths que abrem trilha completa (ou near-full) por regra de produto. */
export function isFullTrailPath(path: InterventionPath): boolean {
  return (
    path === "guided_learning" ||
    path === "misconception_repair" ||
    path === "prerequisite_repair"
  );
}
