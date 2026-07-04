"use client";

import Link from "next/link";
import type { FinalizarSimuladoResult } from "@/app/actions/simulado";
import { SemaforoZonaCard } from "@/components/dashboard/semaforo-zona-card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { DISCIPLINA_LABELS, DISCIPLINAS, type Disciplina } from "@/types";
import { MIN_PONTOS_TOTAL } from "@/lib/edital-constants";

interface SimuladoResultadoProps {
  data: FinalizarSimuladoResult;
  duracaoLabel: string;
}

export function SimuladoResultado({ data, duracaoLabel }: SimuladoResultadoProps) {
  const { resultado, semaforo, demo } = data;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 pb-8">
      <header className="flex flex-col gap-2 text-center">
        <Badge
          variant={resultado.aprovado ? "default" : "destructive"}
          className="mx-auto w-fit"
        >
          {resultado.aprovado ? "Aprovado no espelho" : "Abaixo do corte"}
        </Badge>
        <h1 className="text-2xl font-bold tabular-nums">
          {resultado.notaTotal} / 100 pts
        </h1>
        <p className="text-sm text-muted-foreground">
          {resultado.acertos} acertos · {resultado.erros} erros ·{" "}
          {resultado.totalQuestoes} questões · {duracaoLabel}
        </p>
        {demo && (
          <p className="text-xs text-muted-foreground">
            Modo demonstração — resultado não salvo no painel.
          </p>
        )}
      </header>

      {resultado.zerouDisciplina && (
        <Alert variant="destructive">
          <AlertTitle>Risco de eliminação por disciplina</AlertTitle>
          <AlertDescription>
            Você ficou abaixo do mínimo em pelo menos uma disciplina presente
            nesta prova. Mínimo: 1 pt (Gerais) e 2 pts (Específicos).
          </AlertDescription>
        </Alert>
      )}

      {!resultado.aprovado && resultado.notaTotal < MIN_PONTOS_TOTAL && (
        <Alert>
          <AlertTitle>Nota total abaixo de {MIN_PONTOS_TOTAL} pts</AlertTitle>
          <AlertDescription>
            O edital exige no mínimo {MIN_PONTOS_TOTAL} pontos na prova objetiva.
          </AlertDescription>
        </Alert>
      )}

      {semaforo && (
        <div className="grid gap-4 sm:grid-cols-3">
          <SemaforoZonaCard metrica={semaforo.gerais} />
          <SemaforoZonaCard metrica={semaforo.especificos} />
          <SemaforoZonaCard
            metrica={semaforo.total}
            minimoLabel={`Mín. ${MIN_PONTOS_TOTAL} pts na prova`}
          />
        </div>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Nota por disciplina</CardTitle>
          <CardDescription>
            Peso do edital: 1 pt/acerto (Gerais) · 2 pts/acerto (Específicos)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {DISCIPLINAS.map((d: Disciplina) => {
              const pts = resultado.notasDisciplina[d] ?? 0;
              const emRisco = resultado.disciplinasEmRisco.some(
                (r) => r.disciplina === d,
              );
              return (
                <li
                  key={d}
                  className={cn(
                    "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                    emRisco && "border-semaforo-vermelho/40 bg-semaforo-vermelho/5",
                  )}
                >
                  <span>{DISCIPLINA_LABELS[d]}</span>
                  <span className="font-medium tabular-nums">{pts} pts</span>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      <div className="flex flex-wrap justify-center gap-2">
        <Link href="/dashboard" className={cn(buttonVariants())}>
          Ver painel
        </Link>
        <Link
          href="/simulado"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Novo simulado
        </Link>
      </div>
    </div>
  );
}
