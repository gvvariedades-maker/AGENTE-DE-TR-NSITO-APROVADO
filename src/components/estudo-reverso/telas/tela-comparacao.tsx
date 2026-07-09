import type { CSSProperties } from "react";
import type { ConteudoComparacao } from "@/types/estudo-reverso-visual";

export function TelaComparacao({ conteudo }: { conteudo: ConteudoComparacao }) {
  const [colA, colB] = conteudo.colunas;

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
          {conteudo.linhas.map(([a, b], i) => (
            <tr
              key={i}
              className="revelar-item border-b border-border last:border-0"
              style={{ "--i": i } as CSSProperties}
            >
              <td className="bg-semaforo-vermelho/5 px-3 py-2 text-muted-foreground">
                {a}
              </td>
              <td className="bg-semaforo-verde/5 px-3 py-2 font-medium text-foreground">
                {b}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
