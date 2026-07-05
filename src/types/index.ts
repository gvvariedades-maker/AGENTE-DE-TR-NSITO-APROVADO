export const DISCIPLINAS = [
  "portugues",
  "informatica",
  "historia_cg_pb",
  "legislacao_etica_sp",
  "direito_administrativo",
  "direito_constitucional",
  "legislacao_transito",
] as const;

export type Disciplina = (typeof DISCIPLINAS)[number];

export const DISCIPLINA_LABELS: Record<Disciplina, string> = {
  portugues: "Língua Portuguesa",
  informatica: "Noções de Informática",
  historia_cg_pb: "História de Campina Grande/PB",
  legislacao_etica_sp: "Legislação e Ética no Serviço Público",
  direito_administrativo: "Direito Administrativo",
  direito_constitucional: "Direito Constitucional",
  legislacao_transito: "Legislação de Trânsito",
};

/** Distribuição do simulado espelho — Edital 04/2026 STTP Campina Grande */
export const SIMULADO_ESPELHO_DISTRIBUICAO: Record<Disciplina, number> = {
  portugues: 8,
  informatica: 4,
  historia_cg_pb: 4,
  legislacao_etica_sp: 4,
  direito_administrativo: 5,
  direito_constitucional: 5,
  legislacao_transito: 30,
};

export const PROVA_DATA = new Date("2026-08-30T14:00:00-03:00");

export interface ComentarioQuestao {
  o_que_testa: string;
  fundamento_legal: string;
  passo_a_passo: string[];
  pegadinha: string;
  macete: string;
  estudo_reverso: string[];
}

import type { EstudoReversoVisual } from "@/types/estudo-reverso-visual";

export type {
  ArquetipoVisual,
  EstudoReversoVisual,
  TelaVisual,
} from "@/types/estudo-reverso-visual";

export interface QuestaoSeed {
  disciplina: Disciplina;
  topico: string;
  tipo: string;
  estilo_idecan?: string;
  dificuldade: number;
  enunciado: string;
  alternativas: Record<string, string>;
  gabarito: string;
  comentario: ComentarioQuestao;
  estudo_reverso_visual?: EstudoReversoVisual;
  tags?: string[];
}
