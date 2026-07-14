# Ouro — Aula nota 10 em questão REAL

Contrato para o Agent: **paridade pedagógica com inéditas**.  
Enunciado permanece fiel ao PDF; a aula não pode ser MVP que só passa no schema.

## Espelho canônico (referência)

| Campo | Valor |
|-------|--------|
| `tec_id` | `447700` |
| Tema | SNT — Polícia Civil **fora** do art. 7º |
| Lote | `content/questoes-reais/legislacao_transito/lote-001.json` |
| Snippet | `_snippets/real-tec-447700-completo-visual.json` |
| Família | C (`PADRAO-C-competencia-snt.md`) |

## Exemplos ouro no acervo (lote-001 trânsito)

| `tec_id` | Tema | Telas | Destaque pedagógico |
|----------|------|-------|---------------------|
| **447700** | SNT — Polícia Civil fora art. 7º | 8 | Família C; diagrama com nó FORA; referência canônica |
| **447703** | CETRAN × CONTRAN (art. 14) | 8 | Contraste crença × lei; recurso JARI |
| **447705** | Estado art. 22 × Município art. 24 | 9 | Caso DETRAN-PB / STTP CG; **lei2** art. 24 III/X/XVIII |
| **447710** | art. 2º vias terrestres | 9 | Caso shopping Campina Grande; coletivo × individual |
| **482258** | art. 1º assertivas | 10 | lei + lei2; macete Near/Far/Não muda |

Snippets: `content/questoes-reais/legislacao_transito/_snippets/real-tec-{id}-completo-visual.json`

## Roteiro mínimo (8 telas)

1. **Diagnóstico** — gabarito + isca A/C/D (sem slug)
2. **Glossário** — nomes que a banca mistura
3. **Diagrama** — quem compõe + nó **FORA** quando couber
4. **Contraste** — `Crença ✗` × `Lei ✓` (só crença falsa)
5. **Distratores** — `LETRA — slug` + por quê
6. **Caso** — “Aplicando ao enunciado” / filtro EXCETO ou CORRETA
7. **Lei** — literal + grifo com `texto_grifado`
8. **Macete** — regra + Near + Far + Não muda

Pode estender até **11 telas** (lei2, fechamento, glossário extra).

## Gate `validate:aula-real` (automático em `validate:lote`)

Roda só em `content/questoes-reais/` para `meta.origem === "real_idecan"`. Implementação: `scripts/validate-aula-real.ts`.

| Verificação | Critério |
|-------------|----------|
| Telas | `estudo_reverso_visual_completo`: **7–11** telas |
| Contraste | Tela `comparacao` com colunas **Crença ✗ × Lei ✓** (não “Alternativa → Órgão”) |
| Macete | Texto com **Near**, **Far** e **Não muda** |
| Títulos | Proibido jargão **“stem”** |
| Meta | `padrao_familia`, `isca_por_alternativa`, `eficacia_pos_aula: ["E1","E2","E3"]` |

Legado (não usar em lote novo): `--legacy-aula-real`.

## Aceita

- Contraste: “Polícia Civil compõe o SNT” → “Civil não consta no art. 7º”
- Caso com letras do enunciado e resultado explícito
- Meta `near_transfer` / `far_transfer` / `o_que_nao_muda` + eco no macete
- `eficacia_pos_aula: ["E1","E2","E3"]`

## Reprova (anti-exemplos)

| Anti-exemplo | Por quê |
|--------------|---------|
| Contraste “Criar Câmaras → CONTRAN” como única tabela | É lista de atribuições, não crença × lei |
| Diagnóstico que já resolve A/B/D com mecanismo | Mistura contexto e distratores |
| Caso sem fatos do enunciado | Tela colável em outra Q |
| Macete só mnemônico sem Near/Far | Falha #18 / transferência |
| Título com “stem” | Falha #21 / gate Zod |
| Fato verdadeiro na coluna ✗ | Falha #20 / `validarContrastePedagogico` |

## Checklist Agent (antes de seed)

- [ ] Família A–D escolhida (hub v3)
- [ ] Mayer 8/8
- [ ] Editorial 12/12 (#18–#21)
- [ ] `validate:lote` (inclui `validate:aula-real`) OK
- [ ] Snippet `_snippets/real-tec-{id}-completo-visual.json` atualizado

## Links

- README pipeline: `content/questoes-reais/README.md`
- Hub: `.cursor/skills/estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md`
- Prompt: `.cursor/skills/examinador-idecan/prompt-questao-real-aula.md`
- Família C: `.cursor/skills/estudo-reverso-visual/exemplos-ouro/familias/PADRAO-C-competencia-snt.md`
