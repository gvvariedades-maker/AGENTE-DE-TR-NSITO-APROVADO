import type { CSSProperties } from "react";
import type { ConteudoTabelaGradacao } from "@/types/estudo-reverso-visual";
import { cn } from "@/lib/utils";
import { TelaConteudoShell } from "./tela-conteudo-shell";

export function TelaTabelaGradacao({
  conteudo,
}: {
  conteudo: ConteudoTabelaGradacao;
}) {
  const [colA, colB] = conteudo.titulo_colunas;

  return (
    <TelaConteudoShell variant="tabela" className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {colA}
            </th>
            <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {colB}
            </th>
          </tr>
        </thead>
        <tbody>
          {conteudo.linhas.map((linha, i) => (
            <tr
              key={i}
              className={cn(
                "revelar-item border-b border-border/70 last:border-0",
                linha.destaque && "bg-transito/10",
              )}
              style={{ "--i": i } as CSSProperties}
            >
              <td
                className={cn(
                  "px-4 py-3 text-[15px] leading-relaxed",
                  linha.destaque && "border-l-2 border-l-transito font-medium",
                )}
              >
                {linha.faixa}
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-[15px] leading-relaxed",
                  linha.destaque && "font-semibold text-transito-foreground",
                )}
              >
                {linha.classificacao}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TelaConteudoShell>
  );
}
