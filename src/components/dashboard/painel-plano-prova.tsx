import Link from "next/link";
import { Brain, Check, ClipboardCheck, Target } from "lucide-react";
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
import { MIN_PONTOS_TOTAL } from "@/lib/edital-constants";
import { orientacaoFase } from "@/lib/plano-prova-calc";
import { labelCtaMissao, type MissaoDia } from "@/lib/semana-chegada";
import type { PlanoProvaResumo } from "@/lib/plano-prova";
import type { ZonaChegada } from "@/lib/plano-prova-calc";
import type { DominioResumo } from "@/lib/tutor/dominio-resumo";
import { PainelPlanoGuia } from "@/components/dashboard/painel-plano-guia";

interface PainelPlanoProvaProps {
  plano: PlanoProvaResumo;
  missaoHoje?: MissaoDia;
  dominio?: DominioResumo;
}

function badgeStatusChegada(zona: ZonaChegada, label: string) {
  const classes: Record<ZonaChegada, string> = {
    verde: "border-semaforo-verde/40 bg-semaforo-verde/10 text-semaforo-verde",
    amarelo:
      "border-semaforo-amarelo/40 bg-semaforo-amarelo/10 text-semaforo-amarelo",
    vermelho:
      "border-semaforo-vermelho/40 bg-semaforo-vermelho/10 text-semaforo-vermelho",
    vazio: "border-border bg-muted text-muted-foreground",
  };
  return (
    <Badge variant="outline" className={cn("shrink-0 font-medium", classes[zona])}>
      {label}
    </Badge>
  );
}

