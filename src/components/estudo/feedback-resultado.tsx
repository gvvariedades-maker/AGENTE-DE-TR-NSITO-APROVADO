"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface FeedbackResultadoProps {
  acertou: boolean;
  gabarito: string;
  dominioAlcancado?: boolean;
  tipoErroLabel?: string;
}

/** KR mínimo pós-resposta — usado quando há estudo reverso visual na questão. */
export function FeedbackResultado({
  acertou,
  gabarito,
  dominioAlcancado,
  tipoErroLabel,
}: FeedbackResultadoProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-x-2 gap-y-1 rounded-lg border px-3 py-2 text-center",
        acertou
          ? "border-semaforo-verde/30 bg-semaforo-verde/5"
          : "border-semaforo-vermelho/30 bg-semaforo-vermelho/5",
      )}
    >
      {acertou ? (
        <Check className="size-4 shrink-0 text-semaforo-verde" aria-hidden />
      ) : (
        <X className="size-4 shrink-0 text-semaforo-vermelho" aria-hidden />
      )}
      <span
        className={cn(
          "text-sm font-semibold",
          acertou ? "text-semaforo-verde" : "text-semaforo-vermelho",
        )}
      >
        {acertou ? "Correto" : "Incorreto"}
      </span>
      {!acertou && (
        <span className="text-sm text-muted-foreground">
          · Gabarito{" "}
          <span className="font-semibold text-foreground">{gabarito}</span>
        </span>
      )}
      {dominioAlcancado && (
        <Badge
          variant="outline"
          className="border-semaforo-verde/50 text-semaforo-verde"
        >
          Microtópico dominado
        </Badge>
      )}
      {tipoErroLabel && (
        <Badge variant="outline" className="text-xs">
          {tipoErroLabel}
        </Badge>
      )}
    </div>
  );
}
