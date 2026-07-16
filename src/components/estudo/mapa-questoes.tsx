"use client";

import { cn } from "@/lib/utils";
import type { EstadoQuestao } from "@/lib/estado-questao";
import { Flag } from "lucide-react";

interface MapaQuestoesProps {
  total: number;
  indiceAtual: number;
  questaoIds: string[];
  estados: Map<string, EstadoQuestao>;
  onIrPara: (indice: number) => void;
  /**
   * estudo = verde/vermelho após gabarito;
   * prova = cartão-resposta (respondida / em branco / revisão) sem revelar acerto.
   */
  variante?: "estudo" | "prova";
  className?: string;
}

export function MapaQuestoes({
  total,
  indiceAtual,
  questaoIds,
  estados,
  onIrPara,
  variante = "estudo",
  className,
}: MapaQuestoesProps) {
  const isProva = variante === "prova";

  return (
    <nav
      className={cn(isProva ? undefined : "px-4 pb-2.5", className)}
      aria-label={
        isProva ? "Cartão-resposta" : "Mapa de questões da sessão"
      }
    >
      <div className={cn(!isProva && "mx-auto max-w-3xl")}>
        {isProva && (
          <p className="mb-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
            Cartão-resposta
          </p>
        )}
        <ol
          className={cn(
            "flex flex-wrap gap-1",
            isProva ? "justify-start" : "justify-center sm:justify-start",
          )}
        >
          {Array.from({ length: total }, (_, i) => {
            const id = questaoIds[i];
            const estado = id ? estados.get(id) : undefined;
            const isAtual = i === indiceAtual;
            const respondida = Boolean(estado?.confirmada);
            const rascunho =
              Boolean(estado?.selecionada) && !estado?.confirmada;
            const revisao = Boolean(estado?.marcadaRevisao);

            let ariaLabel = `Questão ${i + 1}, em branco`;
            if (isProva) {
              if (respondida && revisao) {
                ariaLabel = `Questão ${i + 1}, respondida, marcada para revisão`;
              } else if (respondida) {
                ariaLabel = `Questão ${i + 1}, respondida`;
              } else if (revisao) {
                ariaLabel = `Questão ${i + 1}, em branco, marcada para revisão`;
              } else if (rascunho) {
                ariaLabel = `Questão ${i + 1}, alternativa selecionada não confirmada`;
              }
            } else if (respondida) {
              ariaLabel = `Questão ${i + 1}, ${estado?.acertou ? "acertou" : "errou"}`;
            } else if (rascunho) {
              ariaLabel = `Questão ${i + 1}, alternativa selecionada não confirmada`;
            }

            return (
              <li key={id ?? i} className="relative">
                <button
                  type="button"
                  onClick={() => onIrPara(i)}
                  aria-current={isAtual ? "step" : undefined}
                  aria-label={ariaLabel}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md text-xs font-medium tabular-nums transition-colors",
                    "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    isProva &&
                      isAtual &&
                      "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 ring-offset-background",
                    isProva &&
                      !isAtual &&
                      respondida &&
                      !revisao &&
                      "bg-foreground/85 text-background hover:bg-foreground",
                    isProva &&
                      !isAtual &&
                      respondida &&
                      revisao &&
                      "bg-semaforo-amarelo/90 text-foreground hover:bg-semaforo-amarelo",
                    isProva &&
                      !isAtual &&
                      !respondida &&
                      revisao &&
                      "bg-semaforo-amarelo/20 text-foreground ring-1 ring-semaforo-amarelo/50 hover:bg-semaforo-amarelo/30",
                    isProva &&
                      !isAtual &&
                      !respondida &&
                      !revisao &&
                      rascunho &&
                      "bg-semaforo-amarelo/15 text-foreground ring-1 ring-semaforo-amarelo/40",
                    isProva &&
                      !isAtual &&
                      !respondida &&
                      !revisao &&
                      !rascunho &&
                      "border border-border bg-card text-muted-foreground hover:bg-muted",
                    !isProva &&
                      isAtual &&
                      !rascunho &&
                      "bg-primary text-primary-foreground",
                    !isProva &&
                      isAtual &&
                      rascunho &&
                      "bg-semaforo-amarelo/25 text-foreground ring-2 ring-primary ring-offset-1 ring-offset-background",
                    !isProva &&
                      !isAtual &&
                      !respondida &&
                      !rascunho &&
                      "bg-muted/80 text-muted-foreground hover:bg-muted",
                    !isProva &&
                      !isAtual &&
                      rascunho &&
                      "bg-semaforo-amarelo/15 text-foreground ring-1 ring-semaforo-amarelo/40 hover:bg-semaforo-amarelo/25",
                    !isProva &&
                      !isAtual &&
                      respondida &&
                      estado?.acertou &&
                      "bg-semaforo-verde/15 text-semaforo-verde hover:bg-semaforo-verde/25",
                    !isProva &&
                      !isAtual &&
                      respondida &&
                      !estado?.acertou &&
                      "bg-semaforo-vermelho/15 text-semaforo-vermelho hover:bg-semaforo-vermelho/25",
                  )}
                >
                  {i + 1}
                </button>
                {isProva && revisao && !isAtual && (
                  <Flag
                    className="pointer-events-none absolute -top-1 -right-0.5 size-2.5 text-semaforo-amarelo"
                    aria-hidden
                    fill="currentColor"
                  />
                )}
              </li>
            );
          })}
        </ol>
        {isProva && (
          <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
            <li className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm border border-border bg-card" />
              Em branco
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-foreground/85" />
              Respondida
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-semaforo-amarelo/90" />
              Revisão
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-primary" />
              Atual
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}
