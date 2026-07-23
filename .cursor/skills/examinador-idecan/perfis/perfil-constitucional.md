---
disciplina: direito_constitucional
peso_prova: 5/60 questões · 10/100 pontos · 2 pts/questão
grupo: especificos
minimo_eliminacao: 2 pontos (1 acerto evita zero)
consumido_por: [examinador-idecan, professor-cadeia, estudo-reverso-visual]
corpus_base: 538 questões IDECAN (análise 2026-07-10)
cobertura_banco: 16 questões em content/questoes/direito_constitucional/ (atualizado 2026-07-10)
fonte_legal: conteúdo/legislação federal/cf-1988.html
versao: 1.1
---

# Perfil vertical — Noções de Direito Constitucional

> Aprofundamento por disciplina. DNA transversal da banca: [perfil-banca.md](../perfil-banca.md).
> Microtópicos e itens do Anexo I: [conteudo-programatico.md](../conteudo-programatico.md) → `direito_constitucional`.
> Cobertura do banco: `content/questoes/_index/cobertura.json` (rodar `npm run index:questoes` antes de lotes).

## 1. Peso estratégico

| Métrica | Valor |
|---------|-------|
| Questões na prova | **5 de 60** (Específicos) |
| Pontos na prova | 10 de 100 (2,00 pt/acerto) |
| Mínimo eliminatório | 2 pts — 1 acerto evita zero |
| Cobertura no banco | **16 questões** (forte concentração em art. 144) |
| Tempo de estudo alvo | 8–10% da preparação |

**Regra de ROI:** peso 2x por acerto. O corpus é enorme (538 Q) e o edital amarra a disciplina à **segurança pública (art. 144)** — coração do cargo. Priorizar art. 144, art. 5º e art. 37; jurisprudência aparece no corpus, mas para agente priorizar **letra da CF**.

---

## 2. Perfil estatístico (corpus 538 questões IDECAN)

Fonte: `.cursor/skills/examinador-idecan/scripts/corpus-idecan-stats.json` → `por_disciplina.direito_constitucional`.

| Dimensão | Valor medido | Regra de fabricação |
|----------|--------------|---------------------|
| Enunciado médio | **459 chars** (σ 250) | Caso ou conceito: **300–550 chars** |
| Alternativa média | **100 chars** | Densas: **80–130 chars** |
| Sem comando explícito | 61,3% | Caso concreto direto |
| Comando `correta` | 19,0% | Usar comando explícito em ≥50% das inéditas (edital CG) |
| Assertivas (I, II, III…) | 13,2% | Frequente — 2º maior do corpus |
| INCORRETA | 5,9% | Negação mental de cada alternativa |
| Gabaritos (corpus 4–5 alt.) | D 127 · A 115 · C 111 · B 110 · E 75 | Em lote A–D: **~25% por letra**, máx. 2 consecutivos |

**Padrão IDECAN:** caso concreto (agente/servidor) + dispositivo da CF; assertivas sobre organização e competências são frequentes.

---

## 3. Mecanismos de distrator — análogos constitucionais

Distribuição medida: `competencia_orgao` **340** (dominante) · `excecao` 200 · `pode_deve` 176 · `prazo` 17 · `gravidade` 12 · `percentual` 6.

| Slug | Tradução em constitucional | Onde vive |
|------|----------------------------|-----------|
| `competencia_snt` | Competência entre entes (União/Estado/Município) e poderes; órgão do art. 144 | organização do Estado, segurança pública |
| `regra_excecao` | Exceção constitucional ("salvo", "exceto", direito não absoluto) | direitos fundamentais, remédios |
| `termo_unico` | Vinculado↔discricionário; nato↔naturalizado; garantia↔direito | art. 5º, nacionalidade, princípios |
| `numero_vizinho` | Idade/prazo/quórum vizinho (65↔70 anos, maioria simples↔absoluta) | direitos políticos, processo legislativo |

**Priorizar na fabricação:** `competencia_snt` (dominante) + `regra_excecao` — cobrem ~70% das pegadinhas medidas.

---

## 4. Sub-mecanismos específicos

### 4.1 `competencia_snt` — órgãos do art. 144 (eixo do cargo)

