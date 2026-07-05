# Template: tabela_gradacao

Use para percentuais, prazos, penas graduadas (ex. art. 218).

```json
{
  "id": "gradacao",
  "titulo": "Gradação legal",
  "tipo": "tabela_gradacao",
  "conteudo": {
    "titulo_colunas": ["Faixa", "Classificação"],
    "linhas": [
      { "faixa": "Até 20%", "classificacao": "Infração média" },
      { "faixa": "20% a 50%", "classificacao": "Infração grave", "destaque": true },
      { "faixa": "Acima de 50%", "classificacao": "Gravíssima + multa tripla" }
    ]
  }
}
```

Marque `destaque: true` na linha da pegadinha.
