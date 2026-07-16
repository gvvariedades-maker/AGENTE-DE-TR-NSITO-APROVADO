import Link from "next/link";
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
import type { ProximoPasso } from "@/lib/proximo-passo";
import {
  hrefEstudoErros,
  hrefEstudoTopico,
  labelPiorTopico,
  type PiorTopico,
} from "@/lib/piores-topicos-shared";
import { PROVA_DATA } from "@/types";

interface PainelHeroProps {
  desempenho: DesempenhoResumo;
  retencao: RetencaoResumo;
  atividadeHoje: { questoes: number; acertos: number };
  proximo: ProximoPasso;
  pioresTopicos: PiorTopico[];
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
  proximo,
  pioresTopicos,
}: PainelHeroProps) {
  const { semaforo } = desempenho;
  const nota = semaforo.total.pontos;
  const zona = piorZona(semaforo);
  const temPontosFracos = pioresTopicos.some((p) => p.tentativas > 0);
  const topicosFracos = pioresTopicos
    .filter((p) => p.tentativas > 0)
    .slice(0, 3);

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
                {desempenho.hasData ? (
                  <>
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
                  </>
                ) : (
                  "Resolva questões para destravar a projeção"
                )}
              </p>
            </div>
            <SemaforoVisual zona={zona} size="sm" label="Status" />
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <BarraGeraisEspecificos semaforo={semaforo} />

          {desempenho.hasData ? (
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
                      · {desempenho.topicosVistos}/{desempenho.topicosTotal}{" "}
                      tópicos estudáveis
                    </>
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className="border-t border-border pt-4 text-sm text-muted-foreground">
              Comece pelo{" "}
              <strong className="font-medium text-foreground">CTB</strong> ou
              pelo{" "}
              <strong className="font-medium text-foreground">Motor ATA</strong>{" "}
              — 10 minutos já alimentam o semáforo.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card md:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">Sua prova hoje</CardTitle>
          <CardDescription>Uma sessão focada por vez</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="rounded-lg border border-transito/25 bg-transito/5 px-4 py-3">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Priorize agora
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {proximo.label}
            </p>
            <p className="text-xs text-muted-foreground">{proximo.motivo}</p>
          </div>

          <Link
            href={proximo.href}
            className={cn(buttonVariants({ size: "lg" }), "w-full min-h-11")}
          >
            {proximo.label}
          </Link>

          {temPontosFracos && (
            <div>
              <p className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Pontos fracos
              </p>
              <ul className="flex flex-col gap-1.5">
                {topicosFracos.map((p) => (
                  <li
                    key={p.slug}
                    className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5"
                  >
                    <Link
                      href={hrefEstudoTopico(p.slug, p.disciplina)}
                      className="text-sm text-foreground underline-offset-4 hover:underline"
                    >
                      {labelPiorTopico(p)}
                    </Link>
                    {p.erros > 0 && (
                      <Link
                        href={hrefEstudoErros(p.slug)}
                        className="text-xs text-semaforo-vermelho underline-offset-4 hover:underline"
                      >
                        só erros
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {retencao.revisoesHoje > 0 && !temPontosFracos && (
            <p className="text-xs text-muted-foreground">
              {retencao.revisoesHoje} revisão
              {retencao.revisoesHoje > 1 ? "ões" : ""} FSRS para hoje.
            </p>
          )}

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
