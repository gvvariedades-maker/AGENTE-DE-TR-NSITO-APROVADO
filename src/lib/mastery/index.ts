export {
  computeEvidenceWeight,
  calibrationDelta,
  DELAYED_EVIDENCE_MS,
  type EvidenceMode,
  type EvidenceWeightInput,
  type EvidenceWeightBreakdown,
} from "@/lib/mastery/evidence-weight";

export {
  resolveMasteryState,
  computeMasteryProbability,
  clamp01,
  isMasteryState,
  MASTERED_MIN_SCORE,
  CONSOLIDATING_MIN_SCORE,
  MASTERED_MIN_NOVEL_CORRECT,
  MASTERED_MIN_DELAYED_CORRECT,
  HIGH_CONF_ERROR_WINDOW_MS,
  MASTERY_STATES,
  MASTERY_STATE_LABELS,
  type MasteryState,
  type MasteryScores,
  type MasteryCounters,
  type ResolveMasteryStateInput,
} from "@/lib/mastery/mastery-state";

export {
  updateSkillMastery,
  type UpdateSkillMasteryInput,
  type UpdateSkillMasteryResult,
  type SkillMasterySnapshot,
} from "@/lib/mastery/update-skill-mastery";

export {
  verificarDominioTopicoComMastery,
  verificarDominioTopicoLegado,
  getTopicSkillCoverage,
  aggregateTopicSkillMastery,
  decidirDominioTopico,
  SKILL_COVERAGE_THRESHOLD,
  type TopicSkillCoverage,
  type TopicMasteryAggregate,
} from "@/lib/mastery/topic-dominio";

export {
  getUserMasteryDebug,
  type UserSkillMasteryRow,
  type UserMasteryDebugSummary,
} from "@/lib/mastery/get-user-mastery";

export {
  getPainelDominioEvidencias,
  painelDominioVazio,
  MEMORIZED_WITHOUT_MASTERY_MIN_REPS,
  MEMORIZED_WITHOUT_MASTERY_MAX_P,
  type PainelDominioEvidencias,
  type SkillDominioResumo,
  type MemorizadaSemDominio,
} from "@/lib/mastery/painel-dominio-evidencias";
