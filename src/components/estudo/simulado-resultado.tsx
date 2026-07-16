"use client";

import Link from "next/link";
import type { FinalizarSimuladoResult } from "@/app/actions/simulado";
import { SemaforoCompacto } from "@/components/dashboard/semaforo-compacto";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { DISCIPLINA_LABELS } from "@/types";
import {
  MAX_PONTOS_ESPECIFICOS,
  MAX_PONTOS_GERAIS,
  MIN_PONTOS_TOTAL,
} from "@/lib/edital-constants";
import { formatPontos } from "@/lib/semaforo-format";

interface SimuladoResultadoProps {
  data: FinalizarSimuladoResult;
  duracaoLabel: string;
}

function motivoEliminacao(data: FinalizarSimuladoResult): string | null {
  const { resultado } = data;
  if (resultado.aprovado) return null;

  const partes: string[] = [];
  if (resultado.zerouDisciplina) {
    const nomes = resultado.disciplinasEmRisco
      .map((r) => DISCIPLINA_LABELS[r.disciplina])
      .join(", ");
    partes.push(`mínimo por disciplina (${nomes})`);
  }
  if (resultado.notaTotal < MIN_PONTOS_TOTAL) {
    partes.push(`corte total (${MIN_PONTOS_TOTAL} pts)`);
  }
  return partes.length > 0 ? partes.join(" · ") : "abaixo do mínimo do edital";
}

