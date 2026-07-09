# Padrão ouro — Aula completa v2 (legado)

> **Use o hub v3:** [PADRAO-AULA-COMPLETA-v3.md](./PADRAO-AULA-COMPLETA-v3.md) — famílias A–D, contratos editoriais, gate 12/12.  
> Este arquivo mantém o detalhe histórico da **Família A** (MÉTODO linear, lote-007). Para novas questões, comece pelo v3.

Referência canônica legada para questões com `estudo_reverso_visual_completo` (caso prático art. 29).

| Artefato | Caminho |
|----------|---------|
| Questão + aula (seed) | `content/questoes/legislacao_transito/lote-007.json` |
| Caso MÉTODO linear (regra/exceção) | `content/questoes/legislacao_transito/lote-013.json` |
| JSON espelho (Agent) | [ctb-normas-circulacao-art29.json](./ctb-normas-circulacao-art29.json) |
| Snippet visual | `content/questoes/legislacao_transito/_snippets/normas-circulacao-art29-visual.json` |
| Questão (examinador) | [exemplos-ouro.md](../../examinador-idecan/exemplos-ouro.md#exemplo-3--legislacao_transito-normas-de-circulação--aula-completa) |

**Microtópico de referência:** `CTB_circulacao_conduta` — art. 29, III + §2º (preferência + hierarquia).  
**Gabarito:** C · **Telas:** 11 · **Duração:** 260 s

---

## Quando usar este padrão

Copie a **estrutura** (ids, ordem, tipos, seções) — nunca o conteúdo literal entre questões.

| Sinal na questão | Use este padrão |
|------------------|-----------------|
| `tipo: caso_pratico` + `dificuldade` ≥ 3 | ✅ Estrutura base |
| Pegadinha = ordem de regras / exceção antes da regra geral | ✅ Fluxograma + contraste |
| Enunciado com **2 conflitos** ou 2 dispositivos legais | ✅ Caso resolvido + 2 `trecho_legal` |
| ≥ 2 termos técnicos desconhecidos para iniciante | ✅ Glossário (condicional) |
| Segundo par confundível (ex.: §2º hierarquia) | ✅ `comparacao` extra em `conceito` |

**Não use** quando o arquétipo dominante for outro (ex.: `diagrama_competencia` puro, `matriz_assertivas` I–V) — nesse caso, adapte só o núcleo 7 e consulte [arquetipos/](../arquetipos/).

---

## Mapa das 11 telas (lote-007)

Progressão pedagógica: **diagnóstico → pré-treino → método → mapa → contraste → distratores → caso → conceito → lei → macete**.

| # | `id` | `secao` | `tipo` | Papel | Gatilho |
|---|------|---------|--------|-------|---------|
| 1 | `contexto` | `diagnostico` | `texto_destaque` | Abre pelo erro/acerto + nomeia a isca | **Sempre** |
| 2 | `glossario` | — | `texto_destaque` | Pré-treino ≤3 termos | ≥2 termos técnicos |
| 3 | `fluxo` | `metodo` | `fluxograma` | **Caminho linear** do caso → gabarito (não a árvore da lei) | `regra_excecao` / caso prático |
| 4 | `mapa` | `mapa` | `tabela_gradacao` | Ordem/gradação legal | Lista ordenada na lei |
| 5 | `contraste` | `contraste` | `comparacao` | Crença errada × lei | Pegadinha = par confundível |
| 6 | `distratores` | `distratores` | `comparacao` | Slug IDECAN por errada | **Sempre (v2)** |
| 7 | `caso` | `metodo` | `comparacao` | Enunciado resolvido linha a linha | Caso prático |
| 8 | `hierarquia` | `conceito` | `comparacao` | Segundo eixo da pegadinha | 2º dispositivo / par extra |
| 9 | `lei3` | `lei` | `trecho_legal` | Dispositivo principal grifado | **Sempre** |
| 10 | `lei2` | `lei` | `trecho_legal` | § / inciso distinto | 2º fundamento no gabarito |
| 11 | `macete` | `macete` | `texto_destaque` | Mnemônico + transferência | **Sempre** |

### Núcleo vs condicionais

- **Núcleo 7** (validador exige ordem): contexto → arquétipo → contraste → distratores → caso → trecho_legal → macete.
- **Condicionais deste padrão (+4):** glossário, mapa (reforço), hierarquia, 2º trecho_legal.
- **Total 11** = núcleo expandido com condicionais **todas com gatilho real** — nunca preencher para “chegar em 11”.

---

## Decisões de design (por que cada tela existe)

### 1. Diagnóstico (`contexto`)

- **Princípio Mayer:** feedback elaborado pós-teste — a aula começa pelo que o aluno acabou de errar.
- **Conteúdo:** gabarito + isca mais provável (“se marcou A…”) + promessa da aula.
- **`destaques`:** 2–4 tokens da pegadinha (não frases inteiras).

### 2. Glossário (`glossario`)

- **Gatilho:** termos do enunciado que um iniciante não domina (`fluxos que se cruzam`, `não sinalizado`).
- **`secao`:** omitir (não existe `glossario` no enum — ver § Regras técnicas).
- **Limite:** ≤3 termos, ≤150 palavras.

### 3. Fluxograma (`fluxo`, `secao: metodo`)

- **Arquétipo raiz:** `fluxograma_decisao`.
- **Regra de simplicidade:** só o **caminho do enunciado até o gabarito** — cadeia linear, sem ramos “e se fosse o contrário?”.
- **Limites Zod (MÉTODO):** ≤4 nós, ≤2 `pergunta`, **1** `resultado`, sem `art.` no `label`.
- **Árvore completa da regra** → tela `mapa` (`tabela_gradacao`), não no MÉTODO.
- **Fora do MÉTODO** (v1 expressa): ≤7 nós, ≤2 `pergunta`, ramificação permitida.

#### Divisão de papéis (MÉTODO × MAPA × CASO)

| Tela | O que ensina | Exemplo (CONTRAN 911 / lote-013) |
|------|----------------|----------------------------------|
| **MÉTODO** (`fluxo`) | Perguntas do caso + conclusão em português | Frete pago? → Sim → Inacabado? → Sim → **Proibido** |
| **MAPA** (`mapa`) | Todos os desfechos legais (árvore, prazos, docs) | Inacabado+frete vedado · Acabado+ATV · Só DANFe |
| **CASO** (`caso`) | Fatos do enunciado amarrados ao dispositivo | Caminhão inacabado + frete + DANFe insuficiente |

#### Antes × depois (anti-padrão corrigido em 2026-07-08)

**❌ Antes** — árvore inteira no MÉTODO (5 nós, 3 resultados, artigos nos labels):

```
1. Transporte remunerado? → Sim
2. Veículo inacabado? → Sim
3. Vedado — art. 6º, §2º
4. Exige ATV + DANFe — art. 6º, I      ← ramo que não é o caso
5. Sem remunerado: DANFe + prazo art. 4º ← ramo que não é o caso
```

**✅ Depois** — só o caminho do gabarito (3 nós, 1 resultado):

```json
{
  "nos": [
    { "id": "p1", "label": "Frete remunerado?", "tipo": "pergunta" },
    { "id": "p2", "label": "Veículo inacabado?", "tipo": "pergunta" },
    { "id": "r1", "label": "Proibido — gabarito C", "tipo": "resultado" }
  ],
  "arestas": [
    { "de": "p1", "para": "p2", "rotulo": "Sim" },
    { "de": "p2", "para": "r1", "rotulo": "Sim" }
  ]
}
```

#### Referências por tipo de questão

| Tipo | Questão de referência | Fluxo MÉTODO |
|------|----------------------|--------------|
| Caso prático (2 conflitos) | `lote-007` art. 29 | Rodovia? → Caminhão responde? → Gabarito C |
| Caso prático (regra/exceção) | `lote-013` CONTRAN 911 | Frete pago? → Inacabado? → Proibido |
| Letra da lei (assertivas) | `lote-006` arts. 1º–3º | Parece a lei? → ação → Troca 1 palavra? → Errada |

**Player:** `src/components/estudo-reverso/telas/tela-fluxograma.tsx` ordena nós pelo caminho linear (`src/lib/estudo-reverso/fluxograma-caminho.ts`).

### 4. Tabela (`mapa`)

- **Arquétipo secundário:** `tabela_gradacao`.
- **Dual coding:** mesma ordem do fluxograma, formato scan rápido.
- **`destaque: true`** na linha do gabarito (alínea a — rodovia).

### 5. Contraste (`contraste`)

- **Obrigatório antes de `distratores`** (validador `validarNucleoV2`).
- Colunas: crença do candidato × redação legal.

### 6. Distratores (`distratores`)

- **Formato canônico:** coluna 1 = `LETRA — slug`; coluna 2 = por que engana + artigo.
- Slugs: `numero_vizinho` | `competencia_snt` | `gravidade` | `regra_excecao` | `termo_unico`.
- Deve espelhar o passo 2 do `comentario.passo_a_passo`.

### 7. Caso resolvido (`caso`)

- **Obrigatório após distratores** (`comparacao` ou `fluxograma`).
- Amarra cada conflito do enunciado a um dispositivo — prova que C não é “sorte”.

### 8. Hierarquia (`hierarquia`)

- **Condicional:** segundo eixo (art. 29, §2º) necessário para gabarito C.
- `secao: conceito` — enum válido.

### 9–10. Trechos legais (`lei3`, `lei2`)

- Texto **literal** de `conteúdo/` — `<cadeia_anti_alucinacao>`.
- ≤80 palavras por trecho, ≤3 grifos.
- **Grifos:** calcular com `indexOf` no texto exato do JSON:

```bash
node -e "
const t = '...texto literal...';
const s = 'proveniente de rodovia';
console.log(t.indexOf(s), t.indexOf(s)+s.length);
"
```

Offsets lote-007 (referência):

| Tela | Grifo | inicio | fim |
|------|-------|--------|-----|
| `lei3` | rodovia (alínea a) | 159 | 181 |
| `lei3` | nos demais casos… (alínea c) | 289 | 342 |
| `lei2` | maior porte… menores | 96 | 175 |
| `lei2` | motorizados pelos não motorizados | 177 | 213 |

### 11. Macete (`macete`)

- Repete `macete_visual` da raiz + **transferência** (outros arts. do microtópico).
- Última tela — sempre `texto_destaque`.

---

## Campos raiz do visual (copiar e adaptar)

```json
{
  "versao": 2,
  "arquetipo": "fluxograma_decisao",
  "arquetipo_secundario": "tabela_gradacao",
  "publico_alvo": "iniciante",
  "duracao_estimada_seg": 260,
  "fundamento_slug": "CTB_art_29_III",
  "macete_visual": "RO-RO-DI · o MAIOR cuida do menor",
  "telas": [],
  "links_fonte": [
    { "rotulo": "CTB art. 29", "path": "conteúdo/legislação federal/lei-9503-ctb.html" }
  ]
}
```

| Campo | Regra |
|-------|-------|
| `fundamento_slug` | Dispositivo **principal** da pegadinha (inciso do gabarito) |
| `macete_visual` | ≤80 caracteres; tokens repetidos no macete final |
| `duracao_estimada_seg` | ~20–25 s × número de telas |
| `publico_alvo: iniciante` | Quando há glossário ou linha do tempo |

---

## Regras técnicas (validador)

### `secao` — valores permitidos

`diagnostico` | `mapa` | `contraste` | `distratores` | `metodo` | `lei` | `conceito` | `recall` | `macete`

- Glossário: **omitir** `secao` (não usar `glossario` nem `caso`).
- Caso resolvido: `secao: metodo`.

### Limites por componente

| Componente | Limite |
|------------|--------|
| Palavras/tela v2 | ≤150 |
| `fluxograma` (MÉTODO, `secao: metodo`) | ≤4 nós, cadeia linear, 1 `resultado`, sem `art.` no `label` |
| `fluxograma` (demais / v1 expressa) | ≤7 nós, ≤2 `pergunta`, ramificação permitida |
| `comparacao` | ≤5 linhas |
| `tabela_gradacao` | ≤5 faixas |
| `trecho_legal` | ≤80 palavras, ≤3 grifos |

### Ordem enforceada (`validarNucleoV2`)

1. Primeira tela = `texto_destaque` (contexto)
2. Última tela = `texto_destaque` (macete)
3. `distratores` antes de qualquer `trecho_legal`
4. Tela imediatamente antes de `distratores` = `comparacao` (contraste)
5. Tela imediatamente após `distratores` = `comparacao` ou `fluxograma` (caso)

---

## Workflow de replicação (nova questão)

```
1. examinador-idecan → questão + passo_a_passo com slugs por errada
2. Copiar estrutura de ctb-normas-circulacao-art29.json (ids + ordem)
3. Substituir conteúdo — manter gatilhos condicionais só se existirem
4. Calcular grifos (indexOf) nos trecho_legal
5. Gate Mayer 8/8 (checklist-mayer.md)
6. npm run validate:lote -- content/questoes/.../lote-XXX.json
7. npm run db:seed
8. Espelhar snippet em content/questoes/{disc}/_snippets/
```

### Prompt curto (Agent)

Ver [prompt-questao-aula-completa.md](../examinador-idecan/prompt-questao-aula-completa.md) — versões completa, curta e lote.

```
Use examinador-idecan + estudo-reverso-visual.
Estrutura da aula: exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md + família A|B|C|D
JSON de referência: exemplos-ouro/ctb-normas-circulacao-art29.json
Gate Mayer 8/8 → validate:lote → db:seed
```

---

## Anti-padrões (não replicar)

- Reusar texto de telas entre questões ou microtópicos
- Tela condicional sem gatilho (decorar para 11 telas)
- `secao: glossario` ou `secao: caso` (rejeitado pelo schema)
- **MÉTODO com árvore de decisão** — ramos alternativos, 2+ `resultado`, ou artigos no `label` (vai no `mapa` / `lei`)
- Fluxograma (fora do MÉTODO) com 3+ nós `pergunta`
- Grifo calculado “no olho” — sempre `indexOf`
- Recall (`matriz_assertivas`) dentro da aula — recall = questão + FSRS

---

## Comparação com padrão anterior (lote-006)

| Aspecto | lote-006 (disposições preliminares) | lote-007 (padrão ouro) |
|---------|-------------------------------------|-------------------------|
| Telas | 10 | 11 |
| Arquétipo | `trecho_legal` | `fluxograma_decisao` |
| Pré-treino | Não | Glossário 3 termos |
| Caso resolvido | Implícito no fluxograma | Tela dedicada |
| 2º dispositivo | Mesclado | Tela `hierarquia` + 2º `trecho_legal` |
| Recall | Removido a pedido | Ausente (política FSRS) |

---

## Checklist rápido antes do seed

- [ ] `estudo_reverso_visual_completo.versao === 2`
- [ ] 7–11 telas; ordem núcleo v2 respeitada
- [ ] Tela `fluxo` (MÉTODO): cadeia linear, ≤4 nós, 1 resultado, sem `art.` no label
- [ ] Tela `mapa`: árvore / gradação completa (se aplicável)
- [ ] Tela `distratores` com slug por alternativa errada
- [ ] `passo_a_passo[1]` nomeia os mesmos slugs
- [ ] Grifos com `inicio`/`fim` verificados por script
- [ ] Gate Mayer 8/8
- [ ] `npm run validate:lote` zero erros

---

## Changelog deste documento

| Data | Mudança |
|------|---------|
| 2026-07-08 | **MÉTODO linear** — regra de simplicidade, validação Zod, retrofit lotes 006–019; exemplos antes/depois (lote-013) |
| 2026-07-08 | Criação — referência canônica lote-007 / art. 29 |
