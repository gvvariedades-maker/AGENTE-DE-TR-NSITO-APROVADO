import Link from "next/link";
import {
  SIMULADO_ESPELHO_DISTRIBUICAO,
  type Disciplina,
} from "@/types";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { DesempenhoDisciplina } from "@/lib/desempenho";
import type { ZonaSemaforo } from "@/lib/edital-constants";

const zonaDot: Record<ZonaSemaforo, string> = {
  verde: "bg-semaforo-verde",
  amarelo: "bg-semaforo-amarelo",
  vermelho: "bg-semaforo-vermelho",
  vazio: "bg-muted",
};

const zonaBar = {
  verde: "[&_[data-slot=progress-indicator]]:bg-semaforo-verde",
  amarelo: "[&_[data-slot=progress-indicator]]:bg-semaforo-amarelo",
  vermelho: "[&_[data-slot=progress-indicator]]:bg-semaforo-vermelho",
  vazio: "",
} as const;

interface DisciplinasMapaCompactoProps {
  ctb?: DesempenhoDisciplina;
  piores: DesempenhoDisciplina[];
}

function ordenarPiores(disciplinas: DesempenhoDisciplina[]): DesempenhoDisciplina[] {
  return [...disciplinas]
    .filter((d) => d.disciplina !== "legislacao_transito")
    .sort((a, b) => {
      if (a.zona === "vermelho" && b.zona !== "vermelho") return -1;
      if (b.zona === "vermelho" && a.zona !== "vermelho") return 1;
      if (a.tentativas === 0 && b.tentativas > 0) return 1;
      if (b.tentativas === 0 && a.tentativas > 0) return -1;
      return a.taxaAcerto - b.taxaAcerto;
    })
    .slice(0, 2);
}

export function pioresDisciplinasParaMapa(
  disciplinas: DesempenhoDisciplina[],
): DesempenhoDisciplina[] {
  return ordenarPiores(disciplinas);
}

function LinhaDisciplina({ d }: { d: DesempenhoDisciplina }) {
  const isCtb = d.disciplina === "legislacao_transito";

  return (
    <Link
      href={`/desempenho?disciplina=${d.disciplina}`}
      className={cn(
        "flex flex-col gap-2 rounded-lg border p-4 transition-colors",
        "hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        isCtb
          ? "border-transito/25 bg-transito/5 hover:bg-transito/10"
          : "border-border bg-card",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className={cn("size-2 shrink-0 rounded-full", zonaDot[d.zona])}
            aria-hidden
          />
          <span
            className={cn(
              "truncate text-sm font-semibold",
              isCtb && "text-transito-foreground",
            )}
          >
            {d.label}
          </span>
        </span>
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
          {SIMULADO_ESPELHO_DISTRIBUICAO[d.disciplina as Disciplina]}Q
        </span>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xl font-bold tabular-nums">
          {d.tentativas > 0 ? `${d.taxaAcerto}%` : "—"}
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {d.tentativas > 0
            ? `${d.pontos.toFixed(1)} pts proj.`
            : "Sem tentativas"}
        </span>
      </div>

      <Progress
        value={d.tentativas > 0 ? d.taxaAcerto : 0}
        aria-label={`Acerto em ${d.label}`}
        className={cn("h-1.5", zonaBar[d.zona])}
      />
    </Link>
  );
}

export function DisciplinasMapaCompacto({
  ctb,
  piores,
}: DisciplinasMapaCompactoProps) {
  return (
    <section
      className="flex flex-col gap-3"
      aria-labelledby="mapa-compacto-titulo"
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h2 id="mapa-compacto-titulo" className="text-sm font-semibold">
            Foco do edital
          </h2>
          <p className="text-xs text-muted-foreground">
            CTB + disciplinas que mais precisam de atenção
          </p>
        </div>
        <Link
          href="/desempenho"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "text-primary",
          )}
        >
          Ver evolução →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {ctb && <LinhaDisciplina d={ctb} />}
        {piores.map((d) => (
          <LinhaDisciplina key={d.disciplina} d={d} />
        ))}
      </div>
    </section>
  );
}