export function SimuladoResultado({
  data,
  duracaoLabel,
}: SimuladoResultadoProps) {
  const { resultado, semaforo, demo } = data;
  const taxaAcerto =
    resultado.totalQuestoes > 0
      ? Math.round((resultado.acertos / resultado.totalQuestoes) * 100)
      : 0;
  const faltamPts = Math.max(0, MIN_PONTOS_TOTAL - resultado.notaTotal);
  const motivo = motivoEliminacao(data);
  const primeiraRisco = resultado.disciplinasEmRisco[0];
  const hrefEstudoRisco = primeiraRisco
    ? `/estudo?disciplina=${primeiraRisco.disciplina}`
    : "/estudo?modo=auto";

  const geraisPts = semaforo?.gerais.pontos ?? null;
  const especPts = semaforo?.especificos.pontos ?? null;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4 pb-10 md:gap-5 md:p-6">
      {/* Veredicto — 1 linha */}
      <header
        className={cn(
          "rounded-xl border px-4 py-3",
          resultado.aprovado
            ? "border-semaforo-verde/35 bg-semaforo-verde/5"
            : "border-semaforo-vermelho/35 bg-semaforo-vermelho/5",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={resultado.aprovado ? "default" : "destructive"}
                className={cn(
                  resultado.aprovado &&
                    "border-semaforo-verde/40 bg-semaforo-verde text-white",
                )}
              >
                {resultado.aprovado ? "Aprovado no simulado" : "Eliminado no simulado"}
              </Badge>
              {demo && (
                <Badge variant="outline" className="text-[10px] font-normal">
                  Demo — não salvo
                </Badge>
              )}
            </div>
            {motivo && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                Motivo: {motivo}
              </p>
            )}
            {resultado.aprovado && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                Nota ≥ {MIN_PONTOS_TOTAL} pts e mínimos por disciplina atingidos.
              </p>
            )}
          </div>

          <div className="text-right">
            <p
              className={cn(
                "text-3xl font-bold tabular-nums leading-none tracking-tight sm:text-4xl",
                resultado.aprovado
                  ? "text-semaforo-verde"
                  : "text-foreground",
              )}
            >
              {resultado.notaTotal}
              <span className="text-lg font-semibold text-muted-foreground">
                /100
              </span>
            </p>
            {!resultado.aprovado && faltamPts > 0 && (
              <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                Faltam {faltamPts} pts para o corte
              </p>
            )}
          </div>
        </div>
      </header>

      {/* Métricas densas — 1 glance */}
      <section
        aria-label="Resumo da prova"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        <div className="rounded-xl border border-border bg-card px-3 py-2.5">
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Taxa de acerto
          </p>
          <p
            className={cn(
              "mt-1 text-xl font-bold tabular-nums leading-none",
              taxaAcerto >= 50
                ? "text-semaforo-verde"
                : "text-semaforo-vermelho",
            )}
          >
            {taxaAcerto}%
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-3 py-2.5">
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Acertos / erros
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums leading-none">
            <span className="text-semaforo-verde">{resultado.acertos}</span>
            <span className="text-muted-foreground"> / </span>
            <span className="text-semaforo-vermelho">{resultado.erros}</span>
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-3 py-2.5">
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Questões
          </p>
          <p className="mt-1 text-xl font-bold tabular-nums leading-none">
            {resultado.totalQuestoes}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-3 py-2.5">
          <p className="text-[10px] font-medium tracking-wide text-muted-foreground uppercase">
            Tempo
          </p>
          <p className="mt-1 font-mono text-lg font-bold tabular-nums leading-none">
            {duracaoLabel}
          </p>
        </div>
      </section>

      {/* Progresso até o corte */}
      <section className="rounded-xl border border-border bg-card px-3 py-3">
        <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
          <span className="font-medium text-muted-foreground">
            Progresso ao corte ({MIN_PONTOS_TOTAL} pts)
          </span>
          <span className="tabular-nums text-foreground">
            {Math.min(100, Math.round((resultado.notaTotal / MIN_PONTOS_TOTAL) * 100))}
            %
          </span>
        </div>
        <Progress
          value={Math.min(100, (resultado.notaTotal / MIN_PONTOS_TOTAL) * 100)}
          aria-label="Progresso em relação ao corte de 50 pontos"
          className={cn(
            "h-2",
            resultado.notaTotal >= MIN_PONTOS_TOTAL
              ? "[&_[data-slot=progress-indicator]]:bg-semaforo-verde"
              : "[&_[data-slot=progress-indicator]]:bg-semaforo-vermelho",
          )}
        />
        {(geraisPts !== null || especPts !== null) && (
          <p className="mt-2 text-[11px] text-muted-foreground tabular-nums">
            Gerais {formatPontos(geraisPts)}
            {geraisPts !== null && ` / ${MAX_PONTOS_GERAIS}`}
            {" · "}
            Específicos {formatPontos(especPts)}
            {especPts !== null && ` / ${MAX_PONTOS_ESPECIFICOS}`}
          </p>
        )}
      </section>

      {semaforo && (
        <SemaforoCompacto
          gerais={semaforo.gerais}
          especificos={semaforo.especificos}
          total={semaforo.total}
        />
      )}

      {/* Disciplinas — só as que caíram na prova */}
      <section aria-labelledby="nota-disciplina-titulo">
        <div className="mb-2 flex items-end justify-between gap-2">
          <div>
            <h2
              id="nota-disciplina-titulo"
              className="text-sm font-semibold"
            >
              Nota por disciplina
            </h2>
            <p className="text-[11px] text-muted-foreground">
              1 pt Gerais · 2 pts Específicos · só itens deste caderno
            </p>
          </div>
        </div>

        <ul className="overflow-hidden rounded-xl border border-border">
          {resultado.detalhesDisciplina.length === 0 ? (
            <li className="px-3 py-4 text-center text-sm text-muted-foreground">
              Nenhuma disciplina neste caderno.
            </li>
          ) : (
            resultado.detalhesDisciplina.map((d, i) => {
              const pct =
                d.total > 0 ? Math.round((d.acertos / d.total) * 100) : 0;
              return (
                <li
                  key={d.disciplina}
                  className={cn(
                    "flex flex-col gap-1.5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3",
                    i > 0 && "border-t border-border",
                    d.emRisco && "bg-semaforo-vermelho/5",
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-medium">
                        {DISCIPLINA_LABELS[d.disciplina]}
                      </span>
                      {d.emRisco ? (
                        <Badge variant="destructive" className="text-[10px]">
                          Risco
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-semaforo-verde/40 text-[10px] text-semaforo-verde"
                        >
                          OK
                        </Badge>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground tabular-nums">
                      {d.acertos}/{d.total} acertos · {pct}% · mín. {d.minimo}{" "}
                      pts
                    </p>
                  </div>
                  <div className="flex items-center gap-3 sm:shrink-0">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:w-24">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          d.emRisco
                            ? "bg-semaforo-vermelho"
                            : "bg-semaforo-verde",
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        "w-14 text-right text-sm font-bold tabular-nums",
                        d.emRisco
                          ? "text-semaforo-vermelho"
                          : "text-foreground",
                      )}
                    >
                      {d.pontos} pts
                    </span>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </section>

      {/* CTAs — uma primária clara */}
      <footer className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {!resultado.aprovado ? (
          <Link
            href={hrefEstudoRisco}
            className={cn(buttonVariants({ size: "lg" }), "min-h-11 flex-1")}
          >
            {primeiraRisco
              ? `Estudar ${DISCIPLINA_LABELS[primeiraRisco.disciplina]}`
              : "Continuar estudo"}
          </Link>
        ) : (
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ size: "lg" }), "min-h-11 flex-1")}
          >
            Ver painel
          </Link>
        )}
        <Link
          href="/simulado"
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "min-h-11 flex-1",
          )}
        >
          Novo simulado
        </Link>
        {!resultado.aprovado && (
          <Link
            href="/dashboard"
            className={cn(
              buttonVariants({ variant: "ghost", size: "lg" }),
              "min-h-11 sm:flex-none",
            )}
          >
            Painel
          </Link>
        )}
      </footer>
    </div>
  );
}
