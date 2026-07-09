import { pesoAcerto } from "@/lib/edital-constants";
import { SIMULADO_ESPELHO_DISTRIBUICAO, type Disciplina } from "@/types";

/** Projeção de pontos por disciplina a partir da taxa de acerto nas tentativas. */
export function projetarPontosDisciplina(
  acertos: number,
  tentativas: number,
  disciplina: Disciplina,
): number {
  if (tentativas === 0) return 0;
  const taxa = acertos / tentativas;
  return (
    taxa * SIMULADO_ESPELHO_DISTRIBUICAO[disciplina] * pesoAcerto(disciplina)
  );
}
