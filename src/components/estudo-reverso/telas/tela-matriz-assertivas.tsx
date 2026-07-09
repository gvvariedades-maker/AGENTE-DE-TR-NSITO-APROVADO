"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import type { ConteudoMatrizAssertivas, ItemAssertiva } from "@/types/estudo-reverso-visual";
import { cn } from "@/lib/utils";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type RespostaUsuario = "certo" | "errado";

function ItemRecall({
  item,
  index,
}: {
  item: ItemAssertiva;
  index: number;
}) {
  const [resposta, setResposta] = useState<RespostaUsuario | null>(null);
  const revelado = resposta !== null;
  const acertou =
    revelado &&
    ((resposta === "certo" && item.correto) ||
      (resposta === "errado" && !item.correto));

  return (
    <li
      className="revelar-item rounded-xl border border-border bg-card px-3 py-3"
      style={{ "--i": index } as CSSProperties}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground"
          aria-hidden
        >
          {item.id}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <p
            className={cn(
              "text-sm leading-snug text-foreground transition-opacity",
              !revelado && "select-none blur-[3px]",
            )}
            aria-hidden={!revelado}
          >
            {item.texto}
          </p>

          {!revelado ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 border-semaforo-verde/40 text-semaforo-verde hover:bg-semaforo-verde/10"
                onClick={() => setResposta("certo")}
              >
                Certo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 border-semaforo-vermelho/40 text-semaforo-vermelho hover:bg-semaforo-vermelho/10"
                onClick={() => setResposta("errado")}
              >
                Errado
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                "flex items-start gap-2 rounded-lg border px-2.5 py-2 text-sm",
                item.correto
                  ? "border-semaforo-verde/40 bg-semaforo-verde/5"
                  : "border-border bg-muted/30",
              )}
              role="status"
            >
              {item.correto ? (
                <Check className="mt-0.5 size-4 shrink-0 text-semaforo-verde" aria-hidden />
              ) : (
                <X className="mt-0.5 size-4 shrink-0 text-semaforo-vermelho" aria-hidden />
              )}
              <div className="space-y-1">
                <p className="font-medium text-foreground">
                  {item.correto ? "Correto" : "Incorreto"}
                  {acertou !== null && (
                    <span
                      className={cn(
                        "ml-1.5 text-xs font-normal",
                        acertou ? "text-semaforo-verde" : "text-semaforo-vermelho",
                      )}
                    >
                      {acertou ? "· você acertou" : "· você errou"}
                    </span>
                  )}
                </p>
                {item.porque && (
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    {item.porque}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </li>
  );
}

export function TelaMatrizAssertivas({
  conteudo,
}: {
  conteudo: ConteudoMatrizAssertivas;
}) {
  return (
    <div className="space-y-3">
      {conteudo.intro && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {conteudo.intro}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Toque em Certo ou Errado antes de ver o gabarito (testing effect).
      </p>
      <ul className="space-y-2" aria-label="Recall interativo">
        {conteudo.itens.map((item, i) => (
          <ItemRecall key={item.id} item={item} index={i} />
        ))}
      </ul>
      <p
        className="text-sm font-medium text-transito-foreground"
        aria-live="polite"
      >
        {conteudo.gabarito_resumo}
      </p>
    </div>
  );
}
