/**
 * FSRS-4.5 (Free Spaced Repetition Scheduler) — modelo de memória de
 * dificuldade + estabilidade, estado da arte público em repetição espaçada.
 *
 * Substitui o antigo "SM-2 simplificado" (nunca implementado de fato — o
 * schema tinha `ease_factor` mas nenhuma função o lia/atualizava). FSRS
 * supera SM-2 em acurácia de previsão de esquecimento em ~99,5% dos casos
 * do maior benchmark público do campo (350M+ revisões reais do Anki:
 * https://github.com/open-spaced-repetition/fsrs4anki), exigindo 20-30%
 * menos revisões para a mesma retenção-alvo.
 *
 * Referência normativa das fórmulas (fonte oficial, não inventada):
 * https://github.com/open-spaced-repetition/awesome-fsrs/wiki/The-Algorithm
 *
 * Limitação assumida nesta MVP: como `attempts.acertou` é booleano, não há
 * distinção Hard/Easy (grades 2 e 4 do FSRS original) — apenas Again (1) ou
 * Good (3). Isso é uma simplificação aceitável (o modelo ainda é muito mais
 * preciso que um cronograma fixo), mas a precisão total do FSRS só é
 * alcançada com as 4 notas. Ver `FsrsGrade` para evoluir isso depois com um
 * botão de confiança na UI (ex.: "fácil" vs "acertei mas na dúvida").
 */

/** 1 = Again (errou), 2 = Hard, 3 = Good (padrão para acerto), 4 = Easy */
export type FsrsGrade = 1 | 2 | 3 | 4;

export type FsrsState = "new" | "learning" | "review" | "relearning";

/** Pesos padrão publicados do FSRS-4.5 (w0..w16), treinados sobre ~700M revisões. */
export const FSRS_DEFAULT_WEIGHTS = [
  0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474,
  0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755,
] as const;

const DECAY = -0.5;
const FACTOR = 19 / 81; // garante R(t=S) = 0.9

/** Retenção-alvo padrão do FSRS (90% de chance de lembrar no dia agendado). */
export const REQUESTED_RETENTION = 0.9;

export interface SrsCardState {
  difficulty: number;
  stability: number;
  reps: number;
  lapses: number;
  state: FsrsState;
  lastReview: Date | null;
}

export interface SrsSchedule extends SrsCardState {
  lastReview: Date;
  nextReview: Date;
  intervalDays: number;
}

export function criarCardInicial(): SrsCardState {
  return {
    difficulty: FSRS_DEFAULT_WEIGHTS[4],
    stability: 0,
    reps: 0,
    lapses: 0,
    state: "new",
    lastReview: null,
  };
}

function clamp(valor: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, valor));
}

/** Probabilidade de recall (0-1) após `elapsedDays` dias, dado `stability`. */
export function retrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + (FACTOR * elapsedDays) / stability, DECAY);
}

function initStability(grade: FsrsGrade, w: readonly number[]): number {
  return Math.max(w[grade - 1], 0.1);
}

function initDifficulty(grade: FsrsGrade, w: readonly number[]): number {
  const d0 = w[4] - Math.exp((grade - 1) * w[5]) + 1;
  return clamp(d0, 1, 10);
}

/** Amortecimento linear em direção à média — evita dificuldade saturar em 1 ou 10. */
function linearDamping(deltaD: number, difficulty: number): number {
  return (deltaD * (10 - difficulty)) / 9;
}

function nextDifficulty(difficulty: number, grade: FsrsGrade, w: readonly number[]): number {
  const deltaD = -w[6] * (grade - 3);
  const proximaD = difficulty + linearDamping(deltaD, difficulty);
  const comReversaoMedia = w[7] * initDifficulty(4, w) + (1 - w[7]) * proximaD;
  return clamp(comReversaoMedia, 1, 10);
}

