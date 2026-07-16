import type { TipoErro } from "@/lib/estudo-reverso";

export function labelTipoErro(tipo: TipoErro): string {
  const labels: Record<TipoErro, string> = {
    decoreba: "Literalidade — revise o dispositivo legal",
    interpretacao: "Interpretação — releia o enunciado com atenção",
    pegadinha_idecan: "Pegadinha IDECAN — compare alternativas parecidas",
    confusao_artigos: "Confusão de competência/artigos — revise a lei seca do assunto",
  };
  return labels[tipo];
}
