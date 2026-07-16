/** Textos do guia de onboarding — disciplinas e assuntos. */

export interface ItemGuiaDisciplinas {
  id: string;
  titulo: string;
  descricao: string;
}

export const ITENS_GUIA_DISCIPLINAS: ItemGuiaDisciplinas[] = [
  {
    id: "escolher",
    titulo: "Escolher a disciplina",
    descricao:
      "Toque em um dos 7 cards (ou no botão “Ver disciplinas”) para trocar a matéria. A borda colorida marca a disciplina ativa. O número (ex.: 30Q) é quantas questões essa matéria tem no simulado de 60Q do edital.",
  },
  {
    id: "semaforo",
    titulo: "Bolinha de desempenho",
    descricao:
      "A bolinha ao lado do nome mostra o semáforo da disciplina: verde (bem), amarelo (atenção), vermelho (risco de mínimo) ou cinza (ainda sem tentativas). Use isso para priorizar o que está fraco.",
  },
  {
    id: "assuntos",
    titulo: "Assuntos da disciplina",
    descricao:
      "Abaixo dos cards aparece o catálogo da disciplina escolhida. Expanda “Todos os assuntos” ou use a busca para achar um tema. Clique em um assunto para estudar só aquele pedaço do edital.",
  },
  {
    id: "buscar",
    titulo: "Busca e estudar questões",
    descricao:
      "Use a busca para achar um artigo, resolução ou tema. “Estudar questões” monta uma fila automática com o que falta cobrir na disciplina inteira. Expanda “Todos os assuntos” para ver a lista completa.",
  },
  {
    id: "trocar",
    titulo: "Trocar de disciplina",
    descricao:
      "Para mudar de matéria, use o botão “Ver disciplinas” na seção acima e toque em outro card.",
  },
];

export const STORAGE_GUIA_DISCIPLINAS = "disciplinas-guia-dismissed";
