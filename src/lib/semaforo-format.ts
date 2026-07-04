export function formatPontos(pontos: number | null): string {
  if (pontos === null) return "—";
  return `${pontos.toFixed(1)} pts`;
}
