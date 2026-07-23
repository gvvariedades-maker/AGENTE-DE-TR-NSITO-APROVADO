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
- **Aprofundamento:** [perfis/perfil-transito.md](perfis/perfil-transito.md) — sub-mecanismos, cobertura, fila ROI

### portugues
- Interpretação de texto + morfologia/sintaxe
- Texto-base obrigatório em ~60% das questões do bloco
- **Aprofundamento:** [perfis/perfil-portugues.md](perfis/perfil-portugues.md) — texto-base, mecanismos semânticos, cobertura, fila ROI

### informatica
- Windows/Office/Internet/segurança; assertivas e correspondência frequentes
- Alternativas curtas (média ~55 chars no corpus)
- **Aprofundamento:** [perfis/perfil-informatica.md](perfis/perfil-informatica.md) — atalhos, malware, protocolos, cobertura, fila ROI

### direito_administrativo
- Atos administrativos, licitação (Lei 14.133), poderes, responsabilidade
- Poder de polícia (base da autuação) — caso prático STTP
- **Aprofundamento:** [perfis/perfil-administrativo.md](perfis/perfil-administrativo.md) — poder de polícia, atos, cobertura, fila ROI

### direito_constitucional
- Direitos fundamentais, administração pública (CF art. 37), organização do Estado
- Segurança pública e segurança viária (CF art. 144) — eixo do cargo
- **Aprofundamento:** [perfis/perfil-constitucional.md](perfis/perfil-constitucional.md) — art. 144, remédios, competências, lacunas

### historia_cg_pb
- Fatos verificáveis de Campina Grande e Paraíba — só `conteúdo/historia-cg-pb/base-factual.md`
- Datas-chave: 1697 (fundação), 1790 (vila), 1864 (cidade)
- **Aprofundamento:** [perfis/perfil-historia-cg-pb.md](perfis/perfil-historia-cg-pb.md) — anti-alucinação, marcos, lacuna total

### legislacao_etica_sp
- Lei Orgânica CG, LGPD, LAI, princípios éticos (art. 37)
- Banco saturado em Lei Orgânica — lacuna em LGPD/LAI
- **Aprofundamento:** [perfis/perfil-etica-sp.md](perfis/perfil-etica-sp.md) — LGPD, LAI, Lei Orgânica, fila ROI

## Calibragem de dificuldade (`dificuldade_operacional`)

| Nível | Estrutura |
|-------|-----------|
| 1 | Letra de lei direta, dispositivo único, distratores `numero_vizinho`/`gravidade` simples |
| 2 | Letra de lei com INCORRETA ou assertivas simples, 1 mecanismo dominante |
| 3 | Caso prático curto, 1 mecanismo dominante + 1 secundário; pegadinha obrigatória |
| 4 | Caso com 2 mecanismos combinados (ex.: competência + prazo) |
| 5 | Regra-exceção multietapa ou assertivas/correspondência com 2+ mecanismos cruzados |

**Mix padrão no simulado espelho:** ~20% níveis 1–2 | ~50% nível 3 | ~30% níveis 4–5 (embaralhado).

**Banco de treino (`content/questoes/`):** mínimo **nível 4** em toda questão nova — `DIFICULDADE_MINIMA_BANCO` em `src/lib/validations/dificuldade-banco.ts`; `npm run proxima` já sugere escopo 4+.

## Mecanismos de distrator — slugs e mapeamento corpus

Slugs obrigatórios na fabricação (detalhes no `SKILL.md`). Mapeamento para tags do `corpus-idecan-stats.json`:

| Slug (fabricação) | Tag no corpus (`pegadinhas_tags`) |
|-------------------|-----------------------------------|
| `numero_vizinho` | `prazo`, `percentual` |
| `competencia_snt` | `competencia_orgao` |
| `gravidade` | `gravidade` |
| `regra_excecao` | `excecao` |
| `termo_unico` | `pode_deve` |

**Análogos fora de trânsito:**

| Disciplina | Mecanismos típicos |
|------------|-------------------|
| `direito_constitucional` / `direito_administrativo` | `competencia_snt` → competência entre entes/poderes; `regra_excecao` → exceções constitucionais; `termo_unico` → vinculado↔discricionário |
| `portugues` | `termo_unico` → sentido/contexto; `regra_excecao` → exceção semântica; `numero_vizinho` → tempo verbal/número ordinal |
| `informatica` | `numero_vizinho` → versão/atalho/nomenclatura vizinha; `termo_unico` → função similar com nome diferente |
| `historia_cg_pb` | `numero_vizinho` → data/evento vizinho; `termo_unico` → personagem/local trocado |
| `legislacao_etica_sp` | `regra_excecao` → exceção LGPD/ética; `competencia_snt` → competência do órgão sancionador |

