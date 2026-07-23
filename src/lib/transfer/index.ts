/**
 * Transferência e holdout (Fase 5 — Motor de Evidências).
 * Meta textual near/far: `src/lib/validations/transferencia-pedagogica.ts`.
 * IDs concretos: `question_relations` + seletores neste módulo.
 */

export {
  ASSESSMENT_POOLS,
  STUDY_ASSESSMENT_POOLS,
  SIMULADO_ASSESSMENT_POOLS,
  isAssessmentPool,
  isHoldoutPool,
  isStudyEligiblePool,
  isSimuladoEligiblePool,
  type AssessmentPool,
} from "@/lib/transfer/assessment-pool";

export {
  HOLDOUT_RELEASE_MASTERY_PROBABILITY,
  evaluateHoldoutGate,
  canReleaseHoldout,
  type HoldoutGateInput,
  type HoldoutGateResult,
} from "@/lib/transfer/holdout-gate";

export {
  transferLevelRank,
  rankTransferFallback,
  relationMatchesKind,
  type TransferFallbackCandidate,
  type RelationKind,
} from "@/lib/transfer/rank-fallback";

export {
  selectNearTransfer,
  selectFarTransfer,
  selectReleasedHoldout,
  type SelectTransferOptions,
} from "@/lib/transfer/select-transfer";
