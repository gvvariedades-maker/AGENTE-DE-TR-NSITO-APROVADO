import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getDesempenhoResumo,
  getDesempenhoTopicos,
  DISCIPLINA_LABELS,
} from "@/lib/desempenho";
import { getRetencaoResumo, getEstudoReversoResumo } from "@/lib/retencao";
import { MIN_PONTOS_TOTAL } from "@/lib/edital-constants";
import { calcularProximoPasso } from "@/lib/proximo-passo";
import { DISCIPLINAS, type Disciplina } from "@/types";
import { getQuestoesCount } from "@/lib/questoes";
import { CicloRetencao } from "@/components/dashboard/ciclo-retencao";
import { EstudoReversoResumoCard } from "@/components/dashboard/estudo-reverso-resumo";
import { SemaforoZonaCard } from "@/components/dashboard/semaforo-zona-card";
import { DesempenhoMapaCtb } from "@/components/dashboard/desempenho-mapa-ctb";
import { ProximoPassoCard } from "@/components/dashboard/proximo-passo-card";
import {
  DisciplinaDesempenhoCard,
  SessoesRecentesList,
} from "@/components/dashboard/disciplina-desempenho-card";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { ResetDesempenhoForm } from "@/components/dashboard/reset-desempenho-form";
import { withTimeout } from "@/lib/with-timeout";

export const dynamic = "force-dynamic";

const QUERY_MS = 8_000;

const retencaoFallback = {
  aprendendo: 0,
  jovem: 0,
  maduro: 0,
  revisoesHoje: 0,
  hasData: false,
};

const reversoFallback = {
  sessoesTotal: 0,
  sessoesConcluidas: 0,
  taxaConclusao: 0,
  taxaAcertoPreVisual: null as number | null,
  taxaAcertoPosVisual: null as number | null,
  deltaAcerto: null as number | null,
  amostrasPosVisual: 0,
  hasData: false,
};

function parseDisciplina(raw?: string): Disciplina | undefined {
  if (!raw) return undefined;
  return DISCIPLINAS.includes(raw as Disciplina)
    ? (raw as Disciplina)
    : undefined;
}

function ordenarDisciplinas(
  disciplinas: Awaited<ReturnType<typeof getDesempenhoResumo>>["disciplinas"],
) {
  return [...disciplinas].sort((a, b) => {
    if (a.zona === "vermelho" && b.zona !== "vermelho") return -1;
    if (b.zona === "vermelho" && a.zona !== "vermelho") return 1;
    return b.pontos - a.pontos;
  });
}

export default async function DesempenhoPage({
  searchParams,
}: {
  searchParams: Promise<{ disciplina?: string; reset?: string }>;
}) {
  const { disciplina: disciplinaRaw, reset } = await searchParams;
  const disciplinaFoco = parseDisciplina(disciplinaRaw);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const emptyDesempenho = await getDesempenhoResumo(null);
  const [desempenho, retencao, questoesCount, reversoResumo, topicosFoco] =
    await Promise.all([
      withTimeout(
        getDesempenhoResumo(user?.id),
        QUERY_MS,
        emptyDesempenho,
        "desempenho",
      ),
      withTimeout(
        getRetencaoResumo(user?.id),
        QUERY_MS,
        retencaoFallback,
        "retencao",
      ),
      withTimeout(getQuestoesCount(), QUERY_MS, 0, "questoesCount"),
      withTimeout(
        getEstudoReversoResumo(user?.id),
        QUERY_MS,
        reversoFallback,
        "reverso",
      ),
      disciplinaFoco && user?.id
        ? withTimeout(
            getDesempenhoTopicos(user.id, disciplinaFoco),
            QUERY_MS,
            [],
            "topicosFoco",
          )
        : Promise.resolve([]),
    ]);

  const { semaforo } = desempenho;
  const emRisco = semaforo.disciplinasEmRisco.length > 0;
  const proximo = calcularProximoPasso({
    emRisco,
    revisoesHoje: retencao.revisoesHoje,
    questoesDisponiveis: questoesCount > 0,
  });

  const ctb = desempenho.disciplinas.find(
    (d) => d.disciplina === "legislacao_transito",
  );
  const demais = ordenarDisciplinas(
    desempenho.disciplinas.filter(
      (d) => d.disciplina !== "legislacao_transito",
    ),
  );

  const disciplinasVisiveis = disciplinaFoco
    ? desempenho.disciplinas.filter((d) => d.disciplina === disciplinaFoco)
    : null;

  const temHistorico =
    desempenho.hasData || retencao.hasData || reversoResumo.hasData;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      {reset === "ok" && (
        <Alert>
          <AlertDescription>
            Histórico zerado com sucesso. Seu painel foi reiniciado.
          </AlertDescription>
        </Alert>
      )}

      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Desempenho</h1>
        <p className="text-sm text-muted-foreground">
          Não zerar → passar dos 50 → aprofundar CTB → fixar na memória
        </p>
      </header>

      {emRisco && (
        <Alert variant="destructive">
          <AlertTitle>Risco de eliminação</AlertTitle>
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
              href="/estudo?modo=anti_zerar"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-3",
              )}
            >
              Treinar anti-zerar
            </Link>
          </AlertDescription>
        </Alert>
      )}

      <section className="flex flex-col gap-3" aria-labelledby="semaforo-titulo">
        <h2 id="semaforo-titulo" className="text-lg font-semibold">
          Semáforo de aprovação
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <SemaforoZonaCard
            metrica={semaforo.gerais}
            minimoLabel="Mín. 1 pt/disciplina geral"
          />
          <SemaforoZonaCard
            metrica={semaforo.especificos}
            minimoLabel="Mín. 2 pts/disciplina específica"
          />
          <SemaforoZonaCard
            metrica={semaforo.total}
            minimoLabel={`Mín. ${MIN_PONTOS_TOTAL} pts na prova`}
          />
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-5">
        <DesempenhoMapaCtb
          className="md:col-span-3"
          ctb={ctb}
          demais={demais}
        />
        <ProximoPassoCard
          className="md:col-span-2"
          href={proximo.href}
          label={proximo.label}
          motivo={proximo.motivo}
        />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Por disciplina</h2>
            <p className="text-sm text-muted-foreground">
              {disciplinaFoco
                ? `Foco: ${DISCIPLINA_LABELS[disciplinaFoco]}`
                : "CTB em destaque — clique para ver tópicos"}
            </p>
          </div>
          {disciplinaFoco && (
            <Link
              href="/desempenho"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              Ver todas
            </Link>
          )}
        </div>

        {disciplinasVisiveis ? (
          <div className="grid gap-3">
            {disciplinasVisiveis.map((d) => (
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
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {ctb && (
              <DisciplinaDesempenhoCard disciplina={ctb} />
            )}
            <div className="grid gap-3 sm:grid-cols-2">
              {demais.map((d) => (
                <DisciplinaDesempenhoCard key={d.disciplina} disciplina={d} />
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4" aria-labelledby="memoria-titulo">
        <div>
          <h2 id="memoria-titulo" className="text-lg font-semibold">
            Memória e fixação
          </h2>
          <p className="text-sm text-muted-foreground">
            Ciclo de revisão e ganho após estudo reverso visual
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <CicloRetencao
            resumo={retencao}
            atividade={desempenho.atividade}
            embedded
          />
          <EstudoReversoResumoCard resumo={reversoResumo} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Sessões recentes</h2>
        <SessoesRecentesList sessoes={desempenho.sessoesRecentes} />
      </section>

      <ResetDesempenhoForm temHistorico={temHistorico} />
    </div>
  );
}
