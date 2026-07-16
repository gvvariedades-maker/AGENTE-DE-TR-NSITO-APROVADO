import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DISCIPLINA_LABELS } from "@/types";
import { calcularProximoPasso } from "@/lib/proximo-passo";
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
import { SimuladosHistoricoList } from "@/components/dashboard/simulados-historico-list";
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
  }>;
}) {
  const {
    disciplina: disciplinaRaw,
    reset,
    periodo: periodoRaw,
    visao: visaoRaw,
  } = await searchParams;
  const disciplinaFoco = parseDisciplina(disciplinaRaw);
  const periodo = parsePeriodoDesempenho(periodoRaw);
  const visao = parseVisaoDesempenho(visaoRaw);
  const isSimulados = visao === "simulados";
  const since = periodoSince(periodo);
  const periodoLabel = labelPeriodo(periodo);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { desempenho, simulados, retencao, questoesCount, topicosFoco } =
    await loadDesempenhoPageResumo(user?.id, { since, disciplinaFoco });

  const dadosAtivos = isSimulados ? simulados : desempenho;
  const { semaforo, overview } = dadosAtivos;
  const emRisco = semaforo.disciplinasEmRisco.length > 0;
  const proximo = calcularProximoPasso({
    emRisco,
    revisoesHoje: retencao.revisoesHoje,
    questoesDisponiveis: questoesCount > 0,
  });

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
              ? "Espelhos 60Q — nota real do edital e histórico de provas"
              : "Visão clara do que está indo bem — e o que pode eliminar você"}
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

      {isSimulados && simulados.ultimoSimulado && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm">
          <span className="text-muted-foreground">Último espelho:</span>
          <span className="font-bold tabular-nums">
            {simulados.ultimoSimulado.notaTotal} pts
          </span>
          <Badge
            variant={
              simulados.ultimoSimulado.aprovado ? "default" : "destructive"
            }
            className={cn(
              simulados.ultimoSimulado.aprovado &&
                "border-semaforo-verde/40 bg-semaforo-verde text-white",
            )}
          >
            {simulados.ultimoSimulado.aprovado ? "Aprovado" : "Eliminado"}
          </Badge>
          {simulados.melhorNota !== null && (
            <span className="text-xs text-muted-foreground tabular-nums">
              · melhor no período: {simulados.melhorNota} pts
            </span>
          )}
        </div>
      )}

      {isSimulados && !simulados.hasData && (
        <Alert>
          <AlertTitle>Nenhum simulado no período</AlertTitle>
          <AlertDescription>
            Faça um espelho de 60 questões para ver nota, semáforo e histórico
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

      {emRisco && (
        <Alert variant="destructive">
          <AlertTitle>
            {isSimulados
              ? "Risco no último espelho"
              : "Risco de eliminação"}
          </AlertTitle>
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
              href={
                isSimulados
                  ? "/simulado"
                  : "/estudo?modo=anti_zerar"
              }
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-3",
              )}
            >
              {isSimulados ? "Refazer simulado" : "Treinar anti-zerar"}
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
                Tópicos no período · {periodoLabel}
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
          <SemaforoCompacto
            gerais={semaforo.gerais}
            especificos={semaforo.especificos}
            total={semaforo.total}
          />

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
    </div>
  );
}
