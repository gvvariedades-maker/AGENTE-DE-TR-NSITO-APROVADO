import { Badge } from "@/components/ui/badge";
import { PROVA_DATA } from "@/types";
import { SemaforoVisual } from "@/components/dashboard/semaforo-visual";

interface HomeHeroProps {
  diasParaProva: number;
}

function formatarDataProva() {
  return PROVA_DATA.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function HomeHero({ diasParaProva }: HomeHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-asfalto">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        aria-hidden
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, var(--faixa) 0, var(--faixa) 24px, transparent 24px, transparent 48px)",
        }}
      />

      <div className="relative flex flex-col gap-6 p-5 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="border-transito/40 bg-transito/15 text-transito-foreground">
              IDECAN · Edital 04/2026
            </Badge>
            <Badge variant="outline" className="border-transito/25 text-transito-foreground">
              STTP Campina Grande/PB
            </Badge>
          </div>

          <div>
            <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
              Concurso público
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Agente de Trânsito Aprovado
            </h1>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Simulados espelho, estudo reverso e questões no DNA IDECAN.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-5 md:gap-8">
          <div className="flex flex-col items-start gap-1 md:items-end">
            <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Contagem regressiva
            </span>
            <p className="text-4xl font-bold tabular-nums text-foreground">
              {diasParaProva}
              <span className="ml-1 text-lg font-semibold text-muted-foreground">
                dias
              </span>
            </p>
            <p className="text-xs text-muted-foreground">
              Prova objetiva — {formatarDataProva()}
            </p>
            <p className="text-xs text-muted-foreground">60 questões · 4 horas</p>
          </div>

          <SemaforoVisual
            zona="vazio"
            size="lg"
            label="Semáforo"
            className="shrink-0"
          />
        </div>
      </div>

      <div className="relative border-t border-border/50 bg-transito/10 px-5 py-2 md:px-8">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-transito-foreground">
            Legislação de Trânsito
          </span>{" "}
          — 30 das 60 questões (50% da prova) · mínimo 50 pts total · 1 pt
          (gerais) e 2 pts (específicos) por disciplina
        </p>
      </div>
    </section>
  );
}
