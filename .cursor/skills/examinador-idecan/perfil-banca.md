# Perfil da banca IDECAN — DNA para reprodução

Calibrado para provas objetivas IDECAN (agente de trânsito, polícia, prefeituras). **Corpus analisado em 04/07/2026** — ver seção datada no final.

## Características gerais

| Aspecto | Padrão IDECAN |
|---------|---------------|
| Estilo | Objetivo, formal, sem humor |
| Alternativas | **4 (A–D)** neste edital (item 10.4) |
| Extensão enunciado | Média 2–5 linhas; português pode ter 8–15 linhas com texto-base |
| Extensão alternativa | 1–2 linhas; comprimentos parecidos |
| Dificuldade | Meio-alta; exige atenção a detalhes |
| Decoreba pura | Presente, mas frequentemente em casos práticos |

## Tipos de comando (frequência estimada)

> **Atualizado com corpus 04/07/2026 (1.463 questões):** ver seção datada para percentuais medidos. Resumo: comando explícito em ~39%; português lidera em CORRETA explícita (42,6%).

1. **"Assinale a alternativa CORRETA"** — ~45% (estimativa histórica; corpus explícito: 22,4%)
2. **"Assinale a alternativa INCORRETA"** — ~20% (corpus: 5,5%)
3. **Assertivas I, II, III...** (quantas estão certas) — ~15% (corpus: 9,4%)
4. **Correspondência / associação** — ~10% (corpus: 1,5%)
5. **"Analise as afirmativas"** com combinações — ~10%

> Em comandos INCORRETA, a banca espera que o candidato negue cada alternativa mentalmente.

## Pegadinhas recorrentes (`estilo_idecan`)

### Universal
- **pode vs deve** — permissão x obrigação legal
- **poder vs dever** — faculdade administrativa x obrigação
- **prazo** — troca 24h/48h/72h; dias úteis x corridos
- **percentual** — 20% vs 50%; fração do salário
- **sujeito ativo** — quem pode/deve praticar o ato
- **nulidade vs anulabilidade** — efeitos e competência

### Legislação de Trânsito
- **infração vs crime** — CTB x CP
- **autuação x apreensão** — procedimentos distintos
- **recusa etilômetro** — infração autônoma (**art. 165-A** CTB; o antigo §3º do art. 165 foi revogado — banca pode usar a redação velha como distrator)
- **competência** — federal x estadual x municipal
- **Resolução CONTRAN** vs artigo CTB — qual prevalece no caso
- **velocidade / conversão / ultrapassagem** — números próximos

### Direito Administrativo / Constitucional
- **ato vinculado vs discricionário**
- **princípio** aplicado a caso concreto
- **controle** — judicial x administrativo
- **CF/88** artigos frequentes: 5º, 37, 39, 41, 144

### Português
- Texto-base longo (crônica, reportagem, HQ) + 4–5 questões
- Interpretação + gramática no mesmo bloco
- **crase, regência, concordância** em contexto
- **semântica** — sentido de expressão no texto

### Informática
- Conceitos **Windows, Word, Excel, Internet, e-mail**
- Atalhos, funções básicas, segurança (phishing, senha)
- Pegadinha: versões/nomenclaturas similares

### História CG/PB
- Fatos **cobráveis** do edital (não curiosidades)
- Linha do tempo, personagens, eventos de Campina Grande e PB

### Ética / Legislação SP
- Lei 8.112/90, 8.429/92 (improbidade), Lei de Acesso
- Conduta do servidor; conflito de interesses

## Por disciplina — foco de cobrança

### legislacao_transito (50% da prova)
- CTB arts. 90–110 (sinais), 161–170 (infrações graves), 218–220 (velocidade)
- Cap. VI a VIII do CTB
- Resoluções CONTRAN em `conteúdo/resoluções CONTRAN/` (lista retificada em `conteudo-programatico.md`)
- Caso prático de fiscalização STTP

### portugues
- Interpretação de texto + morfologia/sintaxe
- Texto-base obrigatório em ~60% das questões do bloco

### direito_administrativo
- Atos administrativos, licitação (Lei 14.133), poderes, responsabilidade

### direito_constitucional
- Direitos fundamentais, administração pública (CF art. 37), organização do Estado

## Calibragem de dificuldade

| Nível | Critério |
|-------|----------|
| 1–2 | Lei seca direta; uma informação |
| 3 | Caso simples; 1 pegadinha |
| 4 | Caso com duas normas ou exceção |
| 5 | Assertivas + exceção + pegadinha de prazo/termo |

## Distribuição de gabaritos em lotes

