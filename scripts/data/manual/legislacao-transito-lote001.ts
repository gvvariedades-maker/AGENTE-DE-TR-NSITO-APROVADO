import { criarAulaCompleto } from "../../lib/aula-completo-builder";

export const legislacaoLote001: Record<string, ReturnType<typeof criarAulaCompleto>> = {
  "legislacao_transito/lote-001.json:0": criarAulaCompleto({
    arquetipo: "comparacao",
    fundamento_slug: "CTB_art_24_VI",
    macete_visual: "Município autua circulação/estacionamento (art.24,VI)",
    links_fonte: [{ rotulo: "CTB art. 24, VI", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "STTP autua estacionamento irregular em via municipal de Campina Grande. A banca testa competência do órgão executivo municipal — não exclusividade da PM.",
      destaques: ["STTP", "estacionamento", "art. 24"],
    },
    glossario: {
      texto: "Órgão executivo municipal = STTP. Policiamento ostensivo = PM (art. 23). Autuar = lavrar auto e aplicar multa. Competência = quem pode fiscalizar e punir.",
      destaques: ["STTP", "PM", "autuar"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Art. 23", descricao: "PM: policiamento ostensivo e preservação da ordem." },
        { ordem: 2, rotulo: "Art. 24, VI", descricao: "Município: fiscalizar, autuar circulação, estacionamento e parada." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Troca ostensivo da PM por exclusividade de autuação." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "PM vs STTP",
      colunas: ["Órgão", "Função"],
      linhas: [
        ["PM (art. 23)", "Policiamento ostensivo"],
        ["STTP (art. 24, VI)", "Fiscalizar e autuar no Município"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["PM autua exclusivamente estacionamento (A)", "Município autua circulação, estacionamento e parada"],
        ["STTP precisa delegação do CONTRAN (C/D)", "Competência é do órgão municipal, não por agente"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — exclusividade da PM", "PM não tem exclusividade para autuar estacionamento urbano."],
        ["C — delegação por agente", "Não exige delegação individual."],
        ["D — autorização do CONTRAN", "Inventa exigência não prevista no CTB."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Confundir patrulha com autuação exclusiva", "Autuação municipal por estacionamento → B"],
        ["Achar que STTP só orienta", "Art. 24, VI confere autuar e aplicar multa"],
      ],
    },
    lei1: {
      fonte: "CTB art. 24, VI",
      texto: "Compete aos órgãos executivos de trânsito dos Municípios executar a fiscalização, autuar e aplicar penalidades pelas infrações previstas neste Código.",
      trechos_grifados: [{ inicio: 60, fim: 90, motivo: "autuar e aplicar" }],
    },
    macete: { texto: "Município autua circulação, estacionamento e parada. PM patrulha (art. 23).", destaques: ["Município", "PM"] },
  }),

  "legislacao_transito/lote-001.json:1": criarAulaCompleto({
    arquetipo: "fluxograma_decisao",
    fundamento_slug: "CTB_art_90",
    macete_visual: "Sinalização ruim=sem sanção ao condutor (art.90)",
    links_fonte: [{ rotulo: "CTB art. 90", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Condutor autuado alega placa apagada. A questão pede a INCORRETA: com sinalização insuficiente, as sanções não se aplicam ao condutor.",
      destaques: ["INCORRETA", "sinalização", "art. 90"],
    },
    glossario: {
      texto: "Sinalização insuficiente = falta ou erro que impede compreensão. Sanção ao condutor = multa por desobedecer sinalização válida. Responsabilidade do órgão = implantar sinalização correta.",
      destaques: ["insuficiente", "sanção", "órgão"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Caput art. 90", descricao: "Sinalização ruim = sem sanção ao condutor." },
        { ordem: 2, rotulo: "§ 1º", descricao: "Órgão da via responde pela implantação." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Alternativa D inverte: aplica multa mesmo com falha." },
      ],
    },
    nucleo: {
      tipo: "fluxograma",
      titulo: "Sinalização e sanção",
      nos: [
        { id: "n1", label: "Sinalização insuficiente?", tipo: "pergunta" },
        { id: "n2", label: "Sem sanção ao condutor", tipo: "resultado" },
        { id: "n3", label: "Órgão responsável pela via", tipo: "lei", ref: "CTB art. 90, § 1º" },
        { id: "n4", label: "Sanção aplicável", tipo: "resultado" },
      ],
      arestas: [
        { de: "n1", para: "n2", rotulo: "Sim" },
        { de: "n1", para: "n4", rotulo: "Não" },
        { de: "n2", para: "n3" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Falha na sinalização só obriga consertar (D)", "Falha afasta sanção ao condutor"],
        ["Órgão conserta e multa mesmo assim", "Caput art. 90 protege o condutor"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não é a incorreta"],
      linhas: [
        ["A — sem sanção", "Verdadeira — caput do art. 90."],
        ["B — órgão responsável", "Verdadeira — § 1º do art. 90."],
        ["C — impede sanções", "Verdadeira — consequência do caput."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Achar que condutor paga e órgão só conserta depois", "Placa apagada = sanções não aplicáveis → D incorreta"],
        ["Confundir responsabilidade do órgão com multa ao condutor", "Duas esferas distintas no art. 90"],
      ],
    },
    lei1: {
      fonte: "CTB art. 90",
      texto: "Não serão aplicadas as sanções previstas neste Código por inobservância à sinalização quando esta for insuficiente ou incorreta.",
      trechos_grifados: [{ inicio: 0, fim: 40, motivo: "sem sanção" }],
    },
    lei2: {
      titulo: "Lei — § 1º",
      fonte: "CTB art. 90, § 1º",
      texto: "O órgão ou entidade de trânsito com circunscrição sobre a via é responsável pela implantação da sinalização.",
    },
    macete: { texto: "Sinalização ruim = sem sanção ao condutor + responsabilidade do órgão da via.", destaques: ["sem sanção", "órgão"] },
  }),

  "legislacao_transito/lote-001.json:2": criarAulaCompleto({
    arquetipo: "fluxograma_decisao",
    fundamento_slug: "CTB_art_44-A",
    macete_visual: "Vermelho+placa conversão=direita livre (44-A)",
    links_fonte: [{ rotulo: "CTB art. 44-A e 208", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Semáforo vermelho na Av. Epitácio Pessoa, mas há placa permitindo conversão à direita. A banca testa a exceção do art. 44-A ao art. 208.",
      destaques: ["vermelho", "conversão à direita", "44-A"],
    },
    glossario: {
      texto: "Art. 208 = avançar sinal vermelho (gravíssima). Art. 44-A = exceção: conversão à direita no vermelho com placa indicativa. Prudência = arts. 44 e 45.",
      destaques: ["208", "44-A", "placa"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Regra", descricao: "Vermelho = parar — art. 208." },
        { ordem: 2, rotulo: "Exceção", descricao: "Placa permite conversão à direita — art. 44-A." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Exige seta verde ou nega exceção com placa." },
      ],
    },
    nucleo: {
      tipo: "fluxograma",
      titulo: "Vermelho + placa",
      nos: [
        { id: "n1", label: "Sinal vermelho", tipo: "acao" },
        { id: "n2", label: "Placa permite conversão à direita?", tipo: "pergunta" },
        { id: "n3", label: "Conversão permitida (44-A)", tipo: "resultado" },
        { id: "n4", label: "Avanço proibido (208)", tipo: "resultado" },
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
        ["Vermelho sempre proíbe qualquer movimento (B)", "44-A excepciona conversão à direita com placa"],
        ["Exige seta verde exclusiva (C)", "Basta sinalização indicativa"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["B — gravíssima sempre", "Art. 208 excepciona conversão com placa."],
        ["C — só com seta verde", "Lei não exige seta verde."],
        ["D — só coletivo", "Não restringe a veículos de coletivo."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Ignorar a placa regulamentadora no enunciado", "Placa + vermelho = conversão à direita permitida → A"],
        ["Aplicar 208 sem ler a exceção do 44-A", "Exceção expressa no próprio art. 208"],
      ],
    },
    lei1: {
      fonte: "CTB art. 44-A",
      texto: "É livre o movimento de conversão à direita diante de sinal vermelho onde houver sinalização indicativa que permita essa conversão.",
      trechos_grifados: [{ inicio: 0, fim: 35, motivo: "conversão livre" }],
    },
    lei2: { fonte: "CTB art. 208", texto: "Avançar o sinal vermelho, exceto onde houver sinalização que permita a livre conversão à direita prevista no art. 44-A." },
    macete: { texto: "Vermelho + placa de conversão à direita = pode converter com prudência.", destaques: ["placa", "direita"] },
  }),

  "legislacao_transito/lote-001.json:3": criarAulaCompleto({
    arquetipo: "tabela_gradacao",
    fundamento_slug: "CTB_art_218",
    macete_visual: "Até20%=média | 20-50%=grave | +50%=gravíssima",
    links_fonte: [{ rotulo: "CTB art. 218", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Assertivas sobre gradação de excesso de velocidade. A banca troca infração grave (20% a 50%) por gravíssima na assertiva II.",
      destaques: ["velocidade", "art. 218", "assertivas"],
    },
    glossario: {
      texto: "Até 20% acima = média. De 20% a 50% = grave. Acima de 50% = gravíssima com multa tripla e suspensão. Percentual = (velocidade − limite) ÷ limite.",
      destaques: ["média", "grave", "gravíssima"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Inciso I", descricao: "Até 20% — infração média." },
        { ordem: 2, rotulo: "Inciso II", descricao: "20% a 50% — infração GRAVE (pegadinha)." },
        { ordem: 3, rotulo: "Inciso III", descricao: "Acima de 50% — gravíssima + suspensão." },
      ],
    },
    nucleo: {
      tipo: "tabela_gradacao",
      titulo: "Art. 218 — faixas",
      titulo_colunas: ["Excesso", "Classificação"],
      linhas: [
        { faixa: "Até 20%", classificacao: "Média (inciso I)" },
        { faixa: "20% a 50%", classificacao: "Grave (inciso II)", destaque: true },
        { faixa: "Acima de 50%", classificacao: "Gravíssima + suspensão (III)" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["20% a 50% = gravíssima (II errada)", "20% a 50% = GRAVE"],
        ["Abaixo de 50% sempre é média", "Entre 20% e 50% já é grave"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — só I", "III também está correta."],
        ["C — II e III", "II está errada."],
        ["D — todas", "II está errada."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Decorar só 'acima de 50% = gravíssima'", "Faixa intermediária é grave — I e III corretas → B"],
        ["Confundir grave com gravíssima", "II é a assertiva armadilha"],
      ],
    },
    lei1: {
      fonte: "CTB art. 218, II",
      texto: "Transitar em velocidade superior à máxima permitida em mais de vinte por cento até cinquenta por cento — infração grave.",
      trechos_grifados: [{ inicio: 80, fim: 95, motivo: "grave" }],
    },
    macete: { texto: "Até 20% média | 20–50% grave | +50% gravíssima + suspensão.", destaques: ["20–50%", "grave"] },
  }),

  "legislacao_transito/lote-001.json:4": criarAulaCompleto({
    arquetipo: "comparacao",
    fundamento_slug: "CTB_art_167",
    macete_visual: "Sem cinto=grave+retenção até colocar (167)",
    links_fonte: [{ rotulo: "CTB art. 167", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Blitz da STTP: motorista e passageiro sem cinto em veículo em movimento. A banca testa a medida administrativa do art. 167 — retenção, não remoção.",
      destaques: ["cinto", "retenção", "art. 167"],
    },
    glossario: {
      texto: "Retenção = veículo parado até regularizar a infração. Remoção = levar ao pátio. Infração grave = art. 167. Condutor ou passageiro = ambos podem ser autuados.",
      destaques: ["Retenção", "Remoção", "passageiro"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Art. 167", descricao: "Sem cinto = infração grave + multa." },
        { ordem: 2, rotulo: "Medida", descricao: "Retenção até colocar o cinto." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Troca retenção por remoção ao pátio." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "Retenção vs remoção",
      colunas: ["Medida", "Quando"],
      linhas: [
        ["Retenção até colocar cinto", "Art. 167 — sem cinto"],
        ["Remoção ao pátio", "Outras infrações (ex.: estacionamento)"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Remoção 24h ao pátio (B)", "Retenção até colocar o cinto"],
        ["Só condutor autuado (C)", "Passageiro também configura art. 167"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["B — remoção ao pátio", "Art. 167 prevê retenção, não remoção."],
        ["C — só condutor", "Menciona condutor ou passageiro."],
        ["D — ordem judicial", "Retenção é medida legal, sem juiz."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Confundir retenção com guincho ao pátio", "Até colocar o cinto → A"],
        ["Achar que passageiro não gera medida", "Ambos sem cinto no caso do enunciado"],
      ],
    },
    lei1: {
      fonte: "CTB art. 167",
      texto: "Deixar o condutor ou passageiro de usar o cinto de segurança — infração grave; medida administrativa: retenção do veículo até colocação do cinto.",
      trechos_grifados: [{ inicio: 90, fim: 130, motivo: "retenção" }],
    },
    macete: { texto: "Sem cinto = grave + retenção até colocar o cinto.", destaques: ["retenção", "cinto"] },
  }),
};
