import { criarAulaCompleto } from "../../lib/aula-completo-builder";

export const informaticaAulas: Record<string, ReturnType<typeof criarAulaCompleto>> = {
  "informatica/lote-001.json:1": criarAulaCompleto({
    arquetipo: "comparacao",
    arquetipo_secundario: "fluxograma_decisao",
    fundamento_slug: "info_atalhos_windows",
    macete_visual: "Ctrl+X corta | Ctrl+C clona | Ctrl+V cola",
    links_fonte: [{ rotulo: "Anexo I — Informática, item 2.3", path: "conteúdo/edital/" }],
    contexto: {
      texto:
        "No explorador de arquivos, o agente pressionou Ctrl+X, abriu outra pasta e pressionou Ctrl+V. A banca testa se você sabe que recortar move o arquivo — não copia.",
      destaques: ["Ctrl+X", "Ctrl+V", "move"],
    },
    glossario: {
      texto:
        "Recortar (Ctrl+X) = tira da origem e guarda na área de transferência. Copiar (Ctrl+C) = duplica mantendo o original. Colar (Ctrl+V) = insere o que está na área de transferência.",
      destaques: ["Recortar", "Copiar", "Colar"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Atalho X", descricao: "X lembra 'cortar' — o arquivo some da pasta de origem." },
        { ordem: 2, rotulo: "Atalho C", descricao: "C lembra 'clonar' — o original permanece no lugar." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Troca o efeito de Ctrl+X pelo de Ctrl+C na alternativa A." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "Atalhos do Windows",
      colunas: ["Atalho", "Efeito"],
      linhas: [
        ["Ctrl+X", "Recorta: remove da origem"],
        ["Ctrl+C", "Copia: mantém na origem"],
        ["Ctrl+V", "Cola da área de transferência"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Ctrl+X = copiar (alternativa A)", "Ctrl+X = recortar e mover"],
        ["Recortar = excluir definitivo", "Recortar ≠ lixeira permanente"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — copiado na origem", "Isso é Ctrl+C, não Ctrl+X."],
        ["C — excluído definitivo", "Recortar move; excluir usa Delete ou lixeira."],
        ["D — compactado", "Recortar/colar não compacta o arquivo."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Marcar A por associar X a copiar", "Ctrl+X + Ctrl+V = move para outra pasta (B)"],
        ["Achar que o arquivo fica nas duas pastas", "Após recortar e colar, só existe no destino"],
      ],
    },
    edital: {
      texto:
        "Anexo I — Informática, item 2.3: manipulação de arquivos e pastas, incluindo atalhos de teclado no Windows.",
      destaques: ["item 2.3", "atalhos", "arquivos"],
    },
    macete: {
      texto: "X corta e some. C clona e mantém. V sempre cola o que está na área de transferência.",
      destaques: ["X", "C", "V"],
    },
  }),

  "informatica/lote-001.json:2": criarAulaCompleto({
    arquetipo: "fluxograma_decisao",
    fundamento_slug: "info_funcao_se",
    macete_visual: "SE(condição; se sim; se não) — avalie o teste",
    links_fonte: [{ rotulo: "Anexo I — Informática, item 4.2", path: "conteúdo/edital/" }],
    contexto: {
      texto:
        "Na planilha de infrações da STTP, C2 usa =SE(B2>10;\"Multa alta\";\"Multa baixa\") e B2 vale 15. A banca testa se você avalia a condição antes de escolher o texto.",
      destaques: ["SE", "B2=15", "B2>10"],
    },
    glossario: {
      texto:
        "Função SE = teste lógico com três partes: condição; valor se verdadeiro; valor se falso. Operador > = maior que. Célula B2 = gravidade registrada (15).",
      destaques: ["SE", "condição", "B2"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Sintaxe", descricao: "=SE(teste; se verdadeiro; se falso) — ponto e vírgula no Excel BR." },
        { ordem: 2, rotulo: "Teste", descricao: "15 > 10 é verdadeiro — a condição passa." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Alternativa B inverte verdadeiro/falso para pegar quem não calcula." },
      ],
    },
    nucleo: {
      tipo: "fluxograma",
      titulo: "Fluxo da função SE",
      nos: [
        { id: "n1", label: "B2 = 15", tipo: "acao" },
        { id: "n2", label: "15 > 10?", tipo: "pergunta" },
        { id: "n3", label: "Retorna Multa alta", tipo: "resultado" },
        { id: "n4", label: "Retorna Multa baixa", tipo: "resultado" },
      ],
      arestas: [
        { de: "n1", para: "n2" },
        { de: "n2", para: "n3", rotulo: "Sim" },
        { de: "n2", para: "n4", rotulo: "Não" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["15>10 é falso → Multa baixa", "15>10 é verdadeiro → Multa alta"],
        ["SE retorna o valor de B2", "SE retorna um dos dois textos definidos"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — erro de sintaxe", "A sintaxe apresentada está correta."],
        ["B — Multa baixa", "Inverte o resultado: 15 é maior que 10."],
        ["D — retorna 15", "SE não devolve o valor testado, e sim o texto condicional."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Decorar a fórmula sem calcular 15>10", "15>10 verdadeiro → C2 exibe Multa alta (C)"],
        ["Confundir gravidade com resultado da fórmula", "A fórmula classifica; não repete o número de B2"],
      ],
    },
    edital: {
      texto: "Anexo I — Informática, item 4.2: planilhas eletrônicas e fórmulas lógicas como a função SE.",
      destaques: ["item 4.2", "planilhas", "fórmulas"],
    },
    macete: {
      texto: "Leia SE como pergunta: a condição é verdadeira? Primeiro texto. Falsa? Segundo texto.",
      destaques: ["verdadeira", "falsa"],
    },
  }),

  "informatica/lote-001.json:3": criarAulaCompleto({
    arquetipo: "comparacao",
    fundamento_slug: "info_teams",
    macete_visual: "Compartilhar=mostrar | Gravar=registrar | Sala=dividir",
    links_fonte: [{ rotulo: "Anexo I — Informática, item 6.1", path: "conteúdo/edital/" }],
    contexto: {
      texto:
        "Na reunião do Teams da STTP, o organizador exibiu a planilha de indicadores para todos verem. A banca quer o nome correto dessa função na ferramenta.",
      destaques: ["Teams", "exibir", "planilha"],
    },
    glossario: {
      texto:
        "Compartilhamento de tela = mostrar o que está no seu monitor aos participantes. Quadro branco = desenhar e anotar. Gravação = salvar o encontro em vídeo.",
      destaques: ["Compartilhamento", "Quadro branco", "Gravação"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Reunião remota", descricao: "Teams, Meet e Zoom usam nomes parecidos para funções distintas." },
        { ordem: 2, rotulo: "Verbo-guia", descricao: "Compartilhar = mostrar; gravar = registrar; sala = dividir grupos." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Mistura gravação, quadro branco e breakout room na mesma questão." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "Funções do Teams",
      colunas: ["Função", "O que faz"],
      linhas: [
        ["Compartilhamento de tela", "Exibe sua tela aos participantes"],
        ["Quadro branco", "Desenho e anotações colaborativas"],
        ["Gravação", "Registra a reunião em vídeo"],
        ["Sala de descanso", "Divide participantes em grupos"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Gravar = mostrar em tempo real", "Gravar salva; compartilhar exibe ao vivo"],
        ["Quadro branco = espelhar tela", "Quadro é superfície de desenho, não espelho"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — quadro branco", "Serve para desenho, não para exibir a planilha."],
        ["C — gravação", "Registra o encontro; não transmite a tela ao vivo."],
        ["D — sala de descanso", "Divide grupos; não exibe conteúdo da tela."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Escolher função pelo nome em inglês sem ler o enunciado", "Exibir planilha = compartilhamento de tela (B)"],
        ["Confundir reunião gravada com transmissão de tela", "O caso pede exibição ao vivo, não arquivo salvo"],
      ],
    },
    edital: {
      texto: "Anexo I — Informática, item 6.1: ferramentas de comunicação on-line (Teams, Meet, Zoom).",
      destaques: ["item 6.1", "Teams", "comunicação"],
    },
    macete: {
      texto: "Compartilhar tela = mostrar. Gravar = registrar. Sala de descanso = dividir grupo.",
      destaques: ["mostrar", "registrar", "dividir"],
    },
  }),

  "informatica/lote-001.json:4": criarAulaCompleto({
    arquetipo: "matriz_assertivas",
    arquetipo_secundario: "comparacao",
    fundamento_slug: "info_protocolos_url",
    macete_visual: "HTTPS=cadeado+criptografia | HTTP=sem cadeado",
    links_fonte: [{ rotulo: "Anexo I — Informática, item 5.2", path: "conteúdo/edital/" }],
    contexto: {
      texto:
        "A questão traz assertivas sobre HTTP, HTTPS e endereços web. A banca testa se você distingue protocolo seguro (cadeado) de afirmações absolutas sobre 'qualquer site'.",
      destaques: ["HTTPS", "HTTP", "cadeado"],
    },
    glossario: {
      texto:
        "HTTP = protocolo de transferência de páginas. HTTPS = HTTP com camada de segurança (SSL/TLS). URL = endereço completo do recurso na web (ex.: https://...).",
      destaques: ["HTTP", "HTTPS", "URL"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "HTTP", descricao: "Comunicação básica entre navegador e servidor." },
        { ordem: 2, rotulo: "HTTPS", descricao: "Adiciona criptografia — navegador exibe cadeado." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Inclui afirmativa plausível com palavra absoluta ('qualquer site')." },
      ],
    },
    nucleo: {
      tipo: "matriz_assertivas",
      titulo: "Assertivas-chave",
      intro: "Marque mentalmente V ou F antes de cruzar com as alternativas.",
      itens: [
        { id: "I", texto: "HTTPS usa criptografia na comunicação", correto: true },
        { id: "II", texto: "O cadeado garante que qualquer site é confiável", correto: false },
        { id: "III", texto: "URL identifica o endereço do recurso na web", correto: true },
      ],
      gabarito_resumo: "I e III corretas → alternativa A",
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Cadeado = site 100% seguro", "HTTPS protege a comunicação, não valida o conteúdo"],
        ["HTTP e HTTPS são iguais", "HTTPS adiciona camada de segurança"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["B — só II", "II é falsa: cadeado não garante confiabilidade total."],
        ["C — II e III", "II continua falsa."],
        ["D — todas", "II é falsa — não pode incluir todas."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Achar que cadeado elimina todo risco", "HTTPS criptografa; não certifica honestidade do site"],
        ["Ignorar palavra absoluta 'qualquer'", "Afirmativa II é a armadilha clássica"],
      ],
    },
    edital: {
      texto: "Anexo I — Informática, item 5.2: internet, protocolos (HTTP/HTTPS) e endereçamento web (URL).",
      destaques: ["item 5.2", "HTTPS", "URL"],
    },
    macete: {
      texto: "HTTPS = cadeado + criptografia. Cadeado não prova que o site é honesto.",
      destaques: ["HTTPS", "cadeado"],
    },
  }),

  "informatica/lote-001.json:5": criarAulaCompleto({
    arquetipo: "comparacao",
    fundamento_slug: "info_malware",
    macete_visual: "Vírus≠elimina tudo | Desconfie de absolutos",
    links_fonte: [{ rotulo: "Anexo I — Informática, item 7.1", path: "conteúdo/edital/" }],
    contexto: {
      texto:
        "O servidor da STTP exibiu alerta de antivírus. A banca testa conceitos de malware e a diferença entre proteção real e promessas absolutas de software.",
      destaques: ["antivírus", "malware", "alerta"],
    },
    glossario: {
      texto:
        "Malware = software malicioso (vírus, worm, trojan). Antivírus = detecta e neutraliza ameaças conhecidas. Firewall = controla tráfego de rede.",
      destaques: ["Malware", "Antivírus", "Firewall"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Ameaças", descricao: "Vírus se propaga; trojan disfarça utilidade; worm se espalha sozinho." },
        { ordem: 2, rotulo: "Defesa", descricao: "Antivírus + firewall + atualizações + usuário cauteloso." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Usa 'elimina por completo' e 'qualquer ameaça' para testar absolutos." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "Malware vs proteção",
      colunas: ["Conceito", "Realidade"],
      linhas: [
        ["Vírus", "Programa que se replica e infecta arquivos"],
        ["Antivírus", "Detecta e remove muitas ameaças — não é infalível"],
        ["Firewall", "Filtra conexões de rede — não substitui antivírus"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Antivírus elimina 100% das ameaças", "Nenhum software garante proteção absoluta"],
        ["Firewall = antivírus", "Funções diferentes: rede vs arquivos"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — elimina qualquer ameaça", "Promessa absoluta — falsa na prática."],
        ["B — vírus só em pendrive", "Vírus pode vir de e-mail, download, rede."],
        ["D — firewall substitui antivírus", "São camadas complementares, não substitutos."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Marcar alternativa com 'por completo' ou 'qualquer'", "Desconfie de absolutos — gabarito C"],
        ["Achar que alerta do antivírus = infecção confirmada", "Alerta exige análise; pode ser falso positivo"],
      ],
    },
    edital: {
      texto: "Anexo I — Informática, item 7.1: segurança da informação, vírus, antivírus e firewall.",
      destaques: ["item 7.1", "segurança", "antivírus"],
    },
    macete: {
      texto: "Antivírus ajuda, mas não é escudo perfeito. Desconfie de 'elimina tudo' e 'qualquer ameaça'.",
      destaques: ["não é escudo perfeito", "qualquer"],
    },
  }),
};
