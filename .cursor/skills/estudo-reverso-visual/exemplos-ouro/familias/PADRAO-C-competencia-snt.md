# Família C — Competência SNT

**Quando usar:** slug dominante `competencia_snt`; quem autua / legisla / julga (CONTRAN, CETRAN, órgão executivo, PRF, PM…).

| Artefato | Caminho |
|----------|---------|
| Hub v3 | [../PADRAO-AULA-COMPLETA-v3.md](../PADRAO-AULA-COMPLETA-v3.md) |
| JSON ouro | [../ctb-competencias-snt.json](../ctb-competencias-snt.json) |
| Template | [../../arquetipos/diagrama-competencia.md](../../arquetipos/diagrama-competencia.md) |

**Não use** para só pode↔deve sem órgão → Família A ou comparação pura.

---

## Mapa típico (8–9 telas)

| # | `id` | `secao` | `tipo` | Operação | Gatilho |
|---|------|---------|--------|----------|---------|
| 1 | `contexto` | `diagnostico` | `texto_destaque` | Diagnosticar (PM exclusiva / CONTRAN / PRF) | **Sempre** |
| 2 | `glossario` | — | `texto_destaque` | Órgãos do enunciado (STTP, executivo…) | Nomes pouco familiares |
| 3 | `diagrama` | `metodo` | `diagrama_competencia` | Quem faz o quê no caso (≤8 nós) | **Sempre (C)** |
| 4 | `contraste` | `contraste` | `comparacao` | 1 par: órgão errado × órgão certo | **Sempre** |
| 5 | `distratores` | `distratores` | `comparacao` | Via/órgão trocado por letra | **Sempre** |
| 6 | `caso` | `metodo` | `comparacao` | Via + fato + órgão → letra | **Sempre** |
| 7 | `mapa` | `mapa` | `comparacao` | Matriz via × órgão (scan) | ≥3 órgãos no microtópico |
| 8 | `lei` | `lei` | `trecho_legal` | art. 23/24… grifado | **Sempre** |
| 9 | `macete` | `macete` | `texto_destaque` | Via × órgão + near/far + o que NÃO muda | **Sempre** |

**Núcleo C:** contexto → **diagrama** → contraste → distratores → caso → lei → macete.

---

## Contratos Família C

### `diagrama`
- **Aceita:** nós = órgãos **do caso**; arestas = competência no enunciado; nível 0 = normativo (CONTRAN), 2 = operacional (STTP)
- **Reprova:** organograma completo do SNT; nós sem relação com o stem

### `contraste`
- **Aceita:** 1 par — “só PM autua” × “órgão executivo municipal — art. 24, VI”
- **Reprova:** 4 órgãos na mesma tela

### `distratores`
- `A — competencia_snt` PM exclusiva
- `C — competencia_snt` delegação CONTRAN por agente
- `D — termo_unico` ou `competencia_snt` PRF em via municipal

### `caso`
- Via municipal | estacionamento irregular | STTP autua | Gabarito B

### `macete` — transferência (v3.4)

- Regra via+órgão + **near** + **far** + **o que NÃO muda** (eco de `meta`)
- Near exemplo: “Mesma infração em rodovia federal no perímetro urbano — quem autua?” — 1 frase.
- Far: outro par de órgãos (ex.: CONTRAN↔CETRAN) no mesmo dispositivo

---

## Campos raiz

```json
{
  "versao": 2,
  "arquetipo": "diagrama_competencia",
  "arquetipo_secundario": "comparacao",
  "fundamento_slug": "CTB_art_24_VI",
  "macete_visual": "Via municipal + estacionamento = executivo municipal"
}
```

`meta.padrao_familia`: `"C_competencia_snt"`

---

## Anti-padrões C

- Diagrama com todos os órgãos do CTB
- Fluxo RO-RO-DI colado
- Macete sem tipo de via
- Contraste misturando PRF + CONTRAN + CETRAN
