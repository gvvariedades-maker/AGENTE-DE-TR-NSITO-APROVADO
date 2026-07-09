# Família D — Gradação (% / prazo / gravidade)

**Quando usar:** `pegadinha_percentual` / `pegadinha_prazo`; slugs `gravidade` / `numero_vizinho`; caso com cálculo (radar, prazo, vizinho numérico).

| Artefato | Caminho |
|----------|---------|
| Hub v3 | [../PADRAO-AULA-COMPLETA-v3.md](../PADRAO-AULA-COMPLETA-v3.md) |
| JSON ouro | [../ctb-velocidade-218-caso.json](../ctb-velocidade-218-caso.json) |
| Template | [../../arquetipos/tabela-gradacao.md](../../arquetipos/tabela-gradacao.md) |

**Assertivas I–V sobre a mesma gradação** → preferir **Família B**, não D.

---

## Mapa típico (7–9 telas)

| # | `id` | `secao` | `tipo` | Operação | Gatilho |
|---|------|---------|--------|----------|---------|
| 1 | `contexto` | `diagnostico` | `texto_destaque` | Diagnosticar faixa do meio / vizinho | **Sempre** |
| 2 | `glossario` | — | `texto_destaque` | “excesso %”, “natureza grave”… | Iniciante |
| 3 | `gradacao` | `mapa` | `tabela_gradacao` | Faixas com `destaque` na isca | **Sempre (D)** |
| 4 | `contraste` | `contraste` | `comparacao` | Faixa errada × correta (1 eixo) | **Sempre** |
| 5 | `distratores` | `distratores` | `comparacao` | média↔grave↔gravíssima / vizinho | **Sempre** |
| 6 | `caso` | `metodo` | `comparacao` | Números do stem → % → inciso | **Sempre** |
| 7 | `linha_tempo` | — | `linha_tempo` | Alteração de faixas/prazos | Lei nova relevante |
| 8 | `lei` | `lei` | `trecho_legal` | Inciso da faixa correta | **Sempre** |
| 9 | `macete` | `macete` | `texto_destaque` | Faixas + near-transfer | **Sempre** |

**Núcleo D:** contexto → **gradacao** → contraste → distratores → caso → lei → macete.

Cálculo vai **dentro de `caso`**, não em tela separada antes do contraste.

---

## Contratos Família D

### `gradacao`
- **Aceita:** ≤5 faixas; **1** `destaque: true` = faixa da pegadinha (ex.: 20–50% grave)
- **Reprova:** tabela sem destaque; faixas fora da lei

### `contraste`
- **Aceita:** 1 eixo — “abaixo de 50% = média” × “20–50% = grave (II)”
- **Reprova:** 3 faixas repetidas da tabela

### `distratores` (ex. art. 218 caso)
- `A — gravidade` → pula para gravíssima/suspensão
- `B — termo_unico` → inventa natureza leve
- `C — gravidade` → mantém média além de 20%

### `caso`
- Colunas: Conta | Resultado legal
- Ex.: (84−60)÷60 = 40% | art. 218, II — grave | Gabarito D

### `macete` near-transfer
- “Radar marca 95 km/h no mesmo limite 60 — qual faixa?” → >50% gravíssima.

---

## Campos raiz

```json
{
  "versao": 2,
  "arquetipo": "tabela_gradacao",
  "arquetipo_secundario": "comparacao",
  "fundamento_slug": "CTB_art_218_II",
  "macete_visual": "≤20 média | 20-50 GRAVE | >50 gravíssima+suspensão"
}
```

`meta.padrao_familia`: `"D_gradacao"`

---

## Anti-padrões D

- `gradacao` sem `destaque`
- Pular cálculo quando o enunciado tem números
- Matriz I–V em caso sem assertivas
- Macete só “20/50” sem hipotética de outra velocidade
