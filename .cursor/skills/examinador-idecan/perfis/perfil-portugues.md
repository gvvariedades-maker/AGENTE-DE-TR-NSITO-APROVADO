---
disciplina: portugues
peso_prova: 8/60 questões · 8/100 pontos · 1 pt/questão
grupo: gerais
minimo_eliminacao: 1 ponto (1 acerto evita zero)
consumido_por: [examinador-idecan, professor-cadeia, estudo-reverso-visual]
corpus_base: 197 questões IDECAN (análise 2026-07-10)
cobertura_banco: 4 questões em content/questoes/portugues/ (atualizado 2026-07-10)
fonte_legal: norma culta (sem diploma legal específico no edital — Anexo I, Língua Portuguesa)
versao: 1.0
---

# Perfil vertical — Língua Portuguesa

> Aprofundamento por disciplina. DNA transversal da banca: [perfil-banca.md](../perfil-banca.md).
> Microtópicos e itens do Anexo I: [conteudo-programatico.md](../conteudo-programatico.md) → `portugues`.
> Cobertura do banco: `content/questoes/_index/cobertura.json` (rodar `npm run index:questoes` antes de lotes).

## 1. Peso estratégico

| Métrica | Valor |
|---------|-------|
| Questões na prova | **8 de 60** (maior peso entre as Gerais) |
| Pontos na prova | 8 de 100 (1,00 pt/acerto) |
| Mínimo eliminatório | 1 ponto — **zerar elimina**; risco real é perder tempo em texto longo |
| Cobertura no banco | **4 questões** — maior lacuna relativa do projeto |
| Tempo de estudo alvo | 10–12% da preparação; treinar leitura cronometrada |

**Regra de ROI:** 8 questões e banco quase vazio → prioridade máxima de geração fora de trânsito. Um único texto-base rende **3–4 questões** (interpretação + gramática no mesmo bloco), então gerar por *bloco de texto*, não por questão avulsa.

---

## 2. Perfil estatístico (corpus 197 questões IDECAN)

Fonte: `.cursor/skills/examinador-idecan/scripts/corpus-idecan-stats.json` → `por_disciplina.portugues`.

| Dimensão | Valor medido | Regra de fabricação |
|----------|--------------|---------------------|
| Enunciado médio | **2.575 chars** (σ 1.292 — texto-base embutido) | Texto-base **800–1.500 chars** + pergunta de 2–4 linhas |
| Alternativa média | **61 chars** (a menor de todas as disciplinas) | Alternativas curtas e paralelas (razão máx/mín ≤ 1,8) |
| Comando `correta` | **42,6%** (líder absoluto entre disciplinas) | Usar "assinale a CORRETA" como padrão — aqui o comando explícito é a norma |
| Sem comando explícito | 48,7% | Ainda alto, mas português é o mais explícito do corpus |
| INCORRETA | 7,6% | Negação mental de cada alternativa |
| Assertivas (I, II, III…) | 1,0% | Raríssimo — não é a cara de português IDECAN |
| Gabaritos (corpus 4–5 alt.) | B 45 · A 44 · D 37 · E 36 · C 35 | Em lote A–D: **~25% por letra**, máx. 2 consecutivos |

**Padrão IDECAN em português:** um mesmo texto-base alimenta 2–4 questões seguidas, misturando interpretação e gramática. Diferente de todas as outras disciplinas, o comando "CORRETA" explícito domina.

---

## 3. Mecanismos de distrator — análogos semânticos

Os 5 slugs obrigatórios (skill `examinador-idecan`) traduzidos para a linguagem de português. Distribuição medida no corpus: `excecao` 109 · `pode_deve` 87 · `prazo` 33 · `gravidade` 21 · `percentual` 16 · `competencia` 3.

| Slug | Tradução em português | Onde vive |
|------|----------------------|-----------|
| `termo_unico` | Troca de 1 palavra que muda sentido/regência/referência | significação contextual, regência, coesão |
| `regra_excecao` | "sempre/nunca/toda" em regra gramatical que tem exceção | crase, concordância, colocação pronominal |
| `numero_vizinho` | Tempo/modo verbal vizinho ou referente pronominal trocado | correlação verbal, referência |

