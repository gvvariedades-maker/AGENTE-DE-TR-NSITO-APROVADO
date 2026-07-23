/**
 * Tipos e catálogo de skills finas (Fase 2 — Motor de Evidências).
 * Skills de microtópico = slug do edital (1:1 com topics.nome LT).
 * Clusters = alto ROI IDECAN (SNT, EAR/art.261, gravidade/art.259, …).
 */

export type SkillKind = "microtopico" | "cluster" | "device";
export type SkillRole = "primary" | "secondary" | "distractor";
export type TransferLevel = "T0" | "T1" | "T2" | "T3";

export const TRANSFER_LEVELS: readonly TransferLevel[] = [
  "T0",
  "T1",
  "T2",
  "T3",
] as const;

export const SKILL_ROLES: readonly SkillRole[] = [
  "primary",
  "secondary",
  "distractor",
] as const;

export interface FineSkillDef {
  /** Código estável em skills.code */
  code: string;
  /** Microtópico edital pai (topics.nome) */
  topicSlug: string;
  name: string;
  kind: SkillKind;
  editalWeight: number;
  /** Prefixos de fundamento_slug / eixos_legais que disparam secondary */
  slugPrefixes: string[];
  /** Tags de questão que também disparam secondary */
  tags?: string[];
}

/**
 * Clusters CTB de alto ROI (plano Fase 2).
 * Códigos finos além do 1:1 microtópico.
 */
export const FINE_SKILLS_LT: readonly FineSkillDef[] = [
  {
    code: "CTB_cluster_snt_competencias",
    topicSlug: "CTB_snt_competencias",
    name: "Competências SNT — CONTRAN, SENATRAN, DETRAN, município (arts. 12–24)",
    kind: "cluster",
    editalWeight: 1.5,
    slugPrefixes: ["CTB_art_12", "CTB_art_18", "CTB_art_21", "CTB_art_22", "CTB_art_24"],
    tags: ["snt", "competencia", "contran", "detran", "senatran"],
  },
  {
    code: "CTB_cluster_ear_pontuacao",
    topicSlug: "CTB_penalidades",
    name: "EAR e limiares de pontuação / suspensão (art. 261)",
    kind: "cluster",
    editalWeight: 1.5,
    slugPrefixes: ["CTB_art_261"],
    tags: ["ear", "atividade_remunerada", "suspensao_pontos"],
  },
  {
    code: "CTB_cluster_infracoes_gravidade",
    topicSlug: "CTB_penalidades",
    name: "Gravidade e pontuação das infrações (art. 259)",
    kind: "cluster",
    editalWeight: 1.5,
    slugPrefixes: ["CTB_art_259"],
    tags: ["gravidade", "pontuacao", "leve", "media", "grave", "gravissima"],
  },
  {
    code: "CTB_cluster_infracoes_cumulacao",
    topicSlug: "CTB_infracoes",
    name: "Infrações simultâneas (art. 266)",
    kind: "cluster",
    editalWeight: 1.4,
    slugPrefixes: ["CTB_art_266"],
    tags: ["cumulacao", "simultaneas", "concomitantes"],
  },
  {
    code: "CTB_cluster_embriaguez",
    topicSlug: "CTB_conducao_embriaguez",
    name: "Embriaguez, recusa e exames (arts. 165, 165-A, 277)",
    kind: "cluster",
    editalWeight: 1.5,
    slugPrefixes: ["CTB_art_165", "CTB_art_277"],
    tags: ["embriaguez", "etilometro", "recusa", "alcoolemia"],
  },
] as const;

/** Mecanismos IDECAN → skill_code preferida (quando aplicável). */
export const MECHANISM_SKILL_CODE: Partial<
  Record<string, string>
> = {
  competencia_snt: "CTB_cluster_snt_competencias",
  gravidade: "CTB_cluster_infracoes_gravidade",
};

/** Peso edital sugerido para microtópicos de prioridade de estudo. */
export const MICROTOPICO_WEIGHT_BOOST: Readonly<Record<string, number>> = {
  CTB_engenharia_fiscalizacao: 1.4,
  CTB_infracoes: 1.5,
  CTB_processo_administrativo: 1.4,
  CTB_penalidades: 1.3,
  CTB_snt_competencias: 1.3,
  CTB_conducao_embriaguez: 1.4,
  CONTRAN_985_mbft: 1.3,
  CONTRAN_432_alcoolemia: 1.3,
  CONTRAN_1003_mbft: 1.2,
  SENATRAN_966_curso_agente: 1.2,
};
