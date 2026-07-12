import Link from "next/link";
import {
  DISCIPLINA_LABELS,
  SIMULADO_ESPELHO_DISTRIBUICAO,
  type Disciplina,
} from "@/types";
import { cn } from "@/lib/utils";
import type { DesempenhoDisciplina } from "@/lib/desempenho";
import type { ZonaSemaforo } from "@/lib/edital-constants";

const DEMAIS: Disciplina[] = [
  "portugues",
  "direito_administrativo",
  "direito_constitucional",
  "informatica",
  "historia_cg_pb",
  "legislacao_etica_sp",
];

const zonaDot: Record<ZonaSemaforo, string> = {
  verde: "bg-semaforo-verde",
  amarelo: "bg-semaforo-amarelo",
  vermelho: "bg-semaforo-vermelho",
  vazio: "bg-muted",
};

interface DisciplinasMapaProps {
  desempenhoPorDisciplina: Map<Disciplina, DesempenhoDisciplina>;
}

function pontosLabel(d?: DesempenhoDisciplina) {
  const temDados = (d?.tentativas ?? 0) > 0;
  if (!temDados && (d?.pontos ?? 0) === 0) return null;
  return d!.pontos.toFixed(1);
}

export function DisciplinasMapa({ desempenhoPorDisciplina }: DisciplinasMapaProps) {
  const ctb = desempenhoPorDisciplina.get("legislacao_transito");
  const ctbPontos = pontosLabel(ctb);
  const ctbZona = ctb?.zona ?? "vazio";
  const qtdCtb = SIMULADO_ESPELHO_DISTRIBUICAO.legislacao_transito;
  const qtdDemais = DEMAIS.reduce(
    (acc, d) => acc + SIMULADO_ESPELHO_DISTRIBUICAO[d],
    0,
  );

  const pontosDemais = DEMAIS.reduce(
    (acc, d) => acc + (desempenhoPorDisciplina.get(d)?.pontos ?? 0),
    0,
  );
  const emRiscoDemais = DEMAIS.filter(
    (d) => desempenhoPorDisciplina.get(d)?.zona === "vermelho",
  ).length;

  return (
    <section
      className="rounded-xl border border-border bg-card p-5 md:p-6"
      aria-labelledby="disciplinas-mapa-titulo"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="disciplinas-mapa-titulo" className="text-lg font-semibold">
            Mapa de disciplinas
          </h2>
          <p className="text-sm text-muted-foreground">
            Desempenho por bloco — CTB vs demais
          </p>
        </div>
        <p className="text-sm font-medium text-transito-foreground">
          CTB {qtdCtb}Q · Demais {qtdDemais}Q
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Link
          href="/estudo?disciplina=legislacao_transito"
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
            <span className="ml-auto text-sm font-bold tabular-nums text-foreground">
              {qtdCtb}Q
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            {ctbPontos !== null ? (
              <>
                <span className="text-2xl font-bold tabular-nums text-foreground">
                  {ctbPontos}
                </span>
                <span className="text-sm text-muted-foreground">pts</span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">Sem tentativas</span>
            )}
            {(ctb?.coberturaPct ?? 0) > 0 && (
              <span className="ml-auto text-xs font-medium tabular-nums text-muted-foreground">
                {ctb!.coberturaPct}% coberto
              </span>
            )}
          </div>

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
            <span className="ml-auto text-sm font-bold tabular-nums text-foreground">
              {qtdDemais}Q
            </span>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-foreground">
              {pontosDemais.toFixed(1)}
            </span>
            <span className="text-sm text-muted-foreground">pts somados</span>
            {emRiscoDemais > 0 && (
              <span className="ml-auto text-xs font-medium text-semaforo-vermelho">
                {emRiscoDemais} em risco
              </span>
            )}
          </div>

          <ul className="mt-3 flex flex-col gap-1">
            {DEMAIS.map((d) => {
              const desemp = desempenhoPorDisciplina.get(d);
              const zona = desemp?.zona ?? "vazio";
              const pts = pontosLabel(desemp);
              const isGeral = [
                "portugues",
                "informatica",
                "historia_cg_pb",
                "legislacao_etica_sp",
              ].includes(d);

              return (
                <li key={d}>
                  <Link
                    href={`/estudo/catalogo?disciplina=${d}`}
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-md px-1 py-0.5 text-xs transition-colors",
                      "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span
                        className={cn(
                          "size-1.5 shrink-0 rounded-full",
                          zonaDot[zona],
                        )}
                        aria-hidden
                      />
                      <span className="truncate text-muted-foreground">
                        {DISCIPLINA_LABELS[d]}
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-2 tabular-nums">
                      {pts !== null && (
                        <span className="font-medium text-foreground">
                          {pts} pt
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        {SIMULADO_ESPELHO_DISTRIBUICAO[d]}Q
                      </span>
                      <span className="hidden text-muted-foreground/70 sm:inline">
                        {isGeral ? "Geral" : "Espec."}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
