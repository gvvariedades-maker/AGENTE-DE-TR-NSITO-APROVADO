"use client";

import { useCallback, useEffect, useState } from "react";
import { PainelPlanoProva } from "@/components/dashboard/painel-plano-prova";
import { PainelSemanaChegada } from "@/components/dashboard/painel-semana-chegada";
import {
  PainelPlanoSkeleton,
  PainelSemanaChegadaSkeleton,
} from "@/components/dashboard/painel-hero-skeleton";
import { PainelDisciplinasSeletor } from "@/components/dashboard/painel-disciplinas-seletor";
import { PainelCatalogoEditalLoader } from "@/components/dashboard/painel-catalogo-edital-loader";
import { PainelDominioEvidenciasCard } from "@/components/dashboard/painel-dominio-evidencias";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Disciplina } from "@/types";
import type { DashboardResumo } from "@/types/dashboard-resumo";

interface PainelDashboardLoaderProps {
  disciplinaAtiva: Disciplina;
}

export function PainelDashboardLoader({
  disciplinaAtiva,
}: PainelDashboardLoaderProps) {
  const [data, setData] = useState<DashboardResumo | null>(null);
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
        const res = await fetch("/api/dashboard/resumo", {
          credentials: "include",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = (await res.json()) as DashboardResumo;
        if (!cancelled) setData(json);
      } catch (err) {
        if (
          !cancelled &&
          !(err instanceof DOMException && err.name === "AbortError")
        ) {
          setError(true);
          setData(null);
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
  }, [reloadKey]);

  if (loading) {
    return (
      <>
        <PainelPlanoSkeleton />
        <PainelSemanaChegadaSkeleton />
        <div className="h-10 w-full max-w-md animate-pulse rounded-lg bg-muted/60" />
      </>
    );
  }

  if (error || !data) {
    return (
      <Alert>
        <AlertTitle>Não foi possível carregar o painel</AlertTitle>
        <AlertDescription className="flex flex-col gap-3 text-sm">
          <span>O banco demorou para responder. Tente novamente em alguns segundos.</span>
          <button
            type="button"
            onClick={retry}
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "w-fit")}
          >
            Tentar novamente
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  const { desempenho, plano, semana, questoesReaisCount, dominio, dominioEvidencias } =
    data;

  const desempenhoDisciplina = desempenho.disciplinas.find(
    (d) => d.disciplina === disciplinaAtiva,
  );
  const desempenhoPorDisciplina = new Map(
    desempenho.disciplinas.map((d) => [d.disciplina, d]),
  );

  const reaisAtivo = questoesReaisCount !== 0;
  const reaisDesc =
    questoesReaisCount > 0
      ? `${questoesReaisCount} questões · corpus superior`
      : questoesReaisCount < 0
        ? "Corpus superior IDECAN"
        : "Aguardando seed no banco";

  const painelDominio = dominioEvidencias ?? {
    totalSkills: 0,
    byState: {
      unseen: 0,
      learning: 0,
      consolidating: 0,
      mastered: 0,
      at_risk: 0,
    },
    masteredCount: 0,
    delayedRetentionCount: 0,
    transferReadyCount: 0,
    highConfErrorSkills: 0,
    atRiskCount: 0,
    withoutEvidenceCount: 0,
    memorizedWithoutMastery: [],
    topAtRisk: [],
    hasData: false,
  };

  return (
    <>
      <PainelPlanoProva
        plano={plano}
        missaoHoje={semana.missoes[0]}
        dominio={dominio}
      />
      <PainelDominioEvidenciasCard painel={painelDominio} />
      <PainelSemanaChegada semana={semana} />

      <PainelDisciplinasSeletor
        disciplinaAtiva={disciplinaAtiva}
        desempenhoPorDisciplina={desempenhoPorDisciplina}
        questoesReaisAtivo={reaisAtivo}
        questoesReaisDesc={reaisDesc}
        questoesReaisCount={questoesReaisCount}
      />

      <PainelCatalogoEditalLoader
        disciplina={disciplinaAtiva}
        desempenhoDisciplina={desempenhoDisciplina}
      />
    </>
  );
}
