import Link from "next/link";
import {
  montarSessaoEstudo,
  previewSessaoEstudo,
  parseModoSessao,
  labelModoSessao,
} from "@/lib/estudo-reverso";
import { iniciarSessaoEstudo, obterOuIniciarSessaoMissaoHoje, buscarSessaoMissaoHoje, invalidarFilasMissaoHojeOutrasDisciplinas } from "@/lib/study-sessions";
import { QUESTAO_DEMO, getQuestoesByIds } from "@/lib/questoes";
import { createClient } from "@/lib/supabase/server";
import { QuestaoView } from "@/components/estudo/questao-view";
import { SessaoPreview } from "@/components/estudo/sessao-preview";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeQuestaoReal } from "@/components/estudo/badge-questao-real";
import {
  DISCIPLINAS,
  DISCIPLINA_LABELS,
  type Disciplina,
} from "@/types";
import { hrefVitrineReais } from "@/lib/estudo-links";
import { getEditalTopic, labelTopicoEdital } from "@/lib/edital-topicos";
import { carregarMissaoHoje } from "@/lib/tutor/missao-hoje";
import type { SessaoMissaoContext } from "@/lib/estudo-reverso";

export const dynamic = "force-dynamic";

const DEMO_TOPICO = "CTB_conducao_embriaguez";
const LIMITE_SESSAO_PADRAO = 20;
const LIMITE_REVISOES = 50;
const LIMITE_MISSAO_MIN = 10;
const LIMITE_MISSAO_MAX = 30;

function clampLimite(n: number): number {
  return Math.min(LIMITE_MISSAO_MAX, Math.max(LIMITE_MISSAO_MIN, n));
}

function parseLimit(
  raw: string | undefined,
  modo: ReturnType<typeof parseModoSessao>,
  missaoHoje: boolean,
): number {
  if (raw?.trim()) {
    const n = Number.parseInt(raw, 10);
    if (!Number.isNaN(n)) return clampLimite(n);
  }
  if (modo === "revisoes" && !missaoHoje) return LIMITE_REVISOES;
  return LIMITE_SESSAO_PADRAO;
}

function parseMissaoHoje(raw?: string): boolean {
  return raw === "hoje";
}

function parseDisciplina(raw?: string): Disciplina | undefined {
  if (!raw) return undefined;
  return DISCIPLINAS.includes(raw as Disciplina)
    ? (raw as Disciplina)
    : undefined;
}

function parseTopico(raw?: string): string | undefined {
  if (!raw?.trim()) return undefined;
  return decodeURIComponent(raw.trim());
}

