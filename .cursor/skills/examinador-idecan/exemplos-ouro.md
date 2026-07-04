# Exemplos ouro — padrão Examinador IDECAN

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
    "fundamento_legal": "CTB, art. 165, §3º: 'Serão aplicadas as penalidades e medidas administrativas estabelecidas no art. 165-A deste Código à recusa do condutor de veículo automotor de se submeter a teste, exame clínico, perícia ou outro procedimento que permita certificar influência de álcool ou outra substância psicoativa'.",
    "passo_a_passo": [
      "O enunciado descreve sinais de alteração psicomotora + recusa ao etilômetro.",
      "A) Erra: a recusa não impede autuação — é infração autônoma.",
      "B) Erra: não é necessário aguardar perito para autuação em flagrante administrativo.",
      "C) Correta: a recusa configura infração autônoma (art. 165, §3º c/c art. 165-A).",
      "D) Erra: confunde necessidade de confirmação etílica com a recusa em si."
    ],
    "pegadinha": "IDECAN troca 'recusa' por 'necessidade de confirmação do etilômetro' — candidato acha que sem teste positivo não há infração.",
    "macete": "Recusou o bafômetro = infração autônoma (art. 165, §3º). Não precisa estar bêbado no teste.",
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
