"use client";

import { useEffect, useState } from "react";
import { CircleHelp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  ITENS_GUIA_DISCIPLINAS,
  STORAGE_GUIA_DISCIPLINAS,
} from "@/lib/disciplinas-guia";

export function PainelDisciplinasGuia() {
  const [aberto, setAberto] = useState(false);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    try {
      setAberto(localStorage.getItem(STORAGE_GUIA_DISCIPLINAS) !== "1");
    } catch {
      setAberto(true);
    }
  }, []);

  function ocultar() {
    try {
      localStorage.setItem(STORAGE_GUIA_DISCIPLINAS, "1");
    } catch {
      /* storage indisponível */
    }
    setAberto(false);
  }

  function reabrir() {
    setAberto(true);
  }

  if (!montado) {
    return null;
  }

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={reabrir}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-auto w-full justify-start gap-2 px-0 py-1 text-xs text-muted-foreground hover:text-foreground",
        )}
      >
        <CircleHelp className="size-3.5 shrink-0" aria-hidden />
        Como usar disciplinas e assuntos?
      </button>
    );
  }

  return (
    <section
      aria-labelledby="guia-disciplinas-titulo"
      className="rounded-lg border border-transito/25 bg-background/80"
    >
      <div className="flex items-start justify-between gap-2 border-b border-transito/15 px-3 py-2.5 sm:px-4">
        <div className="flex min-w-0 items-start gap-2">
          <CircleHelp
            className="mt-0.5 size-4 shrink-0 text-transito"
            aria-hidden
          />
          <div>
            <h3
              id="guia-disciplinas-titulo"
              className="text-sm font-semibold text-foreground"
            >
              Como estudar por disciplina
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Escolha a matéria, depois o assunto — ou use Estudar questões
              para montar a fila.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={ocultar}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Ocultar guia"
        >
          <X className="size-4" />
        </button>
      </div>

      <ol className="divide-y divide-border/80 px-3 py-1 sm:px-4">
        {ITENS_GUIA_DISCIPLINAS.map((item, i) => (
          <li key={item.id} className="py-2.5">
            <p className="text-sm font-medium text-foreground">
              <span className="mr-1.5 tabular-nums text-muted-foreground">
                {i + 1}.
              </span>
              {item.titulo}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {item.descricao}
            </p>
          </li>
        ))}
      </ol>

      <div className="border-t border-transito/15 px-3 py-2.5 sm:px-4">
        <button
          type="button"
          onClick={ocultar}
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "w-full sm:w-auto",
          )}
        >
          Entendi — escolher disciplina
        </button>
      </div>
    </section>
  );
}
