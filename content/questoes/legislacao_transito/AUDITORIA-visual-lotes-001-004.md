# Auditoria de qualidade — estudo reverso visual

**Lotes:** `lote-001.json` (10Q) · `lote-004.json` (5Q)  
**Critérios:** Checklist Mayer · tabela de arquétipos · coerência questão↔visual  
**Padrão atual (v3):** `.cursor/skills/estudo-reverso-visual/DOCUMENTACAO.md` — distratores com slug IDECAN, coerência v1↔v2, gate 8/8, validador Zod.  
**Nota (2026-07-08):** `micro_recall` / Fixação ativa foi **removido do produto**. Menções a “recall” neste arquivo são históricas da auditoria anterior.  
**Escala:** 🟢 ouro · 🟡 revisar · 🔴 corrigir antes do seed

---

## Resumo executivo

| Lote | Média estimada | Destaques | Principal gap |
|------|----------------|-----------|---------------|
| **lote-001** | 🟢 88/100 | art. 219, art. 218 assertivas, art. 93 diagrama | — |
| **lote-004** | 🟢 92/100 | art. 218 caso, art. 252 § único, art. 181 V | — |

**Risco transversal:** Q5 cinto (lote-001) e Q3 cinto (lote-004) compartilham estrutura visual quase idêntica — aceitável se enunciados divergem, mas recall deveria diferenciar (medida vs sujeito passivo).

---

## lote-004 — questão a questão

### Q1 · CTB_conducao_embriaguez · art. 165-A · Gab. B · 🟢 88/100

| Tela | Status | Observação |
|------|--------|------------|
| 1 Contexto | 🟢 | Nomeia pegadinha (recusa autônoma). |
| 2 Fluxograma | 🟡 | Falta ramo "não" no n1; só caminho "sim". Para caso prático, ok, mas ideal 4º nó: "165 vs 165-A". |
| 3 Pegadinha | 🟢 | 2 linhas, contraste claro. |
| 4 Lei seca | 🟡 | Grifo `inicio: 95` pode não bater com texto encurtado — validar offsets no player. Falta grifo em "suspensão 12 meses". |
| 5 Macete | 🟢 | Alinhado ao comentário. |
| 6 Recall | 🟡 | Bom (165-A). **Falta `dica`**. Não testa penalidade (10x / 12 meses) — considerar 2º recall variante no reattempt SRS. |

**Ações:** adicionar `dica`; revisar `trechos_grifados`; opcional 4º nó fluxograma 165↔165-A.

---

### Q2 · CTB_infracoes · art. 218 · Gab. D · 🟢 95/100 — **referência de lote**

| Tela | Status | Observação |
|------|--------|------------|
| 1 Contexto | 🟢 | Ancora no caso (84/60 = 40%). Excelente. |
| 2 Tabela gradacao | 🟢 | Arquétipo correto para `pegadinha_percentual`. |
| 3 Cálculo do caso | 🟢 | Tela extra que liga caso→tabela. Modelo para outros casos práticos. |
| 4 Lei seca | 🟢 | Inciso II explícito. |
| 5 Macete | 🟢 | Repete fórmula com "40% = grave!". |
| 6 Recall | 🟢 | Pergunta fechada, resposta "grave" verificável. |

**Ações:** nenhuma obrigatória. Usar como template para novos casos de velocidade.

---

### Q3 · CTB_infracoes · art. 167 assertivas · Gab. A · 🟡 78/100

| Tela | Status | Observação |
|------|--------|------------|
| 1 Contexto | 🟢 | Foca sujeito passivo (pegadinha III). |
| 2 Medidas | 🟡 | `comparacao` ok, mas **tipo `assertivas` exige `matriz_assertivas`** na tela 2 (skill estudo-reverso-visual). |
| 3 Quem | 🟢 | Linha condutor vs passageiro — core da pegadinha. |
| 4 Lei seca | 🟢 | Grifos com motivo. |
| 5 Macete | 🟢 | |
| 6 Recall | 🟡 | "condutor ou passageiro" — resposta longa; aceitar "I e II" como variante reforçaria vínculo com assertivas. |

**Ações:** 🔴 substituir tela 2 por `matriz_assertivas` (I grave ✓, II retenção ✓, III só condutor ✗). Recall: incluir "I e II" / "A".

---

### Q4 · CTB_infracoes · art. 181 V · Gab. C (INCORRETA) · 🟢 85/100

| Tela | Status | Observação |
|------|--------|------------|
| 1 Contexto | 🟢 | Menciona pisca-alerta (distrator do enunciado). |
| 2 Classificação | 🟢 | |
| 3 Local | 🟢 | Contraste V vs VII (acostamento) — dual coding forte. |
| 4 Lei seca | 🟢 | |
| 5 Macete | 🟢 | |
| 6 Recall | 🟡 | Testa natureza, não inciso V nem comando INCORRETA. Sugestão: "Qual inciso do art. 181 — pista de rolamento em rodovia?" → `V` |

**Ações:** recall alternativo com inciso; tela 0 opcional "Comando: INCORRETA = achar a falsa".

---

### Q5 · CTB_circulacao_conduta · art. 252 § único · Gab. C · 🟢 92/100

