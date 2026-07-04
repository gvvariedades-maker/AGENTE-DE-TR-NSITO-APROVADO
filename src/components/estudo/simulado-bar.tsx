"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface SimuladoBarProps {
  questaoAtual: number;
  totalQuestoes: number;
  tempoRestante: string;
  alertaTempo?: boolean;
}

export function SimuladoBar({
  questaoAtual,
  totalQuestoes,
  tempoRestante,
  alertaTempo = false,
}: SimuladoBarProps) {
  const progresso = totalQuestoes > 0 ? (questaoAtual / totalQuestoes) * 100 : 0;

  return (
    <div
      className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <Progress value={progresso} aria-label="Progresso do simulado" />
          <span className="text-xs text-muted-foreground tabular-nums">
            Questão {questaoAtual}/{totalQuestoes}
          </span>
        </div>
        <span
          className={cn(
            "shrink-0 font-mono text-sm tabular-nums",
            alertaTempo && "font-semibold text-destructive",
          )}
        >
          {tempoRestante}
        </span>
      </div>
    </div>
  );
}
