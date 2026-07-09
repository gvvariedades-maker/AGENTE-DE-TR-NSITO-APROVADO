import { criarAulaCompleto } from "../../lib/aula-completo-builder";

export const direitoAulas: Record<string, ReturnType<typeof criarAulaCompleto>> = {
  "direito_constitucional/lote-001.json:0": criarAulaCompleto({
    arquetipo: "trecho_legal",
    arquetipo_secundario: "comparacao",
    fundamento_slug: "CF_art1",
    macete_visual: "Art.1º=SCDVP | Separação dos Poderes=art.2º",
    links_fonte: [{ rotulo: "CF/88, art. 1º", path: "conteúdo/legislação federal/cf-1988.html" }],
    contexto: {
      texto:
        "A questão pede a alternativa INCORRETA sobre fundamentos do art. 1º. A banca coloca separação dos Poderes na lista — mas esse princípio está no art. 2º.",
      destaques: ["INCORRETA", "art. 1º", "fundamentos"],
    },
    glossario: {
      texto:
        "Fundamentos da República (art. 1º) = valores que definem o Estado. Princípios de organização (art. 2º) = separação dos Poderes. Lista taxativa = só o que a lei enumera.",
      destaques: ["Fundamentos", "art. 2º", "taxativa"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Art. 1º", descricao: "Cinco fundamentos: soberania, cidadania, dignidade, valores sociais, pluralismo." },
        { ordem: 2, rotulo: "Art. 2º", descricao: "Separação dos Poderes — Executivo, Legislativo, Judiciário." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Insere princípio verdadeiro, mas de outro artigo, como fundamento." },
      ],
    },
    nucleo: {
      tipo: "tabela_gradacao",
      titulo: "Os 5 fundamentos (art. 1º)",
      titulo_colunas: ["Fundamento", "Inciso"],
      linhas: [
        { faixa: "Soberania", classificacao: "I" },
        { faixa: "Cidadania", classificacao: "II" },
        { faixa: "Dignidade da pessoa humana", classificacao: "III", destaque: true },
        { faixa: "Valores sociais do trabalho", classificacao: "IV" },
        { faixa: "Pluralismo político", classificacao: "V" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Separação dos Poderes no art. 1º (D)", "Separação dos Poderes está no art. 2º"],
        ["Qualquer princípio verdadeiro serve", "Fundamentos = lista fechada do art. 1º"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não é a incorreta"],
      linhas: [
        ["A — soberania", "Fundamento expresso no inciso I."],
        ["B — dignidade", "Fundamento expresso no inciso III."],
        ["C — pluralismo político", "Fundamento expresso no inciso V."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Marcar D por soar como princípio constitucional válido", "É válido, mas no art. 2º — não no art. 1º"],
        ["Confundir 'fundamento' com 'princípio de organização'", "Art. 1º ≠ art. 2º na CF/88"],
      ],
    },
    lei1: {
      titulo: "Lei — art. 1º",
      fonte: "CF/88, art. 1º",
      texto:
        "São fundamentos da República Federativa do Brasil a soberania, a cidadania, a dignidade da pessoa humana, os valores sociais do trabalho e da livre iniciativa e o pluralismo político.",
      trechos_grifados: [{ inicio: 0, fim: 50, motivo: "lista taxativa" }],
    },
    lei2: {
      titulo: "Lei — art. 2º",
      fonte: "CF/88, art. 2º",
      texto: "São Poderes da União, independentes e harmônicos entre si, o Legislativo, o Executivo e o Judiciário.",
      trechos_grifados: [{ inicio: 0, fim: 30, motivo: "separação dos Poderes" }],
    },
    macete: {
      texto: "SCDVP no art. 1º. Separação dos Poderes = art. 2º — não é fundamento da República.",
      destaques: ["SCDVP", "art. 2º"],
    },
  }),

  "direito_constitucional/lote-001.json:1": criarAulaCompleto({
    arquetipo: "fluxograma_decisao",
    fundamento_slug: "CF_art5_LXVIII_LXIX",
    macete_visual: "Locomoção=HC | Direito líquido=MS | Sem norma=MI",
    links_fonte: [{ rotulo: "CF/88, art. 5º, LXIX", path: "conteúdo/legislação federal/cf-1988.html" }],
    contexto: {
      texto:
        "Cidadão teve direito líquido e certo negado, sem ameaça à locomoção e sem caber habeas data. A banca testa se você escolhe mandado de segurança — não habeas corpus.",
      destaques: ["direito líquido e certo", "sem locomoção", "MS"],
    },
    glossario: {
      texto:
        "Habeas corpus = protege liberdade de locomoção. Mandado de segurança = protege direito líquido e certo não amparado por HC/HD. Ação popular = patrimônio público e meio ambiente.",
      destaques: ["Habeas corpus", "Mandado de segurança", "Ação popular"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Sem locomoção", descricao: "Afasta habeas corpus (art. 5º, LXVIII)." },
        { ordem: 2, rotulo: "Direito líquido e certo", descricao: "Remédio residual: mandado de segurança (LXIX)." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Alternativa A generaliza HC para 'qualquer ato ilegal'." },
      ],
    },
    nucleo: {
      tipo: "fluxograma",
      titulo: "Qual remédio cabe?",
      nos: [
        { id: "q1", label: "Ameaça à locomoção?", tipo: "pergunta" },
        { id: "hc", label: "Habeas corpus (LXVIII)", tipo: "resultado", ref: "CF art. 5º, LXVIII" },
        { id: "q2", label: "Direito líquido e certo?", tipo: "pergunta" },
        { id: "ms", label: "Mandado de segurança (LXIX)", tipo: "resultado", ref: "CF art. 5º, LXIX" },
      ],
      arestas: [
        { de: "q1", para: "hc", rotulo: "Sim" },
        { de: "q1", para: "q2", rotulo: "Não" },
        { de: "q2", para: "ms", rotulo: "Sim" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["HC para qualquer ato ilegal (A)", "HC só protege liberdade de locomoção"],
        ["Mandado de injunção sem ausência de norma (D)", "MI exige falta de norma regulamentadora"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — habeas corpus", "Não há ameaça à locomoção no caso."],
        ["C — ação popular", "Tutela patrimônio público — não é o caso."],
        ["D — mandado de injunção", "Exige ausência de norma regulamentadora."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Marcar HC por ser 'remédio constitucional famoso'", "Benefício negado sem locomoção → MS (B)"],
        ["Confundir ato administrativo concreto com falta de lei", "Caso é negativa de benefício, não lacuna normativa"],
      ],
    },
    lei1: {
      fonte: "CF/88, art. 5º, LXIX",
      texto:
        "Conceder-se-á mandado de segurança para proteger direito líquido e certo, não amparado por habeas corpus ou habeas data.",
      trechos_grifados: [{ inicio: 0, fim: 40, motivo: "remédio residual" }],
    },
    lei2: {
      titulo: "Lei — habeas corpus",
      fonte: "CF/88, art. 5º, LXVIII",
      texto: "Conceder-se-á habeas corpus sempre que alguém sofrer ou se achar ameaçado de sofrer violência ou coação em sua liberdade de locomoção.",
      trechos_grifados: [{ inicio: 80, fim: 105, motivo: "liberdade de locomoção" }],
    },
    macete: {
      texto: "Locomoção ameaçada = HC. Direito líquido e certo sem locomoção = MS. Falta de norma = mandado de injunção.",
      destaques: ["HC", "MS", "injunção"],
    },
  }),

  "direito_constitucional/lote-001.json:2": criarAulaCompleto({
    arquetipo: "comparacao",
    fundamento_slug: "CF_art37_LIMPE",
    macete_visual: "Favoritismo=impessoalidade (art.37)",
    links_fonte: [{ rotulo: "CF/88, art. 37", path: "conteúdo/legislação federal/cf-1988.html" }],
    contexto: {
      texto:
        "Servidor municipal favoreceu conhecido na fila de atendimento sem justificativa legal. A banca testa o princípio da impessoalidade — não legalidade genérica.",
      destaques: ["favorecimento", "fila", "impessoalidade"],
    },
    glossario: {
      texto:
        "LIMPE = Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência. Impessoalidade = tratamento igualitário, sem favoritismo. Legalidade = atuar conforme a lei.",
      destaques: ["LIMPE", "Impessoalidade", "Legalidade"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Caso concreto", descricao: "Tratamento diferenciado a conhecido na fila." },
        { ordem: 2, rotulo: "Núcleo", descricao: "Favoritismo pessoal = violação da impessoalidade." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Alternativa A oferece 'legalidade' — soa genérico, mas não é o foco." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "LIMPE no caso",
      colunas: ["Princípio", "Caso típico"],
      linhas: [
        ["Legalidade", "Atuar sem previsão legal"],
        ["Impessoalidade", "Favoritismo pessoal na fila"],
        ["Publicidade", "Ocultar ato administrativo"],
        ["Eficiência", "Serviço lento ou mal feito"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Legalidade (A) — soa sempre certa", "O caso é tratamento desigual, não ausência de lei"],
        ["Publicidade (B) — não divulgou", "O problema não é divulgação, é favoritismo"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — legalidade", "Não é ausência de previsão legal; é favoritismo."],
        ["B — publicidade", "Não trata de divulgação de atos."],
        ["D — eficiência", "Não é lentidão; é tratamento diferenciado."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Marcar legalidade por envolver servidor público", "Favorecer conhecido = impessoalidade (C)"],
        ["Confundir moralidade com impessoalidade", "Favoritismo é núcleo clássico da impessoalidade"],
      ],
    },
    lei1: {
      fonte: "CF/88, art. 37, caput",
      texto:
        "A administração pública obedecerá aos princípios de legalidade, impessoalidade, moralidade, publicidade e eficiência.",
      trechos_grifados: [{ inicio: 52, fim: 68, motivo: "impessoalidade" }],
    },
    macete: {
      texto: "Favoritismo, panelinha, apadrinhamento = impessoalidade (art. 37, LIMPE).",
      destaques: ["Favoritismo", "impessoalidade"],
    },
  }),

  "direito_constitucional/lote-001.json:3": criarAulaCompleto({
    arquetipo: "diagrama_competencia",
    fundamento_slug: "CF_art144_caput",
    macete_visual: "Caput art.144=6 órgãos | Guarda=§8º",
    links_fonte: [{ rotulo: "CF/88, art. 144", path: "conteúdo/legislação federal/cf-1988.html" }],
    contexto: {
      texto:
        "Agentes municipais debatem quais órgãos integram o caput do art. 144. A banca testa o rol taxativo — PF e PRF estão; guarda municipal não.",
      destaques: ["caput", "art. 144", "taxativo"],
    },
    glossario: {
      texto:
        "Caput art. 144 = lista de seis órgãos de segurança pública. § 8º = guardas municipais (finalidade distinta). § 10 = segurança viária e trânsito.",
      destaques: ["Caput", "§ 8º", "§ 10"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Seis órgãos", descricao: "PF, PRF, PF ferroviária, civis, militares/bombeiros, penais." },
        { ordem: 2, rotulo: "Parágrafos", descricao: "Guarda municipal e trânsito têm regras próprias fora do caput." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Alternativa A coloca guarda municipal no caput." },
      ],
    },
    nucleo: {
      tipo: "diagrama_competencia",
      titulo: "Órgãos do caput vs § 8º",
      nos: [
        { id: "caput", label: "Art. 144 caput", nivel: 0 },
        { id: "pf", label: "Polícia Federal (I)", nivel: 1 },
        { id: "prf", label: "Polícia Rodoviária Federal (II)", nivel: 1 },
        { id: "guarda", label: "Guarda municipal (§ 8º)", nivel: 2 },
      ],
      arestas: [
        { de: "caput", para: "pf" },
        { de: "caput", para: "prf" },
        { de: "guarda", para: "caput", rotulo: "Não integra caput" },
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Guarda municipal no caput (A)", "Guarda está no § 8º, não no caput"],
        ["Rol exemplificativo (D)", "Caput é taxativo — alteração exige emenda constitucional"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — guarda no caput", "Guarda municipal está no § 8º."],
        ["C — trânsito substitui PM", "Órgãos de trânsito não substituem polícias militares."],
        ["D — rol exemplificativo", "Lista é fechada no caput."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Confundir agente municipal com guarda no caput", "PF e PRF integram caput → B"],
        ["Achar que STTP/trânsito entra no rol do caput", "Trânsito é § 10 — competência distinta"],
      ],
    },
    lei1: {
      fonte: "CF/88, art. 144, I e II",
      texto:
        "A segurança pública é exercida através dos seguintes órgãos: I - polícia federal; II - polícia rodoviária federal.",
      trechos_grifados: [{ inicio: 0, fim: 30, motivo: "rol taxativo" }],
    },
    lei2: {
      titulo: "Lei — § 8º",
      fonte: "CF/88, art. 144, § 8º",
      texto:
        "Os Municípios poderão constituir guardas municipais destinadas à proteção de seus bens, serviços e instalações.",
      trechos_grifados: [{ inicio: 0, fim: 35, motivo: "guarda municipal" }],
    },
    macete: {
      texto: "Caput = 6 órgãos fixos. Guarda municipal e trânsito = parágrafos à parte.",
      destaques: ["6 órgãos", "§ 8º"],
    },
  }),

  "direito_constitucional/lote-001.json:4": criarAulaCompleto({
    arquetipo: "trecho_legal",
    fundamento_slug: "CF_art18_art32",
    macete_visual: "DF nunca vira Municípios (art.32)",
    links_fonte: [{ rotulo: "CF/88, art. 32", path: "conteúdo/legislação federal/cf-1988.html" }],
    contexto: {
      texto:
        "Questão INCORRETA sobre organização federativa. A banca mistura afirmações corretas sobre autonomia com a falsa ideia de dividir o DF em Municípios.",
      destaques: ["INCORRETA", "Distrito Federal", "Municípios"],
    },
    glossario: {
      texto:
        "Entes autônomos (art. 18) = União, Estados, DF e Municípios. Territórios Federais = integram a União, sem autonomia. DF = ente híbrido com vedação do art. 32.",
      destaques: ["art. 18", "Territórios", "art. 32"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Art. 18", descricao: "Quatro entes autônomos na federação brasileira." },
        { ordem: 2, rotulo: "Art. 32", descricao: "Veda dividir o DF em Municípios — exceção pouco lembrada." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Alternativa C parece plausível sobre organização territorial." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "Entes e exceções",
      colunas: ["Ente", "Regra"],
      linhas: [
        ["União, Estados, DF, Municípios", "Autônomos (art. 18)"],
        ["Territórios Federais", "Integram a União"],
        ["DF dividido em Municípios", "Vedado (art. 32)"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["DF pode virar Municípios (C)", "Art. 32 veda expressamente"],
        ["DF não é ente autônomo", "DF é autônomo, mas com regra especial"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não é a incorreta"],
      linhas: [
        ["A — quatro entes autônomos", "Correta conforme art. 18."],
        ["B — autonomia municipal própria", "Correta — municípios têm autonomia distinta."],
        ["D — territórios integram União", "Correta — não são entes autônomos."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Achar que DF se organiza como Estado com municípios", "Vedação expressa art. 32 → C incorreta"],
        ["Marcar afirmação genérica sobre autonomia", "Atenção ao detalhe excepcional do DF"],
      ],
    },
    lei1: {
      fonte: "CF/88, art. 18",
      texto:
        "A organização político-administrativa da República compreende a União, os Estados, o Distrito Federal e os Municípios, todos autônomos.",
      trechos_grifados: [{ inicio: 60, fim: 90, motivo: "entes autônomos" }],
    },
    lei2: {
      titulo: "Lei — vedação",
      fonte: "CF/88, art. 32, caput",
      texto: "O Distrito Federal não poderá ser dividido em Municípios.",
      trechos_grifados: [{ inicio: 0, fim: 55, motivo: "vedação expressa" }],
    },
    macete: {
      texto: "DF é híbrido, mas jamais pode ser dividido em Municípios — art. 32.",
      destaques: ["DF", "art. 32"],
    },
  }),

  "direito_constitucional/lote-001.json:5": criarAulaCompleto({
    arquetipo: "comparacao",
    fundamento_slug: "CF_art5_LV",
    macete_visual: "Contraditório e ampla defesa=no administrativo",
    links_fonte: [{ rotulo: "CF/88, art. 5º, LV", path: "conteúdo/legislação federal/cf-1988.html" }],
    contexto: {
      texto:
        "Agente quer aplicar penalidade sem dar chance de defesa no processo administrativo de trânsito. A banca testa o art. 5º, LV — contraditório vale também no administrativo.",
      destaques: ["defesa", "administrativo", "penalidade"],
    },
    glossario: {
      texto:
        "Contraditório = direito de participar e se manifestar. Ampla defesa = meios e recursos para defesa. Processo administrativo = sanções fora do Judiciário, mas com garantias.",
      destaques: ["Contraditório", "Ampla defesa", "administrativo"],
    },
    historico: {
      eventos: [
        { ordem: 1, rotulo: "Texto expresso", descricao: "Art. 5º, LV inclui processo judicial ou administrativo." },
        { ordem: 2, rotulo: "Trânsito", descricao: "Auto de infração e defesa seguem processo administrativo." },
        { ordem: 3, rotulo: "IDECAN", descricao: "Alternativa A restringe garantia só ao processo judicial." },
      ],
    },
    nucleo: {
      tipo: "comparacao",
      titulo: "Judicial vs administrativo",
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Só vale no processo judicial (A)", "Vale em judicial E administrativo"],
        ["Comunicação verbal basta (C)", "Defesa formal com meios e recursos"],
      ],
    },
    contraste: {
      colunas: ["Confusão", "Regra"],
      linhas: [
        ["Viola só legalidade (D)", "Viola diretamente contraditório e ampla defesa"],
        ["Defesa é privilégio do Judiciário", "CF/88 estende ao administrativo"],
      ],
    },
    distratores: {
      colunas: ["Alternativa", "Por que não"],
      linhas: [
        ["A — só no judicial", "Contraria o texto do art. 5º, LV."],
        ["C — comunicação verbal", "Não substitui defesa formal."],
        ["D — só legalidade", "A garantia violada é contraditório/ampla defesa."],
      ],
    },
    caso: {
      colunas: ["Pegadinha", "Correto"],
      linhas: [
        ["Achar que multa de trânsito dispensa defesa", "Processo administrativo exige contraditório → B"],
        ["Confundir abordagem em flagrante com fim do processo", "Penalidade exige defesa nos autos"],
      ],
    },
    lei1: {
      fonte: "CF/88, art. 5º, LV",
      texto:
        "Aos litigantes, em processo judicial ou administrativo, são assegurados o contraditório e ampla defesa, com os meios e recursos a ela inerentes.",
      trechos_grifados: [{ inicio: 30, fim: 60, motivo: "processo administrativo" }],
    },
    lei2: {
      titulo: "Lei — devido processo",
      fonte: "CF/88, art. 5º, LIV",
      texto: "Ninguém será privado da liberdade ou de seus bens sem o devido processo legal.",
      trechos_grifados: [{ inicio: 50, fim: 75, motivo: "devido processo legal" }],
    },
    macete: {
      texto: "Processo administrativo + defesa = art. 5º, LV. Não é exclusividade do Judiciário.",
      destaques: ["administrativo", "art. 5º, LV"],
    },
  }),
};
