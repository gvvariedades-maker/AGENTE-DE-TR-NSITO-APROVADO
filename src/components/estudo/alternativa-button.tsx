"use client";

import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AlternativaButtonProps {
  letra: string;
  texto: string;
  selecionada: boolean;
  revelada: boolean;
  correta: boolean;
  desabilitada: boolean;
  onSelect: (letra: string) => void;
}

export function AlternativaButton({
  letra,
  texto,
  selecionada,
  revelada,
  correta,
  desabilitada,
  onSelect,
}: AlternativaButtonProps) {
  const isAcerto = revelada && correta;
  const isErro = revelada && selecionada && !correta;

  return (
    <button
      type="button"
      aria-pressed={selecionada}
      aria-disabled={desabilitada}
      onClick={() => !desabilitada && onSelect(letra)}
      className={cn(
        "flex min-h-11 w-full items-start gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left text-base leading-relaxed transition-colors",
        "hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        desabilitada && "pointer-events-none",
        desabilitada && !isAcerto && !isErro && "opacity-40",
        selecionada && !revelada && "border-primary bg-primary/5 ring-1 ring-primary/30",
        isAcerto && "border-semaforo-verde/40 bg-semaforo-verde/5",
        isErro && "border-semaforo-vermelho/40 bg-semaforo-vermelho/5",
      )}
    >
      <span className="shrink-0 font-semibold tabular-nums">{letra}.</span>
      <span className="flex-1">{texto}</span>
      {isAcerto && (
        <Check
          className="size-5 shrink-0 text-semaforo-verde"
          aria-hidden
        />
      )}
      {isErro && (
        <X className="size-5 shrink-0 text-semaforo-vermelho" aria-hidden />
      )}
    </button>
  );
}
