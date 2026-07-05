"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { EstudoReversoVisual } from "@/types/estudo-reverso-visual";
import { EstudoReversoProgress } from "./estudo-reverso-progress";
import { TelaRenderer } from "./telas/tela-renderer";
import { Button } from "@/components/ui/button";

export interface EstudoReversoConclusao {
  telasVistas: string[];
  recallAcertou: boolean | null;
  tempoTotalSeg: number;
  concluido: boolean;
}

interface EstudoReversoPlayerProps {
  visual: EstudoReversoVisual;
  onFechar: () => void;
  onConcluir: (dados: EstudoReversoConclusao) => void;
}

export function EstudoReversoPlayer({
  visual,
  onFechar,
  onConcluir,
}: EstudoReversoPlayerProps) {
  const [passo, setPasso] = useState(0);
  const [vistas, setVistas] = useState<string[]>([]);
  const [recallAcertou, setRecallAcertou] = useState<boolean | null>(null);
  const inicioRef = useRef(Date.now());

  const telas = visual.telas;
  const tela = telas[passo];
  const ultima = passo === telas.length - 1;
  const isRecall = tela?.tipo === "micro_recall";

  useEffect(() => {
    document.documentElement.dataset.foco = "true";
    return () => {
      delete document.documentElement.dataset.foco;
    };
  }, []);

  useEffect(() => {
    if (tela && !vistas.includes(tela.id)) {
      setVistas((prev) => [...prev, tela.id]);
    }
  }, [tela, vistas]);

  const finalizar = useCallback(
    (concluido: boolean) => {
      onConcluir({
        telasVistas: vistas,
        recallAcertou,
        tempoTotalSeg: Math.round((Date.now() - inicioRef.current) / 1000),
        concluido,
      });
      onFechar();
    },
    [onConcluir, onFechar, recallAcertou, vistas],
  );

  if (!tela) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-label="Estudo reverso visual"
    >
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Estudo reverso visual
          </p>
          <p className="text-sm font-medium text-transito-foreground">
            {visual.macete_visual}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => finalizar(false)}
          aria-label="Fechar estudo reverso"
        >
          <X className="size-5" />
        </Button>
      </header>

      <EstudoReversoProgress atual={passo + 1} total={telas.length} />

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <h2 className="mb-3 text-base font-semibold">{tela.titulo}</h2>
        <TelaRenderer
          tela={tela}
          onRecallResultado={setRecallAcertou}
        />
      </div>

      <footer className="border-t border-border p-4">
        {!ultima ? (
          <Button
            type="button"
            className="w-full"
            onClick={() => setPasso((p) => p + 1)}
          >
            Próximo bloco
          </Button>
        ) : isRecall && recallAcertou === null ? (
          <p className="text-center text-xs text-muted-foreground">
            Responda o recall para concluir
          </p>
        ) : (
          <Button
            type="button"
            className="w-full"
            onClick={() => finalizar(recallAcertou === true)}
          >
            Concluir estudo reverso
          </Button>
        )}
      </footer>
    </div>
  );
}
