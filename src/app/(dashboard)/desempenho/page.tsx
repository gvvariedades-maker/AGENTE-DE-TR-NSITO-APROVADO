import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  getDesempenhoResumo,
  getDesempenhoTopicos,
  DISCIPLINA_LABELS,
} from "@/lib/desempenho";
import { getRetencaoResumo, getEstudoReversoResumo } from "@/lib/retencao";
import { MIN_PONTOS_TOTAL } from "@/lib/edital-constants";
import { DISCIPLINAS, type Disciplina } from "@/types";
import { PainelHero } from "@/components/dashboard/painel-hero";
import { getAtividadeHoje } from "@/lib/desempenho";
import { getQuestoesCount } from "@/lib/questoes";
import { CicloRetencao } from "@/components/dashboard/ciclo-retencao";
import { EstudoReversoResumoCard } from "@/components/dashboard/estudo-reverso-resumo";
import { SemaforoZonaCard } from "@/components/dashboard/semaforo-zona-card";
import {
  DisciplinaDesempenhoCard,
  SessoesRecentesList,
} from "@/components/dashboard/disciplina-desempenho-card";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ResetDesempenhoForm } from "@/components/dashboard/reset-desempenho-form";

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
  searchParams: Promise<{ disciplina?: string; reset?: string }>;
}) {
  const { disciplina: disciplinaRaw, reset } = await searchParams;
  const disciplinaFoco = parseDisciplina(disciplinaRaw);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [
    desempenho,
    retencao,
    atividadeHoje,
    questoesCount,
    reversoResumo,
    topicosFoco,
  ] = await Promise.all([
    getDesempenhoResumo(user?.id),
    getRetencaoResumo(user?.id),
    getAtividadeHoje(user?.id),
    getQuestoesCount(),
    getEstudoReversoResumo(user?.id),
    disciplinaFoco && user?.id
      ? getDesempenhoTopicos(user.id, disciplinaFoco)
      : Promise.resolve([]),
  ]);

  const disciplinasOrdenadas = [...desempenho.disciplinas].sort((a, b) => {
    if (a.zona === "vermelho" && b.zona !== "vermelho") return -1;
    if (b.zona === "vermelho" && a.zona !== "vermelho") return 1;
    return b.pontos - a.pontos;
  });

  const temHistorico =
    desempenho.hasData || retencao.hasData || reversoResumo.hasData;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 md:p-8">
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
          Evolução detalhada por disciplina, tópico e sessão de estudo
        </p>
      </header>

      <PainelHero
        desempenho={desempenho}
        retencao={retencao}
        atividadeHoje={atividadeHoje}
        questoesDisponiveis={questoesCount > 0}
      />

      {desempenho.semaforo.hasData && (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">Semáforo de aprovação</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <SemaforoZonaCard
              metrica={desempenho.semaforo.gerais}
              minimoLabel="Mín. 1 pt/disciplina geral"
            />
            <SemaforoZonaCard
              metrica={desempenho.semaforo.especificos}
              minimoLabel="Mín. 2 pts/disciplina específica"
            />
            <SemaforoZonaCard
              metrica={desempenho.semaforo.total}
              minimoLabel={`Mín. ${MIN_PONTOS_TOTAL} pts na prova`}
            />
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold">Por disciplina</h2>
            <p className="text-sm text-muted-foreground">
              {disciplinaFoco
                ? `Foco: ${DISCIPLINA_LABELS[disciplinaFoco]}`
                : "Clique para ver tópicos estudados"}
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

        <div className="grid gap-3 sm:grid-cols-2">
          {disciplinasOrdenadas
            .filter((d) => !disciplinaFoco || d.disciplina === disciplinaFoco)
            .map((d) => (
              <DisciplinaDesempenhoCard
                key={d.disciplina}
                disciplina={d}
                expandida={disciplinaFoco === d.disciplina}
                topicos={
                  disciplinaFoco === d.disciplina
                    ? topicosFoco.map((t) => ({
                        slug: t.slug,
                        tentativas: t.tentativas,
                        taxaAcerto: t.taxaAcerto,
                      }))
                    : undefined
                }
              />
            ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Sessões recentes</h2>
        <SessoesRecentesList sessoes={desempenho.sessoesRecentes} />
      </section>

      <CicloRetencao resumo={retencao} atividade={desempenho.atividade} />

      <EstudoReversoResumoCard resumo={reversoResumo} />

      <ResetDesempenhoForm temHistorico={temHistorico} />
    </div>
  );
}
