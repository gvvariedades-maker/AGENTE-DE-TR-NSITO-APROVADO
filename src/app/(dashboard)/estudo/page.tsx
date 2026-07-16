import Link from "next/link";
import {
  montarSessaoEstudo,
  previewSessaoEstudo,
  parseModoSessao,
  labelModoSessao,
} from "@/lib/estudo-reverso";
import { iniciarSessaoEstudo } from "@/lib/study-sessions";
import { QUESTAO_DEMO } from "@/lib/questoes";
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

export const dynamic = "force-dynamic";

const DEMO_TOPICO = "CTB_conducao_embriaguez";
const LIMITE_SESSAO = 20;

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
  searchParams: Promise<{ disciplina?: string; topico?: string; modo?: string }>;
}) {
  const {
    disciplina: disciplinaRaw,
    topico: topicoRaw,
    modo: modoRaw,
  } = await searchParams;
  const topico = parseTopico(topicoRaw);
  const modo = parseModoSessao(modoRaw);
  const disciplina =
    parseDisciplina(disciplinaRaw) ??
    getEditalTopic(topico ?? "")?.disciplina;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const questoesDb = await montarSessaoEstudo(
    user?.id,
    LIMITE_SESSAO,
    disciplina,
    topico,
    modo,
  );

  // Preview só quando a tela de resumo pode aparecer (evita queries duplicadas).
  const preview =
    topico || questoesDb.length > 0
      ? {
          total: questoesDb.length,
          revisoesSrs: 0,
          questoesPratica: questoesDb.length,
          modo,
          topicoSlug: topico,
          disciplina,
        }
      : await previewSessaoEstudo(
          user?.id,
          LIMITE_SESSAO,
          disciplina,
          topico,
          modo,
        );

  const sessionId =
    user && questoesDb.length > 0
      ? await iniciarSessaoEstudo({
          userId: user.id,
          modo,
          disciplina,
          topicoSlug: topico,
          plannedCount: questoesDb.length,
        })
      : undefined;

  const podeDemo =
    modo !== "reais_idecan" &&
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

  const emSessao = questoes.length > 0 && !sessaoErrosVazia && !sessaoReaisVazia;
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
          {modo !== "auto" && (
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
        <SessaoPreview preview={preview} tituloFiltro={tituloFiltro} />
      )}

      {user &&
        questoesDb.length > 0 &&
        !isDemo &&
        modo !== "erros" &&
        modo !== "reais_idecan" &&
        !emSessao && (
        <Alert className="mx-4 mt-4 max-w-3xl self-center" data-foco-hide>
          <AlertTitle>Sessão {modoLabel}</AlertTitle>
          <AlertDescription>
            O motor prioriza revisões SRS, lacunas e peso do edital.
            {topico && (
              <>
                {" "}
                Foco no microtópico{" "}
                <span className="font-medium text-foreground">
                  {tituloFiltro}
                </span>
                .
              </>
            )}
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
            aula completa após cada resposta.
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
      ) : questoes.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-muted-foreground">
            {topico
              ? `O microtópico "${tituloFiltro}" está mapeado no edital, mas ainda não há questões no banco.`
              : `Ainda não há questões de ${disciplina ? DISCIPLINA_LABELS[disciplina] : "este filtro"} no banco.`}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {disciplina && (
              <Link
                href={`/estudo/catalogo?disciplina=${disciplina}`}
                className={cn(buttonVariants())}
              >
                Escolher outro microtópico
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
