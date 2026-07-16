import type { EstudoReversoVisual } from "@/types/estudo-reverso-visual";
import { isEstudoReversoVisualCompleto } from "@/types/estudo-reverso-visual";

/**
 * Roteamento e labels das trilhas visuais pós-questão.
 * @see .cursor/skills/estudo-reverso-visual/DOCUMENTACAO.md §9
 */

/**
 * Sempre prioriza aula completa (v2); usa v1 expressa só como fallback legado.
 */
export function escolherTrilhaEstudoReverso(
  expresso: EstudoReversoVisual | null,
  completo: EstudoReversoVisual | null,
): EstudoReversoVisual | null {
  return completo ?? expresso;
}

export const LABEL_TRILHA_ESTUDO_REVERSO_COMPLETO = "Estudo reverso completo";
export const LABEL_TRILHA_ESTUDO_REVERSO_RAPIDO = "Estudo reverso rápido";

export function labelTrilhaEstudoReverso(visual: EstudoReversoVisual): string {
  return isEstudoReversoVisualCompleto(visual)
    ? LABEL_TRILHA_ESTUDO_REVERSO_COMPLETO
    : LABEL_TRILHA_ESTUDO_REVERSO_RAPIDO;
}