| Par confundível | Erro típico |
|-----------------|-------------|
| Guarda municipal ↔ PM ↔ Polícia Civil | quem faz o quê na segurança pública |
| PRF (rodovias federais) ↔ agente municipal de trânsito | competência territorial |
| Segurança viária (§10) ↔ segurança pública geral | inovação da EC 82/2014 |
| Subordinação a Governador ↔ Prefeito ↔ União | §6º do art. 144 |

**Arquétipo visual:** `diagrama_competencia` (Família C).

### 4.2 `regra_excecao` — direitos não absolutos

- Direito fundamental com exceção ("casa é asilo inviolável, **salvo**..."); devido processo legal.
- **Arquétipo visual:** `fluxograma_decisao` (Família A).

### 4.3 `numero_vizinho` — direitos políticos

- Idade de alistamento/elegibilidade; voto facultativo (16–18, >70); anterioridade eleitoral (1 ano).
- **Arquétipo visual:** `tabela_gradacao` (D) ou `linha_tempo`.

---

## 5. Pares confundíveis clássicos

| A | ↔ | B | Microtópico |
|---|---|---|-------------|
| Habeas corpus | ↔ | Habeas data ↔ Mandado de segurança ↔ MI | remédios constitucionais |
| Direitos individuais | ↔ | direitos sociais | art. 5º × art. 6º |
| Brasileiro nato | ↔ | naturalizado | nacionalidade |
| Competência da União | ↔ | Estados ↔ Municípios | organização do Estado |
| Guarda municipal | ↔ | Polícia Militar | art. 144 |
| Princípio expresso (LIMPE) | ↔ | implícito | art. 37 |
| Voto obrigatório | ↔ | facultativo | art. 14 |

---

## 6. Microtópicos — priorização P1→P5

Fonte Anexo I: `conteudo-programatico.md` § direito_constitucional.

| Prio | Item | Microtópico | Mecanismo dominante | Arquétipo visual |
|------|------|-------------|---------------------|------------------|
| **P1** | 7.1–7.3 | Segurança pública — art. 144 (órgãos, segurança viária) | `competencia_snt` | `diagrama_competencia` (C) |
| **P1** | 3.1 | Direitos individuais e coletivos (art. 5º) | `regra_excecao` | `fluxograma_decisao` (A) |
| **P1** | 6.2 | Administração pública — princípios (art. 37) | `termo_unico` | `matriz_assertivas` (B) |
| **P2** | 4.1–4.5 | Remédios constitucionais (HC, HD, MS, MI, ação popular) | `termo_unico` | `comparacao` (A) |
| **P2** | 5.1–5.4 | Organização do Estado e competências | `competencia_snt` | `diagrama_competencia` (C) |
| **P2** | 9.1–9.4 | Direitos aplicados à segurança pública (locomoção, devido processo, abuso) | `regra_excecao` | `fluxograma_decisao` (A) |
| **P3** | 3.4 | Direitos políticos (art. 14) | `numero_vizinho` | `tabela_gradacao` (D) |
| **P3** | 3.3 | Nacionalidade | `termo_unico` | `comparacao` (A) |
| **P4** | 1.1–1.3 | Teoria da Constituição | conceitual | `texto_destaque` |
| **P4** | 2.1–2.5 | Princípios fundamentais (arts. 1º–4º) | `termo_unico` | `matriz_assertivas` (B) |
| **P5** | 8.1 | Ordem social — base e objetivos | conceitual | `texto_destaque` |

**Slugs de `topico` já usados no banco:** vários `cf_art144_*` (órgãos, segurança viária, guardas municipais, polícia penal, PRF, polícia civil, subordinação) · `cf_art1_fundamentos` · `cf_art3_objetivos` · `cf_art14/15/16` (direitos políticos) · `cf_art18` · `cf_art37_principios` · `cf_remedios_hc_ms` · `cf_devido_processo`.

---

## 7. Fontes por eixo

| Eixo | Fonte de verdade |
|------|------------------|
| Toda a disciplina | `conteúdo/legislação federal/cf-1988.html` |
| Segurança pública | CF art. 144 (incluir §10 — segurança viária, EC 82/2014) |
| Referência no edital | `conteúdo/edital/` — Anexo I, Noções de Direito Constitucional |

`<cadeia_anti_alucinacao>`: transcrever a redação literal do artigo da CF; jurisprudência só se localizável e para o cargo, priorizando letra da lei.

---

## 8. Mapa arquétipo visual (estudo reverso)

