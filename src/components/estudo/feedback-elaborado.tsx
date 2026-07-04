"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ComentarioQuestao } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface FeedbackElaboradoProps {
  acertou: boolean;
  gabarito: string;
  comentario: ComentarioQuestao;
}

/**
 * Feedback adaptativo (Frontiers 2021): acerto = KR breve; erro = EF progressivo.
 * Divulgação progressiva reduz carga extrínseca (CLT).
 */
export function FeedbackElaborado({
  acertou,
  gabarito,
  comentario,
}: FeedbackElaboradoProps) {
  const [passo, setPasso] = useState(acertou ? 0 : 1);

  if (acertou) {
    return (
      <Card className="border-semaforo-verde/35 bg-semaforo-verde/5">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base text-semaforo-verde">
              Correto
            </CardTitle>
            <Badge
              variant="outline"
              className="border-semaforo-verde/50 text-semaforo-verde"
            >
              Gabarito {gabarito}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Boa recuperação ativa. Reforce em{" "}
            <span className="font-medium text-foreground">3 dias</span> via
            estudo reverso.
          </p>
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-medium text-foreground">
              Ver fundamento legal
            </summary>
            <p className="mt-2 text-muted-foreground">
              {comentario.fundamento_legal}
            </p>
          </details>
        </CardContent>
      </Card>
    );
  }

  const etapas = [
    {
      titulo: "Resultado",
      conteudo: (
        <p className="text-sm">
          Sua resposta não confere. O gabarito é{" "}
          <span className="font-semibold">{gabarito}</span>.
        </p>
      ),
    },
    {
      titulo: "Fundamento legal",
      conteudo: (
        <p className="text-sm leading-relaxed">{comentario.fundamento_legal}</p>
      ),
    },
    {
      titulo: "Passo a passo",
      conteudo: (
        <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
          {comentario.passo_a_passo.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ol>
      ),
    },
    {
      titulo: "Pegadinha IDECAN",
      conteudo: (
        <p className="text-sm leading-relaxed">{comentario.pegadinha}</p>
      ),
    },
    {
      titulo: "Macete + estudo reverso",
      conteudo: (
        <div className="space-y-3 text-sm">
          <p className="font-medium text-foreground">{comentario.macete}</p>
          <div className="flex flex-wrap gap-1.5">
            {comentario.estudo_reverso.map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      ),
    },
  ];

  const maxPasso = etapas.length - 1;

  return (
    <Card className="border-semaforo-vermelho/35 bg-semaforo-vermelho/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-semaforo-vermelho">
          Incorreto — feedback elaborado
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Um bloco por vez para fixar o conteúdo (carga cognitiva controlada)
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex gap-1">
          {etapas.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1 flex-1 rounded-full",
                i <= passo ? "bg-transito" : "bg-muted",
              )}
              aria-hidden
            />
          ))}
        </div>

        <div className="rounded-lg border border-border bg-card/60 p-4">
          <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {etapas[passo].titulo}
          </p>
          {etapas[passo].conteudo}
        </div>

        {passo < maxPasso ? (
          <button
            type="button"
            onClick={() => setPasso((p) => p + 1)}
            className="flex items-center justify-center gap-1 text-sm font-medium text-transito-foreground"
          >
            Próximo bloco
            <ChevronRight className="size-4" aria-hidden />
          </button>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Revise os tópicos acima em 24h para consolidar.
          </p>
        )}

        {passo > 0 && (
          <button
            type="button"
            onClick={() => setPasso((p) => p - 1)}
            className="flex items-center gap-1 text-xs text-muted-foreground"
          >
            <ChevronDown className="size-3 rotate-90" aria-hidden />
            Bloco anterior
          </button>
        )}
      </CardContent>
    </Card>
  );
}
