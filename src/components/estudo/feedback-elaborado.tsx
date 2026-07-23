"use client";

import { useState } from "react";
import { Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ComentarioQuestao } from "@/types";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  dominioAlcancado?: boolean;
  tipoErroLabel?: string;
  /** Frase específica da alternativa (diagnóstico Fase 1). */
  diagnosticoFrase?: string | null;
}

/**
 * Feedback elaborado (Frontiers 2021): divulgação progressiva em blocos.
 * Sem etapa "Resultado" — gabarito já visível nas alternativas reveladas.
 */
export function FeedbackElaborado({
  acertou,
  gabarito,
  comentario,
  dominioAlcancado,
  tipoErroLabel,
  diagnosticoFrase,
}: FeedbackElaboradoProps) {
  const [passo, setPasso] = useState(0);

  const etapas = acertou
    ? [
        {
          titulo: "Fundamento legal",
          conteudo: (
            <p className="text-sm leading-relaxed">
              {comentario.fundamento_legal}
            </p>
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
          titulo: "Macete",
          conteudo: (
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">
                {comentario.macete}
              </p>
              {comentario.estudo_reverso.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {comentario.estudo_reverso.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ),
        },
      ]
    : [
        {
          titulo: "Fundamento legal",
          conteudo: (
            <p className="text-sm leading-relaxed">
              {comentario.fundamento_legal}
            </p>
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
          titulo: "Macete",
          conteudo: (
            <div className="space-y-2 text-sm">
              <p className="font-medium text-foreground">
                {comentario.macete}
              </p>
              {comentario.estudo_reverso.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {comentario.estudo_reverso.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ),
        },
      ];

  const maxPasso = etapas.length - 1;

  return (
    <Card
      className={cn(
        "gap-0 py-4 shadow-none",
        acertou
          ? "border-semaforo-verde/30 bg-semaforo-verde/5"
          : "border-semaforo-vermelho/30 bg-semaforo-vermelho/5",
      )}
    >
      <CardHeader className="gap-1 px-4 pb-3">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          {acertou ? (
            <Check className="size-4 shrink-0 text-semaforo-verde" aria-hidden />
          ) : (
            <X className="size-4 shrink-0 text-semaforo-vermelho" aria-hidden />
          )}
          <CardTitle
            className={cn(
              "text-sm font-semibold",
              acertou ? "text-semaforo-verde" : "text-semaforo-vermelho",
            )}
          >
            {acertou ? "Correto" : "Incorreto"}
          </CardTitle>
          {!acertou && (
            <span className="text-sm text-muted-foreground">
              · Gabarito{" "}
              <span className="font-semibold text-foreground">{gabarito}</span>
            </span>
          )}
          {dominioAlcancado && (
            <Badge
              variant="outline"
              className="border-semaforo-verde/50 text-semaforo-verde"
            >
              Assunto dominado
            </Badge>
          )}
          {tipoErroLabel && (
            <Badge variant="outline" className="ml-auto text-xs">
              {tipoErroLabel}
            </Badge>
          )}
        </div>
        {diagnosticoFrase && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {diagnosticoFrase}
          </p>
        )}
        <div className="flex gap-1 pt-1">
          {etapas.map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-0.5 flex-1 rounded-full",
                i <= passo ? "bg-transito" : "bg-muted",
              )}
              aria-hidden
            />
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-3 px-4">
        <div>
          <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {etapas[passo].titulo}
          </p>
          {etapas[passo].conteudo}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setPasso((p) => p - 1)}
            disabled={passo === 0}
          >
            <ChevronLeft className="size-4" aria-hidden />
            Anterior
          </Button>

          {passo < maxPasso ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPasso((p) => p + 1)}
            >
              Próximo
              <ChevronRight className="size-4" aria-hidden />
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">
              {passo + 1}/{etapas.length}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
