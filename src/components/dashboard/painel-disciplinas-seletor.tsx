import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DesempenhoDisciplina } from "@/lib/desempenho";
import type { ZonaSemaforo } from "@/lib/edital-constants";
import {
  DISCIPLINAS,
  DISCIPLINA_LABELS,
  SIMULADO_ESPELHO_DISTRIBUICAO,
  type Disciplina,
} from "@/types";

const zonaDot: Record<ZonaSemaforo, string> = {
  verde: "bg-semaforo-verde",
  amarelo: "bg-semaforo-amarelo",
  vermelho: "bg-semaforo-vermelho",
  vazio: "bg-muted-foreground/40",
};

interface PainelDisciplinasSeletorProps {
  disciplinaAtiva: Disciplina;
  desempenhoPorDisciplina: Map<Disciplina, DesempenhoDisciplina>;
}

export function PainelDisciplinasSeletor({
  disciplinaAtiva,
  desempenhoPorDisciplina,
}: PainelDisciplinasSeletorProps) {
  return (
    <section aria-labelledby="disciplinas-titulo" className="flex flex-col gap-2.5">
      <h2
        id="disciplinas-titulo"
        className="text-sm font-semibold text-foreground"
      >
        Disciplinas
      </h2>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {DISCIPLINAS.map((d) => {
          const ativo = d === disciplinaAtiva;
          const isTransito = d === "legislacao_transito";
          const desemp = desempenhoPorDisciplina.get(d);
          const zona = desemp?.zona ?? "vazio";
          const temDados = (desemp?.tentativas ?? 0) > 0;

          return (
            <Link
              key={d}
              href={`/dashboard?disciplina=${d}`}
              aria-current={ativo ? "true" : undefined}
              className={cn(
                "flex flex-col gap-1.5 rounded-xl border-2 px-3 py-2.5 transition-colors",
                "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                ativo
                  ? isTransito
                    ? "border-transito bg-transito/10"
                    : "border-primary bg-primary/8"
                  : "border-border bg-card hover:border-primary/40 hover:bg-muted/40",
              )}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span
                    className={cn("size-2 shrink-0 rounded-full", zonaDot[zona])}
                    aria-hidden
                  />
                  <span
                    className={cn(
                      "truncate text-sm font-semibold",
                      ativo &&
                        (isTransito ? "text-transito-foreground" : "text-primary"),
                    )}
                  >
                    {DISCIPLINA_LABELS[d]}
                  </span>
                </span>
                <span className="shrink-0 text-[11px] font-medium tabular-nums text-muted-foreground">
                  {SIMULADO_ESPELHO_DISTRIBUICAO[d]}Q
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {temDados ? `${desemp!.taxaAcerto}% acerto` : "Sem tentativas"}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