| Tela | Status | Observação |
|------|--------|------------|
| 1 Contexto | 🟢 | VI vs § único — pegadinha pós-2016. |
| 2 Duas hipóteses | 🟢 | Melhor que snippet antigo do lote-001 Q8. |
| 3 Caso concreto | 🟢 | Liga enunciado (digitando) ao § único. |
| 4 Lei seca | 🟢 | § único com 2 grifos. |
| 5 Macete | 🟢 | |
| 6 Recall | 🟢 | |

**Ações:** atualizar **lote-001 Q8** para não contradizer (lote-001 cobra VI média; visual ok lá, mas cruzar-link no macete: "manusear → ver § único").

---

## lote-001 — questão a questão (síntese)

### Q1 · CTB_snt_competencias · art. 24 VI · 🟢 90/100
Fluxo PM vs municipal excelente. Recall por inciso VI — ouro.

### Q2 · CTB_sinalizacao · art. 90 · 🟢 85/100
Fluxograma 3 passos. Recall "90" — ok.

### Q3 · CTB_infracoes · art. 44-A · 🟢 88/100
Caso Epitácio Pessoa. Fluxograma + pegadinha. Recall "44-A" — ouro.

### Q4 · CTB_infracoes · art. 218 assertivas · 🟢 92/100
Tabela + matriz I–II–III. **Modelo para assertivas de gradação.**

### Q5 · CTB_infracoes · art. 167 · 🟡 80/100
Snippet reutilizado. Overlap com lote-004 Q3. Recall foca **medida** (retenção) — bom diferenciador.

### Q6 · CTB_infracoes · art. 181 I · 🟢 85/100
Esquina 5 m. Claro. Não confundir com Q4 lote-004 (181 V rodovia).

### Q7 · CTB_processo_administrativo · art. 280 · 🟡 75/100
Matriz assertivas ok. **Recall problemático:** resposta "sempre que possível" é frase longa — difícil digitar. Preferir recall fechado: "A assinatura no AIT é obrigatória ou facultativa?" → `facultativa` / `quando possível`.

### Q8 · CTB_circulacao_conduta · art. 252 VI · 🟡 72/100
Visual correto **para esta questão** (celular ao ouvido = média). **Desalinhamento pedagógico:** candidato que estuda só lote-001 não vê § único. Adicionar linha na tela 2: "Manusear celular → gravíssima (§ único)" como contraste.

### Q9 · CTB_infracoes · art. 219 · 🟢 98/100 — **referência absoluta (screenshots do app)**
Fluxograma 3 perguntas + pegadinha + lei + macete + recall artigo. **Padrão ouro do repositório.**

### Q10 · CTB_engenharia_fiscalizacao · art. 93 · 🟡 78/100
`lei_seca` com visual genérico. Falta diagrama competência (município ↔ órgão circunscrição ↔ CONTRAN). Recall: verificar se pergunta art. 93 específico.

---

## Matriz de arquétipos (aderência)

| Questão | tipo / estilo | Arquétipo usado | Arquétipo ideal |
|---------|---------------|-----------------|-----------------|
| lote-004 Q1 | caso / pode_deve | fluxograma | fluxograma ✓ |
| lote-004 Q2 | caso / percentual | tabela_gradacao | tabela_gradacao ✓ |
| lote-004 Q3 | assertivas | comparacao ×2 | **matriz_assertivas** 🔴 |
| lote-004 Q4 | caso / incorreta | comparacao | comparacao ✓ (+ nota INCORRETA) |
| lote-004 Q5 | caso / pode_deve | comparacao | comparacao ✓ |
| lote-001 Q4 | assertivas | tabela + matriz | ✓ ouro |
| lote-001 Q7 | assertivas | matriz | ✓ |
| lote-001 Q9 | caso | fluxograma | ✓ ouro |

---

## Duplicações e reuso de snippet

| Par | Risco | Recomendação |
|-----|-------|--------------|
| lote-001 Q5 ↔ lote-004 Q3 (cinto) | Médio | Manter 2 enunciados; diferenciar recall (Q5: retenção; Q3: I e II / sujeito) |
| lote-001 Q4 ↔ lote-004 Q2 (art. 218) | Baixo | Q4 assertivas vs Q2 caso — complementares |
| Snippet `celular-252` ↔ lote-004 Q5 | Alto no lote-001 | Atualizar snippet com linha § único |

---

## Prioridade de correção (antes do próximo seed)

1. ✅ **lote-004 Q3** — tela 2 → `matriz_assertivas`
2. ✅ **lote-001 Q7** — simplificar recall art. 280
3. ✅ **lote-001 Q8** — adicionar contraste § único na comparação
4. ✅ **lote-004 Q1** — `dica` no recall + revisar grifos lei (offsets 0–10, 90–100, 113–130, 133–153)
5. ✅ **lote-004 Q4** — recall inciso V + nota INCORRETA no contexto
6. ✅ **lote-001 Q10** — `diagrama_competencia` (município ↔ órgão da via ↔ CONTRAN)
7. ✅ Templates em `exemplos-ouro/`: `ctb-velocidade-219.json`, `ctb-velocidade-218-caso.json`
8. ✅ Snippet `art93-visual.json` atualizado com diagrama de competência

---

## Comandos de validação

```bash
npm run validate:estudo-reverso-visual -- content/questoes/legislacao_transito/lote-001.json
npm run validate:estudo-reverso-visual -- content/questoes/legislacao_transito/lote-004.json
npm run audit:estudo-reverso
```

Rubrica manual: pontuar cada questão ≥ 85 antes de `npm run db:seed`.
