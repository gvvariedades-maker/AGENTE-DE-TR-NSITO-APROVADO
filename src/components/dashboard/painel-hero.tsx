import Link from "next/link";
import { Target } from "lucide-react";
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
    month: "long",
    year: "numeric",
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

  const prioridadeLabel =
    semaforo.gerais.zona === "vermelho"
      ? "Disciplinas gerais em risco"
      : retencao.revisoesHoje > 0
        ? `${retencao.revisoesHoje} revisões pendentes`
        : "Legislação de Trânsito";

  const prioridadeDesc =
    semaforo.gerais.zona === "vermelho"
      ? "Gerais abaixo do mínimo — risco de eliminação"
      : retencao.revisoesHoje > 0
        ? "FSRS reagendou tópicos para hoje"
        : "30 das 60 questões · 50% da prova";

  return (
    <section className="grid gap-4 md:grid-cols-5">
      <Card className="border-border bg-card md:col-span-3">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardDescription className="text-xs font-medium tracking-wide uppercase">
                {semaforo.diasParaProva} dias · {formatarDataProva()}
              </CardDescription>
              <div className="mt-1 flex items-baseline gap-2">
                <CardTitle className="text-4xl font-bold tabular-nums tracking-tight">
                  {nota !== null ? nota.toFixed(1) : "—"}
                </CardTitle>
                <span className="text-lg text-muted-foreground">/ 100</span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
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
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <BarraGeraisEspecificos semaforo={semaforo} />

          <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
            <PainelSparkline atividade={desempenho.atividade} />

            <div className="flex flex-col justify-center gap-2">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="tabular-nums">
                  Edital {desempenho.coberturaEditalPct}% coberto
                </Badge>
                {desempenho.topicosMapeados > 0 && (
                  <Badge
                    variant="outline"
                    className="tabular-nums text-muted-foreground"
                  >
                    {desempenho.topicosMapeados} tópicos mapeados
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
                    {desempenho.topicosVistos}/{desempenho.topicosTotal}{" "}
                    tópicos estudáveis
                  </>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Sua prova hoje</CardTitle>
          <CardDescription>Uma sessão focada por vez</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex items-start gap-3 rounded-lg border border-transito/25 bg-transito/5 px-4 py-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-transito/15 ring-1 ring-transito/30">
              <Target
                className="size-4 text-transito-foreground"
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Priorize agora
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">
                {prioridadeLabel}
              </p>
              <p className="text-xs text-muted-foreground">{prioridadeDesc}</p>
            </div>
          </div>

          <Link
            href={ctaHref}
            className={cn(buttonVariants({ size: "lg" }), "w-full min-h-11")}
          >
            {ctaLabel}
          </Link>

          <div className="flex flex-wrap gap-2 border-t border-border pt-4">
            <Link
              href="/desempenho"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "flex-1",
              )}
            >
              Ver evolução
            </Link>
            <Link
              href="/simulado"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "flex-1 text-muted-foreground",
              )}
            >
              Simulado
            </Link>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
