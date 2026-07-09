import { criarAulaCompleto } from "../../lib/aula-completo-builder";

export const legislacaoLote003: Record<string, ReturnType<typeof criarAulaCompleto>> = {
  "legislacao_transito/lote-003.json:0": criarAulaCompleto({
    arquetipo: "tabela_gradacao",
    fundamento_slug: "CTB_art_261",
    macete_visual: "2+grav=20 | 1grav=30 | 0grav=40 pts",
    links_fonte: [{ rotulo: "CTB art. 261", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Assertivas sobre suspensão do direito de dirigir por pontuação. A banca fixa 20 pontos para qualquer cenário com gravíssima na assertiva II.",
      destaques: ["suspensão", "pontos", "gravíssima"],
    },
    glossario: {
      texto: "Suspensão = perda temporária da CNH por pontos. 12 meses = período de contagem. Gravíssima = altera o teto de pontos (20/30/40).",
      destaques: ["suspensão", "12 meses", "gravíssima"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Lei 14.071/2020", descricao: "Graduação 20/30/40 conforme gravíssimas." },
        { ordem: 2, rotulo: "2+ gravíssimas", descricao: "Limite 20 pontos." },
        { ordem: 3, rotulo: "IDECAN", descricao: "II errada: 1 gravíssima = 30, não 20." },
      ],
    },
    nucleo: {
      tipo: "tabela_gradacao",
      titulo: "Limites art. 261, I",
      titulo_colunas: ["Cenário", "Pontos em 12 meses"],
      linhas: [
        { faixa: "2+ gravíssimas", classificacao: "20 pontos", destaque: true },
        { faixa: "1 gravíssima", classificacao: "30 pontos" },
        { faixa: "0 gravíssima", classificacao: "40 pontos" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Qualquer gravíssima = 20 pts (II)", "1 gravíssima = 30 pontos"],
        ["40 pontos com gravíssima", "40 só sem gravíssima na pontuação"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — só I", "III também correta."],
        ["C — II e III", "II errada."],
        ["D — todas", "II errada."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Decorar só '20 pontos'", "I e III corretas, II errada → B"],
        ["Ignorar graduação pós-2020", "Três tetos distintos no art. 261"],
      ],
    },
    lei1: {
      fonte: "CTB art. 261, I",
      texto: "A suspensão ocorrerá ao atingir, em doze meses, vinte pontos com duas ou mais gravíssimas, trinta com uma, ou quarenta sem gravíssima.",
      trechos_grifados: [{ inicio: 0, fim: 40, motivo: "graduação" }],
    },
    macete: { texto: "2+ gravíssimas = 20 | 1 gravíssima = 30 | 0 gravíssima = 40.", destaques: ["20", "30", "40"] },
  }),

  "legislacao_transito/lote-003.json:1": criarAulaCompleto({
    arquetipo: "comparacao",
    fundamento_slug: "CTB_art_148-A",
    macete_visual: "C,D,E=toxicológico na CNH nova E renovação",
    links_fonte: [{ rotulo: "CTB art. 148-A", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Motorista categoria D renova CNH no DETRAN/PB. A banca testa art. 148-A — exame toxicológico na obtenção E na renovação.",
      destaques: ["categoria D", "renovação", "toxicológico"],
    },
    glossario: {
      texto: "Categorias C, D, E = profissionais/veículos pesados. Exame toxicológico = detecta substâncias. Renovação = nova emissão da CNH ao fim da validade.",
      destaques: ["C, D, E", "toxicológico", "renovação"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Art. 148-A", descricao: "Obrigatório na obtenção e renovação." },
        { ordem: 2, rotulo: "Categoria D", descricao: "Ônibus urbano — incluída no rol." },
        { ordem: 3, rotulo: "IDECAN", descricao: "A limita toxicológico à primeira habilitação." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "Quando exige toxicológico",
      colunas: ["Momento", "Exige?"],
      linhas: [
        ["Primeira habilitação C/D/E", "Sim — art. 148-A"],
        ["Renovação C/D/E", "Sim — art. 148-A"],
        ["Renovação categoria B", "Não — fora do rol"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Só na primeira habilitação (A)", "Caput inclui renovação"],
        ["Facultativo na renovação (C)", "É obrigatório por lei"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — só primeira habilitação", "Caput diz obtenção e renovação."],
        ["C — facultativo", "Não é discricionariedade do DETRAN."],
        ["D — D dispensada", "D está no rol do art. 148-A."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Achar que renovação dispensa exame", "Renovação categoria D exige toxicológico → B"],
        ["Confundir transporte urbano com exceção", "Não há exceção para ônibus urbano"],
      ],
    },
    lei1: {
      fonte: "CTB art. 148-A",
      texto: "Os condutores das categorias C, D e E deverão comprovar resultado negativo em exame toxicológico para a obtenção e a renovação da CNH.",
      trechos_grifados: [{ inicio: 80, fim: 110, motivo: "renovação" }],
    },
    macete: { texto: "C, D e E = toxicológico na CNH nova E na renovação.", destaques: ["renovação", "C, D, E"] },
  }),

  "legislacao_transito/lote-003.json:2": criarAulaCompleto({
    arquetipo: "fluxograma_decisao",
    fundamento_slug: "CTB_art_130_2",
    macete_visual: "Mudou de casa? CRLV do exercício vale (130,§2)",
    links_fonte: [{ rotulo: "CTB art. 130, § 2º", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Proprietário muda para Campina Grande mantendo licenciamento do exercício em curso. A banca testa art. 130, § 2º — CRLV de origem continua válido.",
      destaques: ["mudança", "licenciamento", "exercício"],
    },
    glossario: {
      texto: "Licenciamento = autorização anual de circulação (CRLV). Exercício = ano fiscal do licenciamento. Transferência de domicílio ≠ invalidação imediata do CRLV.",
      destaques: ["licenciamento", "exercício", "domicílio"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Regra geral", descricao: "Mudança de Estado exige novo licenciamento depois." },
        { ordem: 2, rotulo: "§ 2º", descricao: "Durante o exercício, CRLV de origem vale." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Confunde com comunicação de venda em 30 dias." },
      ],
    },
    nucleo: {
      tipo: "fluxograma",
      titulo: "Mudança de domicílio",
      nos: [
        { id: "n1", label: "Transferiu residência?", tipo: "pergunta" },
        { id: "n2", label: "Licenciamento do exercício vigente?", tipo: "pergunta" },
        { id: "n3", label: "CRLV de origem válido (§ 2º)", tipo: "resultado" },
        { id: "n4", label: "Exige licenciamento imediato no novo UF", tipo: "resultado" },
      ],
      arestas: [
        { de: "n1", para: "n2", rotulo: "Sim" },
        { de: "n2", para: "n3", rotulo: "Sim" },
        { de: "n2", para: "n4", rotulo: "Não" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Perde validade imediatamente (A)", "Válido durante o exercício — § 2º"],
        ["STTP autua sem CRLV local (C)", "Com exercício vigente, não há infração"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — invalidação imediata", "§ 2º preserva licenciamento do exercício."],
        ["C — autuação pela STTP", "CRLV do exercício ainda vale."],
        ["D — prazo 30 dias", "Inventa prazo não previsto no § 2º."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Confundir mudança de casa com venda do veículo", "Caso é domicílio + exercício em curso → B"],
        ["Exigir licenciamento PB imediato", "Durante o exercício, origem vale"],
      ],
    },
    lei1: {
      fonte: "CTB art. 130, § 2º",
      texto: "No caso de transferência de residência ou domicílio, é válido, durante o exercício, o licenciamento de origem.",
      trechos_grifados: [{ inicio: 0, fim: 55, motivo: "válido no exercício" }],
    },
    macete: { texto: "Mudou de casa no mesmo ano? CRLV do exercício continua valendo.", destaques: ["exercício", "origem"] },
  }),

  "legislacao_transito/lote-003.json:3": criarAulaCompleto({
    arquetipo: "fluxograma_decisao",
    fundamento_slug: "CTB_art_69",
    macete_visual: "Faixa a 50m? Tem que usar (art.69)",
    links_fonte: [{ rotulo: "CTB art. 69", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Pedestre atravessa em diagonal a 30 m da faixa na Av. Epitácio Pessoa. A banca testa art. 69, caput — faixa a até 50 m é obrigatória.",
      destaques: ["pedestre", "faixa", "50 metros"],
    },
    glossario: {
      texto: "Faixa de pedestres = travessia sinalizada. Caput art. 69 = obrigatoriedade até 50 m. Foco de pedestres = regra do inciso II (outra hipótese).",
      destaques: ["faixa", "50 m", "caput"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Caput", descricao: "Faixa a até 50 m = deve usar." },
        { ordem: 2, rotulo: "Sem faixa", descricao: "Cruzamento perpendicular quando seguro." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Confunde com foco de pedestres (inciso II)." },
      ],
    },
    nucleo: {
      tipo: "fluxograma",
      titulo: "Travessia do pedestre",
      nos: [
        { id: "n1", label: "Há faixa a até 50 m?", tipo: "pergunta" },
        { id: "n2", label: "Deve cruzar na faixa", tipo: "resultado" },
        { id: "n3", label: "Cruzamento em outro ponto", tipo: "resultado" },
      ],
      arestas: [
        { de: "n1", para: "n2", rotulo: "Sim (30 m)" },
        { de: "n1", para: "n3", rotulo: "Não" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Pode atravessar em qualquer ponto (A/C)", "Faixa a 50 m = obrigatória"],
        ["Só obrigatória com semáforo (D)", "Basta existir faixa próxima"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — qualquer ponto", "Caput impõe faixa a até 50 m."],
        ["C — livre sem foco", "Faixa próxima prevalece."],
        ["D — só com semáforo", "Não exige semáforo."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Confundir art. 69 caput com inciso II", "30 m da faixa = deve usar → B"],
        ["Achar que diagonal é livre", "Distância à faixa define obrigatoriedade"],
      ],
    },
    lei1: {
      fonte: "CTB art. 69",
      texto: "O pedestre utilizará as faixas ou passagens a ele destinadas sempre que existirem numa distância de até cinquenta metros.",
      trechos_grifados: [{ inicio: 60, fim: 90, motivo: "50 metros" }],
    },
    macete: { texto: "Faixa a até 50 m? Tem que usar (art. 69, caput).", destaques: ["50 m", "faixa"] },
  }),

  "legislacao_transito/lote-003.json:4": criarAulaCompleto({
    arquetipo: "comparacao",
    fundamento_slug: "CTB_art_256_1",
    macete_visual: "Multa não absolve crime (256,§1) | Homicídio=302",
    links_fonte: [{ rotulo: "CTB art. 256 e 302", path: "conteúdo/legislação federal/" }],
    contexto: {
      texto: "Acidente fatal na BR-230: condutor paga multa administrativa. A questão pede a INCORRETA — multa não extingue responsabilidade penal.",
      destaques: ["INCORRETA", "multa", "crime"],
    },
    glossario: {
      texto: "Esfera administrativa = multas e penalidades do CTB. Esfera penal = crimes de trânsito (art. 302). Independência = podem coexistir.",
      destaques: ["administrativa", "penal", "independentes"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Art. 256, § 1º", descricao: "Penalidades administrativas não elidem crimes." },
        { ordem: 2, rotulo: "Art. 302", descricao: "Homicídio culposo na direção de veículo." },
        { ordem: 3, rotulo: "IDECAN", descricao: "D diz que multa extingue pena." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "Administrativo vs penal",
      colunas: ["Esfera", "Consequência"],
      linhas: [
        ["Administrativa", "Multa, suspensão, cassação"],
        ["Penal", "Detenção, suspensão/proibição de CNH"],
        ["Pagou multa", "Não absolve crime"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Multa extingue pena (D)", "Art. 256, § 1º preserva esfera penal"],
        ["Bis in idem", "Esferas distintas — não há absolvição automática"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não é a incorreta"],
      linhas: [
        ["A — não elide crimes", "Verdadeira — § 1º do art. 256."],
        ["B — homicídio culposo", "Verdadeira — art. 302."],
        ["C — esferas independentes", "Verdadeira — consequência lógica."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Achar que pagar multa encerra o processo criminal", "Fatal na BR-230: multa não absolve → D incorreta"],
        ["Confundir quitação administrativa com pena", "§ 1º do art. 256 é expresso"],
      ],
    },
    lei1: {
      fonte: "CTB art. 256, § 1º",
      texto: "A aplicação das penalidades previstas neste Código não elide as punições originárias de ilícitos penais decorrentes de crimes de trânsito.",
      trechos_grifados: [{ inicio: 0, fim: 45, motivo: "não elide" }],
    },
    lei2: { fonte: "CTB art. 302", texto: "Homicídio culposo na direção de veículo automotor — penas de detenção e suspensão ou proibição de habilitação." },
    macete: { texto: "Multa não absolve crime de trânsito (art. 256, § 1º).", destaques: ["não absolve", "crime"] },
  }),
};
