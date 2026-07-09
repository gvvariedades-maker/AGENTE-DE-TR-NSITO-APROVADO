# Rubrica de indistinguibilidade IDECAN

**Objetivo:** questões inéditas tão bem elaboradas que, numa comparação cega com provas reais da IDECAN, **não seja possível identificar a origem** só pelo estilo, estrutura ou dificuldade.

**Não é:** cópia, paráfrase ou reutilização de enunciados de `conteúdo/questões reais/`.

**É:** paridade de ofício — mesma superfície, arquitetura, distrator, cognição e cobrança do edital CG.

---

## As cinco camadas

| Camada | O que validar | Falha típica (denuncia “questão de app”) |
|--------|---------------|------------------------------------------|
| **1. Superfície** | Tom formal, sem explicação no enunciado, 4 alt. A–D homogêneas | Tom de professor; uma alternativa muito longa |
| **2. Arquitetura** | Comando IDECAN (CORRETA/INCORRETA/assertivas/caso direto) | Formato estranho ou comando ausente quando deveria existir |
| **3. Distrator** | Todas plausíveis; erradas por detalhe legal, não absurdo | Só uma alternativa “faz sentido” |
| **4. Cognição** | Nível `dificuldade` coerente com passos exigidos | Decoreba pura ou armadilha óbvia |
| **5. Cobrança** | Microtópico do Anexo I retificado; caso STTP quando couber | Tema de outro concurso ou norma fora do edital |

---

## Pontuação por questão (0–100)

Cada critério vale **0** (falha), **1** (parcial) ou **2** (aprovado). Soma máxima = **21 critérios × 2 = 42 pontos** → normalizar para **0–100** (`(soma / 42) × 100`).

### A. Superfície (4 critérios)

| ID | Critério | 0 | 1 | 2 |
|----|----------|---|---|---|
| A1 | Tom formal, sem humor, sem “aula” no enunciado | Tom didático ou coloquial | Neutro com vícios leves | Indistinguível de prova IDECAN |
| A2 | Extensão do enunciado na faixa da disciplina (ver tabela abaixo) | Fora >30% da faixa | Fora ≤30% | Dentro da faixa |
| A3 | Alternativas com comprimento homogêneo (razão máx/mín ≤ 1,8) | > 2,2 | 1,8–2,2 | ≤ 1,8 |
| A4 | Exatamente 4 alternativas (A–D), sem “todas corretas/incorretas” óbvias | Viola edital ou padrão | Pequena assimetria de tom | Paridade total |

**Faixas de extensão (caracteres)** — corpus 04/07/2026, calibrado Campina Grande:

| Disciplina | Enunciado | Alternativa |
|------------|-----------|-------------|
| `legislacao_transito` | 250–500 | 70–130 |
| `direito_administrativo` | 200–450 | 70–130 |
| `direito_constitucional` | 300–550 | 80–140 |
| `legislacao_etica_sp` | 250–500 | 80–140 |
| `informatica` | 300–550 | 40–80 |
| `historia_cg_pb` | 200–450 | 60–120 |
| `portugues` (sem texto-base no JSON) | 80–200 | 50–90 |
| `portugues` (com texto-base no enunciado) | 800–1.500 + pergunta | 50–90 |

### B. Arquitetura (4 critérios)

| ID | Critério | 0 | 1 | 2 |
|----|----------|---|---|---|
| B1 | `tipo` coerente com o enunciado (`caso_pratico`, `assertivas`, etc.) | Incoerente | Parcial | Coerente |
| B2 | `estilo_idecan` preenchido e alinhado à pegadinha real | Ausente ou genérico | Correto mas superficial | Específico e executado |
| B3 | Comando explícito quando a disciplina exige (≥50% no lote para gerais; trânsito pode ser caso direto ~40%) | Comando errado | Comando ok, redação fraca | Comando IDECAN autêntico |
| B4 | Em INCORRETA: alternativas exigem negação mental item a item | Gabarito trivial | 2 distratoras fracas | 4 itens críveis |

### C. Distrator (5 critérios)

