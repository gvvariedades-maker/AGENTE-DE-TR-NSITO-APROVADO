import { criarAulaCompleto } from "../../lib/aula-completo-builder";

export const legislacaoLote004: Record<string, ReturnType<typeof criarAulaCompleto>> = {
  "legislacao_transito/lote-004.json:0": criarAulaCompleto({
    arquetipo: "fluxograma_decisao",
    fundamento_slug: "CTB_art_165-A",
    macete_visual: "Recusou bafômetro=165-A autônoma gravíssima",
    links_fonte: [{ rotulo: "CTB art. 165-A", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Lei Seca na BR-230: condutor com sinais de álcool recusa o etilômetro. A banca testa art. 165-A — recusa é infração autônoma, independente do resultado.",
      destaques: ["recusa", "165-A", "autônoma"],
    },
    glossario: {
      texto: "Art. 165 = dirigir sob influência de álcool. Art. 165-A = recusar teste — autônoma. Etilômetro = teste de ar expirado. Gravíssima = multa 10x + suspensão 12 meses.",
      destaques: ["165", "165-A", "recusa"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Art. 165", descricao: "Dirigir alterado — exige influência comprovada." },
        { ordem: 2, rotulo: "Art. 165-A", descricao: "Recusa ao teste — infração por si só." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Sem teste positivo = sem infração (pegadinha)." },
      ],
    },
    nucleo: {
      tipo: "fluxograma",
      titulo: "Recusa ao etilômetro",
      nos: [
        { id: "n1", label: "Sinais de alteração?", tipo: "pergunta" },
        { id: "n2", label: "Recusa o teste?", tipo: "pergunta" },
        { id: "n3", label: "165-A autônoma — gravíssima", tipo: "resultado", ref: "CTB art. 165-A" },
        { id: "n4", label: "165 — sob influência", tipo: "resultado" },
      ],
      arestas: [
        { de: "n1", para: "n2", rotulo: "Sim" },
        { de: "n2", para: "n3", rotulo: "Recusa" },
        { de: "n2", para: "n4", rotulo: "Aceita + positivo" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Sem teste positivo = sem infração (A/D)", "Recusa é autônoma — art. 165-A"],
        ["Precisa exame de sangue (C)", "Não exige confirmação para autuação da recusa"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — recusa impede autuação", "Recusa É a infração."],
        ["C — exige sangue", "Não é requisito para 165-A."],
        ["D — só art. 165", "Confunde dirigir alterado com recusa."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Exigir confirmação etílica para autuar", "Recusa expressa → 165-A → B"],
        ["Limitar agente a orientação verbal", "Lei Seca autoriza autuação da recusa"],
      ],
    },
    lei1: {
      fonte: "CTB art. 165-A",
      texto: "Recusar-se a ser submetido a teste que permita certificar influência de álcool — infração gravíssima; multa (dez vezes) e suspensão por 12 meses.",
      trechos_grifados: [{ inicio: 0, fim: 30, motivo: "recusa autônoma" }],
    },
    macete: { texto: "Recusou o bafômetro = 165-A: gravíssima + multa 10x + suspensão 12 meses.", destaques: ["165-A", "recusa"] },
  }),

  "legislacao_transito/lote-004.json:1": criarAulaCompleto({
    arquetipo: "tabela_gradacao",
    fundamento_slug: "CTB_art_218",
    macete_visual: "Até20%=média | 20-50%=grave | +50%=gravíssima",
    links_fonte: [{ rotulo: "CTB art. 218", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Radar da STTP: 84 km/h em via de 60 km/h. Excesso de 40% — art. 218, II (grave). A banca confunde com média ou gravíssima.",
      destaques: ["84 km/h", "60 km/h", "40%"],
    },
    glossario: {
      texto: "Excesso = (84−60)÷60 = 40%. Até 20% = média. 20% a 50% = grave. Acima de 50% = gravíssima + suspensão.",
      destaques: ["40%", "grave", "art. 218"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Cálculo", descricao: "24 km/h acima de 60 = 40% de excesso." },
        { ordem: 2, rotulo: "Inciso II", descricao: "20% a 50% = infração GRAVE." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Acha que abaixo de 50% é média." },
      ],
    },
    nucleo: {
      tipo: "tabela_gradacao",
      titulo: "Onde cai 40%",
      titulo_colunas: ["Excesso", "Classificação"],
      linhas: [
        { faixa: "Até 20%", classificacao: "Média" },
        { faixa: "20% a 50% (40% aqui)", classificacao: "Grave — inciso II", destaque: true },
        { faixa: "Acima de 50%", classificacao: "Gravíssima + suspensão" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["40% = gravíssima (A)", "Gravíssima só acima de 50%"],
        ["40% = média (C)", "Média só até 20%"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — gravíssima imediata", "Suspensão só acima de 50%."],
        ["B — leve", "Não existe leve no art. 218."],
        ["C — média", "40% está na faixa grave."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Não calcular o percentual de excesso", "84 em 60 = 40% → grave → D"],
        ["Associar arterial urbana a gravidade menor", "Art. 218 não distingue tipo de via aqui"],
      ],
    },
    lei1: {
      fonte: "CTB art. 218, II",
      texto: "Transitar em velocidade superior à máxima em mais de vinte por cento até cinquenta por cento — infração grave.",
      trechos_grifados: [{ inicio: 70, fim: 85, motivo: "grave" }],
    },
    macete: { texto: "Até 20% média | 20–50% grave | +50% gravíssima + suspensão.", destaques: ["20–50%", "grave"] },
  }),

  "legislacao_transito/lote-004.json:2": criarAulaCompleto({
    arquetipo: "matriz_assertivas",
    fundamento_slug: "CTB_art_167",
    macete_visual: "Sem cinto=grave+retenção | Condutor OU passageiro",
    links_fonte: [{ rotulo: "CTB art. 167", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Assertivas sobre cinto de segurança. A banca restringe autuação ao condutor na III — art. 167 inclui passageiro.",
      destaques: ["cinto", "art. 167", "passageiro"],
    },
    glossario: {
      texto: "Art. 167 = condutor ou passageiro sem cinto. Grave = natureza da infração. Retenção = até colocar o cinto.",
      destaques: ["condutor", "passageiro", "retenção"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "I", descricao: "Infração grave — correta." },
        { ordem: 2, rotulo: "II", descricao: "Retenção até colocar cinto — correta." },
        { ordem: 3, rotulo: "III errada", descricao: "Só condutor — ignora passageiro." },
      ],
    },
    nucleo: {
      tipo: "matriz_assertivas",
      titulo: "Assertivas do cinto",
      itens: [
        { id: "I", texto: "Infração de natureza grave", correto: true },
        { id: "II", texto: "Medida: retenção até colocar o cinto", correto: true },
        { id: "III", texto: "Somente o condutor pode ser autuado", correto: false },
      ],
      gabarito_resumo: "I e II corretas → alternativa A",
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Só condutor autuado (III)", "Condutor ou passageiro — art. 167"],
        ["Remoção ao pátio", "Medida é retenção, não remoção"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["B — II e III", "III errada."],
        ["C — só I", "II também correta."],
        ["D — todas", "III errada."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Esquecer que passageiro sem cinto também infração", "I e II corretas → A"],
        ["Confundir com medida de remoção", "II fala em retenção — correta"],
      ],
    },
    lei1: {
      fonte: "CTB art. 167",
      texto: "Deixar o condutor ou passageiro de usar o cinto de segurança — infração grave; retenção até colocação do cinto.",
      trechos_grifados: [{ inicio: 6, fim: 30, motivo: "condutor ou passageiro" }],
    },
    macete: { texto: "Sem cinto = grave + retenção (condutor OU passageiro).", destaques: ["passageiro", "retenção"] },
  }),

  "legislacao_transito/lote-004.json:3": criarAulaCompleto({
    arquetipo: "comparacao",
    fundamento_slug: "CTB_art_181_V",
    macete_visual: "Pista de rolamento=gravíssima+remoção (181,V)",
    links_fonte: [{ rotulo: "CTB art. 181, V", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Veículo estacionado na pista de rolamento da BR-230. Questão INCORRETA — a banca diz infração média por estar parado.",
      destaques: ["INCORRETA", "pista de rolamento", "rodovia"],
    },
    glossario: {
      texto: "Pista de rolamento = faixa de circulação (não acostamento). Art. 181, V = gravíssima + remoção. Estacionar ≠ circular, mas gravidade é altíssima em rodovia.",
      destaques: ["pista de rolamento", "gravíssima", "remoção"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Art. 181, V", descricao: "Estacionar na pista = gravíssima." },
        { ordem: 2, rotulo: "Pegadinha", descricao: "Parado = leve/média na cabeça do candidato." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Alternativa C diz média." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "Estacionamento em rodovia",
      colunas: ["Local", "Classificação"],
      linhas: [
        ["Pista de rolamento (art. 181, V)", "GRAVÍSSIMA + remoção"],
        ["Acostamento (quando permitido)", "Local adequado para parada"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Parado = média (C)", "Na pista de rolamento = GRAVÍSSIMA"],
        ["Gravíssima só em movimento", "Estacionado na pista é gravíssimo"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não é a incorreta"],
      linhas: [
        ["A — gravíssima art. 181, V", "Verdadeira."],
        ["B — remoção admitida", "Verdadeira — medida do inciso V."],
        ["D — penalidade de multa", "Verdadeira."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Subestimar por veículo parado", "Pista de rolamento = gravíssima → C incorreta"],
        ["Confundir com estacionamento em esquina urbana", "181, V é hipótese de rodovia"],
      ],
    },
    lei1: {
      fonte: "CTB art. 181, V",
      texto: "Estacionar na pista de rolamento das rodovias — infração gravíssima; medida administrativa remoção.",
      trechos_grifados: [{ inicio: 45, fim: 65, motivo: "gravíssima" }],
    },
    macete: { texto: "Pista de rolamento em rodovia = gravíssima + remoção. Use o acostamento.", destaques: ["gravíssima", "acostamento"] },
  }),
};

/** Aula ouro celular § único — lote-004 Q5 */
export const legislacaoLote004Celular = criarAulaCompleto({
  arquetipo: "comparacao",
  arquetipo_secundario: "fluxograma_decisao",
  fundamento_slug: "CTB_art_252_paragrafo_unico",
  macete_visual: "Ouvido=média(VI) | Manuseando=gravíssima(§único)",
  duracao_estimada_seg: 210,
  links_fonte: [
    { rotulo: "CTB art. 252", path: "conteúdo/legislação federal/" },
    { rotulo: "Lei 13.281/2016", path: "conteúdo/legislação federal/" },
  ],
  contexto: {
    texto: "Condutor digitando mensagem no celular com uma mão na via de Campina Grande. A banca mistura celular ao ouvido (média, VI) com manusear (gravíssima, § único).",
    destaques: ["digitando", "média", "gravíssima"],
  },
  glossario: {
    texto: "Manusear = segurar, digitar ou operar o celular. Inciso VI = uso ao ouvido ou fones. § único = eleva a gravíssima quando há celular na mão.",
    destaques: ["Manusear", "VI", "§ único"],
  },
  historico: {
    eventos: [
      { ordem: 1, rotulo: "Regra geral", descricao: "Celular ao ouvido ou fones: infração média (inciso VI)." },
      { ordem: 2, rotulo: "Lei 13.281/2016", descricao: "§ único do art. 252: manusear celular = gravíssima." },
      { ordem: 3, rotulo: "IDECAN", descricao: "Cobra o contraste: digitando ≠ ouvido." },
    ],
  },
  nucleo: {
    tipo: "fluxograma",
    titulo: "Encadeamento V → § único",
    nos: [
      { id: "n1", label: "Dirige com uma das mãos? (inc. V)", tipo: "pergunta" },
      { id: "n2", label: "Segura ou manuseia celular?", tipo: "pergunta" },
      { id: "n3", label: "§ único — gravíssima", tipo: "lei", ref: "CTB art. 252, § único" },
      { id: "n4", label: "Só celular ao ouvido/fones?", tipo: "pergunta" },
      { id: "n5", label: "Inciso VI — média", tipo: "lei", ref: "CTB art. 252, VI" },
    ],
    arestas: [
      { de: "n1", para: "n2", rotulo: "sim" },
      { de: "n2", para: "n3", rotulo: "sim" },
      { de: "n4", para: "n5", rotulo: "sim" },
    ],
  },
  contraste: {
    titulo: "VI vs § único",
    colunas: ["Conduta", "Classificação"],
    linhas: [
      ["Celular ao ouvido / fones (VI)", "Infração MÉDIA"],
      ["Segurando ou manuseando (§ único)", "Infração GRAVÍSSIMA"],
    ],
  },
  distratores: {
    colunas: ["Alternativa", "Por que não"],
    linhas: [
      ["A — só VI (média)", "VI é ouvido/fones; digitando é manuseio."],
      ["B — só uma mão", "§ único torna gravíssima com celular na mão."],
      ["D — depende de velocidade", "Infração autônoma; não exige excesso."],
    ],
  },
  caso: {
    colunas: ["Pegadinha", "Correto"],
    linhas: [
      ["Sem celular na orelha = média", "Digitando = manusear = gravíssima → C"],
      ["Precisa estar acima do limite", "Não depende de velocidade"],
    ],
  },
  lei1: {
    titulo: "Lei — inciso VI",
    fonte: "CTB art. 252, VI",
    texto: "Dirigir utilizando-se de telefone celular — infração de natureza média.",
    trechos_grifados: [{ inicio: 45, fim: 60, motivo: "média" }],
  },
  lei2: {
    titulo: "Lei — § único",
    fonte: "CTB art. 252, § único",
    texto: "A hipótese do inciso V caracterizar-se-á como gravíssima no caso de o condutor estar segurando ou manuseando telefone celular.",
    trechos_grifados: [
      { inicio: 52, fim: 72, motivo: "gravíssima" },
      { inicio: 95, fim: 130, motivo: "manuseando" },
    ],
  },
  macete: { texto: "Ouvido = média (VI) | Manuseando = gravíssima (§ único).", destaques: ["média", "gravíssima"] },
});

legislacaoLote004["legislacao_transito/lote-004.json:4"] = legislacaoLote004Celular;

export const legislacaoExemplo = {
  "legislacao_transito/lote-001-exemplo.json:0": criarAulaCompleto({
    arquetipo: "fluxograma_decisao",
    fundamento_slug: "CTB_art_165-A",
    macete_visual: "Recusou=teste autônomo (165-A)",
    links_fonte: [{ rotulo: "CTB art. 165-A", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "STTP em Campina Grande: condutor com sinais de álcool recusa o etilômetro. A banca testa se a recusa é infração autônoma — sem precisar de teste positivo.",
      destaques: ["recusa", "165-A", "autônoma"],
    },
    glossario: {
      texto: "Sinais de alteração = odor, fala, coordenação. Etilômetro = teste de ar. Recusa = conduta tipificada no art. 165-A, independente do resultado.",
      destaques: ["sinais", "etilômetro", "recusa"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Art. 165", descricao: "Dirigir sob influência — precisa comprovar alteração." },
        { ordem: 2, rotulo: "Art. 165-A", descricao: "Recusar teste — infração por si só." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Candidato acha que sem teste não há autuação." },
      ],
    },
    nucleo: {
      tipo: "fluxograma",
      titulo: "Recusa ou aceita?",
      nos: [
        { id: "n1", label: "Agente oferece etilômetro", tipo: "acao" },
        { id: "n2", label: "Condutor recusa?", tipo: "pergunta" },
        { id: "n3", label: "165-A — infração autônoma", tipo: "resultado" },
        { id: "n4", label: "165 — se alterado", tipo: "resultado" },
      ],
      arestas: [
        { de: "n1", para: "n2" },
        { de: "n2", para: "n3", rotulo: "Recusa" },
        { de: "n2", para: "n4", rotulo: "Aceita" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Recusa impede autuação (A)", "Recusa É infração autônoma"],
        ["Precisa etilômetro positivo (D)", "165-A independe do resultado"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — recusa impede autuação", "Contrário ao art. 165-A."],
        ["B — aguardar perito", "Não é requisito para autuação administrativa."],
        ["D — só com confirmação etílica", "Confunde 165 com 165-A."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Exigir consentimento livre como veto", "Recusa configurada → C"],
        ["Confundir com necessidade de perícia criminal", "Auto administrativo não espera perito"],
      ],
    },
    lei1: {
      fonte: "CTB art. 165-A",
      texto: "Recusar-se a ser submetido a teste que permita certificar influência de álcool configura infração autônoma de trânsito.",
      trechos_grifados: [{ inicio: 0, fim: 25, motivo: "recusa" }],
    },
    macete: { texto: "Recusou o bafômetro = infração autônoma (art. 165-A). Não precisa estar 'bêbado no teste'.", destaques: ["165-A", "autônoma"] },
  }),
};
