import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getDesempenhoResumo, getAtividadeHoje } from "@/lib/desempenho";
import { getRetencaoResumo } from "@/lib/retencao";
import { getQuestoesCount } from "@/lib/questoes";
import { getContagemQuestoesReais } from "@/lib/questoes-reais";
import { getPioresTopicos } from "@/lib/piores-topicos";
import { calcularProximoPasso } from "@/lib/proximo-passo";
import { DISCIPLINA_LABELS } from "@/lib/desempenho";
import { DISCIPLINAS_CRITICAS_INICIO } from "@/lib/edital-topicos";
import { PainelHero } from "@/components/dashboard/painel-hero";
import { PainelAtalhos } from "@/components/dashboard/painel-atalhos";
import { PainelCatalogoEditalLoader } from "@/components/dashboard/painel-catalogo-edital-loader";
import { PainelDisciplinasSeletor } from "@/components/dashboard/painel-disciplinas-seletor";
import { PainelMaisModos } from "@/components/dashboard/painel-mais-modos";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { withTimeout } from "@/lib/with-timeout";
import type { DesempenhoResumo } from "@/lib/desempenho";
import type { RetencaoResumo } from "@/lib/retencao";
import { DISCIPLINAS, PROVA_DATA, SIMULADO_ESPELHO_DISTRIBUICAO, type Disciplina } from "@/types";
import {
  isDisciplinaGeral,
  MAX_PONTOS_ESPECIFICOS,
  MAX_PONTOS_GERAIS,
  MIN_PONTOS_DISCIPLINA_ESPECIFICO,
  MIN_PONTOS_DISCIPLINA_GERAL,
} from "@/lib/edital-constants";

/** Timeout em contagem de reais → não desativar o card (evita "Em breve" falso). */
const REAIS_COUNT_UNKNOWN = -1;

