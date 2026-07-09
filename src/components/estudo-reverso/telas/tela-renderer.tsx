import type { TelaVisual } from "@/types/estudo-reverso-visual";
import { TelaTextoDestaque } from "./tela-texto-destaque";
import { TelaFluxograma } from "./tela-fluxograma";
import { TelaComparacao } from "./tela-comparacao";
import { TelaMatrizAssertivas } from "./tela-matriz-assertivas";
import { TelaTabelaGradacao } from "./tela-tabela-gradacao";
import { TelaTrechoLegal } from "./tela-trecho-legal";
import { TelaLinhaTempo } from "./tela-linha-tempo";
import { TelaDiagramaCompetencia } from "./tela-diagrama-competencia";

interface TelaRendererProps {
  tela: TelaVisual;
}

export function TelaRenderer({ tela }: TelaRendererProps) {
  switch (tela.tipo) {
    case "texto_destaque":
      return <TelaTextoDestaque conteudo={tela.conteudo} />;
    case "fluxograma":
      return <TelaFluxograma conteudo={tela.conteudo} />;
    case "comparacao":
      return <TelaComparacao conteudo={tela.conteudo} />;
    case "matriz_assertivas":
      return <TelaMatrizAssertivas conteudo={tela.conteudo} />;
    case "tabela_gradacao":
      return <TelaTabelaGradacao conteudo={tela.conteudo} />;
    case "trecho_legal":
      return <TelaTrechoLegal conteudo={tela.conteudo} />;
    case "linha_tempo":
      return <TelaLinhaTempo conteudo={tela.conteudo} />;
    case "diagrama_competencia":
      return <TelaDiagramaCompetencia conteudo={tela.conteudo} />;
    default:
      return null;
  }
}
