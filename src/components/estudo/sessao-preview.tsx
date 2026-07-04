import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { labelTopicoCTB } from "@/lib/ctb-topicos";
import type { SessaoEstudoPreview } from "@/lib/estudo-reverso";
import { DISCIPLINA_LABELS } from "@/types";

interface SessaoPreviewProps {
  preview: SessaoEstudoPreview;
  tituloFiltro?: string | null;
}

export function SessaoPreview({ preview, tituloFiltro }: SessaoPreviewProps) {
  const { total, revisoesSrs, questoesPratica, modo } = preview;
  const isErros = modo === "erros";

  if (total === 0) return null;

  const escopo =
    tituloFiltro ??
    (preview.disciplina
      ? DISCIPLINA_LABELS[preview.disciplina]
      : preview.topicoSlug
        ? labelTopicoCTB(preview.topicoSlug)
        : "geral");

  return (
    <Card className="mx-4 mt-4 max-w-3xl self-center border-border">
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-base">
            {isErros ? "Sessão de erros" : "Preview da sessão"}
          </CardTitle>
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
          {isErros
            ? `Revisão das questões que você ainda não domina em ${escopo}.`
            : `Composição da sessão focada em ${escopo}.`}
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
                  ? "questão nova"
                  : "questões novas"}
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}