function diasParaProvaFallback() {
  const diff = PROVA_DATA.getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function desempenhoFallback(): DesempenhoResumo {
  const dias = diasParaProvaFallback();
  const zonaVazia = {
    pontos: null as number | null,
    maximo: 0,
    minimo: 0,
    zona: "vazio" as const,
    percentual: 0,
    statusLabel: "Sem dados",
  };
  return {
    semaforo: {
      gerais: { ...zonaVazia, label: "Gerais", maximo: MAX_PONTOS_GERAIS, minimo: MIN_PONTOS_DISCIPLINA_GERAL },
      especificos: {
        ...zonaVazia,
        label: "Específicos",
        maximo: MAX_PONTOS_ESPECIFICOS,
        minimo: MIN_PONTOS_DISCIPLINA_ESPECIFICO,
      },
      total: { ...zonaVazia, label: "Total", maximo: 100, minimo: 50 },
      hasData: false,
      diasParaProva: dias,
      disciplinasEmRisco: [],
      fonte: "vazio",
    },
    disciplinas: DISCIPLINAS.map((d) => ({
      disciplina: d,
      label: DISCIPLINA_LABELS[d],
      pontos: 0,
      minimo: isDisciplinaGeral(d)
        ? MIN_PONTOS_DISCIPLINA_GERAL
        : MIN_PONTOS_DISCIPLINA_ESPECIFICO,
      zona: "vazio" as const,
      tentativas: 0,
      acertos: 0,
      taxaAcerto: 0,
      topicosTotal: 0,
      topicosMapeados: 0,
      topicosVistos: 0,
      coberturaPct: 0,
      questoesProva: SIMULADO_ESPELHO_DISTRIBUICAO[d],
    })),
    overview: { total: 0, acertos: 0, erros: 0, taxaAcerto: 0 },
    coberturaEditalPct: 0,
    topicosTotal: 0,
    topicosVistos: 0,
    topicosMapeados: 0,
    atividade: [],
    sessoesRecentes: [],
    hasData: false,
  };
}

const retencaoFallback: RetencaoResumo = {
  aprendendo: 0,
  jovem: 0,
  maduro: 0,
  revisoesHoje: 0,
  hasData: false,
};

export const dynamic = "force-dynamic";

function parseDisciplinaPainel(raw?: string): Disciplina {
  if (raw && DISCIPLINAS.includes(raw as Disciplina)) {
    return raw as Disciplina;
  }
  return "legislacao_transito";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ disciplina?: string }>;
}) {
  const { disciplina: disciplinaRaw } = await searchParams;
  const disciplinaPainel = parseDisciplinaPainel(disciplinaRaw);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const QUERY_MS = 8_000;

  const [
    desempenho,
    retencao,
    atividadeHoje,
    questoesCount,
    questoesReaisCount,
    pioresTopicos,
  ] = await Promise.all([
    withTimeout(
      getDesempenhoResumo(user?.id),
      QUERY_MS,
      desempenhoFallback(),
      "desempenho",
    ),
    withTimeout(
      getRetencaoResumo(user?.id),
      QUERY_MS,
      retencaoFallback,
      "retencao",
    ),
    withTimeout(
      getAtividadeHoje(user?.id),
      QUERY_MS,
      { questoes: 0, acertos: 0 },
      "atividadeHoje",
    ),
    withTimeout(getQuestoesCount(), QUERY_MS, 0, "questoesCount"),
    withTimeout(
      getContagemQuestoesReais(),
      QUERY_MS,
      REAIS_COUNT_UNKNOWN,
      "questoesReais",
    ),
    withTimeout(getPioresTopicos(user?.id), QUERY_MS, [], "pioresTopicos"),
  ]);

  const { semaforo } = desempenho;
  const emRisco = semaforo.disciplinasEmRisco.length > 0;
  const mostrarAlertaInicio =
    !desempenho.hasData && semaforo.disciplinasEmRisco.length === 0;

  const proximo = calcularProximoPasso({
    emRisco,
    revisoesHoje: retencao.revisoesHoje,
    questoesDisponiveis: questoesCount > 0,
  });

  const desempenhoDisciplina = desempenho.disciplinas.find(
    (d) => d.disciplina === disciplinaPainel,
  );
  const desempenhoPorDisciplina = new Map(
    desempenho.disciplinas.map((d) => [d.disciplina, d]),
  );

  const reaisAtivo = questoesReaisCount !== 0;
  const reaisDesc =
    questoesReaisCount > 0
      ? `${questoesReaisCount} questões · corpus superior`
      : questoesReaisCount < 0
        ? "Corpus superior IDECAN"
        : "Aguardando seed no banco";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 p-4 md:gap-6 md:p-8">
      <PainelHero
        desempenho={desempenho}
        retencao={retencao}
        atividadeHoje={atividadeHoje}
        proximo={proximo}
        pioresTopicos={pioresTopicos}
      />

      {emRisco ? (
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
      ) : (
        mostrarAlertaInicio && (
          <Alert>
            <AlertTitle>Primeiro passo</AlertTitle>
            <AlertDescription className="text-sm">
              Cada disciplina geral exige mínimo de{" "}
              <strong>1 ponto</strong> na prova. Comece por:{" "}
              {DISCIPLINAS_CRITICAS_INICIO.map((d) => DISCIPLINA_LABELS[d]).join(
                ", ",
              )}
              .
            </AlertDescription>
          </Alert>
        )
      )}

      <PainelAtalhos />

      <PainelDisciplinasSeletor
        disciplinaAtiva={disciplinaPainel}
        desempenhoPorDisciplina={desempenhoPorDisciplina}
      />

      <PainelCatalogoEditalLoader
        disciplina={disciplinaPainel}
        desempenhoDisciplina={desempenhoDisciplina}
      />

      <PainelMaisModos
        questoesReaisAtivo={reaisAtivo}
        questoesReaisDesc={reaisDesc}
      />
    </div>
  );
}
