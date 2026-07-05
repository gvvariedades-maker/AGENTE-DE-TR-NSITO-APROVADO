import type { ConteudoDiagramaCompetencia } from "@/types/estudo-reverso-visual";
import { cn } from "@/lib/utils";

export function TelaDiagramaCompetencia({
  conteudo,
}: {
  conteudo: ConteudoDiagramaCompetencia;
}) {
  const nosOrdenados = [...conteudo.nos].sort((a, b) => a.nivel - b.nivel);

  return (
    <div className="space-y-2">
      {nosOrdenados.map((no) => (
        <div
          key={no.id}
          className={cn(
            "rounded-lg border border-border px-3 py-2 text-sm",
            no.nivel === 0 && "ml-0 font-semibold bg-muted/50",
            no.nivel === 1 && "ml-4",
            no.nivel === 2 && "ml-8",
            no.nivel >= 3 && "ml-12",
          )}
        >
          {no.label}
        </div>
      ))}
      <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
        {conteudo.arestas.map((a, i) => {
          const de = conteudo.nos.find((n) => n.id === a.de)?.label ?? a.de;
          const para = conteudo.nos.find((n) => n.id === a.para)?.label ?? a.para;
          return (
            <li key={i}>
              {de} → {para}
              {a.rotulo ? ` (${a.rotulo})` : ""}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