Em lotes de 20+ questões, evitar sequências (AAAA) e desbalanceamento extremo. Alvo: ~25% por letra (A–D).

---

## Análise do corpus real — 04/07/2026

**Fonte:** `conteúdo/questões reais/*.pdf` (export Tec Concursos, provas IDECAN diversas).  
**Total parseado:** 1.463 questões | **Script:** `.cursor/skills/examinador-idecan/scripts/analisar-pdfs-idecan.py` | **Dados:** `corpus-idecan-stats.json`

> Corpus mistura concursos com **4 e 5 alternativas**. Para Campina Grande 2026, **forçar sempre 4 (A–D)** — ver edital item 10.4.

### Amostra por arquivo

| Arquivo | Questões |
|---------|----------|
| PORTUGUES - IDECAN - SUPERIOR - TEC.pdf | 197 |
| CONSTITUCIONAL (3 PDFs) | 538 |
| INFORMÁTICA (3 PDFs) | 486 |
| CTB (2 PDFs) + CONTRAN | 168 |
| LGPD + Ética SP | 62 |
| DIREITO ADMINISTRATIVO | 12 |

### Comandos (detecção por palavras-chave no enunciado)

Muitas questões IDECAN **não repetem** “assinale a alternativa” no enunciado (caso prático direto). Comando explícito detectado em **~39%** do corpus.

| Tipo | Global | legislacao_transito | portugues | direito_constitucional | informatica |
|------|--------|---------------------|-----------|------------------------|-------------|
| CORRETA (explícita) | 22,4% | 23,8% | **42,6%** | 19,0% | 17,1% |
| INCORRETA | 5,5% | 4,2% | 7,6% | 5,9% | 5,1% |
| Assertivas (I, II, III…) | 9,4% | 10,1% | 1,0% | 13,2% | 8,6% |
| Correspondência | 1,5% | — | — | 0,4% | 4,1% |
| Sem comando explícito | ~61% | ~61% | ~49% | ~61% | ~65% |

**Regra para gerar:** usar comando explícito em **≥50%** das questões inéditas (acima da média do corpus), pois o edital CG exige clareza objetiva.

### Extensão média (caracteres)

| Disciplina | Enunciado | Alternativa |
|------------|-----------|-------------|
| **portugues** | **2.575** (texto-base embutido) | 61 |
| direito_constitucional | 459 | 100 |
| informatica | 466 | 55 |
| legislacao_transito | 404 | 121 |
| legislacao_etica_sp | 384 | 118 |
| direito_administrativo | 325 | 96 |
| Global | 736* | 83 |

\*Global inflado por português com texto-base longo.

**Calibragem Campina Grande:**
- Português: bloco texto-base **800–1.500 caracteres** + pergunta de 2–4 linhas
- Trânsito/Dir.: enunciado caso prático **250–500 caracteres**
- Alternativas: **70–130 caracteres** (trânsito/direito); **40–80** (informática)

### Pegadinhas mais frequentes no corpus (tags automáticas)

| Tag | Global | legislacao_transito |
|-----|--------|---------------------|
| exceção (salvo/somente/sempre/vedado) | 531 | 64 |
| pode vs deve | 479 | **68** |
| competência/órgão | 431 | **68** |
| gravidade infração | 98 | **39** |
| prazo | 58 | 6 |
| percentual | 31 | 2 |

### Gabaritos observados (corpus com 4–5 alt.)

Distribuição global A 23% | B 22% | C 21% | D 22% | E 12% — em lotes **A–D**, mirar **~25%** por letra.

### Padrões IDECAN confirmados no corpus

1. **Trânsito:** caso STTP/BM/PRF + CTB artigo específico no cabeçalho temático; assertivas sobre SNT e veículos são frequentes.
2. **Português:** mesmo texto-base para 4–5 questões seguidas (interpretação + gramática).
3. **Informática:** assertivas sobre Windows/Office/segurança; correspondência em ~4% das questões.
4. **Constitucional:** CF art. 5º e 37 dominam; enunciados médios com jurisprudência.
5. **Ética/LGPD:** casos concretos de servidor + LGPD arts. 33–36, 52–54.

### Ao gerar questões para este edital

- Priorizar pegadinhas medidas: **pode/deve**, **competência SNT**, **gravidade**, **exceção**
- Validar fundamento com `npm run validate:questoes`
- Validar paridade com `npm run validate:indistinguibilidade` + [rubrica-indistinguibilidade.md](rubrica-indistinguibilidade.md) + [teste-cego.md](teste-cego.md)
- Não copiar enunciados do corpus — só calibrar extensão e comando
