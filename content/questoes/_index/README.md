# Índice de cobertura de questões

Mapa de **eixos legais já ocupados** — consultar antes de gerar questões inéditas.

## Gerar / atualizar

```bash
npm run index:questoes
```

Saída: `cobertura.json` (gerado; não editar manualmente).

## Chave de eixo (anti-repetição)

```
disciplina | topico | fundamento_slug | estilo_idecan
```

Exemplo: `legislacao_transito|CTB_infracoes|CTB_art_266|caso_pratico`

## Gate no pipeline

```bash
npm run validate:cobertura -- content/questoes/.../lote-XXX.json
# ou encadeado em:
npm run validate:lote -- content/questoes/.../lote-XXX.json
```

**Erros:** enunciado idêntico, mesmo eixo ouro, >3 questões/microtópico no lote, similaridade ≥92%.  
**Avisos:** similaridade 80–92% no mesmo `topico`.

## Checklist CTB (artigo ↔ microtópico ↔ cobertura)

```bash
npm run check:ctb-cobertura
```

Cruza `cobertura.json` com o mapa estático em `src/data/ctb-clusters.ts`.  
Saída: `ctb-checklist.json` (lacunas, clusters cobertos, próximos estudos prioridade A).

## Workflow Agent (examinador-idecan)

1. `npm run index:questoes`
2. `npm run check:ctb-cobertura` — escolher cluster **lacuna** (prioridade A primeiro)
3. Gerar questão + aula v2 com `fundamento_slug` do cluster
4. `validate:lote` → `db:seed`
5. Reindexar: `index:questoes` + `check:ctb-cobertura`
