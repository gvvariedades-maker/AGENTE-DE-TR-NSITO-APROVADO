/**
 * Mapa estático CTB: cluster de artigos ↔ microtópico do edital.
 * Fonte: Anexo I retificado + recorrência IDECAN-trânsito.
 */

export type PrioridadeCluster = "A" | "B" | "C";

export interface CtbClusterDef {
  /** Identificador estável (ex.: infracoes_cumulacao_266) */
  id: string;
  microtopico: string;
  titulo: string;
  /** Referência humana — arts. do CTB cobertos por este cluster */
  arts: string;
  prioridade: PrioridadeCluster;
  /** Prefixos de fundamento_slug em cobertura.json (ex.: CTB_art_266) */
  slug_prefixes: string[];
  /** Padrões em dispositivos (ex.: "CTB art. 266") */
  dispositivo_contains?: string[];
}

export const CTB_CLUSTERS: CtbClusterDef[] = [
  {
    id: "preliminares_definicoes",
    microtopico: "CTB_lei_completa",
    titulo: "Disposições preliminares e definições (arts. 1–5)",
    arts: "1–5",
    prioridade: "C",
    slug_prefixes: ["CTB_art_1", "CTB_art_2", "CTB_art_3"],
    dispositivo_contains: ["CTB art. 1", "CTB art. 2"],
  },
  {
    id: "preliminares_anexos",
    microtopico: "CTB_lei_completa",
    titulo: "Anexos e classificação de vias (arts. 6–11)",
    arts: "6–11",
    prioridade: "C",
    slug_prefixes: ["CTB_art_6", "CTB_art_7", "CTB_art_8"],
    dispositivo_contains: ["CTB art. 6", "CTB art. 10"],
  },
  {
    id: "snt_composicao",
    microtopico: "CTB_snt_competencias",
    titulo: "SNT — composição e órgãos (arts. 6–11, 21–22)",
    arts: "6–11, 21–22",
    prioridade: "B",
    slug_prefixes: ["CTB_art_21", "CTB_art_22"],
    dispositivo_contains: ["CTB art. 21", "CTB art. 22"],
  },
  {
    id: "snt_competencias",
    microtopico: "CTB_snt_competencias",
    titulo: "Competências CONTRAN, CETRAN, entidades (arts. 12–24)",
    arts: "12–24",
    prioridade: "A",
    slug_prefixes: ["CTB_art_12", "CTB_art_24"],
    dispositivo_contains: ["CTB art. 24", "CTB art. 12"],
  },
  {
    id: "snt_diretrizes",
    microtopico: "CTB_snt_competencias",
    titulo: "Diretrizes e normas complementares (arts. 25–26)",
    arts: "25–26",
    prioridade: "B",
    slug_prefixes: ["CTB_art_25", "CTB_art_26"],
    dispositivo_contains: ["CTB art. 25", "CTB art. 26"],
  },
  {
    id: "circulacao_preferencia",
    microtopico: "CTB_circulacao_conduta",
    titulo: "Preferência e hierarquia no cruzamento (art. 29)",
    arts: "29",
    prioridade: "A",
    slug_prefixes: ["CTB_art_29"],
    dispositivo_contains: ["CTB art. 29"],
  },
  {
    id: "circulacao_velocidade",
    microtopico: "CTB_circulacao_conduta",
    titulo: "Velocidade, parada e estacionamento (arts. 30–38)",
    arts: "30–38",
    prioridade: "A",
    slug_prefixes: ["CTB_art_30", "CTB_art_31", "CTB_art_38"],
    dispositivo_contains: ["CTB art. 38"],
  },
  {
    id: "circulacao_ultrapassagem",
    microtopico: "CTB_circulacao_conduta",
    titulo: "Ultrapassagem e conversões (arts. 39–49)",
    arts: "39–49",
    prioridade: "A",
    slug_prefixes: ["CTB_art_39", "CTB_art_44", "CTB_art_48", "CTB_art_49"],
    dispositivo_contains: ["CTB art. 44", "CTB art. 48"],
  },
  {
    id: "circulacao_celular",
    microtopico: "CTB_circulacao_conduta",
    titulo: "Celular e condução distraída (art. 252)",
    arts: "252",
    prioridade: "A",
    slug_prefixes: ["CTB_art_252"],
    dispositivo_contains: ["CTB art. 252"],
  },
  {
    id: "circulacao_semaforo",
    microtopico: "CTB_circulacao_conduta",
    titulo: "Semáforo e sinalização luminosa (art. 44-A)",
    arts: "44-A",
    prioridade: "B",
    slug_prefixes: ["CTB_art_44-A", "CTB_art_44_A"],
    dispositivo_contains: ["CTB art. 44-A", "art. 44-A"],
  },
  {
    id: "pedestres_deveres",
    microtopico: "CTB_pedestres_nao_motorizados",
    titulo: "Pedestres — deveres e infrações (arts. 68–69)",
    arts: "68–69",
    prioridade: "B",
    slug_prefixes: ["CTB_art_68", "CTB_art_69"],
    dispositivo_contains: ["CTB art. 68", "CTB art. 69"],
  },
  {
    id: "direitos_cidadao",
    microtopico: "CTB_direitos_deveres",
    titulo: "Direitos e deveres do cidadão (arts. 50–59)",
    arts: "50–59",
    prioridade: "B",
    slug_prefixes: ["CTB_art_50", "CTB_art_55", "CTB_art_58"],
    dispositivo_contains: ["CTB art. 50", "CTB art. 58"],
  },
  {
    id: "educacao_transito",
    microtopico: "CTB_educacao_transito",
    titulo: "Educação para o trânsito (arts. 80–81)",
    arts: "80–81",
    prioridade: "C",
    slug_prefixes: ["CTB_art_80", "CTB_art_81"],
    dispositivo_contains: ["CTB art. 80", "CTB art. 81"],
  },
  {
    id: "sinalizacao_normas",
    microtopico: "CTB_sinalizacao",
    titulo: "Sinalização — normas gerais (arts. 80–90)",
    arts: "80–90",
    prioridade: "A",
    slug_prefixes: ["CTB_art_90", "CTB_art_88"],
    dispositivo_contains: ["CTB art. 90", "CTB art. 88"],
  },
  {
    id: "fiscalizacao_operacao",
    microtopico: "CTB_engenharia_fiscalizacao",
    titulo: "Engenharia, operação e fiscalização (arts. 88–95)",
    arts: "88–95",
    prioridade: "A",
    slug_prefixes: ["CTB_art_88", "CTB_art_91", "CTB_art_93", "CTB_art_95"],
    dispositivo_contains: ["CTB art. 91", "CTB art. 93"],
  },
  {
    id: "agente_transito",
    microtopico: "CTB_engenharia_fiscalizacao",
    titulo: "Agentes de trânsito (arts. 147–151)",
    arts: "147–151",
    prioridade: "A",
    slug_prefixes: ["CTB_art_147", "CTB_art_148", "CTB_art_149", "CTB_art_150", "CTB_art_151"],
    dispositivo_contains: ["CTB art. 147", "CTB art. 148", "CTB art. 149"],
  },
  {
    id: "veiculos_registro",
    microtopico: "CTB_veiculos",
    titulo: "Registro, licenciamento e documentos (arts. 96–115)",
    arts: "96–115",
    prioridade: "A",
    slug_prefixes: ["CTB_art_96", "CTB_art_100", "CTB_art_115", "CTB_art_130"],
    dispositivo_contains: ["CTB art. 96", "CTB art. 115", "CTB art. 130"],
  },
  {
    id: "habilitacao_cnh",
    microtopico: "CTB_habilitacao",
    titulo: "Habilitação e categorias (arts. 140–159)",
    arts: "140–159",
    prioridade: "A",
    slug_prefixes: ["CTB_art_140", "CTB_art_143", "CTB_art_148", "CTB_art_159"],
    dispositivo_contains: ["CTB art. 140", "CTB art. 148", "CTB art. 159"],
  },
  {
    id: "infracoes_conduta",
    microtopico: "CTB_infracoes",
    titulo: "Infrações de conduta (arts. 162–169)",
    arts: "162–169",
    prioridade: "A",
    slug_prefixes: ["CTB_art_162", "CTB_art_163", "CTB_art_165", "CTB_art_167", "CTB_art_169"],
    dispositivo_contains: ["CTB art. 167", "CTB art. 165"],
  },
  {
    id: "infracoes_estacionamento",
    microtopico: "CTB_infracoes",
    titulo: "Estacionamento e parada (arts. 180–181)",
    arts: "180–181",
    prioridade: "A",
    slug_prefixes: ["CTB_art_180", "CTB_art_181"],
    dispositivo_contains: ["CTB art. 181", "CTB art. 180"],
  },
  {
    id: "infracoes_velocidade",
    microtopico: "CTB_infracoes",
    titulo: "Velocidade incompatível (arts. 218–220)",
    arts: "218–220",
    prioridade: "A",
    slug_prefixes: ["CTB_art_218", "CTB_art_219", "CTB_art_220"],
    dispositivo_contains: ["CTB art. 218", "CTB art. 219"],
  },
  {
    id: "infracoes_cumulacao",
    microtopico: "CTB_infracoes",
    titulo: "Infrações simultâneas (art. 266)",
    arts: "266",
    prioridade: "A",
    slug_prefixes: ["CTB_art_266"],
    dispositivo_contains: ["CTB art. 266"],
  },
  {
    id: "infracoes_identificacao",
    microtopico: "CTB_infracoes",
    titulo: "Identificação do infrator e PJ (art. 257, §§ 7–8)",
    arts: "257",
    prioridade: "A",
    slug_prefixes: ["CTB_art_257"],
    dispositivo_contains: ["CTB art. 257", "art. 257"],
  },
  {
    id: "penalidades_pontuacao",
    microtopico: "CTB_penalidades",
    titulo: "Pontuação e suspensão (arts. 259–261)",
    arts: "259–261",
    prioridade: "A",
    slug_prefixes: ["CTB_art_259", "CTB_art_260", "CTB_art_261"],
    dispositivo_contains: ["CTB art. 259", "CTB art. 261"],
  },
  {
    id: "penalidades_medidas",
    microtopico: "CTB_penalidades",
    titulo: "Penalidades e medidas administrativas (arts. 256–268)",
    arts: "256–268",
    prioridade: "A",
    slug_prefixes: ["CTB_art_256", "CTB_art_267", "CTB_art_268"],
    dispositivo_contains: ["CTB art. 256", "CTB art. 267"],
  },
  {
    id: "processo_auto",
    microtopico: "CTB_processo_administrativo",
    titulo: "Auto de infração e notificação (arts. 269–282)",
    arts: "269–282",
    prioridade: "A",
    slug_prefixes: ["CTB_art_269", "CTB_art_280", "CTB_art_281", "CTB_art_282"],
    dispositivo_contains: ["CTB art. 280", "CTB art. 281", "CTB art. 282"],
  },
  {
    id: "processo_recursos",
    microtopico: "CTB_processo_administrativo",
    titulo: "Defesa e recursos — prazos (arts. 283–290)",
    arts: "283–290",
    prioridade: "A",
    slug_prefixes: ["CTB_art_283", "CTB_art_285", "CTB_art_286", "CTB_art_288", "CTB_art_289"],
    dispositivo_contains: ["CTB art. 285", "CTB art. 286", "CTB art. 288"],
  },
  {
    id: "crimes_transito",
    microtopico: "CTB_crimes_transito",
    titulo: "Crimes de trânsito (arts. 291–312)",
    arts: "291–312",
    prioridade: "A",
    slug_prefixes: ["CTB_art_291", "CTB_art_302", "CTB_art_306", "CTB_art_312"],
    dispositivo_contains: ["CTB art. 302", "CTB art. 306", "CTB art. 312"],
  },
  {
    id: "embriaguez_ctb",
    microtopico: "CTB_conducao_embriaguez",
    titulo: "Embriaguez, recusa e exames (arts. 165, 165-A, 277)",
    arts: "165, 165-A, 277",
    prioridade: "A",
    slug_prefixes: ["CTB_art_165", "CTB_art_277"],
    dispositivo_contains: ["CTB art. 165", "CTB art. 165-A", "CTB art. 277"],
  },
];

