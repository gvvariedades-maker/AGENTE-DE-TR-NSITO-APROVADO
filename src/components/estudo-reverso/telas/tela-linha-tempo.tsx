import type { ConteudoLinhaTempo } from "@/types/estudo-reverso-visual";

export function TelaLinhaTempo({ conteudo }: { conteudo: ConteudoLinhaTempo }) {
  const eventos = [...conteudo.eventos].sort((a, b) => a.ordem - b.ordem);

  return (
    <ol className="relative space-y-4 border-l-2 border-transito/40 pl-4">
      {eventos.map((ev) => (
        <li key={ev.ordem} className="relative">
          <span
            className="absolute -left-[1.35rem] top-1 flex size-5 items-center justify-center rounded-full bg-transito text-[10px] font-bold text-white"
            aria-hidden
          >
            {ev.ordem}
          </span>
          <p className="text-sm font-medium">{ev.rotulo}</p>
          <p className="text-sm text-muted-foreground">{ev.descricao}</p>
        </li>
      ))}
    </ol>
  );
}
