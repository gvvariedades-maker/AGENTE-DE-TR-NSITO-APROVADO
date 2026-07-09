import type { Disciplina } from "@/types";
import { SIMULADO_ESPELHO_DISTRIBUICAO } from "@/types";

export const DISCIPLINAS_GERAIS = [
  "portugues",
  "informatica",
  "historia_cg_pb",
  "legislacao_etica_sp",
] as const satisfies readonly Disciplina[];

export const DISCIPLINAS_ESPECIFICOS = [
  "direito_administrativo",
  "direito_constitucional",
  "legislacao_transito",
] as const satisfies readonly Disciplina[];

/** Peso por acerto na prova objetiva real (edital 04/2026). */
export const PESO_ACERTO_GERAL = 1;
export const PESO_ACERTO_ESPECIFICO = 2;

export function pesoAcerto(disciplina: Disciplina): number {
  return isDisciplinaGeral(disciplina)
    ? PESO_ACERTO_GERAL
    : PESO_ACERTO_ESPECIFICO;
}

export const MIN_PONTOS_TOTAL = 50;
export const MIN_PONTOS_DISCIPLINA_GERAL = 1;
export const MIN_PONTOS_DISCIPLINA_ESPECIFICO = 2;

/** Máximo de pontos Gerais no espelho: 8+4+4+4 questões × 1 pt = 20. */
export const MAX_PONTOS_GERAIS = DISCIPLINAS_GERAIS.reduce(
  (acc, d) => acc + SIMULADO_ESPELHO_DISTRIBUICAO[d] * PESO_ACERTO_GERAL,
  0,
);

/** Máximo de pontos Específicos no espelho: 5+5+30 questões × 2 pts = 80. */
export const MAX_PONTOS_ESPECIFICOS = DISCIPLINAS_ESPECIFICOS.reduce(
  (acc, d) => acc + SIMULADO_ESPELHO_DISTRIBUICAO[d] * PESO_ACERTO_ESPECIFICO,
  0,
);

export type ZonaSemaforo = "verde" | "amarelo" | "vermelho" | "vazio";

export function isDisciplinaGeral(
  disciplina: Disciplina,
): disciplina is (typeof DISCIPLINAS_GERAIS)[number] {
  return (DISCIPLINAS_GERAIS as readonly Disciplina[]).includes(disciplina);
}
