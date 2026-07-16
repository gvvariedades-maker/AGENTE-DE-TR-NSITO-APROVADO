import { labelTopicoEdital } from "@/lib/edital-topicos";
import type { Disciplina } from "@/types";

export interface PiorTopico {
  topicId: string | null;
  slug: string;
  disciplina: Disciplina;
  erros: number;
  tentativas: number;
  taxaErro: number;
}

export function labelPiorTopico(p: PiorTopico): string {
  const nome = labelTopicoEdital(p.slug);
  if (p.tentativas === 0) {
    return `${nome} — prioridade do edital`;
  }
  return `${nome} — ${p.taxaErro}% erros`;
}

export { hrefEstudoErros, hrefEstudoTopico } from "@/lib/estudo-links";
