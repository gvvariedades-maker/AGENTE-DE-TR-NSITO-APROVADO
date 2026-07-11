---
disciplina: legislacao_etica_sp
peso_prova: 4/60 questões · 4/100 pontos · 1 pt/questão
grupo: gerais
minimo_eliminacao: 1 ponto (1 acerto evita zero) — RISCO DE ZERAR
consumido_por: [examinador-idecan, professor-cadeia, estudo-reverso-visual]
corpus_base: 62 questões IDECAN (análise 2026-07-10) — LGPD domina; ética pura só 8 Q
cobertura_banco: 10 questões em content/questoes/legislacao_etica_sp/ (atualizado 2026-07-10)
fonte_legal: conteúdo/municipal/lei-organica-campina-grande.txt + legislação federal/lei-13709-lgpd.html + lei-12527-lai.html + cf-1988.html (art. 37)
versao: 1.0
---

# Perfil vertical — Legislação e Ética no Serviço Público

> Aprofundamento por disciplina. DNA transversal da banca: [perfil-banca.md](../perfil-banca.md).
> Microtópicos e itens do Anexo I: [conteudo-programatico.md](../conteudo-programatico.md) → `legislacao_etica_sp`.
> Cobertura do banco: `content/questoes/_index/cobertura.json` (rodar `npm run index:questoes` antes de lotes).

## 1. Peso estratégico

| Métrica | Valor |
|---------|-------|
| Questões na prova | **4 de 60** |
| Pontos na prova | 4 de 100 (1,00 pt/acerto) |
| Mínimo eliminatório | 1 ponto — **zerar elimina** |
| Cobertura no banco | **10 questões** (todas em Lei Orgânica Municipal) |
| Tempo de estudo alvo | 6–8% da preparação |

**Regra de ROI:** só 4 questões e risco de zerar. **Desbalanceamento crítico:** o banco cobre 100% Lei Orgânica de CG e 0% LGPD/LAI/ética — mas o corpus IDECAN é dominado por LGPD. Priorizar geração de **LGPD, LAI e princípios éticos** para equilibrar.

---

## 2. Perfil estatístico (corpus 62 questões IDECAN)

Fonte: `.cursor/skills/examinador-idecan/scripts/corpus-idecan-stats.json` → `por_disciplina.legislacao_etica_sp`.

> Composição do corpus: **54 Q de LGPD** + **8 Q de ética pura**. Forma medida abaixo reflete majoritariamente LGPD.

| Dimensão | Valor medido | Regra de fabricação |
|----------|--------------|---------------------|
| Enunciado médio | **384 chars** (σ 199) | Caso prático: **300–500 chars** |
| Alternativa média | **118 chars** (densas) | **90–130 chars** |
| Sem comando explícito | 64,5% | Caso concreto direto |
| Comando `correta` | 30,6% | Usar comando explícito em ≥50% das inéditas |
| Assertivas (I, II, III…) | 4,8% | Menos frequente |
| Gabaritos (corpus 4–5 alt.) | B 16 · E 15 · A 14 · D 10 · C 7 | Em lote A–D: **~25% por letra**, máx. 2 consecutivos |

---

## 3. Mecanismos de distrator — análogos ético-legais

Distribuição medida: `excecao` 21 · `pode_deve` 18 · `competencia_orgao` 7 · `percentual` 2.

| Slug | Tradução em ética/legislação | Onde vive |
|------|------------------------------|-----------|
| `regra_excecao` | Exceção da LGPD/LAI (sigilo × publicidade; hipótese de tratamento) | LGPD, LAI |
| `termo_unico` | Dever↔faculdade do servidor; controlador↔operador (LGPD) | ética, LGPD |
| `competencia_snt` | Competência do órgão sancionador (ANPD) / autoridade | LGPD, LAI |
| `numero_vizinho` | Prazo/percentual da sanção | LGPD (arts. 52–54) |

**Priorizar na fabricação:** `regra_excecao` + `termo_unico`.

---

## 4. Sub-mecanismos específicos

### 4.1 LGPD (Lei 13.709/2018) — eixo mais cobrado no corpus

- Controlador ↔ operador ↔ encarregado (`termo_unico`).
- Hipóteses de tratamento (art. 7º) e transferência internacional (arts. 33–36); sanções (arts. 52–54).
- **Arquétipo visual:** `comparacao` (A) / `matriz_assertivas` (B).

### 4.2 LAI (Lei 12.527/2011)

- Regra da publicidade × exceção do sigilo; prazos de classificação (reservado/secreto/ultrassecreto).
- **Arquétipo visual:** `tabela_gradacao` (D).

### 4.3 Ética no serviço público / princípios (art. 37)

- Conduta, decoro, conflito de interesses; LIMPE aplicado a caso concreto.
- **Arquétipo visual:** `matriz_assertivas` (B).

### 4.4 Lei Orgânica de Campina Grande (específico do edital)

- Organização municipal, competências, servidores; **sem corpus IDECAN** — validar contra o texto municipal.
- **Arquétipo visual:** `diagrama_competencia` (C).

---

## 5. Pares confundíveis clássicos

