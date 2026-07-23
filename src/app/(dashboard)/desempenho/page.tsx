import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DISCIPLINA_LABELS } from "@/types";
import { calcularProximoPasso } from "@/lib/proximo-passo";
import { montarPlanoProvaResumo } from "@/lib/plano-prova";
import { diasParaProva } from "@/lib/prova-data";
import { DISCIPLINAS, type Disciplina } from "@/types";
import { CicloRetencao } from "@/components/dashboard/ciclo-retencao";
import { ProximoPassoCard } from "@/components/dashboard/proximo-passo-card";
import {
  DisciplinaDesempenhoCard,
  SessoesRecentesList,
} from "@/components/dashboard/disciplina-desempenho-card";
import { DesempenhoPeriodoFilter } from "@/components/dashboard/desempenho-periodo-filter";
import {
  DesempenhoVisaoFilter,
  parseVisaoDesempenho,
} from "@/components/dashboard/desempenho-visao-filter";
import { SemaforoCompacto } from "@/components/dashboard/semaforo-compacto";
import { DesempenhoDonut } from "@/components/dashboard/desempenho-donut";
import { DesempenhoDisciplinasLista } from "@/components/dashboard/desempenho-disciplinas-lista";
import { PainelEspelhoResumo } from "@/components/dashboard/painel-espelho-resumo";
import { SimuladosHistoricoList } from "@/components/dashboard/simulados-historico-list";
import { MasteryDebugPanel } from "@/components/dashboard/mastery-debug-panel";
import { PainelDominioEvidenciasCard } from "@/components/dashboard/painel-dominio-evidencias";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ResetDesempenhoForm } from "@/components/dashboard/reset-desempenho-form";
import { loadDesempenhoPageResumo } from "@/lib/desempenho-page-resumo";
import {
  labelPeriodo,
  parsePeriodoDesempenho,
  periodoSince,
} from "@/lib/desempenho-periodo";
import {
  getPainelDominioEvidencias,
  getUserMasteryDebug,
} from "@/lib/mastery";

export const dynamic = "force-dynamic";

function parseDisciplina(raw?: string): Disciplina | undefined {
  if (!raw) return undefined;
  return DISCIPLINAS.includes(raw as Disciplina)
    ? (raw as Disciplina)
    : undefined;
}