export interface ContranClusterDef {
  id: string;
  microtopico: string;
  titulo: string;
  resolucao: string;
  prioridade: PrioridadeCluster;
  slug_prefixes: string[];
}

export const CONTRAN_CLUSTERS: ContranClusterDef[] = [
  {
    id: "contran_432",
    microtopico: "CONTRAN_432_alcoolemia",
    titulo: "Fiscalização de alcoolemia",
    resolucao: "432/2013",
    prioridade: "A",
    slug_prefixes: ["CONTRAN_432"],
  },
  {
    id: "contran_940",
    microtopico: "CONTRAN_940_capacete",
    titulo: "Capacete motociclistas",
    resolucao: "940/2022",
    prioridade: "B",
    slug_prefixes: ["CONTRAN_940"],
  },
  {
    id: "contran_985",
    microtopico: "CONTRAN_985_mbft",
    titulo: "MBFT — multas e valores",
    resolucao: "985/2022",
    prioridade: "A",
    slug_prefixes: ["CONTRAN_985"],
  },
  {
    id: "contran_900",
    microtopico: "CONTRAN_900_recursos",
    titulo: "Defesa e recursos administrativos",
    resolucao: "900/2022",
    prioridade: "B",
    slug_prefixes: ["CONTRAN_900"],
  },
  {
    id: "contran_968",
    microtopico: "CONTRAN_968_identificacao",
    titulo: "Identificação de veículos",
    resolucao: "968/2022",
    prioridade: "B",
    slug_prefixes: ["CONTRAN_968"],
  },
  {
    id: "contran_1020",
    microtopico: "CONTRAN_1020_habilitacao",
    titulo: "Habilitação e documentos",
    resolucao: "1020/2025",
    prioridade: "B",
    slug_prefixes: ["CONTRAN_1020"],
  },
  {
    id: "contran_1013",
    microtopico: "CONTRAN_1013_free_flow",
    titulo: "Pedágio free flow",
    resolucao: "1013/2024",
    prioridade: "C",
    slug_prefixes: ["CONTRAN_1013"],
  },
  {
    id: "senatran_966",
    microtopico: "SENATRAN_966_curso_agente",
    titulo: "Curso de agente de trânsito",
    resolucao: "SENATRAN 966",
    prioridade: "A",
    slug_prefixes: ["SENATRAN_966"],
  },
];

/** Microtópicos CTB na ordem sugerida de estudo (fase 1 → fase 3). */
export const ORDEM_ESTUDO_CTB: string[] = [
  "CTB_engenharia_fiscalizacao",
  "CTB_infracoes",
  "CTB_processo_administrativo",
  "CTB_conducao_embriaguez",
  "CTB_circulacao_conduta",
  "CTB_snt_competencias",
  "CTB_penalidades",
  "CTB_sinalizacao",
  "CTB_veiculos",
  "CTB_habilitacao",
  "CTB_crimes_transito",
  "CTB_pedestres_nao_motorizados",
  "CTB_direitos_deveres",
  "CTB_educacao_transito",
  "CTB_lei_completa",
];
