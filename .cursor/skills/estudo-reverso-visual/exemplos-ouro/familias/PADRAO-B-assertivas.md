# Família B — Assertivas I–V

**Quando usar:** `tipo: assertivas` ou enunciado com I, II, III… e gabarito por combinação (“I e III apenas”).

| Artefato | Caminho |
|----------|---------|
| Hub v3 | [../PADRAO-AULA-COMPLETA-v3.md](../PADRAO-AULA-COMPLETA-v3.md) |
| JSON ouro | [../ctb-velocidade-218.json](../ctb-velocidade-218.json) |
| Template | [../../arquetipos/matriz-assertivas.md](../../arquetipos/matriz-assertivas.md) |

**Não use** para caso prático sem I–V → Família A ou D.

---

## Mapa típico (8–10 telas)

| # | `id` | `secao` | `tipo` | Operação | Gatilho |
|---|------|---------|--------|----------|---------|
| 1 | `contexto` | `diagnostico` | `texto_destaque` | Diagnosticar combinações erradas | **Sempre** |
| 2 | `glossario` | — | `texto_destaque` | Desbloquear termos das assertivas | ≥2 termos |
| 3 | `matriz` | `metodo` | `matriz_assertivas` | Classificar V/F + motivo curto | **Sempre (B)** |
| 4 | `gradacao` | `mapa` | `tabela_gradacao` | Faixas legais (scan rápido) | `pegadinha_percentual` / `gravidade` |
| 5 | `contraste` | `contraste` | `comparacao` | Inocular assertiva-isca × lei | **Sempre** |
| 6 | `distratores` | `distratores` | `comparacao` | Erro de **combinação** por letra | **Sempre** |
| 7 | `caso` | `metodo` | `comparacao` | Montar gabarito: I✓ II✗ III✓ → letra | **Sempre** |
| 8 | `lei` | `lei` | `trecho_legal` | Inciso da assertiva-isca | **Sempre** |
| 9 | `lei2` | `lei` | `trecho_legal` | 2º inciso se gabarito usa dois | 2 fundamentos |
| 10 | `macete` | `macete` | `texto_destaque` | Mnemônico + near/far + o que NÃO muda | **Sempre** |

**Núcleo B:** contexto → **matriz** → contraste → distratores → caso → lei → macete.

**Não** force `fluxograma` do art. 29.

---

## Contratos Família B

### `matriz`
- **Aceita:** 1 item por assertiva; `correto` + motivo implícito no `texto` (≤12 palavras); destaque na assertiva-isca (II no art. 218)
- **Reprova:** só V/F sem explicar o erro da falsa

### `contraste`
- **Aceita:** 1 eixo — assertiva falsa × redação correta (ex.: “20–50% gravíssima” × “20–50% GRAVE”)
- **Reprova:** relistar I–II–III (isso é a matriz)

### `distratores`
- Explica **combinação**, não só assertiva isolada:
  - `A — termo_unico` → “Marca só I; ignora III correta”
  - `C — gravidade` → “Inclui II (grave→gravíssima)”
  - `D — regra_excecao` → “Compra II errada + todas corretas”

### `caso`
- Linhas: I → ✓/✗ + inciso | II → ✓/✗ | III → ✓/✗ | Resultado → letra B

### `macete` — transferência (v3.4)

- Regra 1 frase + **near** + **far** + **o que NÃO muda** (eco de `meta` da questão)
- Near exemplo: “Se a banca trocar só a faixa do meio no art. 219, o que muda?” — 1 frase.
- Far: cenário distinto (outro inciso ou outro tipo de infração na mesma tabela)

---

## Campos raiz

```json
{
  "versao": 2,
  "arquetipo": "matriz_assertivas",
  "arquetipo_secundario": "tabela_gradacao",
  "fundamento_slug": "CTB_art_218",
  "macete_visual": "20 média | 20-50 GRAVE | +50 gravíssima"
}
```

`meta.padrao_familia`: `"B_assertivas"`

---

## Anti-padrões B

- Fluxo RO-RO-DI em questão I–V
- `caso` que só repete a matriz
- Distratores sem falar da combinação de letras
- `gradacao` sem `destaque` na faixa-isca
