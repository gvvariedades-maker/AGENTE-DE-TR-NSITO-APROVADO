# Exemplos ouro — padrão Examinador IDECAN

## Padrões reais por disciplina (corpus 04/07/2026)

Fonte: 1.463 questões IDECAN em `conteúdo/questões reais/` — stats em `scripts/corpus-idecan-stats.json`.

| Disciplina | N | Enunciado médio | Alt. média | Comando dominante | Pegadinha #1 |
|------------|---|-----------------|------------|-------------------|--------------|
| `legislacao_transito` | 168 | 404 chars | 121 | caso prático (61%) | competência órgão |
| `portugues` | 197 | **2.575** | 61 | CORRETA (42,6%) | exceção semântica |
| `direito_constitucional` | 538 | 459 | 100 | caso / assertivas | competência CF |
| `informatica` | 486 | 466 | 55 | conceitual | pode/deve |
| `legislacao_etica_sp` | 62 | 384 | 118 | CORRETA (30,6%) | exceção LGPD |
| `direito_administrativo` | 12 | 325 | 96 | assertivas | atos adm. |

**Campina Grande 2026:** sempre **4 alternativas (A–D)** — corpus Tec tem 63% com 5 alternativas; ignorar E ao gerar.

---

## Exemplo 1 — legislacao_transito (caso prático + pegadinha)

```json
{
  "disciplina": "legislacao_transito",
  "topico": "CTB_conducao_embriaguez",
  "tipo": "caso_pratico",
  "estilo_idecan": "pegadinha_pode_deve",
  "dificuldade": 4,
  "enunciado": "Durante fiscalização de trânsito em Campina Grande, agente da STTP constata que o condutor apresenta sinais evidentes de alteração da capacidade psicomotora. O condutor recusa-se a submeter-se ao teste do etilômetro. Considerando o CTB, assinale a alternativa CORRETA:",
  "alternativas": {
    "A": "A recusa impede a autuação, pois o teste depende de consentimento livre do condutor.",
    "B": "O agente deve aguardar perito criminal antes de lavrar qualquer auto de infração.",
    "C": "A recusa em se submeter ao teste constitui infração autônoma prevista no CTB.",
    "D": "A infração somente se configura se o etilômetro confirmar concentração acima do limite legal."
  },
  "gabarito": "C",
  "comentario": {
    "o_que_testa": "Conhecimento sobre embriaguez ao volante e consequência jurídica da recusa ao etilômetro.",
    "fundamento_legal": "CTB, art. 165-A: recusar-se a ser submetido a teste, exame clínico, perícia ou outro procedimento que permita certificar influência de álcool ou outra substância psicoativa, na forma do art. 277, configura infração autônoma de trânsito.",
    "passo_a_passo": [
      "O enunciado descreve sinais de alteração psicomotora + recusa ao etilômetro.",
      "A) Erra: a recusa não impede autuação — é infração autônoma (art. 165-A).",
      "B) Erra: não é necessário aguardar perito para autuação administrativa.",
      "C) Correta: a recusa configura infração autônoma prevista no art. 165-A do CTB.",
      "D) Erra: confunde necessidade de confirmação etílica com a recusa em si."
    ],
    "pegadinha": "IDECAN troca 'recusa' por 'necessidade de confirmação do etilômetro' — candidato acha que sem teste positivo não há infração. Distrator clássico: citar o revogado §3º do art. 165.",
    "macete": "Recusou o bafômetro = infração autônoma (art. 165-A). Não precisa estar bêbado no teste.",
    "estudo_reverso": ["CTB art. 165", "CTB art. 165-A", "CTB art. 277"]
  },
  "tags": ["embriaguez", "etilometro", "recusa"]
}
```

## Exemplo 2 — direito_administrativo (assertivas)

