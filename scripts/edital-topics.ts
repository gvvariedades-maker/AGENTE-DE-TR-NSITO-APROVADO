import type { Disciplina } from "@/types";

export interface EditalTopic {
  disciplina: Disciplina;
  slug: string;
  editalRef: string;
}

/** Anexo I retificado — Edital 04/2026 STTP Campina Grande. Fonte viva: conteudo-programatico.md */
export const EDITAL_TOPICS: EditalTopic[] = [
  // —— Legislação de Trânsito (CTB) ——
  { disciplina: "legislacao_transito", slug: "CTB_lei_completa", editalRef: "Anexo I — Trânsito 1.1" },
  { disciplina: "legislacao_transito", slug: "CTB_snt_competencias", editalRef: "Anexo I — Trânsito 1.2" },
  { disciplina: "legislacao_transito", slug: "CTB_circulacao_conduta", editalRef: "Anexo I — Trânsito 1.3" },
  { disciplina: "legislacao_transito", slug: "CTB_pedestres_nao_motorizados", editalRef: "Anexo I — Trânsito 1.4" },
  { disciplina: "legislacao_transito", slug: "CTB_direitos_deveres", editalRef: "Anexo I — Trânsito 1.5" },
  { disciplina: "legislacao_transito", slug: "CTB_educacao_transito", editalRef: "Anexo I — Trânsito 1.6" },
  { disciplina: "legislacao_transito", slug: "CTB_sinalizacao", editalRef: "Anexo I — Trânsito 1.7" },
  { disciplina: "legislacao_transito", slug: "CTB_engenharia_fiscalizacao", editalRef: "Anexo I — Trânsito 1.8" },
  { disciplina: "legislacao_transito", slug: "CTB_veiculos", editalRef: "Anexo I — Trânsito 1.9" },
  { disciplina: "legislacao_transito", slug: "CTB_habilitacao", editalRef: "Anexo I — Trânsito 1.10" },
  { disciplina: "legislacao_transito", slug: "CTB_infracoes", editalRef: "Anexo I — Trânsito 1.11" },
  { disciplina: "legislacao_transito", slug: "CTB_penalidades", editalRef: "Anexo I — Trânsito 1.12" },
  { disciplina: "legislacao_transito", slug: "CTB_processo_administrativo", editalRef: "Anexo I — Trânsito 1.13" },
  { disciplina: "legislacao_transito", slug: "CTB_crimes_transito", editalRef: "Anexo I — Trânsito 1.14" },
  {
    disciplina: "legislacao_transito",
    slug: "CTB_conducao_embriaguez",
    editalRef: "Operacional — CONTRAN 432 + CTB arts. 165/276/277/306",
  },

  // —— CONTRAN (retificação 01/2026) ——
  { disciplina: "legislacao_transito", slug: "CONTRAN_1013_free_flow", editalRef: "Anexo I — Trânsito 2.1.1" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_227_iluminacao", editalRef: "Anexo I — Trânsito 2.1.2" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_996_mobilidade", editalRef: "Anexo I — Trânsito 2.1.3" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_940_capacete", editalRef: "Anexo I — Trânsito 2.1.4" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_993_equipamentos", editalRef: "Anexo I — Trânsito 2.2.1" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_968_identificacao", editalRef: "Anexo I — Trânsito 2.2.2" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_36_advertencia", editalRef: "Anexo I — Trânsito 2.2.3" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_970_sinalizacao_iluminacao", editalRef: "Anexo I — Trânsito 2.2.4" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_242_imagens", editalRef: "Anexo I — Trânsito 2.2.5" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_914_semirreboque", editalRef: "Anexo I — Trânsito 2.2.6" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_955_cargas_externas", editalRef: "Anexo I — Trânsito 2.2.7" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_911_registro", editalRef: "Anexo I — Trânsito 2.3.1" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_1020_habilitacao", editalRef: "Anexo I — Trânsito 2.3.2" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_1009_alteracoes", editalRef: "Anexo I — Trânsito 2.3.3" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_432_alcoolemia", editalRef: "Anexo I — Trânsito 2.4.1" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_918_multas", editalRef: "Anexo I — Trânsito 2.4.2" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_985_mbft", editalRef: "Anexo I — Trânsito 2.4.3" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_procedimentos_operacionais", editalRef: "Anexo I — Trânsito 2.4.4" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_991_multas", editalRef: "Anexo I — Trânsito 2.4.5" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_1003_mbft", editalRef: "Anexo I — Trânsito 2.4.6" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_1012_rsv", editalRef: "Anexo I — Trânsito 2.4.7" },
  { disciplina: "legislacao_transito", slug: "CONTRAN_900_recursos", editalRef: "Anexo I — Trânsito 2.4.8" },

  // —— SENATRAN ——
  { disciplina: "legislacao_transito", slug: "SENATRAN_966_curso_agente", editalRef: "Anexo I — Trânsito 3.1" },

  // —— Português ——
  ...(
    [
      ["1.1", "Leitura, compreensão e interpretação de textos"],
      ["1.2", "Estruturação do texto e dos parágrafos"],
      ["1.3", "Articulação do texto: pronomes, nexos e operadores sequenciais"],
      ["1.4", "Significação contextual de palavras e expressões"],
      ["1.5", "Equivalência e transformação de estruturas"],
      ["2.1", "Sintaxe: coordenação e subordinação"],
      ["2.2", "Emprego de tempos e modos verbais"],
      ["2.3", "Pontuação"],
      ["2.4", "Concordância nominal e verbal"],
      ["2.5", "Regência nominal e verbal"],
      ["2.6", "Pronomes: emprego, tratamento e colocação"],
      ["3.1", "Estrutura e formação de palavras"],
      ["3.2", "Funções das classes de palavras"],
      ["3.3", "Flexão nominal e verbal"],
      ["4.1", "Ortografia oficial"],
      ["4.2", "Acentuação gráfica"],
    ] as const
  ).map(([ref, label]) => ({
    disciplina: "portugues" as const,
    slug: `portugues_${ref.replace(".", "_")}`,
    editalRef: `Anexo I — Português ${ref} — ${label}`,
  })),

  // —— Informática ——
  ...(
    [
      ["1.1", "Hardware: armazenamento, memórias e periféricos"],
      ["1.2", "Extensões e arquivos"],
      ["2.1", "Windows/Linux: pastas, diretórios, arquivos e atalhos"],
      ["2.2", "Área de trabalho e área de transferência"],
      ["2.3", "Manipulação de arquivos e pastas"],
      ["2.4", "Menus, programas e aplicativos"],
      ["3.1", "Editor de textos: estrutura básica"],
      ["3.2", "Editor de textos: edição e formatação"],
      ["3.3", "Editor de textos: cabeçalhos, parágrafos, fontes, colunas, marcadores"],
      ["3.4", "Editor de textos: tabelas e impressão"],
      ["3.5", "Editor de textos: quebras e numeração de páginas"],
      ["3.6", "Editor de textos: legendas, índices, objetos e campos"],
      ["4.1", "Planilhas: estrutura básica"],
      ["4.2", "Planilhas: células, linhas, colunas, pastas e gráficos"],
      ["4.3", "Planilhas: tabelas e gráficos"],
      ["4.4", "Planilhas: fórmulas, funções e macros"],
      ["4.5", "Planilhas: impressão, objetos e quebras"],
      ["4.6", "Planilhas: dados externos"],
      ["5.1", "Correio eletrônico: uso"],
      ["5.2", "Correio eletrônico: envio de mensagens"],
      ["5.3", "Correio eletrônico: anexos"],
      ["6.1", "Microsoft Teams"],
      ["6.2", "Google Meet"],
      ["6.3", "Zoom"],
      ["6.4", "Skype"],
      ["6.5", "Google Hangout"],
      ["7.1", "Internet, intranet e extranet"],
      ["7.2", "Protocolos e serviços"],
      ["7.3", "Sítios de busca e pesquisa"],
      ["7.4", "URL, links e sites"],
      ["7.5", "Navegadores Firefox e Chrome"],
      ["7.6", "Navegação, busca e impressão na internet"],
      ["7.7", "Computação em nuvem e redes sociais"],
      ["8.1", "TI e segurança de dados"],
      ["8.2", "Confidencialidade e assinatura digital"],
      ["8.3", "Procedimentos de segurança e backup"],
      ["8.4", "Antivírus e firewalls"],
      ["8.5", "Malwares e ataques"],
    ] as const
  ).map(([ref, label]) => ({
    disciplina: "informatica" as const,
    slug: `informatica_${ref.replace(".", "_")}`,
    editalRef: `Anexo I — Informática ${ref} — ${label}`,
  })),

  // —— História CG/PB (edital: linha única; subdivisão operacional p/ cobertura) ——
  {
    disciplina: "historia_cg_pb",
    slug: "historia_cg_pb_formacao",
    editalRef: "Anexo I — História CG/PB — Formação e geografia do município",
  },
  {
    disciplina: "historia_cg_pb",
    slug: "historia_cg_pb_personagens",
    editalRef: "Anexo I — História CG/PB — Personagens e marcos históricos",
  },
  {
    disciplina: "historia_cg_pb",
    slug: "historia_cg_pb_economia_cultura",
    editalRef: "Anexo I — História CG/PB — Economia, cultura e patrimônio",
  },
  {
    disciplina: "historia_cg_pb",
    slug: "historia_pb_contexto",
    editalRef: "Anexo I — História CG/PB — Contexto da Paraíba",
  },

  // —— Legislação e Ética SP ——
  ...(
    [
      ["1.1", "Lei Orgânica do Município de Campina Grande"],
      ["1.2", "Lei 13.709/2018 (LGPD)"],
      ["1.3", "Lei 12.527/2011 (LAI)"],
      ["2.1", "Ética no serviço público"],
      ["2.2", "Ética e função pública"],
      ["2.3", "Ética e moral: definição e distinção"],
      ["2.4", "Valores, honestidade, integridade, decoro e zelo"],
      ["2.5", "Ética, democracia, cidadania e papel do servidor"],
      ["3.1", "Princípios art. 37 CF"],
      ["3.2", "Aplicação dos princípios éticos na Administração Pública"],
    ] as const
  ).map(([ref, label]) => ({
    disciplina: "legislacao_etica_sp" as const,
    slug: `etica_sp_${ref.replace(".", "_")}`,
    editalRef: `Anexo I — Ética SP ${ref} — ${label}`,
  })),

  // —— Direito Administrativo (subitens literais do Anexo I) ——
  ...(
    [
      ["1.1", "Conceito, organização e finalidade da Administração Pública"],
      ["1.2", "Administração Pública direta e indireta"],
      [
        "1.3",
        "Entidades da Administração Pública: autarquias, fundações, empresas públicas e sociedades de economia mista",
      ],
      ["1.4", "Regime jurídico-administrativo"],
      [
        "2.1",
        "Princípios expressos no art. 37 da CF: legalidade, impessoalidade, moralidade, publicidade e eficiência",
      ],
      [
        "2.2",
        "Princípios implícitos: supremacia, indisponibilidade, razoabilidade, proporcionalidade, motivação, continuidade e autotutela",
      ],
      ["3.1", "Atos administrativos: conceito, atributos e elementos"],
      ["3.2", "Atos administrativos: espécies e classificação"],
      ["3.3", "Atos administrativos: validade, anulação, revogação e convalidação"],
      ["3.4", "Extinção dos atos administrativos"],
      ["4.1", "Poder vinculado e poder discricionário"],
      ["4.2", "Poder hierárquico"],
      ["4.3", "Poder disciplinar"],
      ["4.4", "Poder regulamentar"],
      ["4.5", "Poder de polícia"],
      ["5.1", "Serviços públicos: conceito, princípios e classificação"],
      ["5.2", "Formas de prestação dos serviços públicos"],
      ["5.3", "Delegação: concessão, permissão e autorização"],
      ["6.1", "Agentes públicos: conceito e classificação"],
      ["6.2", "Cargo, emprego e função pública"],
      ["6.3", "Direitos e deveres dos servidores públicos"],
      ["6.4", "Responsabilidade civil, penal e administrativa do servidor público"],
      ["6.5", "Acumulação de cargos públicos"],
      ["7.1", "Responsabilidade civil da Administração Pública"],
      ["7.2", "Responsabilidade objetiva do Estado"],
      ["7.3", "Responsabilidade por ação e omissão estatal"],
    ] as const
  ).map(([ref, label]) => ({
    disciplina: "direito_administrativo" as const,
    slug: `dir_adm_${ref.replace(".", "_")}`,
    editalRef: `Anexo I — Dir. Administrativo ${ref} — ${label}`,
  })),

  // —— Direito Constitucional (subitens literais do Anexo I) ——
  ...(
    [
      ["1.1", "Estado: conceito, elementos e formas"],
      ["1.2", "Constituição: conceito, conteúdo, objeto e classificação"],
      ["1.3", "Supremacia da Constituição e aplicabilidade das normas constitucionais"],
      ["2.1", "Preâmbulo da Constituição Federal"],
      ["2.2", "Princípios fundamentais da República Federativa do Brasil"],
      ["2.3", "Fundamentos, objetivos e princípios das relações internacionais"],
      ["2.4", "Dignidade da pessoa humana e direitos humanos"],
      ["2.5", "Dimensões dos direitos humanos no Brasil"],
      ["3.1", "Direitos e deveres individuais e coletivos"],
      ["3.2", "Direitos sociais"],
      ["3.3", "Direitos de nacionalidade"],
      ["3.4", "Direitos políticos"],
      ["3.5", "Partidos políticos"],
      ["3.6", "Aplicação dos direitos e garantias fundamentais"],
      ["4.1", "Habeas corpus"],
      ["4.2", "Habeas data"],
      ["4.3", "Mandado de segurança individual e coletivo"],
      ["4.4", "Mandado de injunção"],
      ["4.5", "Ação popular"],
      ["5.1", "Organização político-administrativa do Estado"],
      ["5.2", "Estado Federal brasileiro"],
      ["5.3", "União, Estados, DF, Municípios e Territórios"],
      ["5.4", "Competências constitucionais dos entes federativos"],
      ["6.1", "Administração pública: disposições constitucionais gerais"],
      ["6.2", "Princípios constitucionais da Administração Pública (art. 37 CF)"],
      ["6.3", "Servidores públicos: disposições constitucionais"],
      ["7.1", "Segurança pública"],
      ["7.2", "Organização da segurança pública"],
      ["7.3", "Órgãos de segurança pública previstos no art. 144 da CF"],
      ["8.1", "Base e objetivos da ordem social"],
      [
        "9.1",
        "Direito à vida, liberdade, igualdade, segurança e propriedade",
      ],
      ["9.2", "Direito de locomoção"],
      ["9.3", "Devido processo legal, contraditório e ampla defesa"],
      ["9.4", "Legalidade e abuso de autoridade no exercício da função pública"],
    ] as const
  ).map(([ref, label]) => ({
    disciplina: "direito_constitucional" as const,
    slug: `dir_const_${ref.replace(".", "_")}`,
    editalRef: `Anexo I — Dir. Constitucional ${ref} — ${label}`,
  })),
];

export const EDITAL_TOPIC_BY_SLUG = new Map(
  EDITAL_TOPICS.map((topic) => [topic.slug, topic]),
);

export function getEditalTopic(slug: string): EditalTopic | undefined {
  return EDITAL_TOPIC_BY_SLUG.get(slug);
}
