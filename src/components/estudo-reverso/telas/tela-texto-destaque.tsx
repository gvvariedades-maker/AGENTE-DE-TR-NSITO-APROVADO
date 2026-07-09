import type { ConteudoTextoDestaque } from "@/types/estudo-reverso-visual";
import { cn } from "@/lib/utils";

export function TelaTextoDestaque({
  conteudo,
}: {
  conteudo: ConteudoTextoDestaque;
}) {
  const paragrafos = conteudo.texto.split(/\n\n+/).filter(Boolean);

  return (
    <div className="rounded-xl border border-transito/25 bg-transito-muted px-4 py-4">
      {paragrafos.map((paragrafo, idx) => (
        <p
          key={idx}
          className={cn(
            "text-base leading-relaxed text-foreground",
            idx > 0 && "mt-3",
          )}
        >
          {conteudo.destaques?.length
            ? paragrafo.split(/(\s+)/).map((part, i) => {
                const limpo = part.replace(/[^\wÀ-ú]/g, "");
                const destaque = conteudo.destaques?.some((d) =>
                  limpo.toLowerCase().includes(d.toLowerCase()),
                );
                return (
                  <span
                    key={i}
                    className={cn(
                      destaque && "font-semibold text-transito-foreground",
                    )}
                  >
                    {part}
                  </span>
                );
              })
            : paragrafo}
        </p>
      ))}
    </div>
  );
}
