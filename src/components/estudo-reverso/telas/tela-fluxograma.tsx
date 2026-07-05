import type { ConteudoFluxograma } from "@/types/estudo-reverso-visual";
import { cn } from "@/lib/utils";

const TIPO_STYLES = {
  pergunta: "border-amber-500/50 bg-amber-500/10",
  acao: "border-border bg-muted/50",
  lei: "border-transito/50 bg-transito/10",
  resultado: "border-semaforo-verde/50 bg-semaforo-verde/10",
};

export function TelaFluxograma({ conteudo }: { conteudo: ConteudoFluxograma }) {
  return (
    <div>
      <ol className="flex flex-col gap-2" aria-label="Fluxo de raciocínio">
        {conteudo.nos.map((no, i) => {
          const aresta = conteudo.arestas.find((a) => a.para === no.id);
          return (
            <li key={no.id} className="flex flex-col gap-1">
              {aresta?.rotulo && (
                <span className="text-xs text-muted-foreground pl-2">
                  ↳ {aresta.rotulo}
                </span>
              )}
              <div
                className={cn(
                  "rounded-lg border px-3 py-2 text-sm",
                  TIPO_STYLES[no.tipo],
                )}
              >
                <span className="font-medium">{i + 1}. </span>
                {no.label}
                {no.ref && (
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {no.ref}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <svg
        className="sr-only"
        role="img"
        aria-label={conteudo.nos.map((n) => n.label).join(" → ")}
      />
    </div>
  );
}