```json
{
  "disciplina": "direito_administrativo",
  "topico": "atos_administrativos",
  "tipo": "assertivas",
  "estilo_idecan": "assertivas",
  "dificuldade": 3,
  "enunciado": "Quanto aos atos administrativos, analise as assertivas:\n\nI. O ato discricionário é aquele em que a lei confere margem de escolha à Administração.\nII. A revogação de ato administrativo produz efeitos ex tunc.\nIII. O desvio de finalidade caracteriza abuso de poder.\n\nEstá CORRETO o que se afirma em:",
  "alternativas": {
    "A": "I, apenas.",
    "B": "I e III, apenas.",
    "C": "II e III, apenas.",
    "D": "I, II e III."
  },
  "gabarito": "B",
  "comentario": {
    "o_que_testa": "Distinção ato vinculado/discricionário, revogação e abuso de poder.",
    "fundamento_legal": "Súmula 473/STF (revogação); doutrina clássica sobre discricionariedade e desvio de finalidade (art. 37 CF).",
    "passo_a_passo": [
      "I: Correta — discricionariedade = margem de escolha legal.",
      "II: Errada — revogação é ex nunc (não retroage).",
      "III: Correta — desvio de finalidade = abuso de poder.",
      "Gabarito: I e III = alternativa B."
    ],
    "pegadinha": "Trocar efeitos da revogação (ex nunc) por anulação (ex tunc).",
    "macete": "Revoga = ex nunc | Anula = ex tunc.",
    "estudo_reverso": ["CF art. 37", "Lei 9.784/99 art. 53"]
  },
  "tags": ["atos_administrativos", "discricionariedade", "abuso_poder"]
}
```

## Exemplo 3 — portugues (interpretação + texto-base)

```json
{
  "disciplina": "portugues",
  "topico": "interpretacao_textual",
  "tipo": "interpretacao",
  "estilo_idecan": "interpretacao_texto",
  "dificuldade": 3,
  "enunciado": "[TEXTO-BASE: crônica urbana, 8–12 linhas sobre trânsito em cidade do agreste]\n\nNo trecho 'o motorista desviou do congestionamento como quem foge de uma armadilha', a expressão destacada transmite, predominantemente, a ideia de:",
  "alternativas": {
    "A": "ironia quanto à imprudência do condutor.",
    "B": "comparação que reforça a sensação de urgência e desconforto.",
    "C": "metáfora que diminui a gravidade da infração.",
    "D": "hipérbole sem relação com o contexto semântico."
  },
  "gabarito": "B",
  "comentario": {
    "o_que_testa": "Interpretação de figura de linguagem em contexto.",
    "fundamento_legal": "N/A — competência de interpretação textual e semântica.",
    "passo_a_passo": [
      "'como quem foge de uma armadilha' = comparação (sensação de urgência).",
      "A) Não há ironia — o narrador descreve, não julga com sarcasmo.",
      "B) Correta — comparação reforça desconforto do congestionamento.",
      "D) Não é hipérbole exagerada sem função — há relação semântica clara."
    ],
    "pegadinha": "Confundir comparação com ironia ou hipérbole.",
    "macete": "'como' = sinal de comparação. Pergunte: o que está sendo equiparado?",
    "estudo_reverso": ["figuras_de_linguagem", "semantica_contexto"]
  },
  "tags": ["interpretacao", "figuras_linguagem"]
}
```

## Questões irmãs (mesmo tópico)

Para o Exemplo 1, gerar 3 variações:
- Irmã 1: condutor recusa **exame clínico** (não etilômetro)
- Irmã 2: condutor **aceita** teste mas resultado negativo — pergunta sobre sinais evidentes
- Irmã 3: **passageiro** embriagado — competência de autuação

Manter `topico` base + sufixo opcional: `CTB_conducao_embriaguez_irma_1`

---

## Exemplo 4 — legislacao_transito (assertivas + SNT — estilo corpus)

Padrão observado: enunciado médio com “analise as afirmativas” sobre SNT/CTB (10,1% do corpus trânsito).

