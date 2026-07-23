import {
  LABEL_MECANISMO_DISTRATOR,
  type MecanismoDistrator,
} from "@/lib/mecanismo-distrator-labels";
import {
  obterPasso2Mecanismos,
  passo2MecanismoPorLetra,
} from "@/lib/validations/questao-mecanismo";

export type AttemptDiagnostics = {
  errorType: string | null;
  misconceptionCode: string | null;
  mechanismSlug: string | null;
  feedbackSummary: string | null;
  source: "db" | "fallback" | "none";
};

function labelMecanismo(slug: string): string {
  if (slug in LABEL_MECANISMO_DISTRATOR) {
    return LABEL_MECANISMO_DISTRATOR[slug as MecanismoDistrator];
  }
  return slug;
}

export function summaryFromMechanism(slug: string, letra: string): string {
  return `Alternativa ${letra}: caiu em «${labelMecanismo(slug)}».`;
}

export function emptyDiagnostics(): AttemptDiagnostics {
  return {
    errorType: null,
    misconceptionCode: null,
    mechanismSlug: null,
    feedbackSummary: null,
    source: "none",
  };
}

/** Fallback puro a partir do passo 2 do comentário (sem DB). */
export function diagnoseFromPassoAPassoPure(
  resposta: string,
  passoAPasso: string[],
  acertou = false,
): AttemptDiagnostics {
  if (acertou) return emptyDiagnostics();

  const passo2 = obterPasso2Mecanismos(passoAPasso);
  if (!passo2?.trim()) return emptyDiagnostics();

  const letra = resposta.trim().toUpperCase();
  const mechanismSlug = passo2MecanismoPorLetra(passo2, letra);
  if (!mechanismSlug) return emptyDiagnostics();

  return {
    errorType: "pegadinha_idecan",
    misconceptionCode: `mech_${mechanismSlug}`,
    mechanismSlug,
    feedbackSummary: summaryFromMechanism(mechanismSlug, letra),
    source: "fallback",
  };
}
