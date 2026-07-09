import type { CSSProperties } from "react";
import type { ConteudoTabelaGradacao } from "@/types/estudo-reverso-visual";
import { cn } from "@/lib/utils";

export function TelaTabelaGradacao({
  conteudo,
}: {
  conteudo: ConteudoTabelaGradacao;
}) {
  const [colA, colB] = conteudo.titulo_colunas;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="px-3 py-2 text-left font-medium">{colA}</th>
            <th className="px-3 py-2 text-left font-medium">{colB}</th>
          </tr>
        </thead>
        <tbody>
          {conteudo.linhas.map((linha, i) => (
            <tr
              key={i}
              className={cn(
                "revelar-item border-b border-border last:border-0",
                linha.destaque && "bg-transito/10",
              )}
              style={{ "--i": i } as CSSProperties}
            >
              <td className="px-3 py-2">{linha.faixa}</td>
              <td
                className={cn(
                  "px-3 py-2",
                  linha.destaque && "font-semibold text-transito-foreground",
                )}
              >
                {linha.classificacao}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
