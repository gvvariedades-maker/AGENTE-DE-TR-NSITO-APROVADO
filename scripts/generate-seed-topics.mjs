/**
 * Gera scripts/seed-topics.sql a partir do Anexo I (conteudo-programatico.md).
 * Uso: node scripts/generate-seed-topics.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";

/** @type {Array<{ disciplina: string; slug: string; editalRef: string }>} */
const topics = [
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
  { disciplina: "legislacao_transito", slug: "CTB_conducao_embriaguez", editalRef: "Operacional — CONTRAN 432 + CTB arts. 165/276/277/306" },

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
  ...[
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
  ].map(([ref, label]) => ({
    disciplina: "portugues",
    slug: `portugues_${ref.replace(".", "_")}`,
    editalRef: `Anexo I — Português ${ref} — ${label}`,
  })),

  // —— Informática ——
  ...[
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
  ].map(([ref, label]) => ({
    disciplina: "informatica",
    slug: `informatica_${ref.replace(".", "_")}`,
    editalRef: `Anexo I — Informática ${ref} — ${label}`,
  })),

  // —— História CG/PB ——
  {
    disciplina: "historia_cg_pb",
    slug: "historia_cg_pb_municipio",
    editalRef: "Anexo I — História de Campina Grande/PB",
  },

  // —— Legislação e Ética SP ——
  ...[
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
  ].map(([ref, label]) => ({
    disciplina: "legislacao_etica_sp",
    slug: `etica_sp_${ref.replace(".", "_")}`,
    editalRef: `Anexo I — Ética SP ${ref} — ${label}`,
  })),

  // —— Direito Administrativo ——
  ...[
    ["1", "Administração Pública: conceito, organização e regime jurídico"],
    ["2", "Princípios da Administração Pública"],
    ["3", "Atos Administrativos"],
    ["4", "Poderes da Administração Pública"],
    ["5", "Serviços Públicos"],
    ["6", "Agentes Públicos"],
    ["7", "Responsabilidade Civil do Estado"],
  ].map(([ref, label]) => ({
    disciplina: "direito_administrativo",
    slug: `dir_adm_${ref}`,
    editalRef: `Anexo I — Dir. Administrativo ${ref} — ${label}`,
  })),

  // —— Direito Constitucional ——
  ...[
    ["1", "Teoria da Constituição"],
    ["2", "Constituição da República Federativa do Brasil de 1988"],
    ["3", "Direitos e Garantias Fundamentais"],
    ["4", "Remédios Constitucionais"],
    ["5", "Organização do Estado"],
    ["6", "Administração Pública na CF"],
    ["7", "Defesa do Estado e segurança pública"],
    ["8", "Ordem Social"],
    ["9", "Direitos fundamentais aplicados à segurança pública"],
  ].map(([ref, label]) => ({
    disciplina: "direito_constitucional",
    slug: `dir_const_${ref}`,
    editalRef: `Anexo I — Dir. Constitucional ${ref} — ${label}`,
  })),
];

function sqlEscape(value) {
  return value.replace(/'/g, "''");
}

const lines = [
  "-- Gerado por scripts/generate-seed-topics.mjs — Anexo I retificado Edital 04/2026",
  `-- Total: ${topics.length} microtópicos`,
  "",
];

for (const { disciplina, slug, editalRef } of topics) {
  lines.push(
    `INSERT INTO topics (disciplina, nome, edital_ref) SELECT '${sqlEscape(disciplina)}', '${sqlEscape(slug)}', '${sqlEscape(editalRef)}' WHERE NOT EXISTS (SELECT 1 FROM topics WHERE nome = '${sqlEscape(slug)}');`,
  );
}

const outPath = join(process.cwd(), "scripts", "seed-topics.sql");
writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
console.log(`OK ${topics.length} tópicos → ${outPath}`);
