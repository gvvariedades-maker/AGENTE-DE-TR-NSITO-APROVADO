"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { hrefEstudoTopico } from "@/lib/estudo-links";
import {
  agruparTopicos,
  type TopicoCatalogo,
  type TopicosDisciplinaResumo,
} from "@/lib/topicos-catalogo-shared";
import { DISCIPLINA_LABELS, type Disciplina } from "@/types";

interface TopicosCatalogoProps {
  resumo: TopicosDisciplinaResumo;
}

function TopicoRow({
  topico,
  disciplina,
}: {
  topico: TopicoCatalogo;
  disciplina: Disciplina;
}) {
  const isTransito = disciplina === "legislacao_transito";

  if (!topico.estudavel) {
    return (
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-lg border border-dashed px-4 py-3 text-sm opacity-60",
          "border-border bg-muted/20",
        )}
      >
        <span className="min-w-0 leading-snug text-muted-foreground">
          {topico.label}
        </span>
        <Badge variant="outline" className="shrink-0 text-xs">
          Em breve
        </Badge>
      </div>
    );
  }

  return (
    <Link
      href={hrefEstudoTopico(topico.slug, disciplina)}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition-colors",
        "hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        isTransito
          ? "border-transito/20 bg-card/50 hover:bg-transito/5"
          : "border-border bg-card/50",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="leading-snug">{topico.label}</p>
        {topico.tentativas > 0 && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {topico.tentativas} tentativas · {topico.taxaAcerto}% acerto
          </p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="secondary" className="tabular-nums text-xs">
          {topico.questoesCount}Q
        </Badge>
        <ChevronRight className="size-4 text-muted-foreground" aria-hidden />
      </div>
    </Link>
  );
}

export function TopicosCatalogo({ resumo }: TopicosCatalogoProps) {
  const [busca, setBusca] = useState("");
  const { disciplina, topicos } = resumo;
  const mostrarBusca = topicos.length > 12;

  const topicosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return topicos;
    return topicos.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.slug.toLowerCase().includes(q) ||
        (t.editalRef?.toLowerCase().includes(q) ?? false),
    );
  }, [busca, topicos]);

  const grupos = useMemo(
    () => agruparTopicos(topicosFiltrados, disciplina),
    [topicosFiltrados, disciplina],
  );

  return (
    <div className="flex flex-col gap-4">
      {mostrarBusca && (
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
      )}

      {grupos.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Nenhum microtópico encontrado
          {busca ? ` para “${busca}”` : ""}.
        </p>
      ) : (
        grupos.map(({ grupo, topicos: lista }) => (
          <section key={grupo} className="flex flex-col gap-2">
            <h2 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              {grupo}
              <span className="ml-2 font-normal normal-case tabular-nums">
                ({lista.length})
              </span>
            </h2>
            <ul className="flex flex-col gap-1.5">
              {lista.map((topico) => (
                <li key={topico.id}>
                  <TopicoRow topico={topico} disciplina={disciplina} />
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
