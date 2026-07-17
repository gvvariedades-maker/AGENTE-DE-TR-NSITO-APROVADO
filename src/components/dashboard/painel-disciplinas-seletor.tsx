"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { labelContagemQuestoes } from "@/lib/format-questoes";
import type { DesempenhoDisciplina } from "@/lib/desempenho";
import type { ZonaSemaforo } from "@/lib/edital-constants";
import {
  DISCIPLINAS,
  DISCIPLINA_LABELS,
  SIMULADO_ESPELHO_DISTRIBUICAO,
  type Disciplina,
} from "@/types";
import { PainelDisciplinasGuia } from "@/components/dashboard/painel-disciplinas-guia";

const STORAGE_DISCIPLINAS_ABERTO = "disciplinas-seletor-aberto";

const zonaDot: Record<ZonaSemaforo, string> = {
  verde: "bg-semaforo-verde",
  amarelo: "bg-semaforo-amarelo",
  vermelho: "bg-semaforo-vermelho",
  vazio: "bg-muted-foreground/40",
};

interface PainelDisciplinasSeletorProps {
  disciplinaAtiva: Disciplina;
  desempenhoPorDisciplina: Map<Disciplina, DesempenhoDisciplina>;
  questoesReaisAtivo: boolean;
  questoesReaisDesc: string;
  questoesReaisCount: number;
}

export function PainelDisciplinasSeletor({
  disciplinaAtiva,
  desempenhoPorDisciplina,
  questoesReaisAtivo,
  questoesReaisDesc,
  questoesReaisCount,
}: PainelDisciplinasSeletorProps) {
  const [aberto, setAberto] = useState(true);
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
    try {
      const salvo = localStorage.getItem(STORAGE_DISCIPLINAS_ABERTO);
      if (salvo === "0") setAberto(false);
      if (salvo === "1") setAberto(true);
    } catch {
      setAberto(true);
    }

    function abrirSeHash() {
      if (typeof window === "undefined") return;
      if (window.location.hash === "#disciplinas") {
        setAberto(true);
        try {
          localStorage.setItem(STORAGE_DISCIPLINAS_ABERTO, "1");
        } catch {
          /* noop */
        }
      }
    }

    abrirSeHash();
    window.addEventListener("hashchange", abrirSeHash);
    return () => window.removeEventListener("hashchange", abrirSeHash);
  }, []);

  function alternar() {
    setAberto((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_DISCIPLINAS_ABERTO, next ? "1" : "0");
      } catch {
        /* storage indisponível */
      }
      return next;
    });
  }

  const labelAtiva = DISCIPLINA_LABELS[disciplinaAtiva];

  function cardQuestoesReais() {
    const cardClass = cn(
      "flex flex-col gap-1.5 rounded-xl border-2 px-3 py-2.5 transition-colors",
      "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
      questoesReaisAtivo
        ? "border-border bg-background hover:border-primary/40 hover:bg-muted/40"
        : "border-border bg-background opacity-70",
    );

    const conteudo = (
      <>
        <div className="flex items-start gap-1.5">
          <span
            className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-500"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug">
              Questões reais IDECAN
            </p>
            {questoesReaisCount > 0 && (
              <p className="mt-0.5 text-[11px] font-medium tabular-nums text-muted-foreground">
                {labelContagemQuestoes(questoesReaisCount)}
              </p>
            )}
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
              {questoesReaisDesc}
            </p>
          </div>
        </div>
      </>
    );

    if (questoesReaisAtivo) {
      return (
        <Link
          key="questoes-reais-idecan"
          href="/estudo/reais"
          role="listitem"
          className={cardClass}
        >
          {conteudo}
        </Link>
      );
    }

    return (
      <div key="questoes-reais-idecan" role="listitem" className={cardClass}>
        {conteudo}
      </div>
    );
  }

  return (
    <section
      id="disciplinas"
      aria-labelledby="disciplinas-titulo"
      className="scroll-mt-20 flex flex-col gap-3"
    >
      <PainelDisciplinasGuia />

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2
              id="disciplinas-titulo"
              className="text-sm font-semibold text-foreground"
            >
              Disciplinas
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Ativa:{" "}
              <span className="font-medium text-foreground">{labelAtiva}</span>
              {" · "}
              toque em um card para estudar outra matéria
            </p>
          </div>
          <button
            type="button"
            onClick={alternar}
            aria-expanded={aberto}
            aria-controls="disciplinas-lista"
            className={cn(
              buttonVariants({ size: "sm" }),
              "shrink-0 gap-2",
            )}
          >
            <BookOpen className="size-4" aria-hidden />
            {aberto ? "Ocultar disciplinas" : "Ver disciplinas"}
            <ChevronDown
              className={cn(
                "size-4 transition-transform",
                aberto && "rotate-180",
              )}
              aria-hidden
            />
          </button>
        </div>

        {(!montado || aberto) && (
          <div
            id="disciplinas-lista"
            role="list"
            className="grid grid-cols-2 gap-2 sm:grid-cols-4"
          >
            {DISCIPLINAS.flatMap((d) => {
              const ativo = d === disciplinaAtiva;
              const isTransito = d === "legislacao_transito";
              const desemp = desempenhoPorDisciplina.get(d);
              const zona = desemp?.zona ?? "vazio";
              const temDados = (desemp?.tentativas ?? 0) > 0;

              const cardDisciplina = (
                <Link
                  key={d}
                  href={`/dashboard?disciplina=${d}#disciplinas`}
                  role="listitem"
                  aria-current={ativo ? "true" : undefined}
                  className={cn(
                    "flex flex-col gap-1.5 rounded-xl border-2 px-3 py-2.5 transition-colors",
                    "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    ativo
                      ? isTransito
                        ? "border-transito bg-transito/10"
                        : "border-primary bg-primary/8"
                      : "border-border bg-background hover:border-primary/40 hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-start gap-1.5">
                    <span
                      className={cn(
                        "mt-1.5 size-2 shrink-0 rounded-full",
                        zonaDot[zona],
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "text-sm font-semibold leading-snug",
                          ativo &&
                            (isTransito
                              ? "text-transito-foreground"
                              : "text-primary"),
                        )}
                      >
                        {DISCIPLINA_LABELS[d]}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {labelContagemQuestoes(SIMULADO_ESPELHO_DISTRIBUICAO[d])}
                        {" · "}
                        {temDados
                          ? `${desemp!.taxaAcerto}% acerto`
                          : "Sem tentativas"}
                      </p>
                    </div>
                  </div>
                </Link>
              );

              if (isTransito) {
                return [cardDisciplina, cardQuestoesReais()];
              }
              return [cardDisciplina];
            })}
          </div>
        )}
      </div>
    </section>
  );
}
