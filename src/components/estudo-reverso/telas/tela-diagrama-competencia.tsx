import type { CSSProperties } from "react";
import type { ConteudoDiagramaCompetencia } from "@/types/estudo-reverso-visual";
import { cn } from "@/lib/utils";

const NIVEL_STYLES = [
  "ml-0 border-l-4 border-l-transito bg-transito/10 font-semibold",
  "ml-3 border-l-2 border-l-blue-500/50 bg-card",
  "ml-6 border-l-2 border-l-muted-foreground/30 bg-card",
  "ml-9 border-l-2 border-l-muted-foreground/20 bg-muted/30",
] as const;

export function TelaDiagramaCompetencia({
  conteudo,
}: {
  conteudo: ConteudoDiagramaCompetencia;
}) {
  const nosOrdenados = [...conteudo.nos].sort((a, b) => a.nivel - b.nivel);

  return (
    <div className="space-y-2.5">
      {nosOrdenados.map((no, i) => (
        <div
          key={no.id}
          className={cn(
            "revelar-item rounded-xl border border-border/80 px-3.5 py-2.5 text-[15px] leading-relaxed shadow-sm",
            NIVEL_STYLES[Math.min(no.nivel, NIVEL_STYLES.length - 1)],
          )}
          style={{ "--i": i } as CSSProperties}
        >
          {no.label}
        </div>
      ))}
      {conteudo.arestas.length > 0 && (
        <div className="rounded-lg border border-dashed border-border/80 bg-muted/30 px-3 py-2.5">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Relações
          </p>
          <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
            {conteudo.arestas.map((a, i) => {
              const de =
                conteudo.nos.find((n) => n.id === a.de)?.label ?? a.de;
              const para =
                conteudo.nos.find((n) => n.id === a.para)?.label ?? a.para;
              return (
                <li key={i}>
                  {de} → {para}
                  {a.rotulo ? ` (${a.rotulo})` : ""}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
