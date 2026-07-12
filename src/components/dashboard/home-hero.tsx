import { Badge } from "@/components/ui/badge";

export function HomeHero() {
  return (
    <header className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border-transito/40 bg-transito/15 text-transito-foreground">
          IDECAN · Edital 04/2026
        </Badge>
        <Badge
          variant="outline"
          className="border-border text-muted-foreground"
        >
          STTP Campina Grande/PB
        </Badge>
      </div>

      <div>
        <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
          Concurso público
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Agente de Trânsito Aprovado
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Simulados espelho, estudo reverso e questões no DNA IDECAN.
        </p>
      </div>
    </header>
  );
}
