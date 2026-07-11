---
disciplina: direito_administrativo
peso_prova: 5/60 questões · 10/100 pontos · 2 pts/questão
grupo: especificos
minimo_eliminacao: 2 pontos (1 acerto evita zero)
consumido_por: [examinador-idecan, professor-cadeia, estudo-reverso-visual]
corpus_base: 12 questões IDECAN (análise 2026-07-10) — AMOSTRA FRACA E ENVIESADA
cobertura_banco: 23 questões em content/questoes/direito_administrativo/ (atualizado 2026-07-10)
fonte_legal: conteúdo/legislação federal/cf-1988.html (arts. 37–41) + lei-9784-processo-administrativo.html + lei-14133-licitacoes.html
versao: 1.0
---

# Perfil vertical — Noções de Direito Administrativo

> Aprofundamento por disciplina. DNA transversal da banca: [perfil-banca.md](../perfil-banca.md).
> Microtópicos e itens do Anexo I: [conteudo-programatico.md](../conteudo-programatico.md) → `direito_administrativo`.
> Cobertura do banco: `content/questoes/_index/cobertura.json` (rodar `npm run index:questoes` antes de lotes).

## 1. Peso estratégico

| Métrica | Valor |
|---------|-------|
| Questões na prova | **5 de 60** (Específicos) |
| Pontos na prova | 10 de 100 (2,00 pt/acerto) |
| Mínimo eliminatório | 2 pts — 1 acerto evita zero |
| Cobertura no banco | **23 questões** (a disciplina mais madura fora de trânsito) |
| Tempo de estudo alvo | 8–10% da preparação |

**Regra de ROI:** peso 2x. O **Poder de Polícia** é a base jurídica da autuação de trânsito — eixo obrigatório. Banco já cobre bem os itens 2–7 do Anexo; priorizar aprofundamento e as lacunas (conceito/organização da Administração).

---

## 2. Perfil estatístico (corpus 12 questões IDECAN — usar com cautela)

Fonte: `.cursor/skills/examinador-idecan/scripts/corpus-idecan-stats.json` → `por_disciplina.direito_administrativo`.

> ⚠️ **Amostra pequena e enviesada:** as 12 questões reais são de concurso de Salvador (regime disciplinar municipal). Servem para **calibrar forma**, **não** para herdar o eixo temático. Para conteúdo, puxar de CF 37–41 + Lei 9.784/99 + Lei 14.133/2021.

| Dimensão | Valor medido | Regra de fabricação |
|----------|--------------|---------------------|
| Enunciado médio | **325 chars** (σ 77 — os mais curtos do corpus) | Caso curto: **250–450 chars** |
| Alternativa média | **96 chars** | Densas: **80–120 chars** |
| Sem comando explícito | 75,0% | Caso concreto direto |
| Assertivas (I, II, III…) | 16,7% | Frequente |
| INCORRETA | 8,3% | Negação mental |
| Gabaritos | amostra minúscula (não usar como regra) | Em lote A–D: **~25% por letra**, máx. 2 consecutivos |

---

## 3. Mecanismos de distrator — análogos administrativos

Distribuição medida (amostra 12 Q): `competencia_orgao` **12** (dominante) · `pode_deve` 5 · `excecao` 3.

| Slug | Tradução em administrativo | Onde vive |
|------|----------------------------|-----------|
| `competencia_snt` | Competência do órgão/agente; delegação e avocação | organização, atos, agentes |
| `termo_unico` | Vinculado↔discricionário; anulação↔revogação; concessão↔permissão | atos, poderes, serviços |
| `regra_excecao` | Exceção legal ("salvo", dispensa de licitação) | licitação, atos, responsabilidade |
| `numero_vizinho` | Prazo/percentual vizinho (prescrição, prazo recursal) | processo administrativo |

**Priorizar na fabricação:** `termo_unico` (vinculado↔discricionário é o par-rei) + `competencia_snt` + `regra_excecao`.

---

## 4. Sub-mecanismos específicos

### 4.1 Poderes administrativos — Poder de Polícia (eixo do cargo)

