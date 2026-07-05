"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { EstudoReversoVisual } from "@/types/estudo-reverso-visual";
import { EstudoReversoProgress } from "./estudo-reverso-progress";
import { TelaRenderer } from "./telas/tela-renderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), [href], [tabindex]:not([tabindex="-1"])';

function trapFocus(container: HTMLElement, event: KeyboardEvent) {
  if (event.key !== "Tab") return;
  const nodes = container.querySelectorAll<HTMLElement>(FOCUSABLE);
  if (nodes.length === 0) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);

  const telas = visual.telas;
  const tela = telas[passo];
  const ultima = passo === telas.length - 1;
  const isRecall = tela?.tipo === "micro_recall";

  useEffect(() => {
    document.documentElement.dataset.foco = "true";
    fecharRef.current?.focus();
    const el = dialogRef.current;
    if (!el) {
      return () => {
        delete document.documentElement.dataset.foco;
      };
    }
    const onKeyDown = (e: KeyboardEvent) => trapFocus(el, e);
    el.addEventListener("keydown", onKeyDown);
    return () => {
      delete document.documentElement.dataset.foco;
      el.removeEventListener("keydown", onKeyDown);
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
      ref={dialogRef}
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
          ref={fecharRef}
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

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4">
        <div className="mx-auto w-full max-w-lg flex-1">
          <h2 className="mb-4 text-lg font-semibold">{tela.titulo}</h2>
          <TelaRenderer
            tela={tela}
            onRecallResultado={setRecallAcertou}
          />
        </div>
      </div>

      <footer className="border-t border-border p-4">
        {visual.links_fonte.length > 0 && (
          <div className="mb-3 flex flex-wrap justify-center gap-1.5">
            {visual.links_fonte.map((link) => (
              <Badge
                key={link.rotulo}
                variant="outline"
                className="text-xs font-normal"
                title={link.path}
              >
                {link.rotulo}
              </Badge>
            ))}
          </div>
        )}
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
