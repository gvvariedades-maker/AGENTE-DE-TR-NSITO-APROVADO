# Guia — Questões reais IDECAN + aula completa

> **Comece aqui.** Skills: **examinador-idecan v2.1** + **estudo-reverso-visual v3.4**.
> Paridade pedagógica com inéditas; diferença = enunciado fiel ao PDF + pasta `questoes-reais/`.

Versão **1.0** — alinhado a estudo-reverso v3.4 / examinador v2.1.

---

## 1. Decisão rápida

| Quero… | Vá para |
|--------|---------|
| **Gerar 1 questão agora** | [§2 Fluxo em 5 passos](#2-fluxo-em-5-passos) → [prompt-questao-real-nova-conversa.txt](../../.cursor/skills/examinador-idecan/prompt-questao-real-nova-conversa.txt) |
| Entender diferenças vs inédita | [prompt-questao-real-aula.md](../../.cursor/skills/examinador-idecan/prompt-questao-real-aula.md) § Diferenças |
| Montar a aula (telas, famílias A–D) | [PADRAO-AULA-COMPLETA-v3.md](../../.cursor/skills/estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md) |
| Ver exemplo nota 10 | [_ouro/real-aula-nota-10.md](./_ouro/real-aula-nota-10.md) · espelho `tec_id` **447700** |
| Validar antes do seed | [§5 Gates](#5-gates-6-em-questoes-reais) |
| Escolher próxima do PDF / fila | [§4 Curadoria](#4-curadoria) |
| Política e estrutura de pastas | [README.md](./README.md) |
| Validação técnica (Zod, CI) | [DOCUMENTACAO.md §7](../../.cursor/skills/estudo-reverso-visual/DOCUMENTACAO.md) |

---

## 2. Fluxo em 5 passos

```bash
# 1. Extrair (só PDFs com SUPERIOR no nome)
npm run extract:reais-superior -- --pdf "CTB - IDECAN - SUPERIOR - TEC.pdf"
# → content/questoes-reais/_raw/

# 2. Agent — abrir prompt, Ctrl+A, colar (modo Agent); trocar Disciplina:
#    .cursor/skills/examinador-idecan/prompt-questao-real-nova-conversa.txt

# 3. Gravar lote + snippet
#    content/questoes-reais/{disciplina}/lote-NNN.json
#    content/questoes-reais/{disciplina}/_snippets/real-tec-{tec_id}-completo-visual.json

# 4. Validar (6 gates automáticos em path questoes-reais/)
npm run validate:lote -- content/questoes-reais/legislacao_transito/lote-001.json

# 5. Seed só reais
npm run db:seed -- --only-reais
```

**Reportar ao final:** `tec_id`, gabarito, família A–D, fundamento, nº telas, checklist 12/12, gates OK, caminho do arquivo.

---

## 3. O que NÃO fazer

| Proibido | Por quê |
|----------|---------|
| `npm run proxima` | Só inéditas em `content/questoes/` |
| Gravar em `content/questoes/` | Pipeline paralelo |
| Forçar dificuldade ≥ 4 | Reais usam nível estrutural honesto (1–3) |
| Contraste só “Alternativa → Órgão” | Gate `validate:aula-real` exige **Crença ✗ × Lei ✓** |
| Fato verdadeiro na coluna ✗ do contraste | Anti-exemplo documentado em `_ouro/` |
| Commitar lotes sem pedido | Política do projeto |

---

## 4. Curadoria

### Mapa disciplina → PDF (prompt Passo 0)

| `Disciplina:` no prompt | PDFs em `conteúdo/questões reais/` |
|-------------------------|-------------------------------------|
| `legislacao_transito` | CTB, TRANSITO, Transporte e Trânsito |
| `direito_constitucional` | CONSTITUCIONAL |
| `direito_administrativo` | ADMINISTRATIVO |
| `legislacao_etica_sp` | ÉTICA, LAI, LGPD, SP |
| `portugues` | PORTUGUÊS |
| `informatica` | INFORMÁTICA |
| `historia_cg_pb` | HISTORIA, CAMPINA |

Só PDFs com **SUPERIOR** no nome. O Agent lista `tec_id` já montados e escolhe a 1ª questão do `_raw` ainda sem aula.

### Fila priorizada

| Local | Conteúdo |
|-------|----------|
| [_fila/direito_administrativo/tec-02-curadoria/](./_fila/direito_administrativo/tec-02-curadoria/README.md) | 24 questões gerais + 6 Poder Disciplinar — ver `selecionadas-*.json` |
| [README § Fila retrofit](./README.md#fila-retrofit-aula-nota-10) | Status ouro trânsito (`tec_id` 447700–482258) |

### Exemplos ouro (trânsito lote-001)

| `tec_id` | Tema | Família |
|----------|------|---------|
| **447700** | SNT — Polícia Civil fora art. 7º | C (referência canônica) |
| 447703 | CETRAN × CONTRAN | — |
| 447705 | Estado art. 22 × Município art. 24 | — |
| 447710 | art. 2º vias terrestres | — |
| 482258 | art. 1º assertivas | B |

Snippets: `legislacao_transito/_snippets/real-tec-{id}-completo-visual.json`

---

## 5. Gates (6 em `questoes-reais/`)

Acionados automaticamente por `validate:lote` quando o path contém `questoes-reais/` (`scripts/validate-lote.ts`).

| # | Gate | Inéditas | Reais |
|---|------|----------|-------|
| 1 | `validate:questoes` | ✓ | ✓ |
| 2 | `validate:cobertura` | ✓ | ✓ |
| 3 | `validate:indistinguibilidade` | ✓ | ✓ (D1/C6 relaxados) |
| 4 | `validate:estudo-reverso-visual` | ✓ | ✓ |
| 5 | `preview:grifos` | ✓ | ✓ |
| 6 | **`validate:aula-real`** | — | ✓ |

Critérios do 6º gate: [scripts/validate-aula-real.ts](../../scripts/validate-aula-real.ts) · resumo humano: [_ouro/real-aula-nota-10.md](./_ouro/real-aula-nota-10.md).

**Legado (não usar em lote novo):** `--legacy-aula-real` e/ou `--legacy-transferencia`.

### Checklist humano (antes do seed)

- [ ] Família A–D escolhida ([hub v3](../../.cursor/skills/estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md))
- [ ] Mayer **8/8** ([checklist-mayer.md](../../.cursor/skills/estudo-reverso-visual/checklist-mayer.md))
- [ ] Editorial **12/12** (#18 near/far, #19 E1–E3, #20 contraste, #21 sem “stem”)
- [ ] `validate:lote` OK (inclui `validate:aula-real`)
- [ ] Snippet `_snippets/real-tec-{tec_id}-completo-visual.json` atualizado

---

## 6. Questão (`real_idecan`)

| Campo / regra | Valor |
|---------------|-------|
| Enunciado | Fiel ao PDF; limpar cabeçalho Tec |
| `meta.origem` | `"real_idecan"` |
| `meta.nivel_escolaridade` | `"superior"` |
| `meta.tec_id`, `meta.fonte_arquivo` | Obrigatórios |
| Tags | `real_idecan`, `superior` |
| Dificuldade | Honesta (1–3); **não** forçar mínimo 4 |
| Comentário | Professor Elite + `cadeia_anti_alucinacao` |
| Meta pedagógica | `padrao_familia`, `isca_por_alternativa`, `near_transfer`, `far_transfer`, `o_que_nao_muda`, `eficacia_pos_aula: ["E1","E2","E3"]` — **sempre**, mesmo se dificuldade &lt; 4 |

Contrato completo: [prompt-questao-real-aula.md](../../.cursor/skills/examinador-idecan/prompt-questao-real-aula.md).

---

## 7. Aula v3.4 (compartilhada com inéditas)

| Item | Regra |
|------|-------|
| Campo JSON | `estudo_reverso_visual_completo` com `"versao": 2` |
| Telas | 7–11 |
| Hub pedagógico | [PADRAO-AULA-COMPLETA-v3.md](../../.cursor/skills/estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md) |
| Famílias | [familias/](../../.cursor/skills/estudo-reverso-visual/exemplos-ouro/familias/) |
| v1 expressa | Recomendada (`estudo_reverso_visual`); não bloqueia seed |

**Núcleo 7 telas:** `contexto → [arquétipo] → contraste → distratores → caso → trecho_legal → macete`

| Tela | Contrato resumido |
|------|-------------------|
| `contexto` | Gabarito + isca por errada — **sem** slug |
| `contraste` | Crença ✗ × Lei ✓ — só crença **falsa** à esquerda |
| `distratores` | `LETRA — slug` = `passo_a_passo[1]` |
| `caso` | Substantivos do enunciado; título sem “stem” |
| `trecho_legal` | Literal de `conteúdo/` + `texto_grifado` |
| `macete` | Regra + Near + Far + Não muda (eco de `meta`) |

Skill operacional: [estudo-reverso-visual/SKILL.md](../../.cursor/skills/estudo-reverso-visual/SKILL.md).

---

## 8. Diferenças vs inéditas (resumo)

| | Inédita | Real superior |
|--|---------|---------------|
| Pasta | `content/questoes/` | `content/questoes-reais/` |
| Enunciado | Gerado | Extraído do PDF |
| `npm run proxima` | Sim | Não |
| Dificuldade mínima 4 | Sim | Não |
| `meta.origem` | ausente | `real_idecan` |
| Indistinguibilidade D1/C6 | rigoroso | relaxado |
| Aula / transferência / E1–E3 | nível 4+ | **sempre** |
| Gate extra | — | `validate:aula-real` |

---

## 9. Documentação compartilhada (não duplicar aqui)

| Recurso | Caminho |
|---------|---------|
| Examinador IDECAN | [examinador-idecan/SKILL.md](../../.cursor/skills/examinador-idecan/SKILL.md) |
| Schema JSON questão | [.cursor/rules/02-questoes-idecan.mdc](../../.cursor/rules/02-questoes-idecan.mdc) |
| Motor pedagógico (player, FSRS) | [.cursor/rules/03-estudo-reverso.mdc](../../.cursor/rules/03-estudo-reverso.mdc) |
| Seed e conteúdo | [.cursor/rules/07-conteudo-seed.mdc](../../.cursor/rules/07-conteudo-seed.mdc) |
| PDFs fonte | `conteúdo/questões reais/` · índice em `conteúdo/FONTES.md` |
| Inéditas (pipeline paralelo) | [prompt-questao-aula-completa.md](../../.cursor/skills/examinador-idecan/prompt-questao-aula-completa.md) |

---

## Changelog

| Data | Versão | Nota |
|------|--------|------|
| 2026-07-22 | 1.0 | Hub único criado — roteador para prompt, ouro, hub v3.4 e gates |
