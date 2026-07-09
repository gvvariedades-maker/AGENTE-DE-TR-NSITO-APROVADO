import type { EstudoReversoVisual } from "@/types/estudo-reverso-visual";

/** Visual demo para QUESTAO_DEMO (espelha ctb-embriaguez.json). */
export const DEMO_ESTUDO_REVERSO_VISUAL: EstudoReversoVisual = {
  versao: 1,
  arquetipo: "fluxograma_decisao",
  arquetipo_secundario: "comparacao",
  duracao_estimada_seg: 90,
  fundamento_slug: "CTB_art_165-A",
  macete_visual: "RECUSA = 165-A (infração autônoma, não depende do resultado do teste)",
  telas: [
    {
      id: "contexto",
      titulo: "O que a IDECAN testou",
      tipo: "texto_destaque",
      conteudo: {
        texto:
          "A banca cobra se você sabe que a recusa ao etilômetro é infração autônoma, independente do resultado do teste.",
        destaques: ["recusa", "infração autônoma"],
      },
    },
    {
      id: "fluxo",
      titulo: "Raciocínio em 3 passos",
      tipo: "fluxograma",
      conteudo: {
        nos: [
          {
            id: "n1",
            label: "Sinais de alteração psicomotora?",
            tipo: "pergunta",
          },
          { id: "n2", label: "Condutor recusa o etilômetro", tipo: "acao" },
          {
            id: "n3",
            label: "Art. 165-A — infração autônoma",
            tipo: "lei",
            ref: "CTB art. 165-A",
          },
        ],
        arestas: [
          { de: "n1", para: "n2", rotulo: "sim" },
          { de: "n2", para: "n3" },
        ],
      },
    },
    {
      id: "pegadinha",
      titulo: "Armadilha IDECAN",
      tipo: "comparacao",
      conteudo: {
        colunas: ["O que parece", "O que a lei diz"],
        linhas: [
          [
            "Precisa confirmar no etilômetro",
            "Recusa já configura infração autônoma",
          ],
        ],
      },
    },
    {
      id: "lei",
      titulo: "Lei seca",
      tipo: "trecho_legal",
      conteudo: {
        fonte: "CTB art. 165-A",
        texto:
          "Recusar-se a ser submetido a teste configura infração autônoma.",
        trechos_grifados: [
          { inicio: 0, fim: 12, motivo: "conduta autônoma" },
        ],
      },
    },
    {
      id: "macete",
      titulo: "Macete visual",
      tipo: "texto_destaque",
      conteudo: {
        texto: "RECUSA = 165-A. Não confunda com art. 165.",
        destaques: ["165-A"],
      },
    },
  ],
  links_fonte: [
    { rotulo: "CTB art. 165-A", path: "conteúdo/legislação federal/" },
  ],
};
