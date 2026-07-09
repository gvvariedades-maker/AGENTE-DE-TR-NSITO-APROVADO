# Template: fluxograma_decisao

Use para `caso_pratico` CTB com raciocínio se/então.

## Regra do slide MÉTODO (`secao: "metodo"`)

O fluxograma do MÉTODO ensina **só o caminho do enunciado até o gabarito** — não a árvore completa da lei.

| Obrigatório | Proibido no MÉTODO |
|---|---|
| Cadeia linear (1 caminho) | Ramos alternativos (“e se fosse o contrário?”) |
| ≤ 4 nós | > 1 nó `resultado` |
| ≤ 2 nós `pergunta` | Citação de artigo no `label` (vai no `mapa` / `lei`) |
| Conclusão em português simples | Sigla sem glossário prévio |

Ramos não usados no caso → tela `mapa` (`tabela_gradacao`) ou `contraste`.

## Template — MÉTODO (caso prático)

```json
{
  "id": "fluxo",
  "titulo": "Método: [pergunta do enunciado]?",
  "secao": "metodo",
  "tipo": "fluxograma",
  "conteudo": {
    "nos": [
      { "id": "p1", "label": "Primeira pergunta do caso?", "tipo": "pergunta" },
      { "id": "p2", "label": "Segunda pergunta (se houver)?", "tipo": "pergunta" },
      { "id": "r1", "label": "Conclusão — gabarito", "tipo": "resultado" }
    ],
    "arestas": [
      { "de": "p1", "para": "p2", "rotulo": "Sim" },
      { "de": "p2", "para": "r1", "rotulo": "Não" }
    ]
  }
}
```

## Template — MAPA ou v1 expressa (árvore permitida)

Fora do MÉTODO, até 7 nós e 2 perguntas com ramificação:

```json
{
  "id": "fluxo",
  "titulo": "Raciocínio em N passos",
  "tipo": "fluxograma",
  "conteudo": {
    "nos": [
      { "id": "n1", "label": "Pergunta do caso?", "tipo": "pergunta" },
      { "id": "n2", "label": "Conduta do agente", "tipo": "acao" },
      { "id": "n3", "label": "Conclusão", "tipo": "resultado" }
    ],
    "arestas": [
      { "de": "n1", "para": "n2", "rotulo": "sim" },
      { "de": "n2", "para": "n3" }
    ]
  }
}
```

Cada `label` ≤ 12 palavras. Validador: MÉTODO linear ≤ 4 nós, 1 resultado; demais fluxogramas ≤ 7 nós, ≤ 2 perguntas.