export default async function DesempenhoPage({
  searchParams,
}: {
  searchParams: Promise<{
    disciplina?: string;
    reset?: string;
    periodo?: string;
    visao?: string;
    debug?: string;
  }>;
}) {
  const {
    disciplina: disciplinaRaw,
    reset,
    periodo: periodoRaw,
    visao: visaoRaw,
    debug: debugRaw,
  } = await searchParams;
  const disciplinaFoco = parseDisciplina(disciplinaRaw);
  const periodo = parsePeriodoDesempenho(periodoRaw);
  const visao = parseVisaoDesempenho(visaoRaw);
  const showMasteryDebug = debugRaw === "mastery";
  const isSimulados = visao === "simulados";
  const since = periodoSince(periodo);
  const periodoLabel = labelPeriodo(periodo);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ desempenho, simulados, retencao, topicosFoco }, masteryDebug, dominioEvidencias] =
    await Promise.all([
      loadDesempenhoPageResumo(user?.id, { since, disciplinaFoco }),
      showMasteryDebug && user?.id
        ? getUserMasteryDebug(user.id)
        : Promise.resolve(null),
      getPainelDominioEvidencias(user?.id),
    ]);

  const dadosAtivos = isSimulados ? simulados : desempenho;
  const { semaforo, overview } = dadosAtivos;
  const plano = montarPlanoProvaResumo({
    dias: diasParaProva(),
    topicosTotal: desempenho.topicosTotal,
    topicosVistos: desempenho.topicosVistos,
    coberturaEditalPct: desempenho.coberturaEditalPct,
    revisoesHoje: retencao.revisoesHoje,
    memoriaAindaFrescas: retencao.aprendendo,
    espelhoMedia: semaforo.espelho.media,
    espelhoQuantidade: semaforo.espelho.quantidade,
    disciplinaPrioritaria: semaforo.disciplinasEmRisco[0]?.disciplina,
    hasData: desempenho.hasData || retencao.hasData,
  });
  const proximo = calcularProximoPasso(plano);

  const temHistorico =
    desempenho.hasData ||
    simulados.hasData ||
    retencao.hasData ||
    overview.total > 0;

  const periodoQs = periodo !== "inicio" ? `periodo=${periodo}` : "";
  const visaoQs = isSimulados ? "visao=simulados" : "";
  const queryBase = [visaoQs, periodoQs].filter(Boolean).join("&");

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 p-4 md:gap-6 md:p-8">
      {reset === "ok" && (
        <Alert>
          <AlertDescription>
            Histórico zerado com sucesso. Seu painel foi reiniciado.
          </AlertDescription>
        </Alert>
      )}

      <header className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Desempenho</h1>
          <p className="text-sm text-muted-foreground">
            {isSimulados
              ? "Simulados 60Q — nota real do edital e histórico de provas"
              : "Treino no período — acertos, cobertura e ritmo por disciplina"}
          </p>
        </div>
        <DesempenhoVisaoFilter
          visao={visao}
          periodo={periodo}
          disciplina={disciplinaFoco}
        />
        <DesempenhoPeriodoFilter
          periodo={periodo}
          disciplina={disciplinaFoco}
          visao={visao}
        />
      </header>

      {isSimulados && semaforo.espelho.quantidade > 0 && (
        <div className="rounded-xl border border-border bg-card px-4 py-3">
          <PainelEspelhoResumo espelho={semaforo.espelho} />
          {simulados.ultimoSimulado && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3 text-sm">
              <Badge
                variant={
                  simulados.ultimoSimulado.aprovado ? "default" : "destructive"
                }
                className={cn(
                  simulados.ultimoSimulado.aprovado &&
                    "border-semaforo-verde/40 bg-semaforo-verde text-white",
                )}
              >
                Último:{" "}
                {simulados.ultimoSimulado.aprovado ? "Aprovado" : "Eliminado"}
              </Badge>
              {simulados.ultimoSimulado.duracaoMin !== null && (
                <span className="text-xs text-muted-foreground tabular-nums">
                  {simulados.ultimoSimulado.duracaoMin} min
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {isSimulados && !simulados.hasData && (
        <Alert>
          <AlertTitle>Nenhum simulado no período</AlertTitle>
          <AlertDescription>
            Faça um simulado de 60 questões para ver nota, semáforo e histórico
            aqui. Estudo avulso não entra nesta aba.
            <Link
              href="/simulado"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-3",
              )}
            >
              Iniciar simulado
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {!isSimulados && disciplinaFoco ? (
        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-semibold">
                {DISCIPLINA_LABELS[disciplinaFoco]}
              </h2>
              <p className="text-sm text-muted-foreground">
                Assuntos no período · {periodoLabel}
              </p>
            </div>
            <Link
              href={
                queryBase ? `/desempenho?${queryBase}` : "/desempenho"
              }
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Voltar à visão geral
            </Link>
          </div>
          {desempenho.disciplinas
            .filter((d) => d.disciplina === disciplinaFoco)
            .map((d) => (
              <DisciplinaDesempenhoCard
                key={d.disciplina}
                disciplina={d}
                expandida
                topicos={topicosFoco.map((t) => ({
                  slug: t.slug,
                  tentativas: t.tentativas,
                  taxaAcerto: t.taxaAcerto,
                }))}
              />
            ))}
        </section>
      ) : (
        <>
          {!isSimulados && (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3">
              <Badge
                variant={
                  plano.chegada === "verde"
                    ? "default"
                    : plano.chegada === "amarelo"
                      ? "secondary"
                      : "destructive"
                }
                className={cn(
                  plano.chegada === "verde" &&
                    "border-semaforo-verde/40 bg-semaforo-verde text-white",
                )}
              >
                {plano.chegadaLabel}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {plano.diasParaProva} dias · {plano.faseLabel}
                {plano.diasAtraso > 0
                  ? ` · ${plano.diasAtraso} dia(s) de atraso`
                  : " · no ritmo"}
              </span>
            </div>
          )}

          {isSimulados && (
            <SemaforoCompacto
              gerais={semaforo.gerais}
              especificos={semaforo.especificos}
              total={semaforo.total}
            />
          )}

          <section
            aria-labelledby="visao-geral-titulo"
            className="grid gap-4 lg:grid-cols-5"
          >
            <h2 id="visao-geral-titulo" className="sr-only">
              {isSimulados ? "Simulados no período" : "Visão geral e disciplinas"}
            </h2>
            <DesempenhoDonut
              overview={overview}
              periodoLabel={
                isSimulados
                  ? `Simulados · ${periodoLabel.toLowerCase()}`
                  : periodoLabel
              }
              className="lg:col-span-2"
            />
            <DesempenhoDisciplinasLista
              disciplinas={dadosAtivos.disciplinas}
              periodo={periodo}
              variante={isSimulados ? "simulado" : "geral"}
              className="lg:col-span-3"
            />
          </section>

          {isSimulados && (
            <SimuladosHistoricoList
              historico={simulados.historico}
              melhorNota={simulados.melhorNota}
            />
          )}
        </>
      )}

      {!isSimulados && (
        <>
          <PainelDominioEvidenciasCard painel={dominioEvidencias} />

          <div className="grid gap-4 md:grid-cols-5">
            <ProximoPassoCard
              className="md:col-span-2"
              href={proximo.href}
              label={proximo.label}
              motivo={proximo.motivo}
            />
            <div className="md:col-span-3">
              <CicloRetencao
                resumo={retencao}
                atividade={desempenho.atividade}
                embedded
              />
            </div>
          </div>

          <details className="group rounded-xl border border-border bg-card">
            <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-2">
                Sessões recentes
                <span className="text-xs font-normal text-muted-foreground group-open:hidden">
                  ver
                </span>
                <span className="hidden text-xs font-normal text-muted-foreground group-open:inline">
                  ocultar
                </span>
              </span>
            </summary>
            <div className="border-t border-border px-4 py-3">
              <SessoesRecentesList sessoes={desempenho.sessoesRecentes} />
            </div>
          </details>
        </>
      )}

      <ResetDesempenhoForm temHistorico={temHistorico} />

      {masteryDebug && <MasteryDebugPanel summary={masteryDebug} />}
    </div>
  );
}
