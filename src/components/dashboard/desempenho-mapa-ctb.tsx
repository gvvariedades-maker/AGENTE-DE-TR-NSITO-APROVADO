import Link from "next/link";
import { cn } from "@/lib/utils";
import type { DesempenhoDisciplina } from "@/lib/desempenho";
import type { ZonaSemaforo } from "@/lib/edital-constants";

const zonaDot: Record<ZonaSemaforo, string> = {
  verde: "bg-semaforo-verde",
  amarelo: "bg-semaforo-amarelo",
  vermelho: "bg-semaforo-vermelho",
  vazio: "bg-muted",
};

interface DesempenhoMapaCtbProps {
  ctb?: DesempenhoDisciplina;
  demais: DesempenhoDisciplina[];
  className?: string;
}

export function DesempenhoMapaCtb({
  ctb,
  demais,
  className,
}: DesempenhoMapaCtbProps) {
  const ptsDemais = demais.reduce((acc, d) => acc + d.pontos, 0);
  const emRisco = demais.filter((d) => d.zona === "vermelho").length;
  const ctbZona = ctb?.zona ?? "vazio";

  return (
    <section
      className={cn(
        "rounded-xl border border-border bg-card p-5 md:p-6",
        className,
      )}
      aria-labelledby="desempenho-mapa-titulo"
    >
      <div>
        <h2 id="desempenho-mapa-titulo" className="text-lg font-semibold">
          Mapa CTB vs demais
        </h2>
        <p className="text-sm text-muted-foreground">
          Pontos projetados por bloco da prova
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link
          href="/desempenho?disciplina=legislacao_transito"
          className={cn(
            "rounded-lg border border-transito/25 bg-transito/5 p-4 transition-colors",
            "hover:bg-transito/10 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          )}
        >
          <div className="flex items-center gap-2">
            <span
              className={cn("size-2.5 shrink-0 rounded-full", zonaDot[ctbZona])}
              aria-hidden
            />
            <h3 className="text-sm font-semibold text-transito-foreground">
              Legislação de Trânsito
            </h3>
            <span className="ml-auto text-xs font-medium text-muted-foreground">
              30Q
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {(ctb?.pontos ?? 0).toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">pts</span>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {(ctb?.tentativas ?? 0) > 0
              ? `${ctb!.taxaAcerto}% acerto`
              : "Sem tentativas"}
            {(ctb?.coberturaPct ?? 0) > 0 && ` · ${ctb!.coberturaPct}% edital`}
          </p>

          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            50% da prova — prioridade máxima no edital.
          </p>
        </Link>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <div className="flex items-center gap-2">
            <span
              className="size-2.5 shrink-0 rounded-full bg-muted-foreground/50"
              aria-hidden
            />
            <h3 className="text-sm font-semibold text-foreground">
              Gerais + específicos
            </h3>
            <span className="ml-auto text-xs font-medium text-muted-foreground">
              30Q
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {ptsDemais.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">pts somados</span>
            {emRisco > 0 && (
              <span className="ml-auto text-xs font-medium text-semaforo-vermelho">
                {emRisco} em risco
              </span>
            )}
          </div>

          <ul className="mt-3 flex flex-col gap-1">
            {demais.map((d) => (
              <li key={d.disciplina}>
                <Link
                  href={`/desempenho?disciplina=${d.disciplina}`}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md px-1 py-0.5 text-xs transition-colors",
                    "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <span
                      className={cn(
                        "size-1.5 shrink-0 rounded-full",
                        zonaDot[d.zona],
                      )}
                      aria-hidden
                    />
                    <span className="truncate text-muted-foreground">
                      {d.label}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 tabular-nums">
                    <span className="font-medium text-foreground">
                      {d.pontos.toFixed(1)} pt
                    </span>
                    <span className="text-muted-foreground">
                      {d.questoesProva}Q
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
