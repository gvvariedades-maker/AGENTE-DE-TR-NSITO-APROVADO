/**
 * Orquestra política + builder para o player adaptativo (Fase 4).
 */

import type { AttemptDiagnostics } from "@/lib/diagnostics/diagnose-from-passo";
import type { SkillMasterySnapshot } from "@/lib/mastery/update-skill-mastery";
import type { ConfidenceLevel } from "@/lib/srs/rating-policy";
import {
  applyInterventionToVisual,
  buildInterventionScreens,
  type BuildInterventionResult,
} from "@/lib/tutor/intervention-builder";
import { selectIntervention } from "@/lib/tutor/intervention-policy";
import { noviceGateFromPedagogy } from "@/lib/tutor/novice-gate";
import type { EstudoReversoVisual } from "@/types/estudo-reverso-visual";
import type { InterventionPath, PedagogyConfig } from "@/types/pedagogy";

export type ResolveAdaptiveLessonInput = {
  visual: EstudoReversoVisual;
  pedagogy: PedagogyConfig | null;
  acertou: boolean;
  confidence?: ConfidenceLevel | null;
  diagnostics?: AttemptDiagnostics | null;
  masteryUpdates?: SkillMasterySnapshot[];
  /** Pré-computado (server). Se omitido, deriva de pedagogy + masteryUpdates. */
  isNovice?: boolean;
};

export type AdaptiveLessonPlan = {
  path: InterventionPath;
  reason: string;
  /** Se false, player usa visual completo (legado / sem pedagogy). */
  adaptive: boolean;
  build: BuildInterventionResult;
  visual: EstudoReversoVisual;
};

function primarySnapshot(
  updates: SkillMasterySnapshot[] | undefined,
): SkillMasterySnapshot | undefined {
  if (!updates?.length) return undefined;
  return (
    updates.find((u) => u.role === "primary") ?? updates[0]
  );
}

function hasMisconception(diagnostics?: AttemptDiagnostics | null): boolean {
  if (!diagnostics) return false;
  return Boolean(
    diagnostics.misconceptionCode ||
      diagnostics.mechanismSlug ||
      (diagnostics.source !== "none" && diagnostics.errorType),
  );
}

/**
 * Sem `pedagogy` → aula completa (compatível com migração gradual).
 * Com `pedagogy` → path + subset de telas.
 */
export function resolveAdaptiveLesson(
  input: ResolveAdaptiveLessonInput,
): AdaptiveLessonPlan {
  const { visual, pedagogy } = input;

  if (!pedagogy) {
    const build = buildInterventionScreens({
      visual,
      path: "guided_learning",
      pedagogy: null,
    });
    return {
      path: "guided_learning",
      reason: "Sem pedagogy_json — aula completa (legado).",
      adaptive: false,
      build,
      visual,
    };
  }

  const masteryMap = new Map(
    (input.masteryUpdates ?? []).map((u) => [
      u.skillCode,
      {
        skillCode: u.skillCode,
        state: u.state,
        novelCorrectCount: u.novelCorrectCount,
      },
    ]),
  );

  const isNovice =
    input.isNovice ??
    noviceGateFromPedagogy(pedagogy, masteryMap);

  const primary = primarySnapshot(input.masteryUpdates);
  const policy = selectIntervention({
    acertou: input.acertou,
    confidence: input.confidence,
    hasMisconception: hasMisconception(input.diagnostics),
    isNovice,
    primaryMasteryState: primary?.state,
    primaryMasteryProbability: primary?.masteryProbability,
  });

  const build = buildInterventionScreens({
    visual,
    path: policy.path,
    pedagogy,
  });

  return {
    path: policy.path,
    reason: policy.reason,
    adaptive: true,
    build,
    visual: applyInterventionToVisual(visual, build.telas),
  };
}
