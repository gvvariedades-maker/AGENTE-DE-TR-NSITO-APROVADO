"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
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
  priorizarTopicosEstudo,
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

  const sugeridos = useMemo(
    () => priorizarTopicosEstudo(resumo.topicos),
    [resumo.topicos],
  );

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
          <div>
            <CardTitle className="text-base">
              Microtópicos · {DISCIPLINA_LABELS[disciplina]}
            </CardTitle>
            <CardDescription>Escolha um tópico e comece agora</CardDescription>
          </div>
          <Link
            href={`/estudo/catalogo?disciplina=${disciplina}`}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-primary",
            )}
          >
            Catálogo completo →
          </Link>
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
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
          <Link
            href={`/estudo?disciplina=${disciplina}&modo=auto`}
            className={cn(
              buttonVariants({ size: "sm" }),
              isTransito && "bg-transito hover:bg-transito/90",
            )}
          >
            Motor ATA · tudo
          </Link>
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
                Nenhum microtópico para “{busca.trim()}”.
              </li>
            ) : (
              resultadosBusca.map((topico) => (
                <li key={topico.id}>
                  <TopicoRow topico={topico} disciplina={disciplina} />
                </li>
              ))
            )}
          </ul>
        ) : (
          <>
            <section aria-labelledby="sugeridos-titulo">
              <h3
                id="sugeridos-titulo"
                className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase"
              >
                Sugeridos para você
              </h3>
              {sugeridos.length === 0 ? (
              resumo.totalMapeados > 0 ? (
                <p className="mb-3 text-sm text-muted-foreground">
                  Nenhum microtópico com questões carregado ainda. Veja o
                  catálogo completo abaixo ou tente atualizar a página.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum microtópico com questões nesta disciplina ainda.
                </p>
              )
            ) : (
                <ul className="flex flex-col gap-1.5">
                  {sugeridos.map((topico) => (
                    <li key={topico.id}>
                      <TopicoRow topico={topico} disciplina={disciplina} />
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {(resumo.topicos.length > sugeridos.length ||
              (sugeridos.length === 0 && resumo.totalMapeados > 0)) && (
              <details
                className="group rounded-lg border border-border"
                open={sugeridos.length === 0 && resumo.totalMapeados > 0}
              >
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-2">
                    Todos os microtópicos ({resumo.totalMapeados})
                    <span className="text-xs font-normal text-muted-foreground group-open:hidden">
                      expandir
                    </span>
                  </span>
                </summary>
                <div className="border-t border-border px-2 pb-3 pt-2">
                  <TopicosCatalogo resumo={resumo} />
                </div>
              </details>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
