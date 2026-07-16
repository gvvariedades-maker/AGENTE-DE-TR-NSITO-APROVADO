"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PainelHero } from "@/components/dashboard/painel-hero";
import { PainelHeroSkeleton } from "@/components/dashboard/painel-hero-skeleton";
import { PainelDisciplinasSeletor } from "@/components/dashboard/painel-disciplinas-seletor";
import { PainelCatalogoEditalLoader } from "@/components/dashboard/painel-catalogo-edital-loader";
import { PainelMaisModos } from "@/components/dashboard/painel-mais-modos";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { calcularProximoPasso } from "@/lib/proximo-passo";
import { DISCIPLINA_LABELS, type Disciplina } from "@/types";
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
        <PainelHeroSkeleton />
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

  const { desempenho, retencao, atividadeHoje, questoesCount, questoesReaisCount, pioresTopicos } =
    data;
  const { semaforo } = desempenho;
  const emRisco = semaforo.disciplinasEmRisco.length > 0;
  const mostrarAlertaInicio =
    !desempenho.hasData && semaforo.disciplinasEmRisco.length === 0;

  const proximo = calcularProximoPasso({
    emRisco,
    disciplinaRisco: semaforo.disciplinasEmRisco[0]?.disciplina,
    revisoesHoje: retencao.revisoesHoje,
    questoesDisponiveis: questoesCount > 0,
  });

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

  return (
    <>
      <PainelHero
        desempenho={desempenho}
        retencao={retencao}
        atividadeHoje={atividadeHoje}
        proximo={proximo}
        pioresTopicos={pioresTopicos}
      />

      {emRisco && desempenho.hasData ? (
        <Alert variant="destructive">
          <AlertTitle>Disciplinas abaixo do mínimo</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-inside list-disc text-sm">
              {semaforo.disciplinasEmRisco.map((r) => (
                <li key={r.disciplina}>
                  {DISCIPLINA_LABELS[r.disciplina]}: {r.pontos.toFixed(1)} pts
                  (mín. {r.minimo})
                </li>
              ))}
            </ul>
            <Link
              href={proximo.href}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-3",
              )}
            >
              {proximo.label}
            </Link>
          </AlertDescription>
        </Alert>
      ) : (
        mostrarAlertaInicio && (
          <Alert>
            <AlertTitle>Primeiro passo</AlertTitle>
            <AlertDescription className="text-sm">
              Comece pelo CTB (50% da prova) ou pelo Motor ATA — o semáforo
              mostra o progresso automaticamente.
            </AlertDescription>
          </Alert>
        )
      )}

      <PainelDisciplinasSeletor
        disciplinaAtiva={disciplinaAtiva}
        desempenhoPorDisciplina={desempenhoPorDisciplina}
      />

      <PainelCatalogoEditalLoader
        disciplina={disciplinaAtiva}
        desempenhoDisciplina={desempenhoDisciplina}
      />

      <PainelMaisModos
        questoesReaisAtivo={reaisAtivo}
        questoesReaisDesc={reaisDesc}
      />
    </>
  );
}
