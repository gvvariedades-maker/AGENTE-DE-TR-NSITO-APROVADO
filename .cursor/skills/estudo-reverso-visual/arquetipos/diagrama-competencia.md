# Template: diagrama_competencia

Use para SNT, hierarquia de órgãos (CONTRAN, DETRAN, STTP).

```json
{
  "id": "competencias",
  "titulo": "Competências",
  "tipo": "diagrama_competencia",
  "conteudo": {
    "nos": [
      { "id": "contran", "label": "CONTRAN", "nivel": 0 },
      { "id": "detran", "label": "DETRAN/PB", "nivel": 1 },
      { "id": "sttp", "label": "STTP municipal", "nivel": 2 }
    ],
    "arestas": [
      { "de": "contran", "para": "detran", "rotulo": "normas" },
      { "de": "detran", "para": "sttp", "rotulo": "fiscalização" }
    ]
  }
}
```

`nivel` 0 = topo da hierarquia.
