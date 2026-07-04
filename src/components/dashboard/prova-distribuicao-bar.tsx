import { SIMULADO_ESPELHO_DISTRIBUICAO, DISCIPLINA_LABELS, type Disciplina } from "@/types";
import { cn } from "@/lib/utils";

const ORDEM: Disciplina[] = [
  "legislacao_transito",
  "portugues",
  "direito_administrativo",
  "direito_constitucional",
  "informatica",
  "historia_cg_pb",
  "legislacao_etica_sp",
];

const CORES: Record<Disciplina, string> = {
  legislacao_transito: "bg-transito",
  portugues: "bg-muted-foreground/50",
  informatica: "bg-muted-foreground/40",
  historia_cg_pb: "bg-muted-foreground/40",
  legislacao_etica_sp: "bg-muted-foreground/40",
  direito_administrativo: "bg-muted-foreground/45",
  direito_constitucional: "bg-muted-foreground/45",
};

export function ProvaDistribuicaoBar() {
  const total = Object.values(SIMULADO_ESPELHO_DISTRIBUICAO).reduce(
    (a, b) => a + b,
    0,
  );

  return (
    <section
      className="flex flex-col gap-3"
      aria-labelledby="distribuicao-titulo"
    >
      <div className="flex items-end justify-between gap-2">
        <div>
          <h2 id="distribuicao-titulo" className="text-lg font-semibold">
            Mapa da prova
          </h2>
          <p className="text-sm text-muted-foreground">
            Espelho IDECAN — 60 questões objetivas
          </p>
        </div>
        <span className="text-sm font-medium text-transito-foreground tabular-nums">
          CTB 50%
        </span>
      </div>

      <div
        className="flex h-3 w-full overflow-hidden rounded-full ring-1 ring-border"
        role="img"
        aria-label="Distribuição: Legislação de Trânsito 30 questões, demais disciplinas 30 questões"
      >
        {ORDEM.map((d) => {
          const qtd = SIMULADO_ESPELHO_DISTRIBUICAO[d];
          const pct = (qtd / total) * 100;
          return (
            <div
              key={d}
              className={cn(CORES[d], "h-full transition-all")}
              style={{ width: `${pct}%` }}
              title={`${DISCIPLINA_LABELS[d]}: ${qtd}Q`}
            />
          );
        })}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {ORDEM.map((d) => (
          <li key={d} className="flex items-center gap-1.5">
            <span
              className={cn("size-2 shrink-0 rounded-full", CORES[d])}
              aria-hidden
            />
            <span
              className={cn(
                d === "legislacao_transito" && "font-medium text-transito-foreground",
              )}
            >
              {DISCIPLINA_LABELS[d]} ({SIMULADO_ESPELHO_DISTRIBUICAO[d]}Q)
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