```json
{
  "disciplina": "legislacao_transito",
  "topico": "CTB_snt_competencias",
  "tipo": "assertivas",
  "estilo_idecan": "assertivas",
  "dificuldade": 4,
  "enunciado": "Em relação ao Sistema Nacional de Trânsito (SNT) e às competências dos órgãos integrantes, analise as afirmativas:\n\nI. O CONTRAN é o órgão máximo normativo e consultivo do SNT.\nII. A SENATRAN exerce a função de órgão executivo federal da União.\nIII. Os órgãos executivos rodoviários dos Estados exercem a fiscalização de trânsito nas rodovias estaduais.\n\nEstá CORRETO o que se afirma em:",
  "alternativas": {
    "A": "I, apenas.",
    "B": "I e II, apenas.",
    "C": "II e III, apenas.",
    "D": "I, II e III."
  },
  "gabarito": "D",
  "comentario": {
    "o_que_testa": "Composição e competências do SNT (CTB arts. 5º a 12).",
    "fundamento_legal": "CTB, arts. 5º, 6º, 7º, 9º e 12 — CONTRAN normativo/consultivo; SENATRAN executivo federal; órgãos estaduais nas rodovias estaduais.",
    "passo_a_passo": [
      "I: Correta — CONTRAN é órgão máximo normativo e consultivo.",
      "II: Correta — SENATRAN é órgão executivo federal.",
      "III: Correta — competência dos executivos rodoviários estaduais.",
      "Gabarito: I, II e III = D."
    ],
    "pegadinha": "Trocar SENATRAN por CONTRAN como órgão executivo, ou atribuir fiscalização federal a município.",
    "macete": "CONTRAN = norma | SENATRAN = executa (federal) | CETRAN = coordena estadual.",
    "estudo_reverso": ["CTB art. 5", "CTB art. 12", "CTB art. 21"]
  },
  "tags": ["snt", "competencia", "contran", "senatran"]
}
```

## Exemplo 5 — informatica (CORRETA + conceito — estilo corpus)

Padrão observado: enunciado 400–500 chars, alternativas curtas (~55 chars), comandos conceituais.

```json
{
  "disciplina": "informatica",
  "topico": "email_seguranca",
  "tipo": "conceitual",
  "estilo_idecan": "conceito_informatica",
  "dificuldade": 2,
  "enunciado": "Assinale a alternativa CORRETA acerca de segurança da informação e uso de correio eletrônico em ambiente corporativo:",
  "alternativas": {
    "A": "Links em e-mails de remetentes desconhecidos devem ser acessados para confirmar a origem.",
    "B": "Phishing é técnica que induz o usuário a revelar dados por meio de comunicação fraudulenta.",
    "C": "Antivírus substitui a necessidade de backup periódico dos arquivos.",
    "D": "Senhas fortes dispensam autenticação em dois fatores em serviços críticos."
  },
  "gabarito": "B",
  "comentario": {
    "o_que_testa": "Conceitos de phishing e boas práticas de e-mail/segurança.",
    "fundamento_legal": "N/A — conceitos de informática e segurança da informação (edital: e-mail e segurança).",
    "passo_a_passo": [
      "A) Erra: nunca acessar links suspeitos.",
      "B) Correta: definição de phishing.",
      "C) Erra: antivírus não substitui backup.",
      "D) Erra: 2FA complementa senha forte."
    ],
    "pegadinha": "IDECAN mistura ferramentas (antivírus vs backup) ou minimiza 2FA.",
    "macete": "Phishing = isca digital para roubar credenciais.",
    "estudo_reverso": ["email_seguranca", "conceitos_hardware_software"]
  },
  "tags": ["phishing", "email", "seguranca"]
}
```

## Exemplo 6 — direito_constitucional (caso + art. 144 — estilo corpus)

