import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { labelTopicoEdital } from "@/lib/edital-topicos";
import type { SessaoEstudoPreview } from "@/lib/estudo-reverso";
import { labelModoSessao } from "@/lib/motor-ata";
import { DISCIPLINA_LABELS } from "@/types";

interface SessaoPreviewProps {
  preview: SessaoEstudoPreview;
  tituloFiltro?: string | null;
  missaoHoje?: boolean;
  metaQuestoes?: number;
}

export function SessaoPreview({
  preview,
  tituloFiltro,
  missaoHoje = false,
  metaQuestoes,
}: SessaoPreviewProps) {
  const { total, revisoesSrs, questoesPratica, modo } = preview;
  const isErros = modo === "erros";
  const isRevisoes = modo === "revisoes";
  const modoLabel = labelModoSessao(modo);

  if (total === 0) return null;

  const escopo =
    tituloFiltro ??
    (preview.disciplina
      ? DISCIPLINA_LABELS[preview.disciplina]
      : preview.topicoSlug
        ? labelTopicoEdital(preview.topicoSlug)
        : "geral");

  const tituloCard = missaoHoje
    ? `Missão de hoje · ${metaQuestoes ?? total} questões`
    : isErros
      ? "Sessão de erros"
      : isRevisoes
        ? "Revisões de hoje"
        : "Preview da sessão";

  return (
    <Card className="mx-4 mt-4 max-w-3xl self-center border-border">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">{tituloCard}</CardTitle>
          <Badge variant="outline" className="text-xs">
            {modoLabel}
          </Badge>
          {isErros && (
            <Badge
              variant="outline"
              className="border-semaforo-vermelho/40 text-semaforo-vermelho"
            >
              Caderno de erros
            </Badge>
          )}
        </div>
        <CardDescription>
          {missaoHoje
            ? `Fila escolhida pela IA para hoje — só estas questões contam na meta. Foco: ${escopo}.`
            : isErros
              ? `Revisão das questões que você ainda não domina em ${escopo}.`
              : isRevisoes
                ? `Só itens agendados para rever hoje — repetição espaçada, sem questões novas.`
                : `Composição da sessão focada em ${escopo} — motor ATA ativo.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">{total}</span>{" "}
            {total === 1 ? "questão" : "questões"} no total
          </li>
          {revisoesSrs > 0 && (
            <li>
              <span className="font-medium text-semaforo-amarelo">
                {revisoesSrs}
              </span>{" "}
              {revisoesSrs === 1 ? "revisão SRS" : "revisões SRS"} vencidas
              (prioridade)
            </li>
          )}
          {questoesPratica > 0 && (
            <li>
              <span className="font-medium text-foreground">
                {questoesPratica}
              </span>{" "}
              {isErros
                ? questoesPratica === 1
                  ? "questão com último erro"
                  : "questões com último erro"
                : questoesPratica === 1
                  ? "questão priorizada pelo motor"
                  : "questões priorizadas pelo motor"}
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
