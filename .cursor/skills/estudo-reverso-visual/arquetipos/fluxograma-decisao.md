# Template: fluxograma_decisao

Use para `caso_pratico` CTB com raciocinio se/entao.

```json
{
  "id": "fluxo",
  "titulo": "Raciocínio em N passos",
  "tipo": "fluxograma",
  "conteudo": {
    "nos": [
      { "id": "n1", "label": "Pergunta do caso?", "tipo": "pergunta" },
      { "id": "n2", "label": "Conduta do agente", "tipo": "acao" },
      { "id": "n3", "label": "Art. X — conclusão", "tipo": "lei", "ref": "CTB art. X" }
    ],
    "arestas": [
      { "de": "n1", "para": "n2", "rotulo": "sim" },
      { "de": "n2", "para": "n3" }
    ]
  }
}
```

Max 8 nos. Cada `label` curto (<= 12 palavras).
