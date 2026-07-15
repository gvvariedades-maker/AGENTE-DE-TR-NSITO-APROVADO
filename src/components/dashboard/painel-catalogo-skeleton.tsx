import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DISCIPLINA_LABELS, type Disciplina } from "@/types";

export function PainelCatalogoSkeleton({
  disciplina,
}: {
  disciplina: Disciplina;
}) {
  return (
    <Card className="overflow-hidden" aria-busy="true" aria-label="Carregando microtópicos">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Microtópicos · {DISCIPLINA_LABELS[disciplina]}
        </CardTitle>
        <CardDescription>Carregando catálogo…</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-14 w-full animate-pulse rounded-lg bg-muted/70"
          />
        ))}
      </CardContent>
    </Card>
  );
}
