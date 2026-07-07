"use client";

import { cn } from "@/lib/utils";
import type { EstadoQuestao } from "@/lib/estado-questao";

interface MapaQuestoesProps {
  total: number;
  indiceAtual: number;
  questaoIds: string[];
  estados: Map<string, EstadoQuestao>;
  onIrPara: (indice: number) => void;
}

export function MapaQuestoes({
  total,
  indiceAtual,
  questaoIds,
  estados,
  onIrPara,
}: MapaQuestoesProps) {
  return (
    <nav
      className="px-4 pb-2.5"
      aria-label="Mapa de questões da sessão"
    >
      <div className="mx-auto max-w-3xl">
        <ol className="flex flex-wrap justify-center gap-1 sm:justify-start">
          {Array.from({ length: total }, (_, i) => {
            const id = questaoIds[i];
            const estado = id ? estados.get(id) : undefined;
            const isAtual = i === indiceAtual;
            const respondida = estado?.confirmada;
            const rascunho =
              Boolean(estado?.selecionada) && !estado?.confirmada;

            let ariaLabel = `Questão ${i + 1}, não respondida`;
            if (respondida) {
              ariaLabel = `Questão ${i + 1}, ${estado?.acertou ? "acertou" : "errou"}`;
            } else if (rascunho) {
              ariaLabel = `Questão ${i + 1}, alternativa selecionada não confirmada`;
            }

            return (
              <li key={id ?? i}>
                <button
                  type="button"
                  onClick={() => onIrPara(i)}
                  aria-current={isAtual ? "step" : undefined}
                  aria-label={ariaLabel}
                  className={cn(
                    "flex size-8 items-center justify-center rounded-md text-xs font-medium tabular-nums transition-colors",
                    "focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    isAtual &&
                      !rascunho &&
                      "bg-primary text-primary-foreground",
                    isAtual &&
                      rascunho &&
                      "bg-semaforo-amarelo/25 text-foreground ring-2 ring-primary ring-offset-1 ring-offset-background",
                    !isAtual &&
                      !respondida &&
                      !rascunho &&
                      "bg-muted/80 text-muted-foreground hover:bg-muted",
                    !isAtual &&
                      rascunho &&
                      "bg-semaforo-amarelo/15 text-foreground ring-1 ring-semaforo-amarelo/40 hover:bg-semaforo-amarelo/25",
                    !isAtual &&
                      respondida &&
                      estado?.acertou &&
                      "bg-semaforo-verde/15 text-semaforo-verde hover:bg-semaforo-verde/25",
                    !isAtual &&
                      respondida &&
                      !estado?.acertou &&
                      "bg-semaforo-vermelho/15 text-semaforo-vermelho hover:bg-semaforo-vermelho/25",
                  )}
                >
                  {i + 1}
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}
