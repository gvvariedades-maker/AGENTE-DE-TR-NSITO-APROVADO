import type { CSSProperties } from "react";
import type { ConteudoFluxograma } from "@/types/estudo-reverso-visual";
import { ordenarNosFluxogramaLinear } from "@/lib/estudo-reverso/fluxograma-caminho";
import { cn } from "@/lib/utils";

const TIPO_STYLES = {
  pergunta: "border-amber-500/40 bg-amber-500/10",
  acao: "border-border bg-card",
  lei: "border-transito/40 bg-transito/10",
  resultado: "border-semaforo-verde/40 bg-semaforo-verde/10",
};

export function TelaFluxograma({ conteudo }: { conteudo: ConteudoFluxograma }) {
  const nosOrdenados = ordenarNosFluxogramaLinear(conteudo);

  return (
    <ol
      className="relative flex flex-col gap-3 pl-1"
      aria-label="Fluxo de raciocínio"
    >
      {nosOrdenados.map((no, i) => {
        const aresta = conteudo.arestas.find((a) => a.para === no.id);
        const ultimo = i === nosOrdenados.length - 1;
        return (
          <li
            key={no.id}
            className="revelar-item relative flex gap-3"
            style={{ "--i": i } as CSSProperties}
          >
            <div className="flex flex-col items-center">
              <span
                className="flex size-7 shrink-0 items-center justify-center rounded-full bg-transito text-xs font-bold text-white shadow-sm"
                aria-hidden
              >
                {i + 1}
              </span>
              {!ultimo && (
                <span
                  className="mt-1 w-px flex-1 min-h-3 bg-border"
                  aria-hidden
                />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-1 pb-1">
              {aresta?.rotulo && (
                <span className="text-xs font-medium text-muted-foreground">
                  {aresta.rotulo}
                </span>
              )}
              <div
                className={cn(
                  "rounded-xl border px-3.5 py-3 text-[15px] leading-relaxed shadow-sm",
                  TIPO_STYLES[no.tipo],
                )}
              >
                {no.label}
                {no.ref && (
                  <span className="mt-1.5 block text-xs text-muted-foreground">
                    {no.ref}
                  </span>
                )}
              </div>
            </div>
          </li>
        );
      })}
      <svg
        className="sr-only"
        role="img"
        aria-label={nosOrdenados.map((n) => n.label).join(" → ")}
      />
    </ol>
  );
}