**Priorizar na fabricação:** `regra_excecao` (exceção gramatical) + `termo_unico` (sentido no contexto) — cobrem o grosso das pegadinhas medidas. `gravidade`/`percentual` só quando o item for numérico (raro em português).

---

## 4. Sub-mecanismos específicos

### 4.1 Interpretação / inferência
- Distrator = inferência **não autorizada** pelo texto (extrapola ou generaliza um detalhe) × ideia central real.
- Armadilha clássica IDECAN: alternativa que **culpa um grupo específico** ou generaliza um detalhe como se fosse a tese. **Arquétipo:** `comparacao` (A) — "detalhe × ideia central".

### 4.2 Significação contextual
- Expressão idiomática cobrada pelo **sentido figurado**; distrator usa ação fisicamente parecida ou o sentido literal isolado.
- **Arquétipo:** `comparacao` (A) — "sentido errado × sentido certo".

### 4.3 Crase
- Presença/ausência antes de palavra que muda a regra (locução × artigo; antes de verbo, pronome, palavra masculina).
- **Arquétipo:** `fluxograma_decisao` (A).

### 4.4 Concordância nominal/verbal
- Sujeito posposto, coletivo, "haver"/"fazer" impessoal, concordância com adjunto vs núcleo.
- **Arquétipo:** `matriz_assertivas` (B) ou `comparacao`.

### 4.5 Pontuação
- Vírgula indevida entre sujeito↔verbo e verbo↔complemento (regra **sem exceção**) × aposto e subordinada anteposta corretos.
- **Arquétipo:** `comparacao` (A) — "uso correto × uso incorreto".

---

## 5. Pares confundíveis clássicos

| A | ↔ | B | Microtópico |
|---|---|---|-------------|
| Ideia central | ↔ | detalhe secundário | interpretação |
| Sentido denotativo | ↔ | conotativo/figurado | significação contextual |
| Crase obrigatória | ↔ | facultativa ↔ vedada | regência/crase |
| Concordância com núcleo | ↔ | com adjunto | concordância |
| Vírgula de aposto (correta) | ↔ | vírgula entre verbo e complemento (erro) | pontuação |
| Oração coordenada | ↔ | subordinada | sintaxe |
| Próclise | ↔ | ênclise ↔ mesóclise | colocação pronominal |
| Pretérito perfeito | ↔ | imperfeito ↔ mais-que-perfeito | tempos verbais |

---

## 6. Microtópicos — priorização P1→P5

Fonte Anexo I: `conteudo-programatico.md` § portugues.

| Prio | Item Anexo I | Microtópico | Mecanismo dominante | Arquétipo visual |
|------|--------------|-------------|---------------------|------------------|
| **P1** | 1.1 | Leitura/interpretação (ideia central, inferência) | `termo_unico` | `comparacao` / `texto_destaque` (A) |
| **P1** | 1.3 | Coesão/referência (pronomes, nexos, operadores) | `termo_unico` | `comparacao` (A) |
| **P1** | 1.4 | Significação contextual | `termo_unico` | `comparacao` (A) |
| **P1** | 2.4 | Concordância nominal e verbal | `regra_excecao` | `matriz_assertivas` (B) |
| **P2** | 2.5 | Regência nominal e verbal + crase | `regra_excecao` | `fluxograma_decisao` (A) |
| **P2** | 2.3 | Pontuação | `regra_excecao` | `comparacao` (A) |
| **P2** | 2.6 | Colocação pronominal | `regra_excecao` | `fluxograma_decisao` (A) |
| **P3** | 2.2 | Tempos e modos verbais | `numero_vizinho` | `tabela_gradacao` (D) |
| **P3** | 2.1 | Coordenação e subordinação | `termo_unico` | `matriz_assertivas` (B) |
| **P3** | 1.5 | Equivalência/transformação de estruturas | `termo_unico` | `comparacao` (A) |
| **P4** | 4.1 / 4.2 | Ortografia e acentuação gráfica | `regra_excecao` | `tabela_gradacao` (D) |
| **P4** | 3.1–3.3 | Formação de palavras, classes, flexão | `termo_unico` | `matriz_assertivas` (B) |

