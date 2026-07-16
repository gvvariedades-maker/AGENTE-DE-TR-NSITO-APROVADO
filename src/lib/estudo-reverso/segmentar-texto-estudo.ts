export interface BlocoTextoEstudo {
  linhas: string[];
}

function segmentarLinhas(bloco: string): string[] {
  const trimmed = bloco.trim();
  if (!trimmed) return [];

  if (/\n/.test(trimmed)) {
    return trimmed
      .split(/\n/)
      .map((l) => l.trim())
      .filter(Boolean);
  }

  const porParagrafo = trimmed.split(/(?<=[.;])\s+(?=§)/);
  if (porParagrafo.length > 1) {
    return porParagrafo.map((p) => p.trim()).filter(Boolean);
  }

  const porArtigo = trimmed.split(/(?<=[.;])\s+(?=Art\.\s)/i);
  if (porArtigo.length > 1) {
    return porArtigo.map((p) => p.trim()).filter(Boolean);
  }

  return [trimmed];
}

/** Quebra texto em blocos (`\n\n`) e linhas (`\n`, `§`, `Art.`). */
export function segmentarTextoEmBlocos(texto: string): BlocoTextoEstudo[] {
  const normalizado = texto.trim();
  if (!normalizado) return [];

  if (/\n\n/.test(normalizado)) {
    return normalizado
      .split(/\n\n+/)
      .map((bloco) => ({ linhas: segmentarLinhas(bloco) }))
      .filter((b) => b.linhas.length > 0);
  }

  const linhas = segmentarLinhas(normalizado);
  return linhas.length > 0 ? [{ linhas }] : [];
}

export function offsetsSegmentosTexto(
  texto: string,
  segmentos: string[],
): { inicio: number; fim: number }[] {
  const offsets: { inicio: number; fim: number }[] = [];
  let buscaDesde = 0;

  for (const seg of segmentos) {
    const idx = texto.indexOf(seg, buscaDesde);
    const inicio = idx >= 0 ? idx : buscaDesde;
    const fim = inicio + seg.length;
    offsets.push({ inicio, fim });
    buscaDesde = fim;
  }

  return offsets;
}

/** Lista plana de segmentos (útil para grifos com offset). */
export function segmentarTextoPlano(texto: string): string[] {
  return segmentarTextoEmBlocos(texto).flatMap((b) => b.linhas);
}
