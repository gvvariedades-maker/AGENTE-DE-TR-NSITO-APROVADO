/** Tag gravada no seed de `content/questoes-reais/`. Sem dependência de DB — seguro em Client Components. */
export const TAG_QUESTAO_REAL_IDECAN = "real_idecan";

export function isQuestaoRealIdecan(tags: string[] | null | undefined): boolean {
  return tags?.includes(TAG_QUESTAO_REAL_IDECAN) ?? false;
}
