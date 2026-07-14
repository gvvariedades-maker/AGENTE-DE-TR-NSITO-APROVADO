/** Slugs de distrator IDECAN — módulo puro (seguro em Client Components). */
export const MECANISMOS_DISTRATOR = [
  "numero_vizinho",
  "competencia_snt",
  "gravidade",
  "regra_excecao",
  "termo_unico",
] as const;

export type MecanismoDistrator = (typeof MECANISMOS_DISTRATOR)[number];

/** Rótulos para o aluno — slugs permanecem no JSON para auditoria. */
export const LABEL_MECANISMO_DISTRATOR: Record<MecanismoDistrator, string> = {
  numero_vizinho: "Número vizinho (prazo/valor trocado)",
  competencia_snt: "Troca de órgão ou competência",
  gravidade: "Gravidade trocada",
  regra_excecao: "Inventa requisito ou exceção",
  termo_unico: "Termo jurídico trocado",
};

const SLUG_PATTERN = new RegExp(
  `\\b(${MECANISMOS_DISTRATOR.join("|")})\\b`,
  "g",
);

export function labelMecanismoDistrator(slug: string): string {
  if ((MECANISMOS_DISTRATOR as readonly string[]).includes(slug)) {
    return LABEL_MECANISMO_DISTRATOR[slug as MecanismoDistrator];
  }
  return slug;
}

/**
 * Converte "A — regra_excecao" → "A — Inventa requisito ou exceção".
 * Se não houver slug, devolve o texto original.
 */
export function formatarCelulaDistratorParaAluno(texto: string): string {
  return texto.replace(SLUG_PATTERN, (slug) => labelMecanismoDistrator(slug));
}

export function formatarTituloColunaDistrator(titulo: string): string {
  const t = titulo.trim().toLowerCase();
  if (
    t === "mecanismo" ||
    t === "mecanismo + por quê" ||
    t.includes("slug")
  ) {
    return "Por que erra";
  }
  return formatarCelulaDistratorParaAluno(titulo);
}

export function isCelulaComSlugDistrator(texto: string): boolean {
  SLUG_PATTERN.lastIndex = 0;
  return SLUG_PATTERN.test(texto);
}
