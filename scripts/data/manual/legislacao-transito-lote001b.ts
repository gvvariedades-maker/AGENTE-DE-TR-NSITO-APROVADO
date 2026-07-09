import { criarAulaCompleto } from "../../lib/aula-completo-builder";

export const legislacaoLote001b: Record<string, ReturnType<typeof criarAulaCompleto>> = {
  "legislacao_transito/lote-001.json:5": criarAulaCompleto({
    arquetipo: "comparacao",
    fundamento_slug: "CTB_art_181_I",
    macete_visual: "Esquina <5m=média+remoção (181,I)",
    links_fonte: [{ rotulo: "CTB art. 181, I", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Veículo estacionado a menos de 5 m da esquina na Av. Epitácio Pessoa. A questão pede a INCORRETA — a banca associa estacionamento a infração leve.",
      destaques: ["INCORRETA", "esquina", "5 metros"],
    },
    glossario: {
      texto: "Estacionamento = veículo parado por tempo superior ao embarque. Esquina = cruzamento de vias. Infração média = art. 181, I. Remoção = medida administrativa cabível.",
      destaques: ["Estacionamento", "esquina", "média"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Art. 181, I", descricao: "Esquina < 5 m = infração média + remoção." },
        { ordem: 2, rotulo: "Pegadinha", descricao: "Candidato acha que parado = leve." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Alternativa C diz infração leve." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "Gravidade do estacionamento",
      colunas: ["Hipótese", "Classificação"],
      linhas: [
        ["Esquina < 5 m (art. 181, I)", "Média + remoção"],
        ["Veículo parado = sempre leve", "Falso — depende da hipótese"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Parado = infração leve (C)", "Art. 181, I = MÉDIA"],
        ["Sem movimento = menor gravidade", "CTB classifica pela hipótese, não pelo movimento"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não é a incorreta"],
      linhas: [
        ["A — natureza média", "Verdadeira."],
        ["B — remoção admitida", "Verdadeira — medida do inciso I."],
        ["D — art. 181, I", "Verdadeira — hipótese correta."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Subestimar gravidade por veículo estacionado", "Esquina < 5 m = média, não leve → C incorreta"],
        ["Confundir com infração de circulação", "Hipótese específica de estacionamento irregular"],
      ],
    },
    lei1: {
      fonte: "CTB art. 181, I",
      texto: "Estacionar nas esquinas e a menos de cinco metros do bordo do alinhamento da via transversal — infração média; medida administrativa remoção.",
      trechos_grifados: [{ inicio: 70, fim: 85, motivo: "média" }],
    },
    macete: { texto: "Esquina < 5 m = média + remoção (art. 181, I).", destaques: ["média", "remoção"] },
  }),

  "legislacao_transito/lote-001.json:6": criarAulaCompleto({
    arquetipo: "matriz_assertivas",
    fundamento_slug: "CTB_art_280",
    macete_visual: "Auto completo (280)+assinatura quando possível",
    links_fonte: [{ rotulo: "CTB art. 280", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Assertivas sobre conteúdo do auto de infração. A banca transforma 'sempre que possível' em 'indispensável' na afirmativa III.",
      destaques: ["auto de infração", "art. 280", "assinatura"],
    },
    glossario: {
      texto: "Auto de infração = documento que inicia o processo. Tipificação = qual infração. Assinatura do infrator = sempre que possível, não em todo caso.",
      destaques: ["tipificação", "assinatura", "sempre que possível"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Incisos I–III", descricao: "Tipificação, local/data/hora, placa/marca/espécie." },
        { ordem: 2, rotulo: "Inciso VI", descricao: "Assinatura sempre que possível." },
        { ordem: 3, rotulo: "IDECAN", descricao: "III errada: assinatura não é indispensável sempre." },
      ],
    },
    nucleo: {
      tipo: "matriz_assertivas",
      titulo: "Afirmativas do auto",
      itens: [
        { id: "I", texto: "Deve conter tipificação, local, data e hora", correto: true },
        { id: "II", texto: "Deve conter placa, marca e espécie do veículo", correto: true },
        { id: "III", texto: "Assinatura do infrator é indispensável em qualquer caso", correto: false },
      ],
      gabarito_resumo: "I e II corretas → alternativa B",
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Assinatura obrigatória sempre (III)", "Sempre que possível — art. 280, VI"],
        ["Auto incompleto é válido", "Elementos dos incisos I–III são obrigatórios"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — só I", "II também correta."],
        ["C — II e III", "III errada."],
        ["D — todas", "III errada."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Absolutizar 'sempre que possível'", "III é falsa — gabarito B (I e II)"],
        ["Ignorar inciso VI do art. 280", "Assinatura não é requisito absoluto"],
      ],
    },
    lei1: {
      fonte: "CTB art. 280, VI",
      texto: "Assinatura do infrator, sempre que possível, valendo como notificação.",
      trechos_grifados: [{ inicio: 20, fim: 42, motivo: "sempre que possível" }],
    },
    macete: { texto: "Auto completo (art. 280) + assinatura quando possível, não obrigatória em todo caso.", destaques: ["quando possível"] },
  }),

  "legislacao_transito/lote-001.json:7": criarAulaCompleto({
    arquetipo: "comparacao",
    fundamento_slug: "CTB_art_252_VI",
    macete_visual: "Celular na orelha=média (252,VI)",
    links_fonte: [{ rotulo: "CTB art. 252, VI", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Condutor de moto usa celular encostado ao ouvido em via arterial. A banca testa art. 252, VI — infração média, sem exigir excesso de velocidade.",
      destaques: ["celular", "ouvido", "média"],
    },
    glossario: {
      texto: "Inciso VI = celular ao ouvido ou fones — média. § único = manusear celular — gravíssima. Infração autônoma = não depende de velocidade.",
      destaques: ["VI", "§ único", "média"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "VI", descricao: "Celular ao ouvido = infração média." },
        { ordem: 2, rotulo: "Lei 13.281", descricao: "§ único elevou manuseio a gravíssima — outro caso." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Subestima gravidade ou exclui motos." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "Celular ao ouvido",
      colunas: ["Conduta", "Classificação"],
      linhas: [
        ["Celular ao ouvido (VI)", "Infração MÉDIA"],
        ["Manusear/digitar (§ único)", "Infração GRAVÍSSIMA"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Infração leve (A)", "Art. 252, VI = média"],
        ["Só infração se acima do limite (C)", "Não condiciona a velocidade"],
        ["Moto dispensada (D)", "Inciso VI não exclui motociclistas"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — leve", "É média, não leve."],
        ["C — depende de velocidade", "Infração autônoma."],
        ["D — moto dispensada", "Moto não está excluída."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Confundir com manuseio (§ único)", "Ao ouvido = VI = média → B"],
        ["Achar que precisa de radar de velocidade", "Conduta autônoma no art. 252"],
      ],
    },
    lei1: {
      fonte: "CTB art. 252, VI",
      texto: "Dirigir utilizando-se de telefone celular — infração de natureza média.",
      trechos_grifados: [{ inicio: 45, fim: 60, motivo: "média" }],
    },
    macete: { texto: "Celular na orelha ao volante = média (art. 252, VI).", destaques: ["média", "VI"] },
  }),

  "legislacao_transito/lote-001.json:8": criarAulaCompleto({
    arquetipo: "fluxograma_decisao",
    fundamento_slug: "CTB_art_219",
    macete_visual: "<50% do limite+obstruir=grave (219)",
    links_fonte: [{ rotulo: "CTB art. 219", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Condutor a 40 km/h em via de 100 km/h na faixa da esquerda, retardando o trânsito. A banca testa art. 219 — velocidade excessivamente baixa também é infração.",
      destaques: ["40 km/h", "100 km/h", "art. 219"],
    },
    glossario: {
      texto: "Metade do limite = 50 km/h em via de 100. Retardar trânsito = obstruir fluxo. Exceções = clima adverso ou faixa da direita.",
      destaques: ["metade", "retardar", "faixa da direita"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Regra comum", descricao: "Abaixo do limite parece sempre permitido." },
        { ordem: 2, rotulo: "Art. 219", descricao: "Abaixo da metade + obstruir = grave." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Alternativa B nega infração por estar abaixo do limite." },
      ],
    },
    nucleo: {
      tipo: "fluxograma",
      titulo: "Art. 219",
      nos: [
        { id: "n1", label: "Velocidade < metade do limite?", tipo: "pergunta" },
        { id: "n2", label: "Retarda ou obstrui trânsito?", tipo: "pergunta" },
        { id: "n3", label: "Infração GRAVE (219)", tipo: "resultado" },
        { id: "n4", label: "Sem infração (exceções)", tipo: "resultado" },
      ],
      arestas: [
        { de: "n1", para: "n2", rotulo: "Sim (40<50)" },
        { de: "n2", para: "n3", rotulo: "Sim" },
        { de: "n2", para: "n4", rotulo: "Não" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Abaixo do limite nunca é infração (B)", "Art. 219 pune velocidade muito baixa"],
        ["Sempre é média (C)", "Art. 219 = GRAVE"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["B — sem infração", "40 km/h < metade de 100 + obstrui."],
        ["C — média", "Art. 219 classifica como grave."],
        ["D — só PRF autua", "Questão testa tipificação, não esse distrator."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Achar que prudência abaixo do limite sempre protege", "40 em via de 100 na esquerda = grave → A"],
        ["Ignorar faixa da esquerda no enunciado", "Exceção da faixa da direita não se aplica"],
      ],
    },
    lei1: {
      fonte: "CTB art. 219",
      texto: "Transitar em velocidade inferior à metade da máxima, retardando ou obstruindo o trânsito — infração grave.",
      trechos_grifados: [{ inicio: 70, fim: 85, motivo: "grave" }],
    },
    macete: { texto: "Menos da metade do limite + obstruir = grave (art. 219).", destaques: ["metade", "grave"] },
  }),

  "legislacao_transito/lote-001.json:9": criarAulaCompleto({
    arquetipo: "diagrama_competencia",
    fundamento_slug: "CTB_art_93",
    macete_visual: "Pólo atrativo=anuência local+estacionamento (93)",
    links_fonte: [{ rotulo: "CTB art. 93", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Shopping em Campina Grande com alto fluxo de veículos. A banca testa art. 93 — anuência do órgão de trânsito da via + estacionamento no projeto.",
      destaques: ["shopping", "art. 93", "anuência"],
    },
    glossario: {
      texto: "Pólo atrativo de trânsito = empreendimento que concentra fluxo. Anuência prévia = aprovação do órgão com circunscrição sobre a via. CONTRAN = normas gerais, não anuência de cada projeto local.",
      destaques: ["pólo atrativo", "anuência", "estacionamento"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Art. 93", descricao: "Projeto atrativo exige anuência + estacionamento + acessos." },
        { ordem: 2, rotulo: "Competência", descricao: "Órgão com circunscrição sobre a via — não CONTRAN direto." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Dispensa estacionamento ou exige só licença ambiental." },
      ],
    },
    nucleo: {
      tipo: "diagrama_competencia",
      titulo: "Aprovação do empreendimento",
      nos: [
        { id: "proj", label: "Pólo atrativo de trânsito", nivel: 0 },
        { id: "org", label: "Anuência órgão da via", nivel: 1 },
        { id: "est", label: "Área de estacionamento", nivel: 1 },
        { id: "contran", label: "CONTRAN (normas gerais)", nivel: 2 },
      ],
      arestas: [
        { de: "proj", para: "org" },
        { de: "proj", para: "est" },
        { de: "contran", para: "proj", rotulo: "Não substitui anuência local" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Só licença ambiental (B)", "Exige anuência do órgão de trânsito"],
        ["Anuência do CONTRAN (D)", "Anuência do órgão com circunscrição sobre a via"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — só aprovação municipal", "Art. 93 exige anuência de trânsito e estacionamento."],
        ["B — só ambiental", "Licença ambiental não substitui art. 93."],
        ["D — CONTRAN obrigatório", "Anuência é do órgão local da via."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Achar que prefeitura aprova sem trânsito", "Shopping com fluxo intenso → art. 93 → C"],
        ["Confundir norma geral com anuência de projeto", "Circunscrição sobre a via é local"],
      ],
    },
    lei1: {
      fonte: "CTB art. 93",
      texto: "Nenhum projeto que possa transformar-se em pólo atrativo de trânsito poderá ser aprovado sem prévia anuência do órgão com circunscrição sobre a via e sem área para estacionamento.",
      trechos_grifados: [{ inicio: 0, fim: 50, motivo: "anuência prévia" }],
    },
    macete: { texto: "Pólo atrativo = anuência do órgão da via + estacionamento + acessos.", destaques: ["anuência", "estacionamento"] },
  }),
};
