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
