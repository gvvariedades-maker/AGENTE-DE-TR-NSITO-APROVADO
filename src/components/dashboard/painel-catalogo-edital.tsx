"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import { TopicoRow } from "@/components/estudo/topicos-catalogo";
import { TopicosCatalogo } from "@/components/estudo/topicos-catalogo";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type TopicosDisciplinaResumo,
} from "@/lib/topicos-catalogo-shared";
import { DISCIPLINA_LABELS } from "@/types";
import type { DesempenhoDisciplina } from "@/lib/desempenho";

interface PainelCatalogoEditalProps {
  resumo: TopicosDisciplinaResumo;
  desempenhoDisciplina?: DesempenhoDisciplina;
}

export function PainelCatalogoEdital({
  resumo,
  desempenhoDisciplina,
}: PainelCatalogoEditalProps) {
  const { disciplina } = resumo;
  const [busca, setBusca] = useState("");
  const isTransito = disciplina === "legislacao_transito";

  const resultadosBusca = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return [];
    return resumo.topicos.filter(
      (t) =>
        t.estudavel &&
        (t.label.toLowerCase().includes(q) ||
          t.slug.toLowerCase().includes(q) ||
          (t.editalRef?.toLowerCase().includes(q) ?? false)),
    );
  }, [busca, resumo.topicos]);

  const taxaLabel =
    desempenhoDisciplina && desempenhoDisciplina.tentativas > 0
      ? `${desempenhoDisciplina.taxaAcerto}% acerto`
      : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <CardTitle className="text-base">
              {DISCIPLINA_LABELS[disciplina]}
            </CardTitle>
            <CardDescription>Escolha um assunto e comece agora</CardDescription>
          </div>
          <Link
            href={`/estudo?disciplina=${disciplina}&modo=auto`}
            className={cn(
              buttonVariants({ size: "sm" }),
              "shrink-0",
              isTransito && "bg-transito hover:bg-transito/90",
            )}
          >
            Estudar questões
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "tabular-nums",
                isTransito && "border-transito/40 text-transito-foreground",
              )}
            >
              {resumo.totalEstudaveis} estudáveis
            </Badge>
            {resumo.coberturaPct > 0 && (
              <Badge variant="secondary" className="tabular-nums">
                {resumo.coberturaPct}% coberto
              </Badge>
            )}
            {taxaLabel && (
              <span className="text-xs text-muted-foreground">{taxaLabel}</span>
            )}
        </div>

        <div className="relative">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder={`Buscar em ${DISCIPLINA_LABELS[disciplina]}…`}
            className={cn(
              "h-10 w-full rounded-lg border border-border bg-background pr-3 pl-9 text-sm",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
            )}
          />
        </div>

        {busca.trim() ? (
          <ul className="flex max-h-72 flex-col gap-1.5 overflow-y-auto">
            {resultadosBusca.length === 0 ? (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Nenhum assunto para “{busca.trim()}”.
              </li>
            ) : (
              resultadosBusca.map((topico) => (
                <li key={topico.id}>
                  <TopicoRow topico={topico} disciplina={disciplina} />
                </li>
              ))
            )}
          </ul>
        ) : resumo.totalMapeados > 0 ? (
          <details className="group rounded-lg border border-border" open>
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                Todos os assuntos ({resumo.totalMapeados})
                <span
                  className={cn(
                    "inline-flex shrink-0 items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-semibold transition-colors group-open:hidden",
                    isTransito
                      ? "border-transito/40 bg-transito/10 text-transito-foreground"
                      : "border-primary/30 bg-primary/10 text-primary",
                  )}
                >
                  Expandir assuntos
                  <ChevronDown className="size-3.5" aria-hidden />
                </span>
                <span
                  className={cn(
                    "hidden shrink-0 items-center gap-1 text-xs font-medium group-open:inline-flex",
                    isTransito ? "text-transito-foreground" : "text-primary",
                  )}
                >
                  Ocultar assuntos
                  <ChevronDown className="size-3.5 rotate-180" aria-hidden />
                </span>
              </span>
            </summary>
            <div className="border-t border-border px-2 pb-3 pt-2">
              <TopicosCatalogo resumo={resumo} ocultarBusca />
            </div>
          </details>
        ) : (
          <p className="text-sm text-muted-foreground">
            Nenhum assunto com questões nesta disciplina ainda.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
