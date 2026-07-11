# Template: trecho_legal grifado

```json
{
  "id": "lei",
  "titulo": "Lei seca",
  "tipo": "trecho_legal",
  "conteudo": {
    "fonte": "CTB art. 218",
    "texto": "Trecho literal ou parafrase fiel do dispositivo.",
    "trechos_grifados": [
      {
        "inicio": 0,
        "fim": 20,
        "texto_grifado": "Trecho exato",
        "motivo": "ponto-chave do gabarito — ecoa id da tela (mapa, contraste…)"
      }
    ]
  }
}
```

## Regras

- Calcular `inicio`/`fim` com `npm run grifo:offsets -- "<substring>" "<texto>"`
- `texto_grifado` deve ser **idêntico** a `texto.slice(inicio, fim)` (Guardrail 3)
- Limites devem respeitar palavras inteiras (Guardrail 2 — anti-corte)
- Validar com `npm run preview:grifos -- arquivo.json` antes do seed
