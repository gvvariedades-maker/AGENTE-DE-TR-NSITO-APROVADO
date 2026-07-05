import type { ConteudoTextoDestaque } from "@/types/estudo-reverso-visual";
import { cn } from "@/lib/utils";

export function TelaTextoDestaque({
  conteudo,
}: {
  conteudo: ConteudoTextoDestaque;
}) {
  return (
    <p className="rounded-xl border border-transito/20 bg-transito/5 px-4 py-5 text-base leading-relaxed">
      {conteudo.destaques?.length
        ? conteudo.texto.split(/(\s+)/).map((part, i) => {
            const limpo = part.replace(/[^\wÀ-ú]/g, "");
            const destaque = conteudo.destaques?.some((d) =>
              limpo.toLowerCase().includes(d.toLowerCase()),
            );
            return (
              <span
                key={i}
                className={cn(destaque && "font-semibold text-transito-foreground")}
              >
                {part}
              </span>
            );
          })
        : conteudo.texto}
    </p>
  );
}
