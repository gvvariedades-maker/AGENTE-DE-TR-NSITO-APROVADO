# Questões reais IDECAN (nível superior)

Pipeline **paralelo** às inéditas em `content/questoes/`. Não entra no `npm run proxima` nem no índice de cobertura das inéditas.

## Política

| Regra | Detalhe |
|-------|---------|
| Escolaridade | **Somente SUPERIOR** (PDFs com `SUPERIOR` no nome) |
| Enunciado | Fiel ao PDF Tec Concursos — limpeza de cabeçalho, sem reescrita |
| Aula | **Paridade com inéditas:** hub v3.4, 7–11 telas, gate editorial 12/12 |
| `meta.origem` | Sempre `"real_idecan"` |
| Tags | Sempre incluir `real_idecan` e `superior` |
| Dificuldade | Estrutural honesta (pode ser 1–3); **não** forçar mínimo 4 |
| Transferência | `near` / `far` / `o_que_nao_muda` + E1–E3 **sempre** (mesmo se dificuldade &lt; 4) |
| Contraste | Crença falsa × lei — nunca só “Alternativa → Órgão” |

## Estrutura

```
content/questoes-reais/
  _ouro/                        # contrato aula nota 10 (Agent)
  _raw/                         # extração bruta do PDF (não seedar)
  {disciplina}/
    lote-001.json               # seedável
    _snippets/real-tec-*-completo-visual.json
```

## Fluxo

```bash
# 1. Extrair só PDFs SUPERIOR
python scripts/extrair-questoes-reais-superior.py --pdf "CTB - IDECAN - SUPERIOR - TEC.pdf"

# 2. Montar 1 questão + aula (prompt Agent)
#    .cursor/skills/examinador-idecan/prompt-questao-real-nova-conversa.txt  (troque Disciplina:)
#    Detalhes: prompt-questao-real-aula.md
#    Ouro: content/questoes-reais/_ouro/real-aula-nota-10.md

# 3. Validar (inclui validate:aula-real em path questoes-reais)
npm run validate:lote -- content/questoes-reais/legislacao_transito/lote-001.json

# 4. Seed só reais
npm run db:seed -- --only-reais
```

Legado (não usar em lote novo): `--legacy-aula-real` e/ou `--legacy-transferencia`.

Documentação global: `README.md` (raiz), `.cursor/skills/estudo-reverso-visual/DOCUMENTACAO.md` §7, `.cursor/skills/examinador-idecan/SKILL.md` § Pipeline no app.

## Separação das inéditas

- `npm run index:questoes` / `npm run proxima` leem **apenas** `content/questoes/`
- Seed de inéditas continua com gate lote-007
- Validadores: `meta.origem === "real_idecan"` relaxa **só** D1 (dificuldade mínima) e on-case C6
- Aula / transferência / contraste: **mesma barra** das inéditas (ou mais rígida via `validate:aula-real`)

## Lotes

| Arquivo | Disciplina | Qtd | Fonte PDF |
|---------|------------|-----|-----------|
| `direito_constitucional/lote-001.json` | Constitucional | 3 | `CONSTITUCIONAL - IDECAN - SUPERIOR - TEC.pdf`, `... 02.pdf` |
| `legislacao_transito/lote-001.json` | Trânsito | 5 | `CTB - IDECAN - SUPERIOR - TEC.pdf` |
| `legislacao_transito/lote-002.json` | Trânsito | 2 | `IDECAN - 2026 - IF Sudeste - MG - Professor - Transporte e Trânsito` |
| `legislacao_transito/lote-003.json` | Trânsito | 1 | `IDECAN - 2022 - PC-BA - Perito Médico Legista` |

## Fila retrofit aula nota 10

| Prioridade | tec_id | Status |
|------------|--------|--------|
| 1 | 447700 Polícia Civil / SNT | Ouro (referência) |
| 2 | 447703 CETRAN × CONTRAN | Retrofit nota 10 feito |
| 3 | 447705 Estado × Município | Ouro — 9 telas, lei2 art. 24, caso DETRAN-PB/STTP CG |
| 4 | 447710 art. 2º vias | Ouro — 9 telas, caso shopping CG, Crença×Lei |
| 5 | 482258 art. 1º assertivas | Ouro — 10 telas, lei+lei2, macete Near/Far |
| 6 | lote-002 / 003 / DC | Passam `validate:aula-real` (retrofit pedagógico profundo pendente) |
