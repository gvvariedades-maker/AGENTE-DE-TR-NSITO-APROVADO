/** Normaliza texto para comparação fuzzy de micro-recall. */
export function normalizarRecall(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export function validarMicroRecall(
  resposta: string,
  esperada: string,
  variacoes: string[] = [],
): boolean {
  const norm = normalizarRecall(resposta);
  if (!norm) return false;

  const aceitas = [esperada, ...variacoes].map(normalizarRecall);
  return aceitas.some((a) => norm === a || norm.includes(a) || a.includes(norm));
}
