"use client";

import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";

interface RecallGateProps {
  onReveal: () => void;
}

/**
 * Recall gate — força leitura do enunciado antes das alternativas (testing effect).
 * Evita reconhecimento imediato; prioriza recuperação ativa.
 */
export function RecallGate({ onReveal }: RecallGateProps) {
  return (
    <div className="flex flex-col items-center gap-4 border-t border-border px-4 py-8 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-transito/10 ring-1 ring-transito/25 text-transito-foreground">
        <Brain className="size-5" aria-hidden />
      </div>
      <div className="max-w-sm space-y-1">
        <p className="text-sm font-medium">Prática de recuperação</p>
        <p className="text-sm text-muted-foreground">
          Leia o enunciado e tente responder mentalmente antes de ver as
          alternativas. Isso fortalece a memória de longo prazo.
        </p>
      </div>
      <Button onClick={onReveal} className="w-full max-w-xs">
        Mostrar alternativas
      </Button>
      <p className="text-xs text-muted-foreground">
        Atalho: teclas A–D após revelar
      </p>
    </div>
  );
}
