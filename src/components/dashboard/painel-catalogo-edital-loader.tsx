"use client";

import { useCallback, useEffect, useState } from "react";
import { PainelCatalogoEdital } from "@/components/dashboard/painel-catalogo-edital";
import { PainelCatalogoSkeleton } from "@/components/dashboard/painel-catalogo-skeleton";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TopicosDisciplinaResumo } from "@/lib/topicos-catalogo-shared";
import { DISCIPLINA_LABELS, type Disciplina } from "@/types";
import type { DesempenhoDisciplina } from "@/lib/desempenho";
import { cn } from "@/lib/utils";

interface PainelCatalogoEditalLoaderProps {
  disciplina: Disciplina;
  desempenhoDisciplina?: DesempenhoDisciplina;
}

export function PainelCatalogoEditalLoader({
  disciplina,
  desempenhoDisciplina,
}: PainelCatalogoEditalLoaderProps) {
  const [resumo, setResumo] = useState<TopicosDisciplinaResumo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const retry = useCallback(() => {
    setReloadKey((k) => k + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    async function load() {
      setLoading(true);
      setError(false);

      try {
        const res = await fetch(
          `/api/catalogo/topicos?disciplina=${encodeURIComponent(disciplina)}`,
          { credentials: "include", signal: controller.signal },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as TopicosDisciplinaResumo;
        const isFallbackEstatico =
          data.totalEstudaveis === 0 &&
          data.topicos.length > 0 &&
          data.topicos.every((t) => t.id.startsWith("edital-"));
        if (isFallbackEstatico) {
          throw new Error("fallback-edital");
        }
        if (!cancelled) setResumo(data);
      } catch (err) {
        if (!cancelled && !(err instanceof DOMException && err.name === "AbortError")) {
          setError(true);
          setResumo(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [disciplina, reloadKey]);

  if (loading) {
    return <PainelCatalogoSkeleton disciplina={disciplina} />;
  }

  if (error || !resumo) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            {DISCIPLINA_LABELS[disciplina]}
          </CardTitle>
          <CardDescription>
            O banco demorou para responder. Os assuntos com questões não
            carregaram — tente de novo em alguns segundos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <button
            type="button"
            onClick={retry}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            Tentar novamente
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <PainelCatalogoEdital
      resumo={resumo}
      desempenhoDisciplina={desempenhoDisciplina}
    />
  );
}