## Distribuição de gabaritos em lotes

Em lotes ≥ 8 questões: **15–35%** por letra (A–D); máx. **2 gabaritos iguais consecutivos**. Alvo central: ~25% por letra.

---

## Análise do corpus real — 04/07/2026

**Fonte:** `conteúdo/questões reais/*.pdf` (export Tec Concursos, provas IDECAN diversas).  
**Total parseado:** 1.463 questões | **Script:** `.cursor/skills/examinador-idecan/scripts/analisar-pdfs-idecan.py` | **Dados:** `.cursor/skills/examinador-idecan/scripts/corpus-idecan-stats.json`

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

---

## Paridade IDECAN — corpus local × Tec Concursos

**Atualizado:** 2026-07-19 · Fonte Tec: conta logada, filtro **Banca → IDECAN** em [tecconcursos.com.br/questoes/filtrar](https://www.tecconcursos.com.br/questoes/filtrar).

### Metodologia (3 camadas)

| Camada | Objetivo | Critério de “pronto” |
|--------|----------|----------------------|
| **1 — DNA estatístico** | Envelope de forma (comando, chars, mecanismos, gabaritos) | **80–120** questões reais IDECAN por disciplina geral; **30–40** para História CG/PB |
| **2 — Cobertura edital** | Microtópicos do Anexo I retificado | `cobertura.json` sem lacunas P1 |
| **3 — Teste cego** | Indistinguibilidade da banca | Acurácia ≤ **55%** em amostra ≥ 20 itens ([teste-cego.md](teste-cego.md)) |

### Panorama consolidado

| Disciplina (slug) | Corpus local | Tec IDECAN (medido) | Meta paridade | Gap coleta | Prioridade |
|-------------------|-------------:|--------------------:|--------------:|-----------:|:----------:|
| `legislacao_transito` | 168 | —* | 80–120 | 0 | 🟢 Manutenção |
| `portugues` | 197 | —* | 80–120 | 0 | 🟢 Manutenção |
| `informatica` | 486 | **1.287** | 80–120 | 0 | 🟢 Manutenção |
| `direito_constitucional` | 538 | —* | 80–120 | 0 | 🟢 Manutenção |
| `legislacao_etica_sp` | 62 | **151** | 80–120 | **~20–60** | 🟡 Média |
| `direito_administrativo` | **98** | **1.385** | 80–120 | 0 | 🟢 Manutenção |
| `historia_cg_pb` | **9** | —* | 30–40 | **~25–35** | 🔴 **P0** |

\*Contagem por matéria no Tec exige filtro adicional (expandir pasta → **“Todo o conteúdo de [matéria]”**). Total IDECAN no Tec: **38.424** questões.

### Roteiro de coleta no Tec (ordem obrigatória)

1. **Direito Administrativo** — matéria: `Direito Administrativo (Doutrina e Leis Federais)` · exportar **80–100** questões · evitar viés “regime disciplinar Salvador” (corpus atual) · priorizar CF 37–41, atos, poder de polícia, licitação 14.133.
2. **História CG/PB** — buscar assuntos: `Campina Grande`, `História da Paraíba`, `História do Brasil` (filtrar CG/PB no enunciado) · meta **30–35** questões · cruzar com `conteúdo/historia-cg-pb/base-factual.md`.
3. **Legislação/Ética SP** — matéria: `Ética no Serviço Público` (151 no Tec) + PDFs LGPD já no corpus · suplementar **LGPD/LAI** se teste cego falhar.
4. **Demais disciplinas** — só se teste cego ou `validate:indistinguibilidade` reprovar; corpus local já cobre DNA estatístico.

**Fluxo no filtro:** Banca → IDECAN → Matéria e assunto → ícone de pasta → **Todo o conteúdo de "[matéria]"** → Gerar caderno → exportar PDF → `conteúdo/questões reais/` → `npm run analyze:idecan`.

**Nomes exatos no Tec (referência):**

| Edital | Nome no Tec |
|--------|-------------|
| Dir. Administrativo | `Direito Administrativo (Doutrina e Leis Federais)` |
| Dir. Constitucional | `Direito Constitucional` |
| Português | `Língua Portuguesa (Português)` |
| Informática | `Informática` |
| Ética/LGPD | `Ética no Serviço Público` (+ corpus LGPD separado) |
| Trânsito | `Legislação de Trânsito` ou `Código de Trânsito Brasileiro (CTB)` |
| História CG/PB | assuntos `Campina Grande` / `História da Paraíba` |

Detalhes por disciplina: `perfis/perfil-{disciplina}.md` § Paridade IDECAN.
