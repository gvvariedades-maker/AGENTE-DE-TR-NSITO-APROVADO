export const ARQUETIPOS_VISUAIS = [
  "fluxograma_decisao",
  "comparacao",
  "matriz_assertivas",
  "tabela_gradacao",
  "trecho_legal",
  "linha_tempo",
  "diagrama_competencia",
  "texto_destaque",
  "micro_recall",
] as const;

export type ArquetipoVisual = (typeof ARQUETIPOS_VISUAIS)[number];

export interface LinkFonte {
  rotulo: string;
  path: string;
}

export interface DestaqueTexto {
  inicio: number;
  fim: number;
  motivo: string;
}

export interface ConteudoTextoDestaque {
  texto: string;
  destaques?: string[];
}

export interface NoFluxograma {
  id: string;
  label: string;
  tipo: "pergunta" | "acao" | "lei" | "resultado";
  ref?: string;
}

export interface ArestaFluxograma {
  de: string;
  para: string;
  rotulo?: string;
}

export interface ConteudoFluxograma {
  nos: NoFluxograma[];
  arestas: ArestaFluxograma[];
}

export interface ConteudoComparacao {
  colunas: [string, string];
  linhas: [string, string][];
}

export interface ItemAssertiva {
  id: string;
  texto: string;
  correto: boolean;
}

export interface ConteudoMatrizAssertivas {
  itens: ItemAssertiva[];
  gabarito_resumo: string;
}

export interface LinhaGradacao {
  faixa: string;
  classificacao: string;
  destaque?: boolean;
}

export interface ConteudoTabelaGradacao {
  titulo_colunas: [string, string];
  linhas: LinhaGradacao[];
}

export interface ConteudoTrechoLegal {
  fonte: string;
  texto: string;
  trechos_grifados?: DestaqueTexto[];
}

export interface EventoLinhaTempo {
  ordem: number;
  rotulo: string;
  descricao: string;
}

export interface ConteudoLinhaTempo {
  eventos: EventoLinhaTempo[];
}

export interface NoCompetencia {
  id: string;
  label: string;
  nivel: number;
}

export interface ArestaCompetencia {
  de: string;
  para: string;
  rotulo?: string;
}

export interface ConteudoDiagramaCompetencia {
  nos: NoCompetencia[];
  arestas: ArestaCompetencia[];
}

export interface ConteudoMicroRecall {
  pergunta: string;
  resposta_esperada: string;
  dica?: string;
  aceitar_variacoes?: string[];
}

export type TelaVisual =
  | {
      id: string;
      titulo: string;
      tipo: "texto_destaque";
      conteudo: ConteudoTextoDestaque;
    }
  | {
      id: string;
      titulo: string;
      tipo: "fluxograma";
      conteudo: ConteudoFluxograma;
    }
  | {
      id: string;
      titulo: string;
      tipo: "comparacao";
      conteudo: ConteudoComparacao;
    }
  | {
      id: string;
      titulo: string;
      tipo: "matriz_assertivas";
      conteudo: ConteudoMatrizAssertivas;
    }
  | {
      id: string;
      titulo: string;
      tipo: "tabela_gradacao";
      conteudo: ConteudoTabelaGradacao;
    }
  | {
      id: string;
      titulo: string;
      tipo: "trecho_legal";
      conteudo: ConteudoTrechoLegal;
    }
  | {
      id: string;
      titulo: string;
      tipo: "linha_tempo";
      conteudo: ConteudoLinhaTempo;
    }
  | {
      id: string;
      titulo: string;
      tipo: "diagrama_competencia";
      conteudo: ConteudoDiagramaCompetencia;
    }
  | {
      id: string;
      titulo: string;
      tipo: "micro_recall";
      conteudo: ConteudoMicroRecall;
    };

export interface EstudoReversoVisual {
  versao: 1;
  arquetipo: ArquetipoVisual;
  arquetipo_secundario?: ArquetipoVisual;
  duracao_estimada_seg: number;
  fundamento_slug: string;
  macete_visual: string;
  telas: TelaVisual[];
  links_fonte: LinkFonte[];
  ref_visual_id?: string;
}
