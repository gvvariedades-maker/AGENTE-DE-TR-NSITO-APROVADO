import type { CSSProperties } from "react";
import type { ConteudoComparacao } from "@/types/estudo-reverso-visual";
import {
  formatarCelulaDistratorParaAluno,
  formatarTituloColunaDistrator,
  isCelulaComSlugDistrator,
} from "@/lib/mecanismo-distrator-labels";

interface TelaComparacaoProps {
  conteudo: ConteudoComparacao;
  /** Quando true, substitui slugs IDECAN por rótulos legíveis. */
  humanizarDistratores?: boolean;
}

export function TelaComparacao({
  conteudo,
  humanizarDistratores = false,
}: TelaComparacaoProps) {
  const [colARaw, colBRaw] = conteudo.colunas;
  const colA = humanizarDistratores
    ? formatarTituloColunaDistrator(colARaw)
    : colARaw;
  const colB = humanizarDistratores
    ? formatarTituloColunaDistrator(colBRaw)
    : colBRaw;

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
          {conteudo.linhas.map(([a, b], i) => {
            const celA =
              humanizarDistratores || isCelulaComSlugDistrator(a)
                ? formatarCelulaDistratorParaAluno(a)
                : a;
            return (
              <tr
                key={i}
                className="revelar-item border-b border-border last:border-0"
                style={{ "--i": i } as CSSProperties}
              >
                <td className="bg-semaforo-vermelho/5 px-3 py-2 text-muted-foreground">
                  {celA}
                </td>
                <td className="bg-semaforo-verde/5 px-3 py-2 font-medium text-foreground">
                  {b}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
