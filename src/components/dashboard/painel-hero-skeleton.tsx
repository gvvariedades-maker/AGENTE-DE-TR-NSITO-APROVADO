import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";

export function PainelPlanoSkeleton() {
  return (
    <Card aria-busy="true" aria-label="Carregando plano até a prova">
      <CardHeader className="pb-3">
        <div className="flex justify-between gap-3">
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted/70" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-lg bg-muted/70"
            />
          ))}
        </div>
        <div className="h-32 animate-pulse rounded-xl bg-muted/70" />
      </CardContent>
    </Card>
  );
}

export function PainelSemanaChegadaSkeleton() {
  return (
    <section aria-busy="true" aria-label="Carregando semana de chegada">
      <Card>
        <CardContent className="space-y-4 px-4 py-4">
          <div className="flex justify-between gap-3">
            <div className="space-y-2">
              <div className="h-5 w-40 animate-pulse rounded bg-muted" />
              <div className="h-8 w-full max-w-sm animate-pulse rounded bg-muted/70" />
            </div>
            <div className="h-10 w-14 animate-pulse rounded bg-muted" />
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-lg bg-muted/70"
              />
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <div className="h-4 w-44 animate-pulse rounded bg-muted/70" />
            <div className="h-8 w-24 animate-pulse rounded bg-muted/50" />
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

/** @deprecated Use PainelSemanaChegadaSkeleton */
export const PainelHeroSkeleton = PainelSemanaChegadaSkeleton;
