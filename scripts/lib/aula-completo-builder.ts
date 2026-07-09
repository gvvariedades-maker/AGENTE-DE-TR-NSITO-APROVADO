/** Builder para aulas completas v2 curadas manualmente (não gerador automático). */

type LinkFonte = { rotulo: string; path: string };

type TelaBase = {
  id: string;
  titulo: string;
};

type ComparacaoLinhas = [string, string][];

export type AulaCompletoInput = {
  arquetipo:
    | "comparacao"
    | "fluxograma_decisao"
    | "tabela_gradacao"
    | "trecho_legal"
    | "diagrama_competencia"
    | "matriz_assertivas";
  arquetipo_secundario?: AulaCompletoInput["arquetipo"] | "texto_destaque";
  fundamento_slug: string;
  macete_visual: string;
  duracao_estimada_seg?: number;
  links_fonte: LinkFonte[];
  contexto: { texto: string; destaques: string[] };
  glossario: { texto: string; destaques: string[] };
  historico?: {
    eventos: { ordem: number; rotulo: string; descricao: string }[];
  };
  nucleo:
    | {
        tipo: "fluxograma";
        titulo: string;
        nos: {
          id: string;
          label: string;
          tipo: "pergunta" | "acao" | "lei" | "resultado";
          ref?: string;
        }[];
        arestas: { de: string; para: string; rotulo?: string }[];
      }
    | {
        tipo: "tabela_gradacao";
        titulo: string;
        titulo_colunas: [string, string];
        linhas: {
          faixa: string;
          classificacao: string;
          destaque?: boolean;
        }[];
      }
    | {
        tipo: "diagrama_competencia";
        titulo: string;
        nos: { id: string; label: string; nivel: number }[];
        arestas: { de: string; para: string; rotulo?: string }[];
      }
    | {
        tipo: "matriz_assertivas";
        titulo: string;
        itens: { id: string; texto: string; correto: boolean }[];
        gabarito_resumo: string;
        intro?: string;
      }
    | {
        tipo: "comparacao";
        titulo: string;
        colunas: [string, string];
        linhas: ComparacaoLinhas;
      };
  contraste: { titulo?: string; colunas: [string, string]; linhas: ComparacaoLinhas };
  distratores: { colunas: [string, string]; linhas: ComparacaoLinhas };
  caso: { colunas: [string, string]; linhas: ComparacaoLinhas };
  edital?: { titulo?: string; texto: string; destaques: string[] };
  lei1?: {
    titulo?: string;
    fonte: string;
    texto: string;
    trechos_grifados?: { inicio: number; fim: number; motivo: string }[];
  };
  lei2?: {
    titulo?: string;
    fonte: string;
    texto: string;
    trechos_grifados?: { inicio: number; fim: number; motivo: string }[];
  };
  macete: { texto: string; destaques: string[] };
};

export function criarAulaCompleto(input: AulaCompletoInput) {
  const telas: Record<string, unknown>[] = [
    {
      id: "contexto",
      titulo: "O que a IDECAN testou",
      tipo: "texto_destaque",
      conteudo: input.contexto,
    },
    {
      id: "glossario",
      titulo: "Antes de memorizar: 3 termos",
      tipo: "texto_destaque",
      conteudo: input.glossario,
    },
  ];

  if (input.historico) {
    telas.push({
      id: "historico",
      titulo: "Por que a pegadinha existe",
      tipo: "linha_tempo",
      conteudo: input.historico,
    });
  }

  const n = input.nucleo;
  if (n.tipo === "fluxograma") {
    telas.push({
      id: "nucleo",
      titulo: n.titulo,
      tipo: "fluxograma",
      conteudo: { nos: n.nos, arestas: n.arestas },
    });
  } else if (n.tipo === "tabela_gradacao") {
    telas.push({
      id: "nucleo",
      titulo: n.titulo,
      tipo: "tabela_gradacao",
      conteudo: {
        titulo_colunas: n.titulo_colunas,
        linhas: n.linhas,
      },
    });
  } else if (n.tipo === "diagrama_competencia") {
    telas.push({
      id: "nucleo",
      titulo: n.titulo,
      tipo: "diagrama_competencia",
      conteudo: { nos: n.nos, arestas: n.arestas },
    });
  } else if (n.tipo === "matriz_assertivas") {
    telas.push({
      id: "nucleo",
      titulo: n.titulo,
      tipo: "matriz_assertivas",
      conteudo: {
        itens: n.itens,
        gabarito_resumo: n.gabarito_resumo,
        ...(n.intro ? { intro: n.intro } : {}),
      },
    });
  } else {
    telas.push({
      id: "nucleo",
      titulo: n.titulo,
      tipo: "comparacao",
      conteudo: { colunas: n.colunas, linhas: n.linhas },
    });
  }

  telas.push(
    {
      id: "contraste",
      titulo: input.contraste.titulo ?? "Pegadinha típica",
      tipo: "comparacao",
      conteudo: {
        colunas: input.contraste.colunas,
        linhas: input.contraste.linhas,
      },
    },
    {
      id: "distratores",
      titulo: "Por que cada alternativa erra",
      tipo: "comparacao",
      conteudo: {
        colunas: input.distratores.colunas,
        linhas: input.distratores.linhas,
      },
    },
    {
      id: "caso",
      titulo: "O caso desta questão",
      tipo: "comparacao",
      conteudo: {
        colunas: input.caso.colunas,
        linhas: input.caso.linhas,
      },
    },
  );

  if (input.edital) {
    telas.push({
      id: "edital",
      titulo: input.edital.titulo ?? "O que o edital cobra",
      tipo: "texto_destaque",
      conteudo: {
        texto: input.edital.texto,
        destaques: input.edital.destaques,
      },
    });
  }

  if (input.lei1) {
    telas.push({
      id: "lei1",
      titulo: input.lei1.titulo ?? "Lei seca",
      tipo: "trecho_legal",
      conteudo: {
        fonte: input.lei1.fonte,
        texto: input.lei1.texto,
        ...(input.lei1.trechos_grifados
          ? { trechos_grifados: input.lei1.trechos_grifados }
          : {}),
      },
    });
  }

  if (input.lei2) {
    telas.push({
      id: "lei2",
      titulo: input.lei2.titulo ?? "Lei complementar",
      tipo: "trecho_legal",
      conteudo: {
        fonte: input.lei2.fonte,
        texto: input.lei2.texto,
        ...(input.lei2.trechos_grifados
          ? { trechos_grifados: input.lei2.trechos_grifados }
          : {}),
      },
    });
  }

  telas.push({
    id: "macete",
    titulo: "Macete",
    tipo: "texto_destaque",
    conteudo: input.macete,
  });

  return {
    arquetipo: input.arquetipo,
    ...(input.arquetipo_secundario
      ? { arquetipo_secundario: input.arquetipo_secundario }
      : {}),
    fundamento_slug: input.fundamento_slug,
    macete_visual: input.macete_visual,
    telas,
    links_fonte: input.links_fonte,
    versao: 2 as const,
    publico_alvo: "iniciante" as const,
    duracao_estimada_seg: input.duracao_estimada_seg ?? 180,
  };
}
