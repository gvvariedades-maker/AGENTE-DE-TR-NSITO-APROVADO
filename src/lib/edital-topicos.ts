import { getEditalTopic } from "../../scripts/edital-topics";
import { CTB_TOPICOS_LABELS, labelTopicoCTB } from "@/lib/ctb-topicos";
import type { Disciplina } from "@/types";

export { getEditalTopic };

export interface TopicoPrioridade {
  slug: string;
  disciplina: Disciplina;
}

/** Ordem de estudo sugerida — Trânsito (CTB + CONTRAN + SENATRAN) + gerais de risco. */
export const TOPICOS_PRIORIDADE_EDITAL: TopicoPrioridade[] = [
  { slug: "CTB_engenharia_fiscalizacao", disciplina: "legislacao_transito" },
  { slug: "CTB_infracoes", disciplina: "legislacao_transito" },
  { slug: "CTB_processo_administrativo", disciplina: "legislacao_transito" },
  { slug: "CONTRAN_985_mbft", disciplina: "legislacao_transito" },
  { slug: "CONTRAN_432_alcoolemia", disciplina: "legislacao_transito" },
  { slug: "SENATRAN_966_curso_agente", disciplina: "legislacao_transito" },
  { slug: "informatica_8_1", disciplina: "informatica" },
  { slug: "historia_cg_pb_formacao", disciplina: "historia_cg_pb" },
  { slug: "dir_const_7_3", disciplina: "direito_constitucional" },
];

/** Gerais com maior risco de zerar (mín. 1 pt) — alerta para usuário sem histórico. */
export const DISCIPLINAS_CRITICAS_INICIO: Disciplina[] = [
  "informatica",
  "historia_cg_pb",
  "legislacao_etica_sp",
];

export function labelTopicoEdital(slug: string): string {
  if (CTB_TOPICOS_LABELS[slug]) return labelTopicoCTB(slug);

  const edital = getEditalTopic(slug);
  if (edital?.editalRef) {
    const partes = edital.editalRef.split(" — ");
    const rotulo = partes[partes.length - 1];
    if (rotulo) return rotulo;
  }

  return slug
    .replace(/^(portugues|informatica|etica_sp|dir_adm|dir_const|historia_cg_pb|historia_pb)_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
