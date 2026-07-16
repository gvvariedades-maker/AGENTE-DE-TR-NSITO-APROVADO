"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Flag } from "lucide-react";

interface SimuladoBarProps {
  questaoAtual: number;
  totalQuestoes: number;
  respondidas: number;
  marcadasRevisao: number;
  tempoRestante: string;
  alertaTempo?: boolean;
  cartaoAberto?: boolean;
  onToggleCartao?: () => void;
  onFinalizar?: () => void;
  finalizando?: boolean;
}

export function SimuladoBar({
  questaoAtual,
  totalQuestoes,
  respondidas,
  marcadasRevisao,
  tempoRestante,
  alertaTempo = false,
  cartaoAberto = false,
  onToggleCartao,
  onFinalizar,
  finalizando = false,
}: SimuladoBarProps) {
  const progresso =
    totalQuestoes > 0 ? (respondidas / totalQuestoes) * 100 : 0;
  const emBranco = Math.max(0, totalQuestoes - respondidas);

  return (
    <header
      className="sticky top-0 z-20 border-b border-border bg-card"
      role="status"
      aria-live="polite"
    >
      <div className="border-b border-border/60 bg-muted/40 px-3 py-1.5 sm:px-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-semibold tracking-wide text-foreground uppercase">
              Prova objetiva · Simulado IDECAN
            </p>
            <p className="truncate text-[10px] text-muted-foreground">
              Edital 04/2026 · STTP Campina Grande/PB · 4 horas · A–D
            </p>
          </div>
          <div
            className={cn(
              "shrink-0 rounded-md border px-2.5 py-1 font-mono text-sm font-semibold tabular-nums sm:text-base",
              alertaTempo
                ? "border-destructive/40 bg-destructive/10 text-destructive"
                : "border-border bg-background text-foreground",
            )}
            aria-label={`Tempo restante ${tempoRestante}`}
          >
            {tempoRestante}
          </div>
        </div>
      </div>

      <div className="px-3 py-2 sm:px-4">
        <div className="mx-auto flex max-w-6xl flex-col gap-2">
          <div className="flex items-center gap-2">
            <Progress
              value={progresso}
              aria-label="Progresso de respostas no cartão"
              className="h-1.5 flex-1"
            />
            <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
              {respondidas}/{totalQuestoes}
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground tabular-nums">
                Questão {questaoAtual}/{totalQuestoes}
              </span>
              <span className="tabular-nums">{emBranco} em branco</span>
              {marcadasRevisao > 0 && (
                <span className="inline-flex items-center gap-1 tabular-nums text-foreground">
                  <Flag
                    className="size-3 text-semaforo-amarelo"
                    aria-hidden
                    fill="currentColor"
                  />
                  {marcadasRevisao} revisão
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {onToggleCartao && (
                <Button
                  type="button"
                  variant={cartaoAberto ? "secondary" : "outline"}
                  size="sm"
                  className="gap-1.5 lg:hidden"
                  onClick={onToggleCartao}
                  aria-pressed={cartaoAberto}
                >
                  <LayoutGrid className="size-3.5" aria-hidden />
                  Cartão
                </Button>
              )}
              {onFinalizar && (
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={onFinalizar}
                  disabled={finalizando}
                >
                  Entregar prova
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
