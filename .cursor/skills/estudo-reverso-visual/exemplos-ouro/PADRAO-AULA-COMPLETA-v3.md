# Padrão ouro — Aula completa v3 (hub)

Referência canônica para **todas** as questões novas com `estudo_reverso_visual_completo`.

> **v2 legado:** [PADRAO-AULA-COMPLETA-v2.md](./PADRAO-AULA-COMPLETA-v2.md) — redireciona para este hub e para a Família A.

---

## Princípio-mestre

> **Uma operação cognitiva por tela.** Nenhuma tela adjacente ensina a mesma proposição em embalagem diferente.

Cada tela exige uma operação mental distinta: diagnosticar → desbloquear → decidir/classificar → inocular → taxonomizar → amarrar → ancorar → recuperar+transferir.

---

## Seletor de família (parar no primeiro match)

| Ordem | Sinal na questão | Família | Guia |
|------:|------------------|---------|------|
| 1 | `tipo: assertivas` ou I–V no enunciado | **B** | [PADRAO-B-assertivas.md](./familias/PADRAO-B-assertivas.md) |
| 2 | Mecanismo dominante `competencia_snt` / órgãos SNT | **C** | [PADRAO-C-competencia-snt.md](./familias/PADRAO-C-competencia-snt.md) |
| 3 | `pegadinha_percentual` / `pegadinha_prazo` / `gravidade` / `numero_vizinho` | **D** | [PADRAO-D-gradacao.md](./familias/PADRAO-D-gradacao.md) |
| 4 | `caso_pratico` + `regra_excecao` / ordem de regras | **A** | [PADRAO-A-caso-regra-excecao.md](./familias/PADRAO-A-caso-regra-excecao.md) |

**Empate residual:** arquétipo que expõe a **pegadinha do gabarito** (não só ilustra o tema).

**Não copie** o mapa da Família A (art. 29) em B/C/D.

---

## Núcleo 7 (todas as famílias — `validarNucleoV2`)

```
contexto → [arquétipo da família] → contraste → distratores → caso → trecho_legal → macete
```

Condicionais (+até 4) só com gatilho real — ver guia de cada família. Total **7–11 telas**.

---

## Contratos compartilhados (todas as famílias)

| Tela | Aceita | Reprova |
|------|--------|---------|
| `contexto` | Gabarito + **isca por cada errada** (A/B/D) + promessa = pegadinha | Só “se marcou X…”; texto colável em outra questão |
| `contraste` | **1 eixo** crença × lei; 2–3 linhas; sem slugs | Tabela de distratores disfarçada |
| `distratores` | `LETRA — slug` = `passo_a_passo[1]` | Slug inventado / genérico |
| `caso` | Substantivos do enunciado + linha Resultado | Repetir arquétipo sem fatos do stem |
| `macete` | `macete_visual` + regra 1 frase + **near-transfer** (hipotética 1 frase) | Só mnemônico / só nº de artigo |
| `trecho_legal` | Literal `conteúdo/` + grifo `indexOf` + `motivo` cita **id da tela** que ensinou o token | Paráfrase; grifo “no olho” |

### Slugs de distrator (examinador-idecan)

`numero_vizinho` | `competencia_snt` | `gravidade` | `regra_excecao` | `termo_unico`

---

## Metadados recomendados (`meta` do JSON espelho)

O schema Zod ainda não exige estes campos — use em `meta` para o Agent auditar qualidade:

```json
{
  "padrao_familia": "A|B|C|D",
  "pegadinha_em_uma_frase": "...",
  "eixos_legais": ["CTB_art_29_III"],
  "isca_por_alternativa": {
    "A": "aplica direita cedo demais",
    "B": "sem placa = sem preferência",
    "D": "inverte §2º"
  }
}
```

---

## Gate editorial 12/12 (além do Mayer 8/8)

| # | Critério |
|---|----------|
| 1–8 | [checklist-mayer.md](../checklist-mayer.md) |
| 9 | Operação cognitiva única por tela (tabela em cada família) |
| 10 | Diagnóstico cobre **todas** as erradas |
| 11 | Arquétipo com pergunta/classificação **discriminante** |
| 12 | Macete com near-transfer aplicável em 5 s |
| 13 | Distratores ≡ slugs do `passo_a_passo` |
| 14 | Grifo `motivo` ecoa id da tela (`mapa`, `contraste`, `gradacao`…) |
| 15 | Zero proposição repetida em telas adjacentes |
| 16 | Teste de colagem: aula não serve em outra Q do lote |

