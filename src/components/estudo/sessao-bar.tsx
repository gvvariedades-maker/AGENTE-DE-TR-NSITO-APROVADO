"use client";

import { Progress } from "@/components/ui/progress";

interface SessaoBarProps {
  atual: number;
  total: number;
  respondidas: number;
  acertos: number;
  erros: number;
}

/** Barra de sessão — progresso por questões confirmadas, não por posição. */
export function SessaoBar({
  atual,
  total,
  respondidas,
  acertos,
  erros,
}: SessaoBarProps) {
  const pct = total > 0 ? (respondidas / total) * 100 : 0;

  return (
    <div className="px-4 pt-2.5 pb-2">
      <div className="mx-auto flex max-w-3xl flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <span className="tabular-nums font-medium text-foreground">
            {atual}/{total}
          </span>
          <span className="tabular-nums">
            {respondidas}/{total} confirmadas
          </span>
          <span className="flex gap-2 tabular-nums">
            <span className="text-semaforo-verde">{acertos} ac.</span>
            <span className="text-semaforo-vermelho">{erros} er.</span>
          </span>
        </div>
        <Progress
          value={pct}
          className="h-1"
          aria-label={`${respondidas} de ${total} questões confirmadas`}
        />
      </div>
    </div>
  );
}
