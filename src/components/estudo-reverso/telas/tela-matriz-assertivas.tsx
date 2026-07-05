import type { ConteudoMatrizAssertivas } from "@/types/estudo-reverso-visual";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";

export function TelaMatrizAssertivas({
  conteudo,
}: {
  conteudo: ConteudoMatrizAssertivas;
}) {
  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {conteudo.itens.map((item) => (
          <li
            key={item.id}
            className={cn(
              "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
              item.correto
                ? "border-semaforo-verde/40 bg-semaforo-verde/5"
                : "border-semaforo-vermelho/40 bg-semaforo-vermelho/5",
            )}
          >
            {item.correto ? (
              <Check className="mt-0.5 size-4 shrink-0 text-semaforo-verde" />
            ) : (
              <X className="mt-0.5 size-4 shrink-0 text-semaforo-vermelho" />
            )}
            <span>
              <strong>{item.id}.</strong> {item.texto}
            </span>
          </li>
        ))}
      </ul>
      <p className="text-sm font-medium text-transito-foreground">
        {conteudo.gabarito_resumo}
      </p>
    </div>
  );
}
