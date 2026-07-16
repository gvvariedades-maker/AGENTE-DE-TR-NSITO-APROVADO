/** Textos do guia de onboarding do painel Plano até a prova. */

export interface ItemGuiaPlanoProva {
  id: string;
  titulo: string;
  descricao: string;
}

export const ITENS_GUIA_PLANO_PROVA: ItemGuiaPlanoProva[] = [
  {
    id: "cabecalho",
    titulo: "Cabeçalho — prazo e projeção",
    descricao:
      "Mostra quantos dias faltam para a prova, em qual fase do cronograma você está e a nota projetada com base no que já estudou e nos simulados. “Faltam X para 90” é uma meta ambiciosa — o corte oficial é 50 pontos, mas 90 indica folga.",
  },
  {
    id: "edital",
    titulo: "Edital — cobertura do programa",
    descricao:
      "Percentual de assuntos do edital que você já viu. A meta por dia indica quantos assuntos precisa avançar para não atrasar. “Domínio” mostra o que já consolidou na memória de longo prazo, além de só ter lido.",
  },
  {
    id: "memoria",
    titulo: "Memória — revisões programadas",
    descricao:
      "Conta revisões que venceram hoje pela repetição espaçada (SM-2). “Ainda frescas” são assuntos que você lembra bem e não precisam de revisão agora. As revisões entram automaticamente no pacote do dia.",
  },
  {
    id: "simulado",
    titulo: "Simulado — prova de 60 questões",
    descricao:
      "Média dos simulados entregues (60 questões na proporção do edital, 4 horas). Só simulados completos entram aqui — treino avulso não altera a nota. Abaixo de 50 pontos indica risco de eliminação na prova real.",
  },
  {
    id: "faca-agora",
    titulo: "Faça agora — missão do dia",
    descricao:
      "Pacote personalizado pelo tutor: revisões, questões novas e erros pendentes. O botão laranja inicia a fila de hoje. O contador X/Y considera apenas as questões desse pacote — não todo o treino do dia.",
  },
  {
    id: "indice",
    titulo: "Índice de chegada — semáforo geral",
    descricao:
      "Quatro sinais resumem sua trajetória: Domínio (consolidação), Ritmo (atraso ou não), Simulado (nota nos 60Q) e Sobrevivência (mínimos por disciplina). Vermelho pede atenção imediata; verde indica que está no caminho.",
  },
  {
    id: "fase",
    titulo: "Nesta fase — orientação do tutor",
    descricao:
      "Dica que muda conforme o tempo até a prova: no início prioriza base; no meio equilibra novos assuntos e revisões; na reta final foca consolidar e simular.",
  },
];

export const STORAGE_GUIA_PLANO_PROVA = "plano-prova-guia-dismissed";