| ID | Critério | 0 | 1 | 2 |
|----|----------|---|---|---|
| C1 | Erradas elimináveis só com domínio do tema | 3+ elimináveis por senso comum | 1 fraca | Todas exigem lei/caso |
| C2 | Pegadinha é uma das do corpus (pode/deve, competência, gravidade, exceção, prazo…) | Pegadinha inventada/óbvia | Pegadinha ok, mal aplicada | Pegadinha típica IDECAN |
| C3 | `comentario.pegadinha` descreve armadilha real do item | Vazio ou genérico | Parcial | Preciso |
| C4 | `passo_a_passo` refuta cada alternativa errada | Só explica a certa | Refuta 1–2 | Refuta A, B, C e D |
| C5 | Passo 2 nomeia slug de mecanismo por distrator (`numero_vizinho`, `competencia_snt`, `gravidade`, `regra_excecao`, `termo_unico`) | Ausente ou genérico | 1–2 slugs | Todos os errados com slug |

### D. Cognição (4 critérios)

| ID | Critério | 0 | 1 | 2 |
|----|----------|---|---|---|
| D1 | `dificuldade` 1–2: lei seca ou 1 informação | Inflado | Ok | Coerente |
| D2 | `dificuldade` 3: caso + 1 pegadinha | Sem pegadinha | Pegadinha fraca | Pegadinha sólida |
| D3 | `dificuldade` 4–5: 2 normas ou exceção | Uma norma só | Quase duas | Duas normas/exceção clara |
| D4 | Gabarito único, sem ambiguidade jurídica | Ambíguo | Discussível | Fechado |

### E. Cobrança (4 critérios)

| ID | Critério | 0 | 1 | 2 |
|----|----------|---|---|---|
| E1 | `topico` mapeado ao Anexo I retificado | Fora do edital | Marginal | Direto |
| E2 | `fundamento_legal` citável e vigente (validador passa) | Erro de citação | Aviso apenas | OK |
| E3 | Caso prático STTP/CG quando `legislacao_transito` + `caso_pratico` | Genérico demais | Contexto vago | Fiscalização/local plausível |
| E4 | Sem similaridade literal com corpus (`conteúdo/questões reais/`) | Trecho copiado | Estrutura muito parecida | Inédito verificável |

---

## Limiares de aprovação

| Pontuação | Status | Ação |
|-----------|--------|------|
| **≥ 85** | Aprovada | Pode ir ao seed após teste cego do lote |
| **70–84** | Revisão | Reescrever distrator, extensão ou pegadinha |
| **< 70** | Reprovada | Descartar ou reescrever do zero |

**Lote (≥ 8 questões):** média do lote ≥ **80**; nenhuma questão < **65**.

---

## Checklist rápido (pré-rubrica)

Use antes da pontuação completa:

```
- [ ] Li 2–3 questões reais da mesma disciplina em exemplos-ouro.md
- [ ] Enunciado sem emoji, sem "veja", sem "conforme vimos"
- [ ] 4 alternativas A–D; gabarito ∈ alternativas
- [ ] estilo_idecan + pegadinha no comentário preenchidos
- [ ] dificuldade ≥ 3 → pegadinha executada no enunciado, não só no comentário
- [ ] npm run validate:questoes -- arquivo.json (schema + citações)
- [ ] npm run validate:indistinguibilidade -- arquivo.json (heurísticas)
```

---

## Sinais de alerta (vício de LLM)

Reprovar ou revisar se o enunciado ou alternativas contiverem:

- "É importante ressaltar", "conforme a doutrina", "obviamente"
- Explicação da lei dentro do enunciado (a IDECAN cobra, não ensina)
- Alternativa correta visivelmente mais completa que as outras
- Números redondos demais sem base legal (ex.: "48 horas" sem artigo)
- Pegadinha `pode/deve` sem caso que force a distinção
- Tema de resolução CONTRAN fora da lista retificada

---

## Calibragem contínua (pós-publicação)

Quando o app tiver tentativas reais:

| Taxa de acerto | Interpretação | Ação |
|----------------|---------------|------|
| > 85% | Fácil demais para IDECAN | Subir `dificuldade` ou reescrever distrator |
| 40–70% | Faixa plausível IDECAN | Manter |
| < 25% | Confusa ou mal redigida | Revisar ambiguidade antes de assumir "difícil" |

Registrar ajustes em comentário do lote ou changelog do arquivo JSON.

---

## Recursos relacionados

- [teste-cego.md](teste-cego.md) — protocolo de comparação com questões reais
- [perfil-banca.md](perfil-banca.md) — DNA e métricas do corpus
- [exemplos-ouro.md](exemplos-ouro.md) — referência de forma por disciplina
- `npm run validate:indistinguibilidade` — checagens automáticas (camada A parcial)
