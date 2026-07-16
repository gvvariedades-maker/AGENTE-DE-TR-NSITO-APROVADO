"use client";

import type { CSSProperties } from "react";
import { useCallback, useState } from "react";
import type { ConteudoMatrizAssertivas, ItemAssertiva } from "@/types/estudo-reverso-visual";
import { cn } from "@/lib/utils";
import { Check, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TelaConteudoShell } from "./tela-conteudo-shell";
import { TextoSegmentado } from "./texto-segmentado";

type RespostaUsuario = "certo" | "errado";

/** Remove julgamento embutido no JSON (ex.: "— correta", "— ERRADA") antes da resposta. */
function textoAntesDaResposta(texto: string): string {
  const semJulgamento = texto.replace(
    /\s*[—–-]\s*(correta|incorreta|errada)\b.*$/i,
    "",
  );
  return semJulgamento.trim() || texto;
}

function ItemRecall({
  item,
  index,
  onResposta,
}: {
  item: ItemAssertiva;
  index: number;
  onResposta: (id: string) => void;
}) {
  const [resposta, setResposta] = useState<RespostaUsuario | null>(null);
  const revelado = resposta !== null;
  const acertou =
    revelado &&
    ((resposta === "certo" && item.correto) ||
      (resposta === "errado" && !item.correto));

  const responder = (valor: RespostaUsuario) => {
    if (revelado) return;
    setResposta(valor);
    onResposta(item.id);
  };

  return (
    <li
      className={cn(
        "revelar-item rounded-xl border bg-card px-3.5 py-3.5 shadow-sm transition-colors",
        !revelado && "border-border/80",
        revelado &&
          acertou &&
          "border-semaforo-verde/50 bg-semaforo-verde/[0.03]",
        revelado &&
          !acertou &&
          "border-semaforo-vermelho/40 bg-semaforo-vermelho/[0.03]",
      )}
      style={{ "--i": index } as CSSProperties}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            !revelado && "bg-transito/15 text-transito-foreground",
            revelado && acertou && "bg-semaforo-verde/15 text-semaforo-verde",
            revelado && !acertou && "bg-semaforo-vermelho/15 text-semaforo-vermelho",
          )}
          aria-hidden
        >
          {item.id}
        </span>
        <div className="min-w-0 flex-1 space-y-3">
          <p className="text-[15px] leading-relaxed text-foreground">
            {revelado ? item.texto : textoAntesDaResposta(item.texto)}
          </p>

          {!revelado ? (
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 border-semaforo-verde/40 text-semaforo-verde hover:bg-semaforo-verde/10"
                onClick={() => responder("certo")}
              >
                Certo
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 border-semaforo-vermelho/40 text-semaforo-vermelho hover:bg-semaforo-vermelho/10"
                onClick={() => responder("errado")}
              >
                Errado
              </Button>
            </div>
          ) : (
            <div
              className={cn(
                "flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm",
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
                  Assertiva {item.correto ? "correta" : "incorreta"}
                  <span
                    className={cn(
                      "ml-1.5 text-xs font-normal",
                      acertou ? "text-semaforo-verde" : "text-semaforo-vermelho",
                    )}
                  >
                    {acertou ? "· você acertou" : "· você errou"}
                  </span>
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
  const total = conteudo.itens.length;
  const [respondidos, setRespondidos] = useState<Set<string>>(() => new Set());

  const marcarRespondido = useCallback((id: string) => {
    setRespondidos((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const todosRespondidos = respondidos.size >= total;
  const faltam = total - respondidos.size;

  return (
    <div className="space-y-3">
      {conteudo.intro && (
        <TelaConteudoShell>
          <TextoSegmentado texto={conteudo.intro} />
        </TelaConteudoShell>
      )}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Leia cada assertiva e marque se é{" "}
          <span className="font-medium text-foreground">juridicamente correta</span>{" "}
          ou incorreta.
        </p>
        <span
          className={cn(
            "shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
            todosRespondidos
              ? "bg-semaforo-verde/10 text-semaforo-verde"
              : "bg-muted text-muted-foreground",
          )}
        >
          {respondidos.size}/{total}
        </span>
      </div>
      <ul className="space-y-2.5" aria-label="Recall interativo">
        {conteudo.itens.map((item, i) => (
          <ItemRecall
            key={item.id}
            item={item}
            index={i}
            onResposta={marcarRespondido}
          />
        ))}
      </ul>
      {todosRespondidos ? (
        <div
          className="revelar-item"
          style={{ "--i": total } as CSSProperties}
        >
          <TelaConteudoShell variant="lei" className="py-3">
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Gabarito da questão
            </p>
            <p
              className="text-sm font-semibold leading-relaxed text-transito-foreground"
              aria-live="polite"
            >
              {conteudo.gabarito_resumo}
            </p>
          </TelaConteudoShell>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-border/80 bg-muted/20 px-3.5 py-3">
          <Lock className="size-4 shrink-0 text-muted-foreground" aria-hidden />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {faltam === 1
              ? "Falta 1 assertiva — a alternativa correta só aparece no final."
              : `Faltam ${faltam} assertivas — a alternativa correta só aparece no final.`}
          </p>
        </div>
      )}
    </div>
  );
}