function nextRecallStability(
  difficulty: number,
  stability: number,
  r: number,
  grade: FsrsGrade,
  w: readonly number[],
): number {
  const hardPenalty = grade === 2 ? w[15] : 1;
  const easyBonus = grade === 4 ? w[16] : 1;
  const fator =
    Math.exp(w[8]) *
      (11 - difficulty) *
      Math.pow(stability, -w[9]) *
      (Math.exp((1 - r) * w[10]) - 1) *
      hardPenalty *
      easyBonus +
    1;
  return stability * fator;
}

function nextForgetStability(
  difficulty: number,
  stability: number,
  r: number,
  w: readonly number[],
): number {
  return (
    w[11] *
    Math.pow(difficulty, -w[12]) *
    (Math.pow(stability + 1, w[13]) - 1) *
    Math.exp(w[14] * (1 - r))
  );
}

/** Intervalo (dias) para atingir a retenção-alvo `r` dada a estabilidade `stability`. */
export function intervalFromStability(
  stability: number,
  requestedRetention: number = REQUESTED_RETENTION,
): number {
  return (stability / FACTOR) * (Math.pow(requestedRetention, 1 / DECAY) - 1);
}

export interface AgendarOpcoes {
  /** Retenção-alvo (0-1). Padrão 0.9, igual ao default do FSRS. */
  requestedRetention?: number;
  /**
   * Data da prova. Nunca agenda revisão depois dela — não há ROI em
   * relembrar um card depois do dia 30/08/2026 (`PROVA_DATA` em src/types).
   */
  examDate?: Date;
  /** Pesos customizados (para otimização futura por usuário). */
  weights?: readonly number[];
}

/**
 * Calcula o próximo estado do card após uma resposta.
 *
 * @param card Estado atual (usar `criarCardInicial()` para card novo).
 * @param acertouOuGrade `true`/`false` (Good/Again) ou nota FSRS explícita 1–4.
 * @param now Momento da resposta (injetável para testes).
 */
export function agendarProximaRevisao(
  card: SrsCardState,
  acertouOuGrade: boolean | FsrsGrade,
  now: Date = new Date(),
  opcoes: AgendarOpcoes = {},
): SrsSchedule {
  const w = opcoes.weights ?? FSRS_DEFAULT_WEIGHTS;
  const requestedRetention = opcoes.requestedRetention ?? REQUESTED_RETENTION;
  const grade: FsrsGrade =
    typeof acertouOuGrade === "boolean"
      ? acertouOuGrade
        ? 3
        : 1
      : acertouOuGrade;

  let difficulty: number;
  let stability: number;

  if (card.state === "new" || card.reps === 0) {
    difficulty = initDifficulty(grade, w);
    stability = initStability(grade, w);
  } else {
    const elapsedDays = card.lastReview
      ? Math.max(0, (now.getTime() - card.lastReview.getTime()) / 86_400_000)
      : 0;
    const r = retrievability(elapsedDays, card.stability);
    difficulty = nextDifficulty(card.difficulty, grade, w);
    stability =
      grade === 1
        ? nextForgetStability(card.difficulty, card.stability, r, w)
        : nextRecallStability(card.difficulty, card.stability, r, grade, w);
  }

  const reps = card.reps + 1;
  const lapses = card.lapses + (grade === 1 ? 1 : 0);

  let intervalDays = Math.max(1, Math.round(intervalFromStability(stability, requestedRetention)));
  let nextReview = new Date(now.getTime() + intervalDays * 86_400_000);

  if (opcoes.examDate && nextReview.getTime() > opcoes.examDate.getTime()) {
    nextReview = opcoes.examDate;
    intervalDays = Math.max(
      1,
      Math.round((opcoes.examDate.getTime() - now.getTime()) / 86_400_000),
    );
  }

  return {
    difficulty,
    stability,
    reps,
    lapses,
    state: grade === 1 ? "relearning" : "review",
    lastReview: now,
    nextReview,
    intervalDays,
  };
}
