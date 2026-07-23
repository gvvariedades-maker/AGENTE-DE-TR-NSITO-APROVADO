import {
  MASTERED_MIN_SCORE,
  type MasteryState,
} from "@/lib/mastery/mastery-state";

/**
 * Cobertura mínima de questões do tópico com skill primary
 * para usar agregação de mastery (senão: regra legada 2 acertos).
 */
export const SKILL_COVERAGE_THRESHOLD = 0.5;

export type TopicSkillCoverage = {
  questionCount: number;
  withPrimarySkill: number;
  coverage: number;
  meetsThreshold: boolean;
};

export type TopicMasteryAggregate = {
  skillCount: number;
  masteredCount: number;
  minProbability: number;
  majorityMastered: boolean;
  /** true se min(mastery_probability) ≥ MASTERED_MIN_SCORE e há ≥1 skill */
  minAboveThreshold: boolean;
  states: MasteryState[];
};

export function coverageFromCounts(
  questionCount: number,
  withPrimarySkill: number,
): TopicSkillCoverage {
  const coverage =
    questionCount === 0 ? 0 : withPrimarySkill / questionCount;
  return {
    questionCount,
    withPrimarySkill,
    coverage,
    meetsThreshold: coverage >= SKILL_COVERAGE_THRESHOLD,
  };
}

export function aggregateFromEntries(
  entries: readonly {
    state: MasteryState;
    masteryProbability: number;
  }[],
): TopicMasteryAggregate | null {
  if (entries.length === 0) return null;

  const masteredCount = entries.filter((e) => e.state === "mastered").length;
  const minProbability = Math.min(
    ...entries.map((e) => e.masteryProbability),
  );
  const majorityMastered = masteredCount / entries.length >= 0.5;
  const minAboveThreshold =
    entries.length > 0 && minProbability >= MASTERED_MIN_SCORE;

  return {
    skillCount: entries.length,
    masteredCount,
    minProbability,
    majorityMastered,
    minAboveThreshold,
    states: entries.map((e) => e.state),
  };
}

/** Pure helper — decisão a partir de cobertura + aggregate. */
export function decidirDominioTopico(input: {
  coverageMeetsThreshold: boolean;
  aggregate: TopicMasteryAggregate | null;
  legadoDominado: boolean;
}): boolean {
  if (input.coverageMeetsThreshold) {
    if (!input.aggregate) return false;
    return (
      input.aggregate.majorityMastered || input.aggregate.minAboveThreshold
    );
  }
  return input.legadoDominado;
}
