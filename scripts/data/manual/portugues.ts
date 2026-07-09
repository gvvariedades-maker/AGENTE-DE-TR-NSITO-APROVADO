import { criarAulaCompleto } from "../../lib/aula-completo-builder";

export const portuguesAulas: Record<string, ReturnType<typeof criarAulaCompleto>> = {
  "portugues/lote-001.json:0": criarAulaCompleto({
    arquetipo: "comparacao",
    arquetipo_secundario: "texto_destaque",
    fundamento_slug: "portugues_ideia_central",
    macete_visual: "Ideia central = frase-síntese, não detalhe",
    links_fonte: [{ rotulo: "Anexo I — Língua Portuguesa", path: "conteúdo/edital/" }],
    contexto: {
      texto:
        "O texto sobre o agente Severino pede a ideia central — não um detalhe do caos no trânsito nem culpa de motoristas ou pedestres.",
      destaques: ["ideia central", "Severino", "norma"],
    },
    glossario: {
      texto:
        "Ideia central = mensagem principal que o texto defende. Detalhe = informação secundária que ilustra, mas não resume. Frase-síntese = trecho que condensa o pensamento do autor.",
      destaques: ["Ideia central", "Detalhe", "Frase-síntese"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Leitura global", descricao: "Pergunte: sobre o que o texto realmente defende?" },
        { ordem: 2, rotulo: "Fala do personagem", descricao: "Severino resume: 'a norma existe para que ninguém precise se arriscar duas vezes'." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Oferece alternativa que culpa um grupo específico como se fosse a tese." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "Central vs secundário",
      colunas: ["Detalhe do texto", "Ideia central"],
      linhas: [
        ["Caos com motoristas, ciclistas e pedestres", "Norma protege a segurança e preserva vidas"],
        ["Punição rigorosa aos infratores", "Cada faixa respeitada = vida que continua"],
        ["Normas são inúteis no caos", "Fiscalizar sem cansaço evita acidentes graves"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Culpar um grupo (D)", "O texto não atribui culpa exclusiva a ninguém"],
        ["Dizer que norma não funciona (A)", "O texto reforça a função protetiva da norma"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — normas inúteis", "O texto defende o contrário: norma protege."],
        ["C — punir com rigor", "Não há foco em punição na fala de Severino."],
        ["D — culpa de ciclistas/pedestres", "Cita todos os grupos sem culpa exclusiva."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Marcar por palavra isolada ('caótico', 'ciclista')", "Fecho: norma preserva segurança e vidas → B"],
        ["Ignorar a frase-síntese de Severino", "A fala citável resume a motivação do agente"],
      ],
    },
    edital: {
      titulo: "O que o edital cobra",
      texto: "Anexo I — Língua Portuguesa: leitura e interpretação textual, identificação da ideia central.",
      destaques: ["interpretação", "ideia central"],
    },
    macete: {
      texto: "Pediu ideia central? Ache a frase que resume o porquê de tudo — geralmente no fecho ou na fala principal.",
      destaques: ["frase", "fecho"],
    },
  }),

  "portugues/lote-001.json:1": criarAulaCompleto({
    arquetipo: "comparacao",
    fundamento_slug: "portugues_significacao_contextual",
    macete_visual: "Expressão idiomática = sentido figurado",
    links_fonte: [{ rotulo: "Anexo I — Língua Portuguesa, item 1.4", path: "conteúdo/edital/" }],
    contexto: {
      texto:
        "No trecho 'motoristas apressados tentam furar a fila', a banca quer o sentido figurado da expressão — não o literal de 'furar' ou ações parecidas.",
      destaques: ["furar a fila", "figurado", "contexto"],
    },
    glossario: {
      texto:
        "Sentido literal = significado da palavra isolada. Sentido figurado = significado no contexto (idioma). Expressão idiomática = combinação com sentido próprio, não soma das partes.",
      destaques: ["literal", "figurado", "idiomática"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Expressão fixa", descricao: "'Furar a fila' = avançar sem respeitar a ordem." },
        { ordem: 2, rotulo: "Contexto", descricao: "Motoristas apressados no cruzamento — desrespeito à sequência." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Oferece ação física parecida (reduzir velocidade, estacionar)." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "Literal vs figurado",
      colunas: ["Sentido errado", "Sentido certo"],
      linhas: [
        ["Respeitar a ordem (A)", "Avançar sem obedecer à sequência"],
        ["Reduzir velocidade (C)", "Pular posição na fila"],
        ["Estacionar proibido (D)", "Desrespeitar a ordem de chegada"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Interpretar 'furar' como perfurar ou furar bloqueio físico", "No trânsito, furar fila = passar na frente indevidamente"],
        ["Escolher alternativa com palavra do enunciado sem contexto", "Expressão destacada pede sentido figurado"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — respeitar ordem", "É o oposto da expressão."],
        ["C — reduzir velocidade", "Não tem relação com 'furar a fila'."],
        ["D — estacionar proibido", "Assunto diferente do trecho."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Confundir com infração de estacionamento", "O trecho fala de fila e sequência → B"],
        ["Ler 'furar' no sentido literal", "No contexto = avançar posição sem obedecer"],
      ],
    },
    edital: {
      texto: "Anexo I — Língua Portuguesa, item 1.4: significação contextual de palavras e expressões.",
      destaques: ["item 1.4", "contextual", "expressões"],
    },
    macete: {
      texto: "Expressão em destaque no enunciado = sentido figurado no contexto, nunca literal isolado.",
      destaques: ["figurado", "contexto"],
    },
  }),

  "portugues/lote-001.json:2": criarAulaCompleto({
    arquetipo: "comparacao",
    fundamento_slug: "portugues_pontuacao_virgula",
    macete_visual: "Nunca vírgula entre sujeito↔verbo ou verbo↔complemento",
    links_fonte: [{ rotulo: "Anexo I — Língua Portuguesa, item 2.3", path: "conteúdo/edital/" }],
    contexto: {
      texto:
        "A questão pede a alternativa com pontuação INCORRETA. A banca insere vírgula entre verbo e complemento — erro que parece natural na leitura em voz alta.",
      destaques: ["INCORRETA", "vírgula", "verbo"],
    },
    glossario: {
      texto:
        "Sujeito = quem pratica a ação. Verbo = ação. Complemento = completa o sentido do verbo. Aposto = explica o substantivo entre vírgulas.",
      destaques: ["Sujeito", "Verbo", "Complemento"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Regra de ouro", descricao: "Não separe sujeito de verbo nem verbo de complemento por vírgula." },
        { ordem: 2, rotulo: "Exceções úteis", descricao: "Aposto e oração subordinada anteposta admitem vírgula corretamente." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Alternativa C: 'atravessaram, a rua,' — vírgulas indevidas." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "Correto vs incorreto",
      colunas: ["Uso correto", "Uso incorreto"],
      linhas: [
        ["Aposto: Severino, o agente, chegou", "Verbo + complemento: atravessaram, a rua,"],
        ["Oração subordinada anteposta", "Vírgula que 'quebra' o núcleo da oração"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Parece natural pausar em voz alta", "Norma-padrão proíbe vírgula entre verbo e complemento"],
        ["Toda vírgula é erro", "Aposto e subordinada anteposta podem estar corretos (A, B, D)"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não é a incorreta"],
      linhas: [
        ["A — aposto correto", "Vírgulas isolam 'o agente de trânsito'."],
        ["B — subordinada anteposta", "Vírgula separa oração subordinada da principal."],
        ["D — subordinada anteposta", "Mesma regra de B — uso correto."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Marcar a que 'soa' errada na leitura oral", "C separa verbo 'atravessaram' do complemento 'a rua'"],
        ["Confundir vírgula antes de 'sem olhar'", "Também rompe a oração sem justificativa → C"],
      ],
    },
    edital: {
      texto: "Anexo I — Língua Portuguesa, item 2.3: pontuação e vírgula entre termos essenciais da oração.",
      destaques: ["item 2.3", "pontuação", "vírgula"],
    },
    macete: {
      texto: "Sem vírgula entre sujeito↔verbo e verbo↔complemento — regra sem exceção na norma-padrão.",
      destaques: ["sujeito", "verbo", "complemento"],
    },
  }),

  "portugues/lote-001.json:3": criarAulaCompleto({
    arquetipo: "tabela_gradacao",
    fundamento_slug: "portugues_acentuacao",
    macete_visual: "Proparoxítona sempre acenta | Paroxítona em ditongo também",
    links_fonte: [{ rotulo: "Anexo I — Língua Portuguesa, itens 4.1 e 4.2", path: "conteúdo/edital/" }],
    contexto: {
      texto:
        "A questão pede a alternativa em que TODAS as quatro palavras estão corretamente acentuadas — a banca mistura uma palavra certa com outra errada na mesma letra.",
      destaques: ["todas", "acentuadas", "quatro palavras"],
    },
    glossario: {
      texto:
        "Proparoxítona = acento na antepenúltima sílaba — sempre leva acento. Paroxítona terminada em ditongo = acento na penúltima com ditongo — também acentua.",
      destaques: ["Proparoxítona", "Paroxítona", "ditongo"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Proparoxítonas", descricao: "trânsito, público — acento obrigatório." },
        { ordem: 2, rotulo: "Ditongo", descricao: "veículo, próprio — paroxítonas com ditongo acentuam." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Alternativas C e D erram só uma palavra — exige conferência item a item." },
      ],
    },
    nucleo: {
      tipo: "tabela_gradacao",
      titulo: "Regras desta questão",
      titulo_colunas: ["Palavra", "Regra"],
      linhas: [
        { faixa: "trânsito, público", classificacao: "Proparoxítona → acento obrigatório", destaque: true },
        { faixa: "veículo, próprio", classificacao: "Paroxítona + ditongo → acento" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Olhar só a primeira palavra da alternativa", "Conferir as quatro palavras uma a uma"],
        ["Achar que paroxítona nunca acenta", "Paroxítona em ditongo acenta (veículo, próprio)"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Erro"],
      linhas: [
        ["B — nenhuma acentuada", "Todas deveriam ter acento."],
        ["C — veiculo sem acento", "Falta acento em veículo."],
        ["D — publico sem acento", "Falta acento em público."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Marcar C ou D por acertar 3 de 4 palavras", "Todas corretas só em A: trânsito, público, veículo, próprio"],
        ["Esquecer regra do ditongo em veículo/próprio", "Duas regras: proparoxítona + ditongo"],
      ],
    },
    edital: {
      texto: "Anexo I — Língua Portuguesa, itens 4.1 e 4.2: ortografia e acentuação gráfica.",
      destaques: ["4.1", "4.2", "acentuação"],
    },
    macete: {
      texto: "Proparoxítona sempre acenta. Paroxítona terminada em ditongo também acenta.",
      destaques: ["proparoxítona", "ditongo"],
    },
  }),
};
