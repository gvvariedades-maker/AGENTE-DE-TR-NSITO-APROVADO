import type { CSSProperties } from "react";
import type { ConteudoLinhaTempo } from "@/types/estudo-reverso-visual";

export function TelaLinhaTempo({ conteudo }: { conteudo: ConteudoLinhaTempo }) {
  const eventos = [...conteudo.eventos].sort((a, b) => a.ordem - b.ordem);

  return (
    <ol className="relative space-y-3 border-l-2 border-transito/30 pl-5">
      {eventos.map((ev, i) => (
        <li
          key={ev.ordem}
          className="revelar-item relative"
          style={{ "--i": i } as CSSProperties}
        >
          <span
            className="absolute -left-[1.6rem] top-3 flex size-6 items-center justify-center rounded-full bg-transito text-[11px] font-bold text-white shadow-sm"
            aria-hidden
          >
            {ev.ordem}
          </span>
          <div className="rounded-xl border border-border/80 bg-card px-3.5 py-3 shadow-sm">
            <p className="text-[15px] font-semibold leading-snug text-foreground">
              {ev.rotulo}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {ev.descricao}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
