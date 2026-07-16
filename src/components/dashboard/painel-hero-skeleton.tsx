import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";

export function PainelHeroSkeleton() {
  return (
    <section
      className="grid gap-4 md:grid-cols-5"
      aria-busy="true"
      aria-label="Carregando painel"
    >
      <Card className="md:col-span-3">
        <CardHeader className="pb-3">
          <CardDescription className="h-4 w-40 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-10 w-24 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-3 w-full animate-pulse rounded-full bg-muted" />
          <div className="h-20 w-full animate-pulse rounded-lg bg-muted/70" />
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardHeader className="pb-3">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-8 w-full animate-pulse rounded bg-muted/70" />
          <div className="h-8 w-full animate-pulse rounded bg-muted/70" />
        </CardContent>
      </Card>
    </section>
  );
}
