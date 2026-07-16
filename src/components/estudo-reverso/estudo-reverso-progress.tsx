"use client";

import { cn } from "@/lib/utils";
import type { Secao } from "@/types/estudo-reverso-visual";
import { metaSecaoVisual, progressBarClass } from "./secao-visual";

interface EstudoReversoProgressProps {
  atual: number;
  total: number;
  secoes?: (Secao | undefined)[];
}

export function EstudoReversoProgress({
  atual,
  total,
  secoes = [],
}: EstudoReversoProgressProps) {
  const secaoAtual = secoes[atual - 1];
  const rotuloFase = metaSecaoVisual(secaoAtual).rotulo;

  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <div
        className="flex min-w-0 flex-1 items-center gap-1"
        aria-label={`Bloco ${atual} de ${total}`}
        role="progressbar"
        aria-valuenow={atual}
        aria-valuemin={1}
        aria-valuemax={total}
      >
        {Array.from({ length: total }, (_, i) => {
          const estado =
            i + 1 === atual ? "atual" : i + 1 < atual ? "visto" : "futuro";
          return (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full transition-all duration-300",
                progressBarClass(estado),
              )}
              aria-hidden
            />
          );
        })}
      </div>
      <div className="flex shrink-0 flex-col items-end gap-0.5">
        <span className="text-xs tabular-nums text-muted-foreground">
          {atual}/{total}
        </span>
        {secaoAtual && (
          <span
            className={cn(
              "text-[10px] font-medium uppercase tracking-wide",
              metaSecaoVisual(secaoAtual).accentClass,
            )}
          >
            {rotuloFase}
          </span>
        )}
      </div>
    </div>
  );
}
