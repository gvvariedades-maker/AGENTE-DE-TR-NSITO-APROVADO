import type { QuestaoUI } from "@/lib/questoes";
import type { TipoErro } from "@/lib/estudo-reverso";

export function labelTipoErro(tipo: TipoErro): string {
  const labels: Record<TipoErro, string> = {
    decoreba: "Decoreba — revise o dispositivo legal",
    interpretacao: "Interpretação — releia o enunciado com atenção",
    pegadinha_idecan: "Pegadinha IDECAN — compare alternativas parecidas",
    confusao_artigos: "Confusão de artigos — revise a lei seca do tópico",
  };
  return labels[tipo];
}

/**
 * Insere irmãs com espaçamento mínimo (interleaving): posição atual + 2, +4, +6.
 * Evita prática maciça AAA na mesma sessão (03-estudo-reverso.mdc).
 */
export function intercalarIrmas(
  lista: QuestaoUI[],
  indiceAtual: number,
  irmaAs: QuestaoUI[],
): QuestaoUI[] {
  if (irmaAs.length === 0) return lista;

  const idsExistentes = new Set(lista.map((q) => q.id));
  const novas = irmaAs.filter((q) => !idsExistentes.has(q.id));
  if (novas.length === 0) return lista;

  const resultado = [...lista];
  novas.forEach((irma, i) => {
    const pos = Math.min(indiceAtual + 2 + i * 2, resultado.length);
    resultado.splice(pos, 0, irma);
  });

  return resultado;
}
