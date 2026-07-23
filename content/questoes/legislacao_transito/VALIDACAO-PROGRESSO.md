# Validação Legislação de Trânsito — Progresso

**Meta MVP:** 360 questões | **Atual:** 265 questões em 240 lotes  
**Última auditoria:** 2026-07-19 — **240/240 passam schema + ouro** ✅

## Pipeline por lote

```bash
# Auditoria rápida (schema + ouro)
npm run audit:lt

# Gate completo (5 validadores)
npm run validate:lote -- content/questoes/legislacao_transito/lote-XXX.json
```

## Status atual

| Métrica | Valor |
|---------|-------|
| Lotes existentes | 240 (lote-002 e lote-166 ausentes) |
| Schema + ouro OK | **240/240** (`npm run audit:lt`) |
| validate:lote 5 gates | Em auditoria (`npm run audit:lt-full`) |
| Retrofits aplicados | grifos, editorial, indistinguibilidade, seed-blockers |

## Comandos

```bash
npm run audit:lt              # schema + ouro (~15s)
npm run audit:lt-full         # 5 gates completos (~1h)
npm run retrofit:lt-indistinguibilidade -- # dific≥4, estilo, eixos_mecanismo
npm run validate:lote -- content/questoes/legislacao_transito/lote-XXX.json
```

## Lotes legados multi-questão

`lote-001.json` (10Q) e `lote-004.json` (5Q) passam schema+ouro mas podem falhar em `validate:cobertura` / `validate:indistinguibilidade` no gate completo — candidatos a split em lotes 1Q.

## Próximos passos

1. `npm run index:questoes` — reindexar cobertura após mudanças
2. Gerar ~95 questões restantes para MVP 360
3. Criar lote-002 e lote-166 (lacunas numéricas)
4. `npm run db:seed` — popular Supabase
