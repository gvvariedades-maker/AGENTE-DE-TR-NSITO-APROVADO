import type { ConteudoTrechoLegal } from "@/types/estudo-reverso-visual";
import { cn } from "@/lib/utils";

export function TelaTrechoLegal({ conteudo }: { conteudo: ConteudoTrechoLegal }) {
  const texto = conteudo.texto;
  const grifos = conteudo.trechos_grifados ?? [];

  const partes: { texto: string; grifo: boolean }[] = [];
  let cursor = 0;

  const ordenados = [...grifos].sort((a, b) => a.inicio - b.inicio);

  for (const g of ordenados) {
    if (g.inicio > cursor) {
      partes.push({ texto: texto.slice(cursor, g.inicio), grifo: false });
    }
    partes.push({ texto: texto.slice(g.inicio, g.fim), grifo: true });
    cursor = g.fim;
  }
  if (cursor < texto.length) {
    partes.push({ texto: texto.slice(cursor), grifo: false });
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        {conteudo.fonte}
      </p>
      <blockquote className="rounded-lg border border-transito/30 bg-transito/5 px-4 py-3 text-sm leading-relaxed">
        {partes.length > 0
          ? partes.map((p, i) => (
              <span
                key={i}
                className={cn(
                  p.grifo &&
                    "rounded bg-transito/20 px-0.5 font-semibold text-transito-foreground",
                )}
              >
                {p.texto}
              </span>
            ))
          : texto}
      </blockquote>
    </div>
  );
}
