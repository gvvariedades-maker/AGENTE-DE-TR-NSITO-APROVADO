"use client";

import { cn } from "@/lib/utils";

interface EstudoReversoProgressProps {
  atual: number;
  total: number;
}

export function EstudoReversoProgress({
  atual,
  total,
}: EstudoReversoProgressProps) {
  return (
    <div className="flex gap-1 px-4 pt-3" aria-label={`Bloco ${atual} de ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            i < atual ? "bg-transito" : "bg-muted",
          )}
          aria-hidden
        />
      ))}
    </div>
  );
}
