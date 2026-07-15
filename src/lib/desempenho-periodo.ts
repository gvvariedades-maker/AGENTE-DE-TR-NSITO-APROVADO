/** Períodos do filtro da página Desempenho (estilo visão geral). */
export type PeriodoDesempenho = "hoje" | "7d" | "15d" | "30d" | "inicio";

export const PERIODOS_DESEMPENHO: {
  value: PeriodoDesempenho;
  label: string;
}[] = [
  { value: "hoje", label: "Hoje" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "15d", label: "Últimos 15 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "inicio", label: "Desde o início" },
];

export function parsePeriodoDesempenho(raw?: string): PeriodoDesempenho {
  const valid: PeriodoDesempenho[] = ["hoje", "7d", "15d", "30d", "inicio"];
  if (raw && valid.includes(raw as PeriodoDesempenho)) {
    return raw as PeriodoDesempenho;
  }
  return "inicio";
}

/** Início do intervalo (inclusive). `null` = sem filtro (desde o início). */
export function periodoSince(periodo: PeriodoDesempenho): Date | null {
  if (periodo === "inicio") return null;

  const now = new Date();
  if (periodo === "hoje") {
    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
      0,
    );
  }

  const dias = periodo === "7d" ? 7 : periodo === "15d" ? 15 : 30;
  const since = new Date(now.getTime() - dias * 24 * 60 * 60 * 1000);
  return since;
}

export function labelPeriodo(periodo: PeriodoDesempenho): string {
  return (
    PERIODOS_DESEMPENHO.find((p) => p.value === periodo)?.label ??
    "Desde o início"
  );
}
