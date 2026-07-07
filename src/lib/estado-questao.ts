export interface EstadoQuestao {
  selecionada: string | null;
  confirmada: boolean;
  revelada: boolean;
  acertou?: boolean;
  dominioAlcancado?: boolean;
  tipoErroLabel?: string;
  ultimoAttemptId?: string;
}

export const ESTADO_QUESTAO_INICIAL: EstadoQuestao = {
  selecionada: null,
  confirmada: false,
  revelada: false,
};

export function getEstadoQuestao(
  estados: Map<string, EstadoQuestao>,
  questionId: string,
): EstadoQuestao {
  return estados.get(questionId) ?? ESTADO_QUESTAO_INICIAL;
}

export function contarResultados(estados: Map<string, EstadoQuestao>) {
  let acertos = 0;
  let erros = 0;
  for (const estado of estados.values()) {
    if (!estado.confirmada) continue;
    if (estado.acertou) acertos++;
    else erros++;
  }
  return { acertos, erros };
}

export function contarRespondidas(estados: Map<string, EstadoQuestao>) {
  let respondidas = 0;
  for (const estado of estados.values()) {
    if (estado.confirmada) respondidas++;
  }
  return respondidas;
}
