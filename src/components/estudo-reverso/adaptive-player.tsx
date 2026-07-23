"use client";

import {
  EstudoReversoPlayer,
  type EstudoReversoConclusao,
} from "@/components/estudo-reverso/estudo-reverso-player";
import { resolveAdaptiveLesson } from "@/lib/tutor/resolve-adaptive-lesson";
import type { AttemptDiagnostics } from "@/lib/diagnostics/diagnose-from-passo";
import type { SkillMasterySnapshot } from "@/lib/mastery/update-skill-mastery";
import type { ConfidenceLevel } from "@/lib/srs/rating-policy";
import type { EstudoReversoVisual } from "@/types/estudo-reverso-visual";
import type { PedagogyConfig } from "@/types/pedagogy";
import { INTERVENTION_PATH_LABELS } from "@/types/pedagogy";

export type AdaptivePlayerContext = {
  acertou: boolean;
  confidence?: ConfidenceLevel | null;
  diagnostics?: AttemptDiagnostics | null;
  masteryUpdates?: SkillMasterySnapshot[];
  isNovice?: boolean;
};

interface AdaptivePlayerProps {
  visual: EstudoReversoVisual;
  pedagogy?: PedagogyConfig | null;
  context: AdaptivePlayerContext;
  onFechar: () => void;
  onConcluir: (dados: EstudoReversoConclusao) => void;
}

/**
 * Wrapper do player: com `pedagogy_json` seleciona subset de telas v2;
 * sem pedagogy, abre a aula completa (legado).
 */
export function AdaptivePlayer({
  visual,
  pedagogy = null,
  context,
  onFechar,
  onConcluir,
}: AdaptivePlayerProps) {
  const plan = resolveAdaptiveLesson({
    visual,
    pedagogy,
    acertou: context.acertou,
    confidence: context.confidence,
    diagnostics: context.diagnostics,
    masteryUpdates: context.masteryUpdates,
    isNovice: context.isNovice,
  });

  const visualAdaptado = plan.visual;

  if (process.env.NODE_ENV === "development" && plan.adaptive) {
    // Ajuda a depurar path sem poluir UI de produção
    console.debug(
      `[adaptive-player] ${INTERVENTION_PATH_LABELS[plan.path]} — ${plan.reason}`,
      plan.build.screenIds,
    );
  }

  return (
    <EstudoReversoPlayer
      visual={visualAdaptado}
      onFechar={onFechar}
      onConcluir={onConcluir}
    />
  );
}
