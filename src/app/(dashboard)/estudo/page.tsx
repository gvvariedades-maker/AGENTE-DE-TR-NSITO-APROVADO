import Link from "next/link";
import {
  montarSessaoEstudo,
  previewSessaoEstudo,
  type ModoSessaoEstudo,
} from "@/lib/estudo-reverso";
import { QUESTAO_DEMO } from "@/lib/questoes";
import { createClient } from "@/lib/supabase/server";
import { QuestaoView } from "@/components/estudo/questao-view";
import { SessaoPreview } from "@/components/estudo/sessao-preview";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import {
  DISCIPLINAS,
  DISCIPLINA_LABELS,
  type Disciplina,
} from "@/types";
import { labelTopicoCTB } from "@/lib/ctb-topicos";
import { Badge } from "@/components/ui/badge";

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

function parseModoSessao(raw?: string): ModoSessaoEstudo {
  return raw === "erros" ? "erros" : "normal";
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
    (topico ? "legislacao_transito" : undefined);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [questoesDb, preview] = await Promise.all([
    montarSessaoEstudo(
      user?.id,
      LIMITE_SESSAO,
      disciplina,
      topico,
      modo,
    ),
    previewSessaoEstudo(
      user?.id,
      LIMITE_SESSAO,
      disciplina,
      topico,
      modo,
    ),
  ]);

  const podeDemo =
    modo === "normal" &&
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
    ? labelTopicoCTB(topico)
    : disciplina
      ? DISCIPLINA_LABELS[disciplina]
      : null;

  const sessaoErrosVazia =
    modo === "erros" && user && questoesDb.length === 0 && !isDemo;

  const emSessao = questoes.length > 0 && !sessaoErrosVazia;

  return (
    <div className="flex flex-1 flex-col">
      {tituloFiltro && !emSessao && (
        <div
          className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-2"
          data-foco-hide
        >
          <Badge variant="secondary" className="text-xs">
            {topico ? `CTB · ${tituloFiltro}` : tituloFiltro}
          </Badge>
          {modo === "erros" && (
            <Badge
              variant="outline"
              className="text-xs border-semaforo-vermelho/40 text-semaforo-vermelho"
            >
              Só erros
            </Badge>
          )}
        </div>
      )}

      {user && preview.total > 0 && !isDemo && !emSessao && (
        <SessaoPreview preview={preview} tituloFiltro={tituloFiltro} />
      )}

      {user &&
        questoesDb.length > 0 &&
        !isDemo &&
        modo === "normal" &&
        !emSessao && (
        <Alert className="mx-4 mt-4 max-w-3xl self-center" data-foco-hide>
          <AlertTitle>Sessão com estudo reverso ativo</AlertTitle>
          <AlertDescription>
            Revisões SRS vencidas entram primeiro. Ao errar, questões irmãs são
            intercaladas na sessão e o próximo intervalo é calculado pelo FSRS.
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

      {isDemo && !emSessao && (
        <Alert className="mx-4 mt-3 max-w-3xl self-center py-3" data-foco-hide>
          <AlertTitle className="text-sm">Demonstração CTB</AlertTitle>
          <AlertDescription className="text-xs">
            Tentativas não são salvas. Questões reais aparecem após o seed do
            banco.
          </AlertDescription>
        </Alert>
      )}

      {sessaoErrosVazia ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-muted-foreground">
            Nenhuma questão com erro recente
            {topico ? ` em "${tituloFiltro}"` : ""}.
            {preview.revisoesSrs === 0
              ? " Resolva questões no modo normal para montar seu caderno de erros."
              : ""}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {topico && (
              <Link
                href={`/estudo?topico=${encodeURIComponent(topico)}`}
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
            Ainda não há questões
            {topico
              ? ` de "${tituloFiltro}"`
              : disciplina
                ? ` de ${DISCIPLINA_LABELS[disciplina]}`
                : " neste filtro"}{" "}
            no banco.
          </p>
          <Link href="/estudo" className={cn(buttonVariants())}>
            Estudar CTB (demonstração)
          </Link>
        </div>
      ) : (
        <QuestaoView questoes={questoes} modo="estudo" isDemo={isDemo} />
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
