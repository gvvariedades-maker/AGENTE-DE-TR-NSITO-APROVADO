"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { EstudoReversoVisual } from "@/types/estudo-reverso-visual";
import { EstudoReversoProgress } from "./estudo-reverso-progress";
import { TelaRenderer } from "./telas/tela-renderer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { labelTrilhaEstudoReverso } from "@/lib/estudo-reverso-visual-trilha";
import { metaSecaoVisual } from "./secao-visual";
import { cn } from "@/lib/utils";

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
  const inicioRef = useRef(Date.now());
  const dialogRef = useRef<HTMLDivElement>(null);
  const fecharRef = useRef<HTMLButtonElement>(null);
  const proximoRef = useRef<HTMLButtonElement>(null);

  const telas = visual.telas;
  const tela = telas[passo];
  const ultima = passo === telas.length - 1;
  const primeira = passo === 0;
  const podeAvancar = !ultima;

  const finalizar = useCallback(
    (concluido: boolean) => {
      onConcluir({
        telasVistas: vistas,
        tempoTotalSeg: Math.round((Date.now() - inicioRef.current) / 1000),
        concluido,
      });
      onFechar();
    },
    [onConcluir, onFechar, vistas],
  );

  const avancar = useCallback(() => {
    if (!ultima) setPasso((p) => p + 1);
  }, [ultima]);

  const voltar = useCallback(() => {
    if (passo > 0) setPasso((p) => p - 1);
  }, [passo]);

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

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        finalizar(false);
        return;
      }

      if (e.key === "ArrowLeft" && passo > 0) {
        e.preventDefault();
        voltar();
        return;
      }

      if (e.key === "ArrowRight" && podeAvancar) {
        e.preventDefault();
        avancar();
        return;
      }

      if (e.key === "Enter" && podeAvancar) {
        e.preventDefault();
        avancar();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [avancar, voltar, finalizar, podeAvancar, passo]);

  if (!tela) return null;

  return (
    <div
      ref={dialogRef}
      className="fixed inset-0 z-50 flex flex-col bg-background"
      role="dialog"
      aria-modal="true"
      aria-labelledby="estudo-reverso-titulo"
      aria-describedby="estudo-reverso-macete"
    >
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p
            id="estudo-reverso-macete"
            className="text-xs font-medium tracking-wide text-muted-foreground uppercase"
          >
            Estudo reverso visual
          </p>
          <Badge variant="secondary" className="w-fit text-[10px] font-normal">
            {labelTrilhaEstudoReverso(visual)}
          </Badge>
        </div>
        <Button
          ref={fecharRef}
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0"
          onClick={() => finalizar(false)}
          aria-label="Fechar estudo reverso (Esc)"
        >
          <X className="size-5" />
        </Button>
      </header>

      <EstudoReversoProgress
        atual={passo + 1}
        total={telas.length}
        secoes={telas.map((t) => t.secao)}
      />

      <div className="flex flex-1 flex-col overflow-y-auto bg-muted/20 px-4 py-5">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
          <div className="flex items-start gap-3">
            {(() => {
              const meta = metaSecaoVisual(tela.secao);
              const Icon = meta.icon;
              return (
                <span
                  className={cn(
                    "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg",
                    meta.iconBgClass,
                  )}
                  aria-hidden
                >
                  <Icon className={cn("size-5", meta.accentClass)} />
                </span>
              );
            })()}
            <h2
              id="estudo-reverso-titulo"
              className="min-w-0 flex-1 text-xl font-semibold leading-snug tracking-tight text-foreground"
            >
              {tela.titulo}
            </h2>
          </div>
          <TelaRenderer tela={tela} />
        </div>
      </div>

      <footer className="border-t border-border bg-background p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {visual.links_fonte.length > 0 && (
          <div className="mb-3 flex flex-wrap justify-center gap-1">
            {visual.links_fonte.map((link) => (
              <Badge
                key={link.rotulo}
                variant="outline"
                className="border-border/60 px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
                title={link.path}
              >
                {link.rotulo}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={voltar}
            disabled={primeira}
          >
            Anterior
          </Button>

          {podeAvancar ? (
            <Button
              ref={proximoRef}
              type="button"
              size="lg"
              className="flex-1"
              onClick={avancar}
            >
              Seguinte
            </Button>
          ) : (
            <Button
              type="button"
              size="lg"
              className="flex-1"
              onClick={() => finalizar(true)}
            >
              Concluir
            </Button>
          )}
        </div>
        <p className="mt-2 hidden text-center text-xs text-muted-foreground sm:block">
          ← Anterior · → Seguinte · Enter avança · Esc sai
        </p>
      </footer>
    </div>
  );
}