- Poder de polícia (limita direito em prol do interesse público) ↔ poder disciplinar ↔ hierárquico ↔ regulamentar (`termo_unico`).
- Atributos do poder de polícia: discricionariedade, autoexecutoriedade, coercibilidade.
- **A autuação de trânsito é exercício do poder de polícia** — cenário natural de caso prático STTP.
- **Arquétipo visual:** `comparacao` (Família A).

### 4.2 Atos administrativos

- Anulação (vício de legalidade, efeito ex tunc) ↔ revogação (conveniência, ex nunc) ↔ convalidação (`termo_unico`).
- Atributos: presunção de legitimidade, imperatividade, autoexecutoriedade, tipicidade.
- Vinculado ↔ discricionário.
- **Arquétipo visual:** `comparacao` (A) / `matriz_assertivas` (B).

### 4.3 Agentes públicos e responsabilidade

- Responsabilidade civil (objetiva do Estado, art. 37 §6º) ↔ penal ↔ administrativa (`termo_unico`).
- Ação ↔ omissão estatal.
- **Arquétipo visual:** `fluxograma_decisao` (A).

---

## 5. Pares confundíveis clássicos

| A | ↔ | B | Microtópico |
|---|---|---|-------------|
| Ato vinculado | ↔ | discricionário | poderes/atos |
| Anulação (ex tunc) | ↔ | revogação (ex nunc) | atos administrativos |
| Poder de polícia | ↔ | poder disciplinar ↔ hierárquico | poderes |
| Concessão | ↔ | permissão ↔ autorização | serviços públicos |
| Responsabilidade objetiva | ↔ | subjetiva | responsabilidade civil |
| Autarquia | ↔ | fundação ↔ empresa pública ↔ soc. economia mista | administração indireta |
| Cargo | ↔ | emprego ↔ função | agentes públicos |
| Princípio expresso (LIMPE) | ↔ | implícito | princípios |

---

## 6. Microtópicos — priorização P1→P5

Fonte Anexo I: `conteudo-programatico.md` § direito_administrativo.

| Prio | Item | Microtópico | Mecanismo dominante | Arquétipo visual |
|------|------|-------------|---------------------|------------------|
| **P1** | 4.5 | Poder de Polícia (base da autuação) | `termo_unico` | `comparacao` (A) |
| **P1** | 3.1–3.4 | Atos administrativos (atributos, anulação/revogação) | `termo_unico` | `comparacao` (A) |
| **P1** | 2.1–2.2 | Princípios (expressos art. 37 + implícitos) | `termo_unico` | `matriz_assertivas` (B) |
| **P2** | 4.1–4.4 | Poderes (vinculado/discricionário, hierárquico, disciplinar, regulamentar) | `termo_unico` | `comparacao` (A) |
| **P2** | 6.1–6.5 | Agentes públicos (cargo/emprego/função, responsabilidades) | `regra_excecao` | `matriz_assertivas` (B) |
| **P2** | 7.1–7.3 | Responsabilidade civil do Estado (objetiva, ação/omissão) | `termo_unico` | `fluxograma_decisao` (A) |
| **P3** | 5.1–5.3 | Serviços públicos (concessão/permissão/autorização) | `termo_unico` | `comparacao` (A) |
| **P3** | 1.2–1.3 | Administração direta e indireta (autarquias, fundações…) | `competencia_snt` | `diagrama_competencia` (C) |
| **P4** | 1.1 / 1.4 | Conceito, organização, regime jurídico-administrativo | conceitual | `texto_destaque` |

**Slugs de `topico` já usados no banco:** `dir_adm_2_1/2_2` (princípios) · `dir_adm_3_1..3_4` (atos) · `dir_adm_4_1..4_5` (poderes) · `dir_adm_5_1..5_3` (serviços) · `dir_adm_6_1..6_5` (agentes) · `dir_adm_7_2/7_3` (responsabilidade) · `dir_adm_1_3` (adm indireta).

---

## 7. Fontes por eixo