export default async function EstudoPage({
  searchParams,
}: {
  searchParams: Promise<{
    disciplina?: string;
    topico?: string;
    modo?: string;
    limit?: string;
    missao?: string;
  }>;
}) {
  const {
    disciplina: disciplinaRaw,
    topico: topicoRaw,
    modo: modoRaw,
    limit: limitRaw,
    missao: missaoRaw,
  } = await searchParams;
  const topico = parseTopico(topicoRaw);
  const modo = parseModoSessao(modoRaw);
  const missaoHoje = parseMissaoHoje(missaoRaw);
  const limite = parseLimit(limitRaw, modo, missaoHoje);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const disciplinaUrl = parseDisciplina(disciplinaRaw);
  const missaoCtx: SessaoMissaoContext | undefined =
    user && missaoHoje
      ? await carregarMissaoHoje(user.id).then((ctx) =>
          ctx
            ? {
                slots: ctx.slots,
                disciplinaFoco: ctx.disciplinaFoco,
                boostDisciplinas: ctx.calibracao.boostDisciplinas,
                topicosPrioritarios: ctx.topicosPrioritarios,
              }
            : undefined,
        )
      : undefined;

  const disciplina =
    disciplinaUrl ??
    missaoCtx?.disciplinaFoco ??
    getEditalTopic(topico ?? "")?.disciplina;

  let questoesDb =
    user && missaoHoje && missaoCtx
      ? await (async () => {
          if (disciplina) {
            await invalidarFilasMissaoHojeOutrasDisciplinas(
              user.id,
              disciplina,
            );
          }
          const existente = await buscarSessaoMissaoHoje(
            user.id,
            disciplina,
          );
          if (existente) {
            return getQuestoesByIds(existente.plannedQuestionIds);
          }
          return montarSessaoEstudo(
            user.id,
            limite,
            disciplina,
            topico,
            modo,
            missaoCtx,
          );
        })()
      : await montarSessaoEstudo(
          user?.id,
          limite,
          disciplina,
          topico,
          modo,
          missaoCtx,
        );

  let sessionId: string | undefined;

  if (user && questoesDb.length > 0 && missaoHoje && missaoCtx) {
    const missaoSessao = await obterOuIniciarSessaoMissaoHoje({
      userId: user.id,
      modo,
      disciplina,
      topicoSlug: topico,
      plannedQuestionIds: questoesDb.map((q) => q.id),
    });
    sessionId = missaoSessao.sessionId;
    if (
      missaoSessao.reusada &&
      missaoSessao.plannedQuestionIds.join() !==
        questoesDb.map((q) => q.id).join()
    ) {
      const reordenadas = await getQuestoesByIds(
        missaoSessao.plannedQuestionIds,
      );
      if (reordenadas.length > 0) questoesDb = reordenadas;
    }
  } else if (user && questoesDb.length > 0) {
    sessionId = await iniciarSessaoEstudo({
      userId: user.id,
      modo,
      disciplina,
      topicoSlug: topico,
      plannedCount: questoesDb.length,
    });
  }

  // Preview só quando a tela de resumo pode aparecer (evita queries duplicadas).
  const preview =
    topico || questoesDb.length > 0
      ? {
          total: questoesDb.length,
          revisoesSrs: modo === "revisoes" ? questoesDb.length : 0,
          questoesPratica: modo === "revisoes" ? 0 : questoesDb.length,
          modo,
          topicoSlug: topico,
          disciplina,
        }
      : await previewSessaoEstudo(
          user?.id,
          limite,
          disciplina,
          topico,
          modo,
          missaoCtx,
        );

  const podeDemo =
    modo !== "reais_idecan" &&
    modo !== "revisoes" &&
    (modo === "auto" || modo === "normal") &&
    (!topico ||
      topico === DEMO_TOPICO ||
      !disciplina ||
      disciplina === "legislacao_transito");

  const questoes =
    questoesDb.length > 0
      ? questoesDb
      : podeDemo && (!disciplina || disciplina === "legislacao_transito")
        ? [QUESTAO_DEMO]
        : [];

  const isDemo =
    questoesDb.length === 0 &&
    questoes.length > 0 &&
    podeDemo &&
    (!disciplina || disciplina === "legislacao_transito");

  const tituloFiltro = topico
    ? labelTopicoEdital(topico)
    : disciplina
      ? DISCIPLINA_LABELS[disciplina]
      : null;

  const badgeEscopo =
    topico && disciplina
      ? `${DISCIPLINA_LABELS[disciplina]} · ${tituloFiltro}`
      : tituloFiltro;

  const sessaoReaisVazia =
    modo === "reais_idecan" && questoesDb.length === 0 && !isDemo;

  const sessaoErrosVazia =
    modo === "erros" && user && questoesDb.length === 0 && !isDemo;

  const sessaoRevisoesVazia =
    modo === "revisoes" && user && questoesDb.length === 0 && !isDemo;

  const emSessao = questoes.length > 0 && !sessaoErrosVazia && !sessaoReaisVazia && !sessaoRevisoesVazia;
  const modoLabel = labelModoSessao(modo);

  return (
    <div className="flex flex-1 flex-col">
      {tituloFiltro && !emSessao && (
        <div
          className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2"
          data-foco-hide
        >
          <Badge variant="secondary" className="text-xs">
            {badgeEscopo}
          </Badge>
          {modo !== "auto" && modo !== "normal" && (
            <Badge variant="outline" className="text-xs">
              {modoLabel}
            </Badge>
          )}
          {modo === "reais_idecan" && (
            <BadgeQuestaoReal tags={["real_idecan"]} variant="compact" />
          )}
        </div>
      )}

      {user && preview.total > 0 && !isDemo && !emSessao && (
        <SessaoPreview
          preview={preview}
          tituloFiltro={tituloFiltro}
          missaoHoje={missaoHoje}
          metaQuestoes={limite}
        />
      )}

      {user &&
        questoesDb.length > 0 &&
        !isDemo &&
        modo !== "erros" &&
        modo !== "reais_idecan" &&
        modo !== "revisoes" &&
        !emSessao && (
        <Alert className="mx-4 mt-4 max-w-3xl self-center" data-foco-hide>
          <AlertTitle>Sessão {modoLabel}</AlertTitle>
          <AlertDescription>
            O motor prioriza revisões SRS, lacunas e peso do edital.
            {topico && (
              <>
                {" "}
                Foco no assunto{" "}
                <span className="font-medium text-foreground">
                  {tituloFiltro}
                </span>
                .
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {modo === "revisoes" &&
        questoesDb.length > 0 &&
        !isDemo &&
        !emSessao && (
        <Alert className="mx-4 mt-4 max-w-3xl self-center border-semaforo-amarelo/30 bg-semaforo-amarelo/5" data-foco-hide>
          <AlertTitle>Revisões de hoje</AlertTitle>
          <AlertDescription>
            Só questões que você já estudou e o app marcou para rever agora —
            {preview.total === 1
              ? " 1 item nesta sessão."
              : ` ${preview.total} itens nesta sessão.`}{" "}
            Sem questões novas do Motor ATA.
          </AlertDescription>
        </Alert>
      )}

      {modo === "reais_idecan" &&
        questoesDb.length > 0 &&
        !isDemo &&
        !emSessao && (
        <Alert className="mx-4 mt-4 max-w-3xl self-center border-amber-500/30 bg-amber-500/5" data-foco-hide>
          <AlertTitle className="flex flex-wrap items-center gap-2">
            Questões reais IDECAN
            <BadgeQuestaoReal tags={["real_idecan"]} variant="compact" />
          </AlertTitle>
          <AlertDescription>
            Sessão só com provas do corpus superior — enunciado fiel ao PDF, com
            estudo reverso completo após cada resposta.
            {topico && (
              <>
                {" "}
                Foco:{" "}
                <span className="font-medium text-foreground">{tituloFiltro}</span>.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {isDemo && !emSessao && (
        <Alert className="mx-4 mt-3 max-w-3xl self-center py-3" data-foco-hide>
          <AlertTitle className="text-sm">Demonstração CTB</AlertTitle>
          <AlertDescription className="text-xs">
            Tentativas não são salvas. Questões reais aparecem após o seed do
            banco.
          </AlertDescription>
        </Alert>
      )}

      {sessaoReaisVazia ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma questão real IDECAN
            {topico ? ` em "${tituloFiltro}"` : ""}
            {disciplina && !topico
              ? ` em ${DISCIPLINA_LABELS[disciplina]}`
              : ""}
            .
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href={hrefVitrineReais()} className={cn(buttonVariants())}>
              Ver vitrine de reais
            </Link>
            {disciplina && (
              <Link
                href={`/estudo/catalogo?disciplina=${disciplina}`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Catálogo completo
              </Link>
            )}
          </div>
        </div>
      ) : sessaoErrosVazia ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma questão com erro recente
            {topico ? ` em "${tituloFiltro}"` : ""}.
            {preview.revisoesSrs === 0
              ? " Resolva questões no modo normal para montar seu caderno de erros."
              : ""}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {topico && disciplina && (
              <Link
                href={`/estudo?disciplina=${disciplina}&topico=${encodeURIComponent(topico)}`}
                className={cn(buttonVariants())}
              >
                Estudar {tituloFiltro}
              </Link>
            )}
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Voltar ao painel
            </Link>
          </div>
        </div>
      ) : sessaoRevisoesVazia ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma revisão pendente para hoje. Volte amanhã ou estude questões
            novas para o ciclo gerar novas revisões.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/estudo?modo=auto" className={cn(buttonVariants())}>
              Estudar com Motor ATA
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Voltar ao painel
            </Link>
          </div>
        </div>
      ) : questoes.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-muted-foreground">
            {topico
              ? `O assunto "${tituloFiltro}" está mapeado no edital, mas ainda não há questões no banco.`
              : `Ainda não há questões de ${disciplina ? DISCIPLINA_LABELS[disciplina] : "este filtro"} no banco.`}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {disciplina && (
              <Link
                href={`/estudo/catalogo?disciplina=${disciplina}`}
                className={cn(buttonVariants())}
              >
                Escolher outro assunto
              </Link>
            )}
            {disciplina && (
              <Link
                href={`/estudo?disciplina=${disciplina}&modo=auto`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Estudar disciplina inteira
              </Link>
            )}
            {!disciplina && (
              <Link href="/estudo" className={cn(buttonVariants())}>
                Estudar CTB (demonstração)
              </Link>
            )}
          </div>
        </div>
      ) : (
        <QuestaoView
          questoes={questoes}
          modo="estudo"
          isDemo={isDemo}
          sessionId={sessionId}
          catalogoDisciplina={disciplina}
          rotuloSessao={modo === "revisoes" ? "Revisão agendada" : undefined}
        />
      )}

      {!emSessao && (
        <div className="border-t border-border p-4" data-foco-hide>
          <Link
            href="/dashboard"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            ← Voltar ao painel
          </Link>
        </div>
      )}
    </div>
  );
}