export function PainelPlanoProva({
  plano,
  missaoHoje,
  dominio,
}: PainelPlanoProvaProps) {
  const cobertura = Math.min(100, Math.round(plano.coberturaEditalPct));
  const ctaHref = missaoHoje?.href ?? plano.pacote.href;
  const ctaLabel = missaoHoje ? labelCtaMissao(missaoHoje) : plano.pacote.label;
  const ctaMotivo = missaoHoje?.motivo ?? plano.pacote.motivo;
  const mixRevisoes = missaoHoje?.mix.revisoes ?? plano.pacote.revisoes;
  const mixNovas = missaoHoje?.mix.novas ?? plano.pacote.novas;
  const mixErros = missaoHoje?.mix.erros ?? plano.pacote.erros;
  const metaQuestoes =
    missaoHoje?.metaQuestoes ??
    (mixRevisoes + mixNovas + mixErros || plano.debitoDiario);
  const mostrarChipsMix = missaoHoje?.tipo !== "espelho";
  const metaFeita =
    missaoHoje?.status === "feito" && missaoHoje.tipo !== "folga";
  const metaParcial = missaoHoje?.status === "parcial";
  const dominioGlobal = dominio?.global;
  const dominados = dominioGlobal?.dominado ?? 0;
  const dominioTotal = dominioGlobal?.total ?? plano.topicosTotal;
  const emProgresso =
    (dominioGlobal?.aprendendo ?? 0) + (dominioGlobal?.formando ?? 0);

  return (
    <Card
      id="plano-prova"
      className="scroll-mt-20 overflow-hidden border-transito/30 border-l-4 border-l-transito bg-card shadow-sm"
    >
      <CardHeader className="border-b border-transito/15 bg-transito/5 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 gap-3">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-transito/25 bg-background text-transito"
              aria-hidden
            >
              <Target className="size-5" />
            </div>
            <div className="min-w-0">
              <CardTitle className="text-lg font-semibold">
                Plano até a prova
              </CardTitle>
              <CardDescription className="mt-1 text-sm normal-case">
                {plano.diasParaProva} dias · Fase: {plano.faseLabel}
                {plano.hasData && (
                  <>
                    {" "}
                    · Projeção ~{plano.projecao.notaProjetada} pts
                    {plano.projecao.gapPara90 > 0 && (
                      <>
                        {" "}
                        · faltam {plano.projecao.gapPara90} para 90
                      </>
                    )}
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          {plano.hasData && badgeStatusChegada(plano.chegada, plano.chegadaLabel)}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 pt-5">
        {!plano.hasData ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Ainda sem histórico — o plano começa a medir cobertura e ritmo
              assim que você estudar. Meta inicial: CTB (50% da prova).
            </p>
            <Link
              href="/estudo?disciplina=legislacao_transito&modo=auto"
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-4 w-full min-h-11 sm:w-auto",
              )}
            >
              Começar pelo CTB
            </Link>
          </div>
        ) : (
          <>
            <PainelPlanoGuia />

            <div className="grid gap-3 sm:grid-cols-3">
              {/* Pilar 1: Edital */}
              <div
                id="plano-pilar-edital"
                className="rounded-lg border border-border bg-background px-4 py-3"
              >
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Edital
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {cobertura}%
                </p>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={cobertura}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Cobertura: ${cobertura}%`}
                >
                  <div
                    className="h-full rounded-full bg-transito"
                    style={{ width: `${cobertura}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {plano.topicosVistos}/{plano.topicosTotal} assuntos vistos
                  {plano.topicosRestantes > 0 && (
                    <>
                      {" "}
                      · faltam{" "}
                      <span className="font-medium text-foreground">
                        {plano.topicosRestantes}
                      </span>
                    </>
                  )}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Meta:{" "}
                  <span className="font-medium text-foreground">
                    {plano.debitoDiario}/dia
                  </span>
                  {plano.topicosBacklogDominio > 0 &&
                    plano.topicosBacklogDominio !== plano.topicosRestantes && (
                      <>
                        {" "}
                        ·{" "}
                        <span className="font-medium text-foreground">
                          {plano.topicosBacklogDominio}
                        </span>{" "}
                        sem domínio
                      </>
                    )}
                  {plano.diasAtraso > 0 && (
                    <span className="font-medium text-semaforo-vermelho">
                      {" "}
                      · {plano.diasAtraso} dia(s) de atraso
                    </span>
                  )}
                </p>
                {dominioTotal > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Domínio:{" "}
                    <span className="font-medium text-semaforo-verde">
                      {dominados}
                    </span>
                    /{dominioTotal} consolidados
                    {emProgresso > 0 && (
                      <>
                        {" "}
                        ·{" "}
                        <span className="font-medium text-foreground">
                          {emProgresso}
                        </span>{" "}
                        em progresso
                      </>
                    )}
                  </p>
                )}
              </div>

              {/* Pilar 2: Memória */}
              <div
                id="plano-pilar-memoria"
                className="rounded-lg border border-border bg-background px-4 py-3"
              >
                <div className="flex items-center gap-1.5">
                  <Brain className="size-3.5 text-muted-foreground" aria-hidden />
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Memória
                  </p>
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {plano.revisoesHoje}
                </p>
                <p className="text-xs text-muted-foreground">
                  {plano.revisoesHoje === 1
                    ? "revisão para hoje"
                    : "revisões para hoje"}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {plano.memoriaAindaFrescas}
                  </span>{" "}
                  ainda frescas na cabeça
                </p>
                {plano.revisoesHoje > 0 &&
                  (missaoHoje?.mix.revisoes ?? 0) > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Incluídas no pacote de hoje
                    </p>
                  )}
              </div>

              {/* Pilar 3: Simulado */}
              <div
                id="plano-pilar-simulado"
                className="rounded-lg border border-border bg-background px-4 py-3"
              >
                <div className="flex items-center gap-1.5">
                  <ClipboardCheck
                    className="size-3.5 text-muted-foreground"
                    aria-hidden
                  />
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Simulado
                  </p>
                </div>
                {plano.espelhoQuantidade > 0 && plano.espelhoMedia !== null ? (
                  <>
                    <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                      {plano.espelhoMedia.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Média dos últimos {plano.espelhoQuantidade} simulado
                      {plano.espelhoQuantidade > 1 ? "s" : ""}
                      {plano.espelhoMedia < MIN_PONTOS_TOTAL && (
                        <span className="text-semaforo-vermelho">
                          {" "}
                          · abaixo de {MIN_PONTOS_TOTAL}
                        </span>
                      )}
                    </p>
                    <Link
                      href="/desempenho?visao=simulados"
                      className="mt-2 inline-block text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Ver em Desempenho
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      Ainda sem simulado
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Faça o 1º simulado de 60 questões na proporção do edital.
                    </p>
                    <Link
                      href="/desempenho?visao=simulados"
                      className="mt-2 inline-block text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Ver em Desempenho
                    </Link>
                  </>
                )}
              </div>
            </div>

            <div
              id="plano-faca-agora"
              className="rounded-xl border border-transito/30 bg-transito/5 px-4 py-4"
            >
              <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Faça agora
              </p>
              {metaQuestoes > 0 && (
                <p className="mt-2 text-sm font-medium text-foreground">
                  Meta:{" "}
                  <span className="tabular-nums">{metaQuestoes}</span>{" "}
                  {metaQuestoes === 1 ? "questão" : "questões"}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {mostrarChipsMix && mixRevisoes > 0 && (
                  <Badge variant="outline" className="tabular-nums">
                    {mixRevisoes} revisões
                  </Badge>
                )}
                {mostrarChipsMix && mixNovas > 0 && (
                  <Badge variant="outline" className="tabular-nums">
                    {mixNovas} novas
                  </Badge>
                )}
                {mostrarChipsMix && mixErros > 0 && (
                  <Badge variant="outline" className="tabular-nums">
                    {mixErros} erros
                  </Badge>
                )}
                {missaoHoje?.tipo === "espelho" && (
                  <Badge variant="outline">Simulado</Badge>
                )}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{ctaMotivo}</p>
              {metaFeita ? (
                <div className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-semaforo-verde/30 bg-semaforo-verde/5 px-4 py-3 text-sm font-medium text-semaforo-verde">
                  <Check className="size-4 shrink-0" aria-hidden />
                  Meta de hoje atingida · {missaoHoje.progressoQuestoes}{" "}
                  {missaoHoje.progressoQuestoes === 1 ? "questão" : "questões"}
                </div>
              ) : (
                <>
                  {metaParcial && missaoHoje && missaoHoje.metaQuestoes > 0 && (
                    <p className="mt-3 text-sm tabular-nums text-semaforo-amarelo">
                      {missaoHoje.progressoQuestoes}/{missaoHoje.metaQuestoes}{" "}
                      feitas
                    </p>
                  )}
                  <Link
                    href={ctaHref}
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "mt-4 w-full min-h-11",
                    )}
                  >
                    {ctaLabel}
                  </Link>
                </>
              )}

              <div id="plano-indice-chegada" className="mt-5 border-t border-transito/20 pt-4">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Índice de chegada
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {plano.indiceChegada.resumo}
                </p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {plano.indiceChegada.sinais.map((sinal) => (
                    <span
                      key={sinal.id}
                      className={cn(
                        "inline-flex min-w-0 flex-col rounded-md border px-2.5 py-2 text-xs",
                        sinal.zona === "verde" &&
                          "border-semaforo-verde/30 bg-semaforo-verde/5 text-semaforo-verde",
                        sinal.zona === "amarelo" &&
                          "border-semaforo-amarelo/30 bg-semaforo-amarelo/5 text-semaforo-amarelo",
                        sinal.zona === "vermelho" &&
                          "border-semaforo-vermelho/30 bg-semaforo-vermelho/5 text-semaforo-vermelho",
                        sinal.zona === "vazio" &&
                          "border-border bg-muted/30 text-muted-foreground",
                      )}
                    >
                      <span className="font-medium">{sinal.label}</span>
                      <span className="mt-0.5 text-[11px] leading-snug opacity-90">
                        {sinal.texto}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <p
              id="plano-orientacao-fase"
              className="rounded-lg border border-border/80 bg-muted/25 px-3 py-2.5 text-sm text-muted-foreground"
            >
              <span className="font-medium text-foreground">
                Nesta fase:{" "}
              </span>
              {orientacaoFase(plano.fase)}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
