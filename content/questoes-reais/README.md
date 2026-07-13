# Questões reais IDECAN (nível superior)

Pipeline **paralelo** às inéditas em `content/questoes/`. Não entra no `npm run proxima` nem no índice de cobertura das inéditas.

## Política

| Regra | Detalhe |
|-------|---------|
| Escolaridade | **Somente SUPERIOR** (PDFs com `SUPERIOR` no nome) |
| Enunciado | Fiel ao PDF Tec Concursos — limpeza de cabeçalho, sem reescrita |
| Aula | Mesma trilha: `estudo_reverso_visual_completo` v2 (7–11 telas) |
| `meta.origem` | Sempre `"real_idecan"` |
| Tags | Sempre incluir `real_idecan` e `superior` |
| Dificuldade | Estrutural honesta (pode ser 1–3); **não** forçar mínimo 4 |

## Estrutura

```
content/questoes-reais/
  _raw/                         # extração bruta do PDF (não seedar)
  {disciplina}/
    lote-001.json               # seedável
    _snippets/real-tec-*-completo-visual.json
```

## Fluxo

```bash
# 1. Extrair só PDFs SUPERIOR
python scripts/extrair-questoes-reais-superior.py --pdf "CTB - IDECAN - SUPERIOR - TEC.pdf"

# 2. Montar lote + aula (prompt Agent)
#    .cursor/skills/examinador-idecan/prompt-questao-real-aula.md

# 3. Validar
npm run validate:lote -- content/questoes-reais/legislacao_transito/lote-001.json

# 4. Seed só reais
npm run db:seed -- --only-reais
```

## Separação das inéditas

- `npm run index:questoes` / `npm run proxima` leem **apenas** `content/questoes/`
- Seed de inéditas continua com gate lote-007; reais usam bypass por `meta.origem`
- Validadores: `meta.origem === "real_idecan"` relaxa D1 (dificuldade mínima) e on-case C6

## Lotes

| Arquivo | Disciplina | Qtd | Fonte PDF |
|---------|------------|-----|-----------|
| `legislacao_transito/lote-001.json` | Trânsito | 5 | `CTB - IDECAN - SUPERIOR - TEC.pdf` |
