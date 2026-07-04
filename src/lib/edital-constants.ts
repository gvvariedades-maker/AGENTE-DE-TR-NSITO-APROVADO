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

/** Cada questão vale 100/60 pontos na prova objetiva */
export const PONTOS_POR_QUESTAO = 100 / 60;

export const MIN_PONTOS_TOTAL = 50;
export const MIN_PONTOS_DISCIPLINA_GERAL = 1;
export const MIN_PONTOS_DISCIPLINA_ESPECIFICO = 2;

export const MAX_PONTOS_GERAIS = DISCIPLINAS_GERAIS.reduce(
  (acc, d) => acc + SIMULADO_ESPELHO_DISTRIBUICAO[d] * PONTOS_POR_QUESTAO,
  0,
);

export const MAX_PONTOS_ESPECIFICOS = DISCIPLINAS_ESPECIFICOS.reduce(
  (acc, d) => acc + SIMULADO_ESPELHO_DISTRIBUICAO[d] * PONTOS_POR_QUESTAO,
  0,
);

export type ZonaSemaforo = "verde" | "amarelo" | "vermelho" | "vazio";

export function isDisciplinaGeral(
  disciplina: Disciplina,
): disciplina is (typeof DISCIPLINAS_GERAIS)[number] {
  return (DISCIPLINAS_GERAIS as readonly Disciplina[]).includes(disciplina);
}
