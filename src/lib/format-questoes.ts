/** Rótulo de quantidade para UI (ex.: 3 → "3 questões"). */
export function labelContagemQuestoes(count: number): string {
  return count === 1 ? "1 questão" : `${count} questões`;
}