**Slugs de `topico` já usados no banco:** `leitura_interpretacao_textual` · `significacao_contextual_palavras_expressoes` · `pontuacao` · `acentuacao_grafica`.

---

## 7. Fontes por eixo

Português **não tem diploma legal** — a `<cadeia_anti_alucinacao>` valida a **regra gramatical** (norma-padrão), não artigo de lei.

| Eixo | Fonte de verdade |
|------|------------------|
| Toda a disciplina | Norma culta / gramática normativa |
| Referência no edital | `conteúdo/edital/` — Anexo I, Língua Portuguesa |
| Textos-base | **Originais ou domínio público** — nunca copiar crônica/reportagem de cursinho |

---

## 8. Mapa arquétipo visual (estudo reverso)

Consultar [PADRAO-AULA-COMPLETA-v3.md](../../estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md).

| Sinal na questão | Arquétipo | Família |
|------------------|-----------|---------|
| Interpretação / ideia central | `comparacao` + `texto_destaque` | A |
| Significação contextual | `comparacao` | A |
| Crase / regência / colocação | `fluxograma_decisao` | A |
| Concordância / classes / assertivas | `matriz_assertivas` | B |
| Acentuação / tempos verbais | `tabela_gradacao` | D |
| Qualquer questão | Tela `distratores` obrigatória (v2) | — |

---

## 9. Cobertura do banco × lacunas

Contagem em `content/questoes/portugues/lote-*.json` — **4 questões** (2026-07-10).

### Coberto (raso — 1 questão cada)

| Slug | Qtd |
|------|-----|
| `leitura_interpretacao_textual` | 1 |
| `significacao_contextual_palavras_expressoes` | 1 |
| `pontuacao` | 1 |
| `acentuacao_grafica` | 1 |

### Lacuna (0 questões — Anexo I exige cobertura)

Coesão/referência · concordância nominal/verbal · regência + crase · colocação pronominal · tempos/modos verbais · coordenação/subordinação · equivalência de estruturas · ortografia · formação de palavras/classes/flexão.

**Meta MVP** (skill examinador): Português **80** questões.

---

## 10. Fila de geração por ROI

1. **2 textos-base × 3–4 questões** cada (interpretação + coesão/referência + significação) — cobre P1 rápido e usa o padrão real de bloco.
2. **Bateria de concordância** (P1, `regra_excecao`) — sujeito posposto, coletivo, impessoalidade.
3. **Crase + regência** (P2) — `fluxograma_decisao`.
4. **Pontuação + colocação pronominal** (P2).
5. **Ortografia/acentuação + tempos verbais** (P3–P4) — fechar Anexo I.

---

## 11. Macetes de prova por eixo

| Eixo | Macete |
|------|--------|
| Ideia central | Procure a **frase-síntese** (fecho do parágrafo ou fala mais citável), não o detalhe |
| Expressão em destaque | Pede **sentido figurado** no contexto, nunca o literal isolado |
| Pontuação | **Nunca** vírgula entre sujeito↔verbo nem verbo↔complemento (sem exceção) |
| Acentuação | **Proparoxítona sempre acentua**; paroxítona terminada em ditongo também |
| Crase | Some o "a": vira "para o"? tem crase. Vira "para"? não tem |

---

## 12. Anti-padrões (português)

- Copiar crônica/reportagem/HQ de cursinho — usar texto **original ou de domínio público**
- Distrator de interpretação sem ancoragem no texto (inferência que o texto não sustenta)
- Alternativas de tamanhos díspares (quebra o paralelismo IDECAN, média 61 chars)
- Questão de gramática "solta" quando o eixo pede contexto (interpretação/significação exigem texto-base)
- Usar `assertivas` como comando dominante (só 1,0% no corpus de português)
- Citar "regra" gramatical sem passar pela `<cadeia_anti_alucinacao>` (norma-padrão)

---

## Changelog

- **1.0** (2026-07-10) — Perfil inicial: corpus 197 Q IDECAN; envelope texto-base 800–1.500 chars + comando CORRETA dominante (42,6%); mecanismos análogos semânticos; 12 microtópicos P1→P5; cobertura 4 Q do banco (lacuna alta); fila ROI por bloco de texto; mapa visual Famílias A/B/D.