| Eixo | Fonte de verdade |
|------|------------------|
| Princípios / agentes / responsabilidade | `conteúdo/legislação federal/cf-1988.html` (arts. 37–41) |
| Processo / atos | `lei-9784-processo-administrativo.html` |
| Licitação / serviços | `lei-14133-licitacoes.html` |
| Improbidade (apoio) | `lei-8429-improbidade.html` |
| Referência no edital | `conteúdo/edital/` — Anexo I, Noções de Direito Administrativo |

`<cadeia_anti_alucinacao>`: transcrever redação literal (CF/leis); doutrina só com dispositivo citável.

---

## 8. Mapa arquétipo visual (estudo reverso)

Consultar [PADRAO-AULA-COMPLETA-v3.md](../../estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md).

| Sinal na questão | Arquétipo | Família |
|------------------|-----------|---------|
| Poder de polícia / atos / serviços (pares) | `comparacao` | A |
| Anulação × revogação; responsabilidade | `fluxograma_decisao` | A |
| Princípios / agentes (assertivas) | `matriz_assertivas` | B |
| Administração direta × indireta | `diagrama_competencia` | C |
| Qualquer questão | Tela `distratores` obrigatória (v2) | — |

---

## 9. Cobertura do banco × lacunas

Contagem em `content/questoes/direito_administrativo/lote-*.json` — **23 questões** (2026-07-10). Disciplina bem madura.

### Coberto (itens 2–7 do Anexo, boa distribuição)

Princípios (2.1, 2.2) · atos (3.1–3.4) · poderes (4.1–4.5, inclui poder de polícia) · serviços (5.1–5.3) · agentes (6.1–6.5) · responsabilidade civil (7.2, 7.3) · adm. indireta (1.3).

### Lacuna (0 questões — Anexo I exige cobertura)

Conceito/organização/finalidade da Administração (1.1) · administração direta e indireta — visão geral (1.2) · regime jurídico-administrativo (1.4) · responsabilidade civil — visão geral (7.1).

**Meta MVP** (skill examinador): Dir. Administrativo **50** questões.

---

## 10. Fila de geração por ROI

1. **Poder de polícia aplicado à STTP** (P1, eixo do cargo) — aprofundar mesmo já coberto.
2. **Atos: anulação × revogação × convalidação** (P1) — par crítico `termo_unico`.
3. **Conceito/organização da Administração + regime jurídico** (P4, lacuna) — fechar item 1.
4. **Responsabilidade civil — visão geral** (7.1, lacuna).
5. **Cuidado:** não herdar eixo "regime disciplinar municipal" do corpus real (viés Salvador).

---

## 11. Macetes de prova por eixo

| Eixo | Macete |
|------|--------|
| Poder de polícia | **Limita direito individual em prol do coletivo** — autuar no trânsito é poder de polícia |
| Atributos do ato | **PIA-T**: Presunção de legitimidade, Imperatividade, Autoexecutoriedade, Tipicidade |
| Anulação × revogação | **Anula por ilegalidade (ex tunc); revoga por conveniência (ex nunc)** |
| Responsabilidade | Estado responde **objetivamente** (art. 37 §6º); regresso contra o agente exige dolo/culpa |
| Delegação | **Concessão (licitação/contrato), permissão (precária), autorização (ato unilateral)** |

---

## 12. Anti-padrões (administrativo)

- Herdar o tema "regime disciplinar de Salvador" do corpus real (viés — não é o edital CG)
- Confundir anulação com revogação nos efeitos (ex tunc × ex nunc)
- Poder de polícia sem vínculo com a atuação da STTP (perde o cargo)
- Distrator de competência sem base em delegação/avocação real
- Citar Lei 8.666 (revogada) em vez da **Lei 14.133/2021**
- Doutrina sem dispositivo citável (`<cadeia_anti_alucinacao>`)

---

## Changelog

- **1.0** (2026-07-10) — Perfil inicial: corpus 12 Q (amostra fraca/enviesada — alerta explícito); envelope 250–450 / alt 80–120; foco Poder de Polícia (cargo); 9 microtópicos P1→P5; cobertura 23 Q (itens 2–7 cobertos, item 1 em lacuna); fila ROI; mapa visual Famílias A/B/C.
