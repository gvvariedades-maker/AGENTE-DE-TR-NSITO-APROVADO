/**
 * Barrel — skills (Fase 2).
 */
export {
  FINE_SKILLS_LT,
  MECHANISM_SKILL_CODE,
  MICROTOPICO_WEIGHT_BOOST,
  SKILL_ROLES,
  TRANSFER_LEVELS,
  type FineSkillDef,
  type SkillKind,
  type SkillRole,
  type TransferLevel,
} from "./catalog";
export {
  inferPilotTransferLevel,
  mapQuestaoToSkillLinks,
  matchFineSkills,
  type MappedSkillLink,
  type QuestaoSkillInput,
} from "./map-questao-skills";
