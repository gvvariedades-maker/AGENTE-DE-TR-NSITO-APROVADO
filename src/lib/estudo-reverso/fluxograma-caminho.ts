import type { ConteudoFluxograma } from "@/types/estudo-reverso-visual";

/** Extrai nós em ordem de caminho linear (raiz → folha). Retorna ordem original se não for linear. */
export function ordenarNosFluxogramaLinear(
  conteudo: ConteudoFluxograma,
): ConteudoFluxograma["nos"] {
  const caminho = extrairCaminhoLinear(conteudo);
  return caminho ?? conteudo.nos;
}

export function extrairCaminhoLinear(
  conteudo: ConteudoFluxograma,
): ConteudoFluxograma["nos"] | null {
  const { nos, arestas } = conteudo;
  if (nos.length === 0) return [];

  const paraIds = new Set(arestas.map((a) => a.para));
  const roots = nos.filter((n) => !paraIds.has(n.id));
  if (roots.length !== 1) return null;

  const path: ConteudoFluxograma["nos"] = [];
  let currentId: string | null = roots[0]!.id;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const no = nos.find((n) => n.id === currentId);
    if (!no) return null;
    path.push(no);
    const outs = arestas.filter((a) => a.de === currentId);
    if (outs.length > 1) return null;
    currentId = outs.length === 1 ? outs[0]!.para : null;
  }

  return path.length === nos.length ? path : null;
}

export function isFluxogramaLinear(conteudo: ConteudoFluxograma): boolean {
  return extrairCaminhoLinear(conteudo) !== null;
}
