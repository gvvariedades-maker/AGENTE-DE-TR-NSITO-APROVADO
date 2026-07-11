/**
 * Política de dificuldade do banco de treino (content/questoes/).
 * Simulado espelho 60Q pode usar mix realista — ver perfil-banca.md § simulado.
 */
export const DIFICULDADE_MINIMA_BANCO = 4;

/** Texto para bloco "Escopo pronto" (proxima-questao.ts) e prompts Agent. */
export const ESCOPO_DIFICULDADE_LINHAS = [
  `Dificuldade: ${DIFICULDADE_MINIMA_BANCO} (mínimo banco — nunca 1–3)`,
  "Estrutura: caso_pratico + ≥2 mecanismos cruzados + ≥2 dispositivos no gabarito",
  "estilo_idecan: pegadinha_* | assertivas | incorreta",
] as const;
