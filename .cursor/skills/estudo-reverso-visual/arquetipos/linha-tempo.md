# Template: linha_tempo

Use para cadeias processuais (autuação → notificação → defesa).

```json
{
  "id": "timeline",
  "titulo": "Sequência processual",
  "tipo": "linha_tempo",
  "conteudo": {
    "eventos": [
      { "ordem": 1, "rotulo": "Autuação", "descricao": "Lavratura do auto" },
      { "ordem": 2, "rotulo": "Notificação", "descricao": "Ciência ao infrator" },
      { "ordem": 3, "rotulo": "Defesa", "descricao": "Prazo para impugnação" }
    ]
  }
}
```

2-5 eventos ordenados.