Consultar [PADRAO-AULA-COMPLETA-v3.md](../../estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md).

| Sinal na questão | Arquétipo | Família |
|------------------|-----------|---------|
| Competência de órgão/ente (art. 144) | `diagrama_competencia` | C |
| Direito com exceção / devido processo | `fluxograma_decisao` | A |
| Remédios / nacionalidade | `comparacao` | A |
| Assertivas art. 37 / princípios | `matriz_assertivas` | B |
| Idades/prazos eleitorais | `tabela_gradacao` | D |
| Qualquer questão | Tela `distratores` obrigatória (v2) | — |

---

## 9. Cobertura do banco × lacunas

Contagem em `content/questoes/direito_constitucional/lote-*.json` — **16 questões** (2026-07-10).

### Saturado (evitar novo lote no mesmo eixo sem `index:questoes`)

| Eixo | Qtd |
|------|-----|
| `cf_art144_*` (segurança pública) | ~7 |

### Coberto, mas raso (1 questão)

Remédios (só HC/MS) · art. 37 princípios · art. 18 organização · art. 1º/3º fundamentos · art. 14/15/16 direitos políticos · devido processo legal.

### Lacuna (0 questões — Anexo I exige cobertura)

Art. 5º detalhado (incisos além do LV/LXVIII) · direitos sociais (art. 6º) · nacionalidade (art. 12) · remédios HD/MI/ação popular · organização do Estado/competências detalhada · teoria da Constituição · ordem social.

**Meta MVP** (skill examinador): Constitucional **50** questões.

---

## 10. Fila de geração por ROI

1. **Art. 5º — direitos individuais** (P1, lacuna): incisos-chave, `regra_excecao`.
2. **Remédios constitucionais completos** (P2): HD, MI, ação popular (só HC/MS coberto).
3. **Organização do Estado / competências** (P2): `diagrama_competencia`.
4. **Nacionalidade + direitos sociais** (P3, lacuna).
5. **Não priorizar:** mais questões só de art. 144 (já saturado — 7 no banco).

---

## 11. Macetes de prova por eixo

| Eixo | Macete |
|------|--------|
| Órgãos art. 144 | **PF, PRF, PFerroviária, Civis, Militares, Bombeiros, Penais + Guardas (§8)** — rol taxativo |
| Segurança viária | §10 do art. 144 (EC 82/2014) — competência dos **órgãos de trânsito** |
| Princípios art. 37 | **LIMPE** — Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiência |
| Voto | Facultativo: **16–18 anos, >70, analfabetos** |
| Remédios | HC (locomoção), HD (dados próprios), MS (direito líquido e certo), MI (falta de norma) |

---

## 12. Anti-padrões (constitucional)

- Cobrar jurisprudência de tribunal superior como gabarito único (priorizar letra da CF para o cargo)
- Confundir guarda municipal com polícia ostensiva sem base no §8 do art. 144
- Distrator de competência sem par plausível entre entes/órgãos
- Ignorar o §10 (segurança viária) — é o vínculo direto com o cargo
- Enunciado com direito fundamental como "absoluto" sem a exceção real
- Gerar mais art. 144 quando o banco já está saturado

---

## 13. Paridade IDECAN — coleta Tec Concursos

**Status:** 🟢 **Manutenção** — Corpus local **538 Q** é o maior do projeto; meta **80–120** amplamente superada.

| Métrica | Valor |
|---------|-------|
| Corpus local | **538** questões |
| Meta paridade (camada 1) | ✅ Atingida |
| Tec (referência) | `Direito Constitucional` + IDECAN |

**Quando reexportar:** art. **5º** (lacuna no banco) ou remédios HD/MI/ação popular se teste cego reprovar. Priorizar questões com **art. 144** apenas se precisar variar distratores — banco já saturado nesse eixo.

---

## Changelog

- **1.1** (2026-07-19) — §13 Paridade IDECAN: corpus OK; coleta opcional para lacunas art. 5º/remédios.
- **1.0** (2026-07-10) — Perfil inicial: corpus 538 Q IDECAN; envelope 300–550 / alt 80–130; `competencia_snt` dominante (340); foco art. 144 (cargo); 11 microtópicos P1→P5; cobertura 16 Q (art. 144 saturado, art. 5º/remédios em lacuna); fila ROI; mapa visual Famílias A/B/C/D.
