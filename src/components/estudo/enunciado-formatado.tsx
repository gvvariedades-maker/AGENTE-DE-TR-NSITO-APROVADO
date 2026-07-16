import { parseEnunciado } from "@/lib/formatar-enunciado";
import { cn } from "@/lib/utils";

interface EnunciadoFormatadoProps {
  enunciado: string;
  className?: string;
}

export function EnunciadoFormatado({
  enunciado,
  className,
}: EnunciadoFormatadoProps) {
  const partes = parseEnunciado(enunciado);

  if (partes.tipo === "simples") {
    return (
      <p className={cn("text-xl leading-relaxed whitespace-pre-line sm:text-lg", className)}>
        {partes.texto}
      </p>
    );
  }

  return (
    <div className={cn("space-y-4 text-xl leading-relaxed sm:text-lg", className)}>
      <p>{partes.intro}</p>
      <ol className="space-y-3">
        {partes.assertivas.map((item) => {
          const marcador = item.match(/^(I{1,3}|IV|V)\./)?.[0] ?? "";
          const corpo = item.slice(marcador.length).trim();
          return (
            <li key={item} className="flex gap-2">
              <span className="shrink-0 font-semibold tabular-nums">
                {marcador}
              </span>
              <span>{corpo}</span>
            </li>
          );
        })}
      </ol>
      {partes.comando && (
        <p className="font-medium text-foreground">{partes.comando}</p>
      )}
    </div>
  );
}
