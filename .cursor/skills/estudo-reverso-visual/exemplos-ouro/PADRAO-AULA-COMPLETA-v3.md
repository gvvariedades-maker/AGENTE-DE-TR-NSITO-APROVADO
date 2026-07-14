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
| `contraste` | **Só crença FALSA** × lei; 2–4 linhas; órgãos diferentes nos lados quando a correção troca o órgão | Fato **verdadeiro** na coluna ✗ (ex.: “PRF patrulha rodovia” \| “PRF — §2º”); slug; tabela de distratores |
| `distratores` | JSON: `LETRA — slug` = `passo_a_passo[1]`; UI mostra **rótulo humano** | Slug inventado; título “stem” |
| `caso` | Substantivos do **enunciado** + linha Resultado; título sem jargão | Título com “stem”; repetir arquétipo sem fatos |
| `macete` | `macete_visual` + regra 1 frase + **near-transfer** + **far-transfer** + **o que NÃO muda** (eco de `meta`) | Só mnemônico / só nº de artigo / near sem far |
| `trecho_legal` | Literal `conteúdo/` + grifo `indexOf` + `motivo` cita **id da tela** que ensinou o token | Paráfrase; grifo “no olho” |

### Contraste — regra de ouro (gate Zod `validarContrastePedagogico`)

1. Coluna esquerda = o que o candidato **pensa e está errado**.
2. Coluna direita = o que a **lei** diz.
3. **Proibido** colocar na esquerda um fato que a direita confirma sobre o **mesmo órgão** (ex.: PRF+rodovia nos dois lados).
4. Verdades vão no **mapa/glossário**, não no contraste.
5. Títulos: “enunciado”, nunca “stem”.

### Slugs de distrator (examinador-idecan)

`numero_vizinho` | `competencia_snt` | `gravidade` | `regra_excecao` | `termo_unico`

No **player**, `TelaComparacao` substitui slugs por labels (`src/lib/mecanismo-distrator-labels.ts`).

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
  },
  "near_transfer": "mesmo dispositivo, 1 fato do stem trocado",
  "far_transfer": "mesmo dispositivo, cenário distante",
  "o_que_nao_muda": "invariante legal citável",
  "eixo_vizinho": "CTB_art_281",
  "eficacia_pos_aula": ["E1", "E2", "E3"]
}
```

`near_transfer` / `far_transfer` / `o_que_nao_muda` vêm do examinador-idecan v2.1 (`<transferencia_obrigatoria>`). `eixo_vizinho` só se o gabarito remete a outro artigo. `eficacia_pos_aula` = checklist E1–E3 passou.

---

## Gate editorial 12/12 (além do Mayer 8/8)

| # | Critério |
|---|----------|
| 1–8 | [checklist-mayer.md](../checklist-mayer.md) |
| 9 | Operação cognitiva única por tela (tabela em cada família) |
| 10 | Diagnóstico cobre **todas** as erradas |
| 11 | Arquétipo com pergunta/classificação **discriminante** |
| 12 | Macete com near-transfer **e** far-transfer aplicáveis em 5 s |
| 13 | Distratores ≡ slugs do `passo_a_passo` |
| 14 | Grifo `motivo` ecoa id da tela (`mapa`, `contraste`, `gradacao`…) |
| 15 | Zero proposição repetida em telas adjacentes |
| 16 | Teste de colagem: aula não serve em outra Q do lote |
| 17 | Grifo com `texto_grifado` validado (`npm run grifo:offsets` + `preview:grifos` no `validate:lote`) |
| 18 | Macete (ou tela imediata antes) distingue **o que muda × o que NÃO muda**; far ≠ paráfrase do near |
| 19 | `<checklist_eficacia_pos_aula>` E1–E3 (invariante / errada tentadora / far) — 3× sim |
| 20 | **Contraste:** nenhuma linha com fato verdadeiro na coluna ✗ (gate Zod `validarContrastePedagogico`) |
| 21 | **Copy aluno:** sem “stem” em títulos; slugs só no JSON — UI com rótulo humano |

Reprovou 1 → corrigir antes de `npm run validate:lote`.

> Itens 1–17 = gate histórico. **#18 e #19** = eficácia máxima (skill v3.4). **#20 e #21** = pacote qualidade contraste/copy (2026-07).

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
6. indexOf nos grifos; `texto_grifado` obrigatório; motivo → id da tela
7. `npm run preview:grifos` + `npm run validate:lote -- content/questoes/.../lote-XXX.json`
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

Ver também [prompt-nova-conversa.txt](../../examinador-idecan/prompt-nova-conversa.txt) (pronto para colar) e [prompt-questao-aula-completa.md](../../examinador-idecan/prompt-questao-aula-completa.md) (variantes).

---

## Anti-padrões globais

- Copiar mapa do art. 29 em assertivas, competência ou gradação
- Diagnóstico monoisca (“se marcou A…”)
- Telas adjacentes com a mesma proposição (fluxo + mapa + caso repetindo RO-RO-DI)
- `contraste` com slugs (isso é `distratores`)
- Macete sem hipotética de near-transfer **ou** sem far-transfer distinto
- Condicional sem gatilho (decorar para 11 telas)
- MÉTODO com árvore de decisão (Família A)
- Recall na aula — recall = questão + FSRS
- Aula que passa no Mayer mas falha E1–E3 (aluno não transfere)

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
| 2026-07-11 | **v3.4** — macete near+far+o que não muda; meta transferência/eixo; gate editorial #18/#19; checklist eficácia E1–E3 |
| 2026-07-08 | **v3** — hub + famílias A–D; contratos editoriais; gate 12/12; ouros B/C/D v2 |
| 2026-07-08 | v2 — MÉTODO linear; lote-007 art. 29 (migrado para Família A) |
