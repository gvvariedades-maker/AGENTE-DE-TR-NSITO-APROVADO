import type { CSSProperties } from "react";
import type { ConteudoComparacao, Secao } from "@/types/estudo-reverso-visual";
import {
  formatarCelulaDistratorParaAluno,
  formatarTituloColunaDistrator,
  isCelulaComSlugDistrator,
} from "@/lib/mecanismo-distrator-labels";
import {
  inferirModoComparacao,
  type ModoComparacao,
} from "@/lib/estudo-reverso/modo-comparacao";
import { cn } from "@/lib/utils";
import { TelaConteudoShell } from "./tela-conteudo-shell";

interface TelaComparacaoProps {
  conteudo: ConteudoComparacao;
  /** Quando true, substitui slugs IDECAN por rótulos legíveis. */
  humanizarDistratores?: boolean;
  secao?: Secao;
}

function celulaEsquerda(
  texto: string,
  humanizarDistratores: boolean,
): string {
  return humanizarDistratores || isCelulaComSlugDistrator(texto)
    ? formatarCelulaDistratorParaAluno(texto)
    : texto;
}

function ComparacaoTabela({
  colA,
  colB,
  linhas,
  modo,
  humanizarDistratores,
}: {
  colA: string;
  colB: string;
  linhas: [string, string][];
  modo: "contraste" | "distratores";
  humanizarDistratores: boolean;
}) {
  const headerA =
    modo === "contraste"
      ? "text-semaforo-vermelho"
      : "text-muted-foreground";
  const headerB =
    modo === "contraste"
      ? "text-semaforo-verde"
      : "text-transito-foreground";
  const cellA =
    modo === "contraste"
      ? "bg-semaforo-vermelho/5 text-muted-foreground"
      : "bg-muted/40 text-muted-foreground";
  const cellB =
    modo === "contraste"
      ? "bg-semaforo-verde/5 font-medium text-foreground"
      : "bg-transito/5 font-medium text-foreground";

  return (
    <TelaConteudoShell variant="tabela" className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th
              className={cn(
                "px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide",
                headerA,
              )}
            >
              {colA}
            </th>
            <th
              className={cn(
                "px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide",
                headerB,
              )}
            >
              {colB}
            </th>
          </tr>
        </thead>
        <tbody>
          {linhas.map(([a, b], i) => (
            <tr
              key={i}
              className="revelar-item border-b border-border/70 last:border-0"
              style={{ "--i": i } as CSSProperties}
            >
              <td
                className={cn(
                  "px-4 py-3 text-[15px] leading-relaxed",
                  cellA,
                )}
              >
                {celulaEsquerda(a, humanizarDistratores)}
              </td>
              <td
                className={cn(
                  "px-4 py-3 text-[15px] leading-relaxed",
                  cellB,
                )}
              >
                {b}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </TelaConteudoShell>
  );
}

/** Método / mapa / conceito: pares empilhados, sem semáforo. */
function ComparacaoPares({
  colA,
  colB,
  linhas,
}: {
  colA: string;
  colB: string;
  linhas: [string, string][];
}) {
  return (
    <ul className="space-y-2.5" aria-label={`${colA} × ${colB}`}>
      {linhas.map(([a, b], i) => (
        <li
          key={i}
          className="revelar-item overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm"
          style={{ "--i": i } as CSSProperties}
        >
          <div className="border-b border-border/60 bg-muted/30 px-3.5 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {colA}
            </p>
            <p className="mt-0.5 text-[15px] leading-relaxed text-foreground">
              {a}
            </p>
          </div>
          <div className="border-l-4 border-l-transito px-3.5 py-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-transito-foreground">
              {colB}
            </p>
            <p className="mt-0.5 text-[15px] font-medium leading-relaxed text-foreground">
              {b}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function TelaComparacao({
  conteudo,
  humanizarDistratores = false,
  secao,
}: TelaComparacaoProps) {
  const [colARaw, colBRaw] = conteudo.colunas;
  const colA = humanizarDistratores
    ? formatarTituloColunaDistrator(colARaw)
    : colARaw;
  const colB = humanizarDistratores
    ? formatarTituloColunaDistrator(colBRaw)
    : colBRaw;

  const modo: ModoComparacao = inferirModoComparacao(colARaw, colBRaw, {
    humanizarDistratores,
    secao,
  });

  if (modo === "neutro") {
    return (
      <ComparacaoPares colA={colA} colB={colB} linhas={conteudo.linhas} />
    );
  }

  return (
    <ComparacaoTabela
      colA={colA}
      colB={colB}
      linhas={conteudo.linhas}
      modo={modo}
      humanizarDistratores={humanizarDistratores}
    />
  );
}
