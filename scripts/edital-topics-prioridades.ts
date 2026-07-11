/**
 * Prioridades ROI por slug — espelha perfis/perfil-*.md §9–§10.
 * Sobrescreve defaults de `npm run proxima` (peso/meta/família/fonte).
 */
import type { EditalTopic, EditalTopicEnriquecido, FamiliaAula, PesoPrioridade } from "./edital-topics";

export type PrioridadeTopico = Partial<
  Pick<EditalTopic, "peso" | "meta" | "familia" | "recente" | "fonteLegal">
>;

/** Meta padrão por disciplina quando slug não tem meta explícita (MVP ÷ tópicos). */
export const META_DEFAULT_DISCIPLINA: Record<string, number> = {
  legislacao_transito: 10,
  portugues: 5,
  informatica: 4,
  historia_cg_pb: 10,
  legislacao_etica_sp: 4,
  direito_administrativo: 5,
  direito_constitucional: 4,
};

const META_POR_TIER: Record<PesoPrioridade, number> = { 3: 8, 2: 5, 1: 3 };

/**
 * Slots na prova (edital 04/2026) — usado em `npm run proxima -- all`.
 */
export const PROVA_SLOTS: Record<string, number> = {
  legislacao_transito: 30,
  portugues: 8,
  informatica: 4,
  historia_cg_pb: 4,
  legislacao_etica_sp: 4,
  direito_administrativo: 5,
  direito_constitucional: 5,
};

