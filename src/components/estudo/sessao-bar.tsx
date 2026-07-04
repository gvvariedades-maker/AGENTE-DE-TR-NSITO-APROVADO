"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface SessaoBarProps {
  atual: number;
  total: number;
  acertos: number;
  erros: number;
}

/** Barra de sessão — feedback imediato de progresso (retenção + motivação). */
export function SessaoBar({ atual, total, acertos, erros }: SessaoBarProps) {
  const pct = total > 0 ? (atual / total) * 100 : 0;

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 py-2 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">
            Sessão {atual}/{total}
          </span>
          <span className="flex gap-3 tabular-nums">
            <span className="text-semaforo-verde">{acertos} acertos</span>
            <span className="text-semaforo-vermelho">{erros} erros</span>
          </span>
        </div>
        <Progress value={pct} aria-label="Progresso da sessão" />
      </div>
    </div>
  );
}
