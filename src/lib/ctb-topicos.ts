/** Slugs e rótulos do Anexo I retificado — Legislação de Trânsito (CTB + CONTRAN + SENATRAN). */
export const CTB_TOPICOS_LABELS: Record<string, string> = {
  CTB_lei_completa: "Lei 9.503/1997 (CTB)",
  CTB_snt_competencias: "Sistema Nacional de Trânsito",
  CTB_circulacao_conduta: "Circulação e conduta",
  CTB_pedestres_nao_motorizados: "Pedestres e não motorizados",
  CTB_direitos_deveres: "Direitos e deveres no trânsito",
  CTB_educacao_transito: "Educação para o trânsito",
  CTB_sinalizacao: "Sinalização de trânsito",
  CTB_engenharia_fiscalizacao: "Fiscalização e policiamento",
  CTB_veiculos: "Veículos e licenciamento",
  CTB_habilitacao: "Habilitação",
  CTB_infracoes: "Infrações de trânsito",
  CTB_penalidades: "Penalidades e medidas administrativas",
  CTB_processo_administrativo: "Processo administrativo (autuação)",
  CTB_crimes_transito: "Crimes de trânsito",
  CTB_conducao_embriaguez: "Embriaguez e etilômetro",
  CONTRAN_1013_free_flow: "CONTRAN 1013 — pedágio free flow",
  CONTRAN_227_iluminacao: "CONTRAN 227 — iluminação",
  CONTRAN_996_mobilidade: "CONTRAN 996 — mobilidade individual",
  CONTRAN_940_capacete: "CONTRAN 940 — capacete",
  CONTRAN_993_equipamentos: "CONTRAN 993 — equipamentos obrigatórios",
  CONTRAN_968_identificacao: "CONTRAN 968 — identificação de veículos",
  CONTRAN_36_advertencia: "CONTRAN 36 — advertência veículos parados",
  CONTRAN_970_sinalizacao_iluminacao: "CONTRAN 970 — sinalização e iluminação",
  CONTRAN_242_imagens: "CONTRAN 242 — equipamentos de imagem",
  CONTRAN_914_semirreboque: "CONTRAN 914 — semirreboque moto",
  CONTRAN_955_cargas_externas: "CONTRAN 955 — cargas externas",
  CONTRAN_911_registro: "CONTRAN 911 — registro e licenciamento",
  CONTRAN_1020_habilitacao: "CONTRAN 1020 — habilitação",
  CONTRAN_1009_alteracoes: "CONTRAN 1009 — alterações normativas",
  CONTRAN_432_alcoolemia: "CONTRAN 432 — fiscalização de alcoolemia",
  CONTRAN_918_multas: "CONTRAN 918 — multas e arrecadação",
  CONTRAN_985_mbft: "CONTRAN 985 — MBFT",
  CONTRAN_procedimentos_operacionais: "Procedimentos de fiscalização",
  CONTRAN_991_multas: "CONTRAN 991 — multas",
  CONTRAN_1003_mbft: "CONTRAN 1003 — MBFT",
  CONTRAN_1012_rsv: "CONTRAN 1012 — RSV",
  CONTRAN_900_recursos: "CONTRAN 900 — defesa e recursos",
  SENATRAN_966_curso_agente: "SENATRAN 966 — curso de agente",
};

/** @deprecated Use TOPICOS_PRIORIDADE_EDITAL em edital-topicos.ts */
export const TOPICOS_CTB_PRIORIDADE: string[] = [
  "CTB_engenharia_fiscalizacao",
  "CTB_infracoes",
  "CTB_processo_administrativo",
  "CONTRAN_985_mbft",
  "CONTRAN_432_alcoolemia",
  "SENATRAN_966_curso_agente",
];

export function labelTopicoCTB(slug: string): string {
  if (CTB_TOPICOS_LABELS[slug]) return CTB_TOPICOS_LABELS[slug];
  return slug
    .replace(/^(CTB|CONTRAN|SENATRAN)_/, "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