Reprovou 1 → corrigir antes de `npm run validate:lote`.

---

## Ouros de referência por família

| Família | JSON espelho | Seed / lote |
|---------|--------------|-------------|
| **A** Caso/regra-exceção | [ctb-normas-circulacao-art29.json](./ctb-normas-circulacao-art29.json) | `lote-007`, `lote-013` |
| **B** Assertivas | [ctb-velocidade-218.json](./ctb-velocidade-218.json) | exemplos-ouro |
| **C** Competência SNT | [ctb-competencias-snt.json](./ctb-competencias-snt.json) | exemplos-ouro |
| **D** Gradação | [ctb-velocidade-218-caso.json](./ctb-velocidade-218-caso.json) | exemplos-ouro |

---

## Comparação das famílias

| | A | B | C | D |
|---|---|---|---|---|
| Arquétipo | `fluxograma_decisao` | `matriz_assertivas` | `diagrama_competencia` | `tabela_gradacao` |
| Tela #2 típica | glossário? | — | glossário? | — |
| Tela arquétipo | `fluxo` | `matriz` | `diagrama` | `gradacao` |
| `caso` significa | conflitos do stem | montar combinação I–V | via+fato→órgão | números→inciso |
| Telas típicas | 9–11 | 8–10 | 8–9 | 7–9 |

---

## Workflow Agent

```
1. examinador-idecan → questão + passo_a_passo + isca_por_alternativa
2. Classificar família A|B|C|D (seletor acima)
3. Abrir familias/PADRAO-{X}-….md — copiar ids/ordem/tipos DESSA família
4. Preencher contratos tela a tela (aceita/reprova)
5. Gate Mayer 8/8 + editorial 12/12
6. indexOf nos grifos; motivo → id da tela
7. npm run validate:lote -- content/questoes/.../lote-XXX.json
8. Teste de colagem
9. db:seed + snippet em _snippets/
```

### Prompt curto

```
Use examinador-idecan + estudo-reverso-visual.
Hub: exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md
Família A|B|C|D → JSON ouro da família (não art.29 cego)
Gate Mayer 8/8 + editorial 12/12 → validate:lote → db:seed
```

Ver também [prompt-questao-aula-completa.md](../../examinador-idecan/prompt-questao-aula-completa.md).

---

## Anti-padrões globais

- Copiar mapa do art. 29 em assertivas, competência ou gradação
- Diagnóstico monoisca (“se marcou A…”)
- Telas adjacentes com a mesma proposição (fluxo + mapa + caso repetindo RO-RO-DI)
- `contraste` com slugs (isso é `distratores`)
- Macete sem hipotética de near-transfer
- Condicional sem gatilho (decorar para 11 telas)
- MÉTODO com árvore de decisão (Família A)
- Recall na aula — recall = questão + FSRS

---

## Regras técnicas (validador)

### `secao` — valores permitidos

`diagnostico` | `mapa` | `contraste` | `distratores` | `metodo` | `lei` | `conceito` | `recall` | `macete`

- Glossário: **omitir** `secao`
- Caso resolvido: `secao: metodo`

### Limites por componente

| Componente | Limite |
|------------|--------|
| Palavras/tela v2 | ≤150 |
| `fluxograma` MÉTODO | ≤4 nós, linear, 1 `resultado`, sem `art.` no `label` |
| `fluxograma` (demais) | ≤7 nós, ≤2 `pergunta` |
| `comparacao` | ≤5 linhas |
| `tabela_gradacao` | ≤5 faixas |
| `matriz_assertivas` | ≤5 itens |
| `diagrama_competencia` | ≤8 nós |
| `trecho_legal` | ≤80 palavras, ≤3 grifos |

### Ordem enforceada (`validarNucleoV2`)

1. Primeira tela = `texto_destaque` (contexto)
2. Última tela = `texto_destaque` (macete)
3. `distratores` antes de qualquer `trecho_legal`
4. Tela imediatamente antes de `distratores` = `comparacao` (contraste)
5. Tela imediatamente após `distratores` = `comparacao` ou `fluxograma` (caso)

---

## Changelog

| Data | Mudança |
|------|---------|
| 2026-07-08 | **v3** — hub + famílias A–D; contratos editoriais; gate 12/12; ouros B/C/D v2 |
| 2026-07-08 | v2 — MÉTODO linear; lote-007 art. 29 (migrado para Família A) |
