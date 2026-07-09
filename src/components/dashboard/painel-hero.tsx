import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarraGeraisEspecificos } from "@/components/dashboard/barra-gerais-especificos";
import { PainelSparkline } from "@/components/dashboard/painel-sparkline";
import { SemaforoVisual } from "@/components/dashboard/semaforo-visual";
import type { DesempenhoResumo } from "@/lib/desempenho";
import type { RetencaoResumo } from "@/lib/retencao";
import { PROVA_DATA } from "@/types";

interface PainelHeroProps {
  desempenho: DesempenhoResumo;
  retencao: RetencaoResumo;
  atividadeHoje: { questoes: number; acertos: number };
  questoesDisponiveis: boolean;
}

function formatarDataProva() {
  return PROVA_DATA.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function piorZona(semaforo: DesempenhoResumo["semaforo"]) {
  const zonas = [
    semaforo.total.zona,
    semaforo.gerais.zona,
    semaforo.especificos.zona,
  ];
  if (zonas.includes("vermelho")) return "vermelho" as const;
  if (zonas.includes("amarelo")) return "amarelo" as const;
  if (zonas.includes("verde")) return "verde" as const;
  return "vazio" as const;
}

export function PainelHero({
  desempenho,
  retencao,
  atividadeHoje,
  questoesDisponiveis,
}: PainelHeroProps) {
  const { semaforo } = desempenho;
  const nota = semaforo.total.pontos;
  const zona = piorZona(semaforo);

  const ctaHref = questoesDisponiveis
    ? "/estudo?modo=auto"
    : "/estudo?disciplina=legislacao_transito";

  const ctaLabel = !questoesDisponiveis
    ? "Começar com CTB"
    : retencao.revisoesHoje > 0
      ? `Estudar agora · ${retencao.revisoesHoje} revisões`
      : "Estudar agora";

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-5 p-5 md:p-6">
        {/* Linha 1: countdown + nota */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              {semaforo.diasParaProva} dias · {formatarDataProva()}
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums tracking-tight">
                {nota !== null ? nota.toFixed(1) : "—"}
              </span>
              <span className="text-lg text-muted-foreground">/ 100</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Nota projetada
              {semaforo.hasData && (
                <>
                  {" "}
                  ·{" "}
                  {semaforo.fonte === "simulado"
                    ? "último simulado"
                    : "suas tentativas"}
                </>
              )}
            </p>
          </div>

          <SemaforoVisual zona={zona} size="sm" label="Status" />
        </div>

        {/* Linha 2: barras gerais/específicos */}
        <BarraGeraisEspecificos semaforo={semaforo} />

        {/* Linha 3: sparkline + métricas compactas */}
        <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
          <PainelSparkline atividade={desempenho.atividade} />

          <div className="flex flex-col justify-center gap-2 text-sm">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="tabular-nums">
                Edital {desempenho.coberturaEditalPct}% coberto
              </Badge>
              {desempenho.topicosMapeados > 0 && (
                <Badge variant="outline" className="tabular-nums text-muted-foreground">
                  {desempenho.topicosMapeados} tópicos mapeados
                </Badge>
              )}
              {retencao.revisoesHoje > 0 && (
                <Badge
                  variant="outline"
                  className="border-semaforo-amarelo/50 text-semaforo-amarelo tabular-nums"
                >
                  {retencao.revisoesHoje} SRS hoje
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Hoje:{" "}
              <span className="font-medium text-foreground">
                {atividadeHoje.questoes} questões
              </span>
              {atividadeHoje.questoes > 0 && (
                <>
                  {" "}
                  ·{" "}
                  <span className="font-medium text-foreground">
                    {atividadeHoje.acertos} acertos
                  </span>
                </>
              )}
              {desempenho.topicosTotal > 0 && (
                <>
                  {" "}
                  ·{" "}
                  {desempenho.topicosVistos}/{desempenho.topicosTotal} tópicos
                  estudáveis
                </>
              )}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
          <Link
            href={ctaHref}
            className={cn(buttonVariants({ size: "lg" }), "flex-1 sm:flex-none")}
          >
            {ctaLabel}
          </Link>
          <Link
            href="/desempenho"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
            )}
          >
            Ver evolução
          </Link>
          <Link
            href="/simulado"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-muted-foreground",
            )}
          >
            Simulado
          </Link>
        </div>
      </div>
    </section>
  );
}
