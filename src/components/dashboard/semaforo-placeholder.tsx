import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SemaforoPlaceholder() {
  return (
    <Card className="border-dashed border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Semáforo de aprovação</CardTitle>
        <CardDescription>
          Gerais, específicos e nota total — critérios do edital STTP
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          Complete questões ou um simulado espelho para projetar seu risco de
          eliminação por disciplina. O painel mostrará verde, amarelo ou
          vermelho conforme o edital IDECAN.
        </p>
        <p className="text-xs text-muted-foreground">
          Mínimos: 50 pts total · 1 pt (gerais) · 2 pts (específicos) por
          disciplina
        </p>
      </CardContent>
    </Card>
  );
}
