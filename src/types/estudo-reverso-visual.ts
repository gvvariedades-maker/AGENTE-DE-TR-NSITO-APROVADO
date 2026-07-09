export const ARQUETIPOS_VISUAIS = [
  "fluxograma_decisao",
  "comparacao",
  "matriz_assertivas",
  "tabela_gradacao",
  "trecho_legal",
  "linha_tempo",
  "diagrama_competencia",
  "texto_destaque",
] as const;

export type ArquetipoVisual = (typeof ARQUETIPOS_VISUAIS)[number];

/** Fase pedagógica da tela — signaling visual no player (dual coding + pre-training). */
export const SECOES_VISUAIS = [
  "diagnostico",
  "mapa",
  "contraste",
  "distratores",
  "metodo",
  "lei",
  "conceito",
  "recall",
  "macete",
] as const;

export type Secao = (typeof SECOES_VISUAIS)[number];

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
  /** Micro-feedback após tap-to-reveal no recall interativo. */
  porque?: string;
}

export interface ConteudoMatrizAssertivas {
  itens: ItemAssertiva[];
  gabarito_resumo: string;
  /** Contexto antes da lista (ex.: cenário do passo a passo). */
  intro?: string;
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

interface TelaVisualBase {
  id: string;
  titulo: string;
  secao?: Secao;
}

export type TelaVisual = TelaVisualBase &
  (
    | {
        tipo: "texto_destaque";
        conteudo: ConteudoTextoDestaque;
      }
    | {
        tipo: "fluxograma";
        conteudo: ConteudoFluxograma;
      }
    | {
        tipo: "comparacao";
        conteudo: ConteudoComparacao;
      }
    | {
        tipo: "matriz_assertivas";
        conteudo: ConteudoMatrizAssertivas;
      }
    | {
        tipo: "tabela_gradacao";
        conteudo: ConteudoTabelaGradacao;
      }
    | {
        tipo: "trecho_legal";
        conteudo: ConteudoTrechoLegal;
      }
    | {
        tipo: "linha_tempo";
        conteudo: ConteudoLinhaTempo;
      }
    | {
        tipo: "diagrama_competencia";
        conteudo: ConteudoDiagramaCompetencia;
      }
  );

export type PublicoAlvoVisual = "iniciante" | "todos";

export interface EstudoReversoVisualBase {
  arquetipo: ArquetipoVisual;
  arquetipo_secundario?: ArquetipoVisual;
  duracao_estimada_seg: number;
  fundamento_slug: string;
  macete_visual: string;
  telas: TelaVisual[];
  links_fonte: LinkFonte[];
  ref_visual_id?: string;
}

/** Trilha expressa pós-questão (3–5 telas). */
export interface EstudoReversoVisualV1 extends EstudoReversoVisualBase {
  versao: 1;
}

/** Aula completa para iniciantes / microtópicos com dúvida (7–11 telas). */
export interface EstudoReversoVisualV2 extends EstudoReversoVisualBase {
  versao: 2;
  publico_alvo?: PublicoAlvoVisual;
}

export type EstudoReversoVisual = EstudoReversoVisualV1 | EstudoReversoVisualV2;

export function isEstudoReversoVisualCompleto(
  visual: EstudoReversoVisual,
): visual is EstudoReversoVisualV2 {
  return visual.versao === 2;
}