| A | ↔ | B | Microtópico |
|---|---|---|-------------|
| Controlador | ↔ | operador ↔ encarregado | LGPD |
| Publicidade (regra) | ↔ | sigilo (exceção) | LAI |
| Reservado | ↔ | secreto ↔ ultrassecreto | LAI (classificação) |
| Dever do servidor | ↔ | faculdade | ética |
| Moralidade | ↔ | legalidade ↔ impessoalidade | princípios (LIMPE) |
| Dado pessoal | ↔ | dado pessoal sensível | LGPD |

---

## 6. Microtópicos — priorização P1→P5

Fonte Anexo I: `conteudo-programatico.md` § legislacao_etica_sp.

| Prio | Item | Microtópico | Mecanismo dominante | Arquétipo visual |
|------|------|-------------|---------------------|------------------|
| **P1** | 1.2 | LGPD (Lei 13.709/2018) | `regra_excecao` + `termo_unico` | `comparacao` (A) |
| **P1** | 1.1 | Lei Orgânica do Município de CG | `competencia_snt` | `diagrama_competencia` (C) |
| **P1** | 1.3 | LAI (Lei 12.527/2011) | `regra_excecao` | `tabela_gradacao` (D) |
| **P2** | 3.1–3.2 | Princípios da Adm. aplicados à ética (art. 37) | `termo_unico` | `matriz_assertivas` (B) |
| **P2** | 2.1–2.5 | Ética, moral, decoro, zelo, cidadania | conceitual | `texto_destaque` |

**Slug de `topico` no banco:** todas as 10 questões estão em `etica_sp_1_1` (Lei Orgânica — `LOM_art*`).

---

## 7. Fontes por eixo

| Eixo | Fonte de verdade |
|------|------------------|
| Lei Orgânica CG | `conteúdo/municipal/lei-organica-campina-grande.txt` |
| LGPD | `conteúdo/legislação federal/lei-13709-lgpd.html` |
| LAI | `conteúdo/legislação federal/lei-12527-lai.html` |
| Princípios / ética | `cf-1988.html` (art. 37) |
| Referência no edital | `conteúdo/edital/` — Anexo I, Legislação e Ética no Serviço Público |

---

## 8. Mapa arquétipo visual (estudo reverso)

Consultar [PADRAO-AULA-COMPLETA-v3.md](../../estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md).

| Sinal na questão | Arquétipo | Família |
|------------------|-----------|---------|
| LGPD (agentes, hipóteses) | `comparacao` | A |
| LAI (classificação de sigilo) | `tabela_gradacao` | D |
| Lei Orgânica (competências) | `diagrama_competencia` | C |
| Princípios/ética (assertivas) | `matriz_assertivas` | B |
| Qualquer questão | Tela `distratores` obrigatória (v2) | — |

---

## 9. Cobertura do banco × lacunas

Contagem em `content/questoes/legislacao_etica_sp/lote-*.json` — **10 questões** (2026-07-10).

### Saturado (evitar novo lote no mesmo eixo sem `index:questoes`)

| Eixo | Qtd |
|------|-----|
| Lei Orgânica de CG (`etica_sp_1_1` / `LOM_art*`) | **10 (100%)** |

### Lacuna (0 questões — Anexo I exige, e é o forte do corpus IDECAN)

**LGPD** (arts. 7º, 33–36, 52–54) · **LAI** (publicidade/sigilo, prazos) · **ética/princípios** (decoro, conflito de interesses, LIMPE aplicado).

**Meta MVP** (skill examinador): Ética SP **40** questões.

---

## 10. Fila de geração por ROI

1. **LGPD** (P1, lacuna total, forte do corpus): agentes, hipóteses de tratamento, sanções.
2. **LAI** (P1, lacuna): regra × exceção, classificação de sigilo.
3. **Princípios éticos / conduta do servidor** (P2, lacuna).
4. **Manter** cobertura de Lei Orgânica (já saturada — não gerar mais sem eixo novo).

---

## 11. Macetes de prova por eixo

| Eixo | Macete |
|------|--------|
| LGPD agentes | **Controlador decide; operador executa; encarregado é o canal (DPO)** |
| LGPD dado sensível | Origem racial, saúde, biometria, opinião política, religião — proteção reforçada |
| LAI | **Publicidade é a regra; sigilo é a exceção** (arts. 5º/LX CF + Lei 12.527) |
| Sigilo LAI | Reservado (5 anos) · Secreto (15) · Ultrassecreto (25) |
| Ética | **LIMPE** aplicado: moralidade = padrão ético além da mera legalidade |

---

## 12. Anti-padrões (ética/legislação SP)

- Gerar mais Lei Orgânica quando o banco já está 100% nela (lacuna real é LGPD/LAI)
- Confundir controlador com operador (LGPD)
- Tratar sigilo como regra na LAI (a regra é publicidade)
- Citar prazo de classificação sem passar pela `<cadeia_anti_alucinacao>`
- Questão de "ética" genérica sem dispositivo/princípio citável
- Ignorar a Lei Orgânica de CG em novos eixos (é diferencial do edital, mas já coberta — equilibrar)

---

## Changelog

- **1.0** (2026-07-10) — Perfil inicial: corpus 62 Q (LGPD 54 + ética 8); envelope 300–500 / alt 90–130; alerta de desbalanceamento (banco 100% Lei Orgânica × lacuna total LGPD/LAI); 5 microtópicos P1→P2; fila ROI priorizando LGPD/LAI; mapa visual Famílias A/B/C/D.