```json
{
  "disciplina": "direito_constitucional",
  "topico": "seguranca_publica_cf",
  "tipo": "caso_pratico",
  "estilo_idecan": "pegadinha_pode_deve",
  "dificuldade": 3,
  "enunciado": "Durante operação conjunta em Campina Grande, policiais militares abordam veículo em via municipal. Quanto à organização da segurança pública na Constituição Federal, assinale a alternativa CORRETA:",
  "alternativas": {
    "A": "A Polícia Rodoviária Federal exerce policiamento ostensivo em vias municipais.",
    "B": "A Polícia Militar exerce o policiamento ostensivo e a preservação da ordem pública.",
    "C": "A Guarda Municipal pode substituir a Polícia Militar em qualquer hipótese de flagrante.",
    "D": "A Polícia Civil exerce função exclusiva de policiamento ostensivo nas capitais."
  },
  "gabarito": "B",
  "comentario": {
    "o_que_testa": "Órgãos de segurança pública e funções do art. 144 da CF/88.",
    "fundamento_legal": "CF/88, art. 144, §§ 5º e 6º — PM: policiamento ostensivo e ordem pública; PC: polícia judiciária.",
    "passo_a_passo": [
      "A) Erra: PRF atua em rodovias federais, não em vias municipais.",
      "B) Correta: redação do §5º (PM).",
      "C) Erra: Guarda Municipal não substitui PM em qualquer hipótese.",
      "D) Erra: PC é judiciária, não ostensiva."
    ],
    "pegadinha": "Confundir polícia ostensiva (PM) com judiciária (PC) ou ampliar competência da Guarda.",
    "macete": "PM = rua/ostensivo | PC = investiga | PRF = rodovia federal.",
    "estudo_reverso": ["CF art. 144", "seguranca_publica_cf"]
  },
  "tags": ["art_144", "pm", "seguranca_publica"]
}
```

## Exemplo 7 — legislacao_etica_sp (LGPD — estilo corpus)

Padrão observado: caso concreto + artigos da Lei 13.709/2018 (30,6% CORRETA explícita).

```json
{
  "disciplina": "legislacao_etica_sp",
  "topico": "lei_13709_lgpd",
  "tipo": "caso_pratico",
  "estilo_idecan": "caso_pratico",
  "dificuldade": 3,
  "enunciado": "Servidor da STTP precisa encaminhar dados pessoais de condutores para empresa contratada de estatística de trânsito, sem identificação direta dos titulares. Considerando a LGPD, assinale a alternativa CORRETA:",
  "alternativas": {
    "A": "Dados anonimizados permanecem regulados pela LGPD em qualquer hipótese.",
    "B": "A transferência internacional de dados dispensa qualquer mecanismo de conformidade.",
    "C": "Dados anonimizados, em regra, não são considerados dados pessoais para os fins da lei.",
    "D": "O titular não pode solicitar informações sobre o tratamento de seus dados."
  },
  "gabarito": "C",
  "comentario": {
    "o_que_testa": "Conceito de dado anonimizado e alcance da LGPD.",
    "fundamento_legal": "Lei 13.709/2018, art. 5º, VI e art. 12 — dado anonimizado não é dado pessoal.",
    "passo_a_passo": [
      "A) Erra: anonimizado, em regra, sai do regime de dados pessoais.",
      "B) Erra: transferência internacional exige requisitos (arts. 33–36).",
      "C) Correta: art. 5º, VI c/c art. 12.",
      "D) Erra: titular tem direitos do art. 18."
    ],
    "pegadinha": "Tratar dado anonimizado como se ainda fosse pessoal sem ressalva legal.",
    "macete": "Anonimizou de verdade = saiu da LGPD de dado pessoal.",
    "estudo_reverso": ["Lei 13.709 art. 5", "Lei 13.709 art. 12", "lei_acesso_informacao"]
  },
  "tags": ["lgpd", "dados_pessoais", "anonimizacao"]
}
```
