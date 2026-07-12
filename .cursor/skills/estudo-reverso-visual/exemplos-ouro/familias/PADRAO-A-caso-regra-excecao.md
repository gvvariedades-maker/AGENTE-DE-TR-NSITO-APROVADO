# Família A — Caso prático / regra-exceção

**Quando usar:** `caso_pratico` + `regra_excecao` / ordem de regras / exceção antes da regra geral / 2 dispositivos no gabarito.

| Artefato | Caminho |
|----------|---------|
| Hub v3 | [../PADRAO-AULA-COMPLETA-v3.md](../PADRAO-AULA-COMPLETA-v3.md) |
| JSON ouro | [../ctb-normas-circulacao-art29.json](../ctb-normas-circulacao-art29.json) |
| Seed | `content/questoes/legislacao_transito/lote-007.json` |
| Regra/exceção | `content/questoes/legislacao_transito/lote-013.json` |

---

## Mapa típico (9–11 telas)

| # | `id` | `secao` | `tipo` | Operação | Gatilho |
|---|------|---------|--------|----------|---------|
| 1 | `contexto` | `diagnostico` | `texto_destaque` | Diagnosticar (isca A/B/D) | **Sempre** |
| 2 | `glossario` | — | `texto_destaque` | Desbloquear ≤3 termos | ≥2 termos técnicos |
| 3 | `fluxo` | `metodo` | `fluxograma` | Decidir (linear ≤4 nós) | **Sempre (A)** |
| 4 | `mapa` | `mapa` | `tabela_gradacao` | Completar conjunto omitido pelo fluxo | Lista ordenada na lei |
| 5 | `contraste` | `contraste` | `comparacao` | Inocular 1 crença × lei | Pegadinha = par confundível |
| 6 | `distratores` | `distratores` | `comparacao` | Taxonomizar slugs | **Sempre** |
| 7 | `caso` | `metodo` | `comparacao` | Amarrar conflitos do stem | Caso prático |
| 8 | `eixo2` / `hierarquia` | `conceito` | `comparacao` | Separar 2º fundamento | 2º dispositivo no gabarito |
| 9–10 | `lei*` | `lei` | `trecho_legal` | Ancorar literal + grifo | 1–2 dispositivos |
| 11 | `macete` | `macete` | `texto_destaque` | Recuperar + near/far + o que NÃO muda | **Sempre** |

---

## Contratos Família A

### `contexto`
- **Aceita:** gabarito + 1 linha por errada (A/B/D) + promessa = pegadinha
- **Reprova:** só a isca mais provável

### `fluxo` (MÉTODO)
- **Aceita:** cada `pergunta` falsificável com fato do enunciado; “Não” mudaria o gabarito
- **Reprova:** árvore com 2+ `resultado`; `art.` no `label`; Sim→Sim sem discriminação

### Divisão MÉTODO × MAPA × CASO

| Tela | Ensina | Exemplo lote-013 |
|------|--------|------------------|
| MÉTODO | Caminho do caso → gabarito | Frete pago? → Inacabado? → Proibido |
| MAPA | Todos os desfechos legais | Inacabado+frete vedado · Acabado+ATV · Só DANFe |
| CASO | Fatos do enunciado → dispositivo | Caminhão inacabado + frete + DANFe insuficiente |

### `macete` — transferência (v3.4)

Consome `meta` da questão (`examinador-idecan` v2.1):

1. **Regra** (1 frase) — invariante do gabarito
2. **Near-transfer** — eco de `meta.near_transfer` (cenário próximo)
3. **Far-transfer** — eco de `meta.far_transfer` (cenário distante; ≠ near)
4. **O que NÃO muda** — eco de `meta.o_que_nao_muda`
5. **Cadeia** (se houver) — `meta.eixo_vizinho` em 1 frase (“próximo na cadeia: art. X”)

Exemplo near: “Se só houvesse rotatória × via comum, quem passa?” — 1 frase.

---

## Campos raiz

```json
{
  "versao": 2,
  "arquetipo": "fluxograma_decisao",
  "arquetipo_secundario": "tabela_gradacao",
  "fundamento_slug": "CTB_art_29_III",
  "macete_visual": "RO-RO-DI · o MAIOR cuida do menor"
}
```

`meta.padrao_familia`: `"A_caso_regra_excecao"`

---

## Anti-padrões A

- Árvore inteira no MÉTODO
- `mapa` = cópia do `fluxo`
- `hierarquia` repetindo RO-RO-DI
- Glossário com spoiler do gabarito
