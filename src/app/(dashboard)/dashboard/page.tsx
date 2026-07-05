import Link from "next/link";
import {
  BookOpen,
  Crosshair,
  Scale,
  ShieldAlert,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { DISCIPLINAS } from "@/types";
import { MIN_PONTOS_TOTAL } from "@/lib/edital-constants";
import { getSemaforoData, DISCIPLINA_LABELS } from "@/lib/semaforo";
import { getQuestoesCount } from "@/lib/questoes";
import { getRetencaoResumo, getAtividadeSemanal, getEstudoReversoResumo } from "@/lib/retencao";
import { getPioresTopicos } from "@/lib/piores-topicos";
import { DashboardHero } from "@/components/dashboard/dashboard-hero";
import { CicloRetencao } from "@/components/dashboard/ciclo-retencao";
import { EstudoReversoResumoCard } from "@/components/dashboard/estudo-reverso-resumo";
import { SemaforoZonaCard } from "@/components/dashboard/semaforo-zona-card";
import { SemaforoPlaceholder } from "@/components/dashboard/semaforo-placeholder";
import { SuaProvaHoje } from "@/components/dashboard/sua-prova-hoje";
import { ProvaDistribuicaoBar } from "@/components/dashboard/prova-distribuicao-bar";
import { ModoTreinoCard } from "@/components/dashboard/modo-treino-card";
import { DisciplinaItem } from "@/components/dashboard/disciplina-item";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const MODOS = [
  {
    slug: "simulado_espelho",
    label: "Simulado Espelho",
    desc: "60 questões · 4 horas · proporção IDECAN",
    href: "/simulado",
    icon: Scale,
    destaque: true,
    ativo: true,
  },
  {
    slug: "sniper_ctb",
    label: "Sniper CTB",
    desc: "Foco total em Legislação de Trânsito",
    href: "/estudo?disciplina=legislacao_transito",
    icon: Crosshair,
    ativo: true,
  },
  {
    slug: "anti_zerar",
    label: "Anti-zerar",
    desc: "Disciplinas abaixo do mínimo do edital",
    icon: ShieldAlert,
    ativo: false,
  },
  {
    slug: "pegadinha_idecan",
    label: "Pegadinha IDECAN",
    desc: "Armadilhas típicas da banca",
    href: "/estudo",
    icon: BookOpen,
    ativo: true,
  },
] as const;

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [semaforo, questoesCount, retencao, atividade, pioresTopicos, reversoResumo] =
    await Promise.all([
      getSemaforoData(user?.id),
      getQuestoesCount(),
      getRetencaoResumo(user?.id),
      getAtividadeSemanal(user?.id),
      getPioresTopicos(user?.id),
      getEstudoReversoResumo(user?.id),
    ]);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 p-4 md:p-8">
      <DashboardHero
        diasParaProva={semaforo.diasParaProva}
        semaforo={semaforo}
      />

      <SuaProvaHoje
        retencao={retencao}
        pioresTopicos={pioresTopicos}
        questoesDisponiveis={questoesCount > 0}
      />

      {semaforo.disciplinasEmRisco.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Risco de eliminação — edital IDECAN</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 list-inside list-disc text-sm">
              {semaforo.disciplinasEmRisco.map((r) => (
                <li key={r.disciplina}>
                  {DISCIPLINA_LABELS[r.disciplina]}: {r.pontos.toFixed(1)} pts
                  (mín. {r.minimo})
                </li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <CicloRetencao resumo={retencao} atividade={atividade} />

      <EstudoReversoResumoCard resumo={reversoResumo} />

      <section aria-labelledby="semaforo-titulo" className="flex flex-col gap-4">
        {semaforo.hasData ? (
          <>
            <div>
              <h2 id="semaforo-titulo" className="text-lg font-semibold">
                Semáforo de aprovação
              </h2>
              <p className="text-sm text-muted-foreground">
                Gerais, específicos e nota total — critérios do edital STTP
              </p>
            </div>
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
            <p className="text-xs text-muted-foreground">
              Fonte:{" "}
              {semaforo.fonte === "simulado"
                ? "último simulado espelho"
                : "projeção pelas suas tentativas"}
            </p>
          </>
        ) : (
          <SemaforoPlaceholder />
        )}
      </section>

      <ProvaDistribuicaoBar />

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Modos de treino</h2>
          <p className="text-sm text-muted-foreground">
            Estratégias alinhadas ao perfil da prova e da banca
          </p>
        </div>
        <div className="grid gap-2">
          {MODOS.map((modo) => (
            <ModoTreinoCard
              key={modo.slug}
              icon={modo.icon}
              label={modo.label}
              desc={modo.desc}
              href={"href" in modo ? modo.href : undefined}
              destaque={"destaque" in modo ? modo.destaque : false}
              ativo={modo.ativo}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Disciplinas do edital</h2>
          <p className="text-sm text-muted-foreground">
            Anexo I retificado — STTP Campina Grande/PB
          </p>
        </div>
        <ul className="grid gap-2 sm:grid-cols-2">
          {DISCIPLINAS.map((d) => (
            <DisciplinaItem key={d} disciplina={d} />
          ))}
        </ul>
      </section>
    </div>
  );
}