export const PRIORIDADES_POR_SLUG: Record<string, PrioridadeTopico> = {
  // —— Legislação de Trânsito — saturados (deficit → 0) ——
  CTB_circulacao_conduta: { peso: 1, meta: 29, familia: "A" },
  CTB_infracoes: { peso: 1, meta: 19, familia: "D" },
  CONTRAN_985_mbft: { peso: 1, meta: 9, familia: "A" },
  CTB_crimes_transito: { peso: 2, meta: 7, familia: "A" },
  CONTRAN_991_multas: { peso: 2, meta: 7, familia: "D" },

  // —— Trânsito — P1 fila ROI ——
  CONTRAN_1013_free_flow: {
    peso: 3,
    meta: 6,
    familia: "A",
    recente: true,
    fonteLegal: "Res. CONTRAN 1.013/2024 (free flow / pedágio eletrônico)",
  },
  CONTRAN_1020_habilitacao: {
    peso: 3,
    meta: 6,
    familia: "A",
    recente: true,
    fonteLegal: "Res. CONTRAN 1.020/2025 (habilitação)",
  },
  CONTRAN_996_mobilidade: {
    peso: 3,
    meta: 8,
    familia: "A",
    recente: true,
    fonteLegal: "Res. CONTRAN 996/2023 (ciclomotores, EMI, patinete)",
  },
  CTB_snt_competencias: {
    peso: 3,
    meta: 8,
    familia: "C",
    fonteLegal: "CTB arts. 12–14, 21–24 (competências SNT)",
  },
  CTB_processo_administrativo: {
    peso: 3,
    meta: 8,
    familia: "A",
    fonteLegal: "CTB arts. 280–288 (AIT, notificação, defesa)",
  },
  CTB_penalidades: { peso: 3, meta: 8, familia: "D", fonteLegal: "CTB arts. 258–272 (penalidades)" },
  CONTRAN_900_recursos: {
    peso: 3,
    meta: 6,
    familia: "A",
    fonteLegal: "Res. CONTRAN 900/2022 (defesa e recursos)",
  },
  CTB_conducao_embriaguez: {
    peso: 3,
    meta: 6,
    familia: "A",
    fonteLegal: "CTB arts. 165-A, 276–277 + Res. CONTRAN 432/2013",
  },
  CONTRAN_432_alcoolemia: {
    peso: 3,
    meta: 6,
    familia: "A",
    fonteLegal: "Res. CONTRAN 432/2013 (teste de alcoolemia)",
  },

  // —— Trânsito — lacunas edital ——
  CTB_direitos_deveres: { peso: 2, meta: 5, familia: "B", fonteLegal: "CTB arts. 88–90" },
  CTB_educacao_transito: { peso: 2, meta: 5, familia: "A", fonteLegal: "CTB arts. 91–93" },
  CTB_lei_completa: { peso: 2, meta: 4, familia: "B", fonteLegal: "CTB — disposições preliminares" },
  CONTRAN_993_equipamentos: {
    peso: 3,
    meta: 6,
    familia: "B",
    fonteLegal: "Res. CONTRAN 993/2022 (equipamentos de segurança)",
  },
  CONTRAN_968_identificacao: {
    peso: 2,
    meta: 5,
    familia: "B",
    fonteLegal: "Res. CONTRAN 968/2022 (identificação veicular)",
  },
  CONTRAN_970_sinalizacao_iluminacao: {
    peso: 2,
    meta: 5,
    familia: "A",
    fonteLegal: "Res. CONTRAN 970/2022 (sinalização e iluminação)",
  },
  CONTRAN_955_cargas_externas: {
    peso: 2,
    meta: 5,
    familia: "A",
    fonteLegal: "Res. CONTRAN 955/2022 (cargas externas)",
  },
  CONTRAN_1009_alteracoes: {
    peso: 2,
    meta: 5,
    familia: "A",
    recente: true,
    fonteLegal: "Res. CONTRAN 1.009/2024 (alterações veiculares)",
  },
  CONTRAN_1003_mbft: { peso: 2, meta: 5, familia: "D", fonteLegal: "Res. CONTRAN 1.003/2024 (MBFT)" },
  CONTRAN_1012_rsv: { peso: 2, meta: 5, familia: "A", fonteLegal: "Res. CONTRAN 1.012/2024 (RSV)" },
  CONTRAN_procedimentos_operacionais: {
    peso: 2,
    meta: 5,
    familia: "A",
    fonteLegal: "Resoluções CONTRAN — procedimentos operacionais (retificação 01/2026)",
  },
  SENATRAN_966_curso_agente: {
    peso: 2,
    meta: 4,
    familia: "B",
    fonteLegal: "Norma SENATRAN 966 (curso de Agente de Trânsito)",
  },
  CTB_sinalizacao: { peso: 2, meta: 6, familia: "A", fonteLegal: "CTB arts. 80–91 (sinalização)" },
  CTB_habilitacao: { peso: 2, meta: 6, familia: "A", fonteLegal: "CTB arts. 142–148 (habilitação)" },
  CTB_pedestres_nao_motorizados: {
    peso: 2,
    meta: 5,
    familia: "A",
    fonteLegal: "CTB arts. 68–71 (pedestres e não motorizados)",
  },
  CTB_veiculos: { peso: 2, meta: 6, familia: "B", fonteLegal: "CTB arts. 96–115 (veículos)" },
  CTB_engenharia_fiscalizacao: {
    peso: 2,
    meta: 5,
    familia: "C",
    fonteLegal: "CTB arts. 94–99 (engenharia e fiscalização)",
  },
  CONTRAN_227_iluminacao: {
    peso: 2,
    meta: 5,
    familia: "D",
    fonteLegal: "Res. CONTRAN 227/2007 (iluminação veicular)",
  },
  CONTRAN_940_capacete: { peso: 2, meta: 5, familia: "A", fonteLegal: "Res. CONTRAN 940/2022 (capacete)" },
  CONTRAN_911_registro: { peso: 2, meta: 6, familia: "A", fonteLegal: "Res. CONTRAN 911/2022 (registro)" },
  CONTRAN_918_multas: { peso: 2, meta: 6, familia: "D", fonteLegal: "Res. CONTRAN 918/2022 (multas)" },
  CONTRAN_36_advertencia: { peso: 2, meta: 4, familia: "D", fonteLegal: "Res. CONTRAN 36/1998 (advertência)" },
  CONTRAN_242_imagens: { peso: 2, meta: 4, familia: "B", fonteLegal: "Res. CONTRAN 242/2007 (imagens)" },
  CONTRAN_914_semirreboque: {
    peso: 2,
    meta: 4,
    familia: "A",
    fonteLegal: "Res. CONTRAN 914/2022 (semirreboque)",
  },

  // —— Português ——
  portugues_1_1: {
    peso: 3,
    meta: 12,
    familia: "B",
    fonteLegal: "Norma culta — interpretação textual (texto-base 800–1500 chars)",
  },
  portugues_1_3: { peso: 3, meta: 8, familia: "B", fonteLegal: "Norma culta — coesão e referência" },
  portugues_1_4: { peso: 3, meta: 8, familia: "B", fonteLegal: "Norma culta — significação contextual" },
  portugues_2_4: { peso: 3, meta: 8, familia: "A", fonteLegal: "Norma culta — concordância nominal e verbal" },
  portugues_2_5: { peso: 3, meta: 6, familia: "A", fonteLegal: "Norma culta — regência e crase" },
  portugues_2_6: { peso: 3, meta: 6, familia: "A", fonteLegal: "Norma culta — colocação pronominal" },
  portugues_2_3: { peso: 2, meta: 6, familia: "A", fonteLegal: "Norma culta — pontuação" },
  portugues_4_2: { peso: 2, meta: 5, familia: "D", fonteLegal: "Norma culta — acentuação gráfica" },

  // —— Informática ——
  informatica_8_5: { peso: 3, meta: 6, familia: "D", fonteLegal: "Conceitos — malwares e ataques" },
  informatica_8_4: { peso: 3, meta: 5, familia: "D", fonteLegal: "Conceitos — antivírus e firewalls" },
  informatica_8_3: { peso: 3, meta: 5, familia: "A", fonteLegal: "Conceitos — backup e segurança" },
  informatica_2_1: { peso: 3, meta: 6, familia: "D", fonteLegal: "Windows/Linux — pastas, arquivos e atalhos" },
  informatica_7_2: { peso: 3, meta: 6, familia: "B", fonteLegal: "Internet — protocolos e serviços (HTTP, POP, IMAP)" },
  informatica_7_1: { peso: 2, meta: 5, familia: "B", fonteLegal: "Internet, intranet e extranet" },
  informatica_4_4: { peso: 2, meta: 5, familia: "D", fonteLegal: "Planilhas — fórmulas e funções" },

  // —— História CG/PB ——
  historia_cg_pb_formacao: {
    peso: 3,
    meta: 12,
    familia: "D",
    fonteLegal: "conteúdo/historia-cg-pb/base-factual.md — formação do município",
  },
  historia_cg_pb_personagens: {
    peso: 3,
    meta: 10,
    familia: "A",
    fonteLegal: "conteúdo/historia-cg-pb/base-factual.md — personagens",
  },
  historia_cg_pb_economia_cultura: {
    peso: 2,
    meta: 10,
    familia: "B",
    fonteLegal: "conteúdo/historia-cg-pb/base-factual.md — economia e cultura",
  },
  historia_pb_contexto: {
    peso: 2,
    meta: 8,
    familia: "B",
    fonteLegal: "conteúdo/historia-cg-pb/base-factual.md — contexto da Paraíba",
  },

  // —— Ética SP ——
  etica_sp_1_1: { peso: 1, meta: 10, familia: "C", fonteLegal: "Lei Orgânica do Município de Campina Grande" },
  etica_sp_1_2: { peso: 3, meta: 8, familia: "A", fonteLegal: "Lei 13.709/2018 (LGPD)" },
  etica_sp_1_3: { peso: 3, meta: 8, familia: "D", fonteLegal: "Lei 12.527/2011 (LAI)" },
  etica_sp_2_1: { peso: 3, meta: 6, familia: "A", fonteLegal: "Ética no serviço público — conduta do agente" },
  etica_sp_3_1: { peso: 2, meta: 5, familia: "B", fonteLegal: "CF/88 art. 37 (princípios da Administração)" },

  // —— Dir. Administrativo ——
  dir_adm_4_5: {
    peso: 3,
    meta: 10,
    familia: "A",
    fonteLegal: "CF arts. 78, 144 §10 + Lei 9.784/99 (poder de polícia)",
  },
  dir_adm_3_3: { peso: 3, meta: 8, familia: "A", fonteLegal: "Lei 9.784/99 — anulação, revogação, convalidação" },
  dir_adm_1_1: { peso: 3, meta: 6, familia: "B", fonteLegal: "CF arts. 37–41 — conceito da Administração" },
  dir_adm_1_2: { peso: 3, meta: 6, familia: "B", fonteLegal: "CF art. 37 — Administração direta e indireta" },
  dir_adm_1_3: { peso: 3, meta: 6, familia: "B", fonteLegal: "Lei 8.112/90 + CF — entidades administrativas" },
  dir_adm_1_4: { peso: 3, meta: 6, familia: "A", fonteLegal: "CF art. 37 — regime jurídico-administrativo" },
  dir_adm_7_1: { peso: 3, meta: 6, familia: "A", fonteLegal: "CF art. 37 §6º — responsabilidade civil do Estado" },

  // —— Dir. Constitucional ——
  dir_const_7_3: { peso: 1, meta: 7, familia: "C", fonteLegal: "CF/88 art. 144 (órgãos de segurança pública)" },
  dir_const_3_1: { peso: 3, meta: 8, familia: "A", fonteLegal: "CF/88 art. 5º (direitos individuais)" },
  dir_const_4_1: { peso: 3, meta: 6, familia: "A", fonteLegal: "CF/88 art. 5º, LXVIII (habeas corpus)" },
  dir_const_4_3: { peso: 3, meta: 6, familia: "A", fonteLegal: "CF/88 art. 5º, LXIX (mandado de segurança)" },
  dir_const_4_5: { peso: 3, meta: 6, familia: "A", fonteLegal: "CF/88 art. 5º, LXXIII (ação popular)" },
  dir_const_5_4: { peso: 3, meta: 6, familia: "C", fonteLegal: "CF/88 arts. 21–24 (competências)" },
  dir_const_3_3: { peso: 2, meta: 5, familia: "B", fonteLegal: "CF/88 art. 12 (nacionalidade)" },
};

export function enriquecerTopico(topic: EditalTopic): EditalTopicEnriquecido {
  const override = PRIORIDADES_POR_SLUG[topic.slug] ?? {};
  const peso = override.peso ?? topic.peso ?? 2;
  const meta =
    override.meta ??
    topic.meta ??
    META_DEFAULT_DISCIPLINA[topic.disciplina] ??
    META_POR_TIER[peso];
  return {
    ...topic,
    peso,
    meta,
    familia: override.familia ?? topic.familia ?? "A",
    recente: override.recente ?? topic.recente ?? false,
    fonteLegal: override.fonteLegal ?? topic.fonteLegal ?? topic.editalRef,
  };
}
