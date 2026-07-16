import { segmentarTextoEmBlocos } from "@/lib/estudo-reverso/segmentar-texto-estudo";
import { cn } from "@/lib/utils";

function renderComDestaques(texto: string, destaques?: string[]) {
  if (!destaques?.length) return texto;

  return texto.split(/(\s+)/).map((part, i) => {
    const limpo = part.replace(/[^\wÀ-ú]/g, "");
    const destaque = destaques.some((d) =>
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
  });
}

interface TextoSegmentadoProps {
  texto: string;
  destaques?: string[];
  classNameLinha?: string;
  classNameBloco?: string;
}

export function TextoSegmentado({
  texto,
  destaques,
  classNameLinha,
  classNameBloco,
}: TextoSegmentadoProps) {
  const blocos = segmentarTextoEmBlocos(texto);

  return (
    <>
      {blocos.map((bloco, idxBloco) => (
        <div
          key={idxBloco}
          className={cn(idxBloco > 0 && "mt-4", classNameBloco)}
        >
          {bloco.linhas.map((linha, idxLinha) => (
            <p
              key={idxLinha}
              className={cn(
                "text-[15px] leading-relaxed text-foreground",
                idxLinha > 0 && "mt-2.5",
                classNameLinha,
              )}
            >
              {renderComDestaques(linha, destaques)}
            </p>
          ))}
        </div>
      ))}
    </>
  );
}
