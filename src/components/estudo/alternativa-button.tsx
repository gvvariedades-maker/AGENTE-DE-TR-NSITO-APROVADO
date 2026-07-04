"use client";

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
      disabled={desabilitada}
      aria-pressed={selecionada}
      onClick={() => onSelect(letra)}
      className={cn(
        "flex min-h-11 w-full items-start gap-3 rounded-lg border border-border px-4 py-3 text-left text-base leading-relaxed transition-colors",
        "hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
        "disabled:cursor-not-allowed disabled:opacity-60",
        selecionada && !revelada && "border-primary bg-primary/10",
        isAcerto && "border-green-500/50 bg-green-500/10",
        isErro && "border-destructive/50 bg-destructive/10",
      )}
    >
      <span className="shrink-0 font-semibold tabular-nums">{letra}.</span>
      <span>{texto}</span>
    </button>
  );
}
