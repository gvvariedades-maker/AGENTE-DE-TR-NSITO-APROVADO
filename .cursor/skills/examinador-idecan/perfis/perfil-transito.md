---
disciplina: legislacao_transito
peso_prova: 30/60 questões (50%) · 60/100 pontos · 2 pts/questão
grupo: especificos
minimo_eliminacao: 2 pontos (1 acerto)
consumido_por: [examinador-idecan, professor-cadeia, estudo-reverso-visual]
corpus_base: 168 questões IDECAN (análise 2026-07-10)
cobertura_banco: 105 questões em content/questoes/legislacao_transito/ (atualizado 2026-07-10)
fonte_legal: conteúdo/legislação federal/lei-9503-ctb.html + conteúdo/resoluções CONTRAN/ + conteúdo/senatran/
prevalece: Retificação 01/2026 do Anexo I
versao: 1.2
---

# Perfil vertical — Legislação de Trânsito

> Aprofundamento por disciplina. DNA transversal da banca: [perfil-banca.md](../perfil-banca.md).
> Microtópicos e fontes legais: [conteudo-programatico.md](../conteudo-programatico.md) → `legislacao_transito`.
> Cobertura do banco: `content/questoes/_index/cobertura.json` (rodar `npm run index:questoes` antes de lotes).

## 1. Peso estratégico

| Métrica | Valor |
|---------|-------|
| Questões na prova | **30 de 60** (50% em contagem) |
| Pontos na prova | **60 de 100** (60% em pontos) |
| Peso por acerto | 2,00 pts (Específicos) |
| Mínimo eliminatório | 2 pts — 1 acerto evita zero; o risco real é perder pontos de classificação |
| Tempo de estudo alvo | 50–55% do tempo total de preparação |

**Regra de ROI:** toda hora investida aqui vale o dobro das disciplinas gerais. Priorizar microtópicos P1 com lacuna no banco antes de gerar mais variações de `CTB_circulacao_conduta`.

---

## 2. Perfil estatístico (corpus 168 questões IDECAN)

Fonte: `.cursor/skills/examinador-idecan/scripts/corpus-idecan-stats.json` → `por_disciplina.legislacao_transito`.

| Dimensão | Valor medido | Regra de fabricação |
|----------|--------------|---------------------|
| Enunciado médio | **404 chars** (σ 205) | Caso prático STTP/BM/PRF: **250–500 chars** |
| Alternativa média | **121 chars** (maior de todas as disciplinas) | Alternativas densas; pegadinha no texto legal parafraseado |
| Comando explícito | **~39%** (61,3% sem comando) | Usar comando explícito em **≥50%** das inéditas (edital CG) |
| CORRETA explícita | 23,8% | Comando dominante quando explícito |
| INCORRETA | 4,2% | Rara — exige negação mental de cada alternativa |
| Assertivas (I, II, III…) | 10,1% | Frequente em veículos, SNT, disposições preliminares |
| Gabaritos (corpus 4–5 alt.) | A 50 · B 39 · C 36 · D 33 · E 10 | Em lote A–D: **~25% por letra**, máx. 2 consecutivos |

**Padrão de enunciado IDECAN em trânsito:** caso concreto de fiscalização (agente municipal, PRF, BM) + dispositivo legal no cabeçalho temático. Não repetir "assinale a alternativa" em 100% das questões — o corpus real é majoritariamente situacional.

---

## 3. Mecanismos de distrator — frequência REAL em trânsito

Slugs obrigatórios (skill `examinador-idecan`). Em trânsito, a distribuição medida difere do global:

| Slug | Ocorrências (168 Q) | Peso | Onde vive |
|------|---------------------|------|-----------|
| `competencia_snt` | **68** | 🔴 dominante | SNT — quem normatiza, autua, julga recurso |
| `termo_unico` (pode/deve) | **68** | 🔴 dominante | Verbo de obrigação/faculdade no texto legal |
| `regra_excecao` | **64** | 🔴 dominante | salvo / somente / sempre / vedado |
| `gravidade` | **39** | 🟠 pico vs outras disciplinas | leve / média / grave / gravíssima + efeitos |
| `numero_vizinho` (prazo) | 6 | 🟡 baixa contagem, alto impacto | prazos processuais |
| `numero_vizinho` (percentual) | 2 | 🟡 raro | multiplicador de multa, % sobre limite |

**Priorizar na fabricação:** `competencia_snt` + `termo_unico` + `regra_excecao` + `gravidade` — cobrem ~95% das pegadinhas medidas em trânsito.

**Mix de dificuldade:** simulado espelho ~20% 1–2 | ~50% 3 | ~30% 4–5 (`perfil-banca.md`). **Banco de treino:** mínimo **4** (ver `dificuldade-banco.ts`).

---

## 4. Sub-mecanismos específicos (extensão dos 5 genéricos)

> Números exatos (prazos, pontos, multas, multiplicadores) **não** ficam fixos neste perfil — passar pela `<cadeia_anti_alucinacao>` contra `conteúdo/` na fabricação.

### 4.1 `gravidade` — primeira classe em trânsito

Sub-tipos de distrator:

| Sub-tipo | Par confundível típico |
|----------|------------------------|
| Gravidade ↔ gravidade vizinha | grave ↔ gravíssima (par crítico IDECAN) |
| Gravidade ↔ pontos na CNH | 3 / 4 / 5 / 7 pontos [verificar art. 259] |
| Gravidade ↔ valor-base da multa | faixas do Anexo I CTB [verificar] |
| Gravidade ↔ medida administrativa | retenção ↔ remoção ↔ recolhimento de documento |
| Gravidade ↔ multiplicador | ×2, ×3, ×5, ×10, ×20 [verificar dispositivo] |

**Arquétipo visual:** `tabela_gradacao` (Família D) — ver §8.

### 4.2 `competencia_snt` — o par define a questão

| Par confundível | Erro típico do candidato |
|-----------------|--------------------------|
| CONTRAN ↔ CETRAN | normatizar ↔ julgar recurso de 2ª instância |
| CONTRAN ↔ CONTRANDIFE | competência normativa federal |
| STTP (municipal) ↔ DETRAN ↔ SENATRAN | executivo local ↔ estadual ↔ federal |
| Agente municipal ↔ PRF ↔ PM | quem autua em qual hipótese |
| Autuar ↔ julgar recurso ↔ normatizar | três funções distintas no mesmo caso |

**Arquétipo visual:** `diagrama_competencia` (Família C).

**Contexto Campina Grande:** STTP = órgão executivo municipal de trânsito — cenário natural de caso prático.

### 4.3 `regra_excecao` em trânsito

| Tema | Armadilha |
|------|-----------|
| Recusa ao teste | Infração **autônoma** → **art. 165-A** CTB. **Nunca** o revogado §3º do art. 165 como fundamento vigente |
| Poder do agente | "poderá" (discricionário) ↔ "deverá" (vinculado) |
| Equipamento | obrigatório ↔ facultativo por tipo/categoria de veículo |
| Infração ↔ crime | consequência administrativa ↔ tipificação penal (CP art. 306 etc.) |

**Arquétipo visual:** `fluxograma_decisao` (Família A) para recusa/alcoolemia.

### 4.4 `termo_unico` (pode/deve) em trânsito

| Troca típica | Exemplo de eixo |
|--------------|-----------------|
| pode ↔ deve | circulação, estacionamento, conversão |
| facultativo ↔ obrigatório | equipamento, documento, sinalização |
| objetivamente ↔ subjetivamente | conduta do condutor |
| infração administrativa ↔ crime | mesmo fato, regimes distintos |

**Arquétipo visual:** `comparacao` (Família A) — colunas "permissão" vs "obrigação".

### 4.5 `numero_vizinho` — prazos e percentuais

**Prazos processuais** (alto impacto, baixa contagem no corpus — subcobrado no banco):

| Etapa | Confusão típica |
|-------|-----------------|
| Defesa prévia | prazo ↔ recurso 1ª instância (JARI) |
| Recurso 1ª ↔ 2ª instância | CETRAN |
| Notificação de autuação ↔ de penalidade | prazos distintos [verificar arts. 281, 282] |
| Dias corridos ↔ dias úteis | em todo o processo administrativo |

**Percentuais / velocidade:** % sobre limite (20% / 50%) — arts. 218–220; `pegadinha_percentual`.

**Arquétipo visual:** `linha_tempo` (processo) ou `tabela_gradacao` (velocidade).

---

## 5. Pares confundíveis clássicos

Fonte para distrator + tela `comparacao` no estudo reverso:

| A | ↔ | B | Microtópico |
|---|---|---|-------------|
| Infração administrativa | ↔ | Crime de trânsito | `CTB_infracoes` × `CTB_crimes_transito` |
| Autuação | ↔ | Apreensão / remoção / retenção | `CTB_processo_administrativo` |
| Retenção do veículo | ↔ | Remoção | ↔ | Recolhimento do documento | `CTB_penalidades` |
| Suspensão do direito de dirigir | ↔ | Cassação da CNH | `CTB_penalidades` |
| Advertência por escrito | ↔ | Multa | `CTB_penalidades` |
| CONTRAN normatiza | ↔ | CETRAN julga recurso | `CTB_snt_competencias` |
| Agente **pode** | ↔ | Agente **deve** | `CTB_circulacao_conduta` / fiscalização |
| Recusa (165-A) | ↔ | Embriaguez comprovada (165) | ↔ | Crime (306 CP) | alcoolemia |
| Sinalização vertical | ↔ | Semáforo | ↔ | Gestos do agente | `CTB_sinalizacao` (ordem de prevalência) |
| DENATRAN (histórico) | ↔ | **SENATRAN** (vigente) | `CTB_snt_competencias` — distrator com nome velho |

---

## 6. Microtópicos CTB — priorização P1→P5

Fonte Anexo I retificado: `conteudo-programatico.md` § legislacao_transito.

| Prio | Slug edital | Arts. CTB (referência) | Mecanismo dominante | Arquétipo visual |
|------|-------------|------------------------|---------------------|------------------|
| **P1** | `CTB_infracoes` | 161–255, Anexo I | `gravidade` + `numero_vizinho` | `tabela_gradacao` (D) |
| **P1** | `CTB_penalidades` | 256–268 | `gravidade` + `regra_excecao` | `tabela_gradacao` (D) |
| **P1** | `CTB_snt_competencias` | 5–25 | `competencia_snt` | `diagrama_competencia` (C) |
| **P1** | `CTB_processo_administrativo` | 280–290 | prazo + fluxo | `fluxograma` + `linha_tempo` (A) |
| **P2** | `CTB_circulacao_conduta` | 26–67 | `termo_unico` + `regra_excecao` | `comparacao` (A) |
| **P2** | `CTB_conducao_embriaguez` | 165, **165-A**, 276–277, 306 | `regra_excecao` | `fluxograma_decisao` (A) |
| **P2** | `CTB_crimes_transito` | 291–312 | `termo_unico` (infração↔crime) | `comparacao` |
| **P2** | `CTB_sinalizacao` | 80–90 | hierarquia de sinais | `tabela_gradacao` (D) |
| **P3** | `CTB_habilitacao` | 140–160 | `regra_excecao` + prazo | `matriz_assertivas` (B) |
| **P3** | `CTB_veiculos` | 96–117 | assertivas, equipamentos | `matriz_assertivas` (B) |
| **P3** | `CTB_engenharia_fiscalizacao` | 91–99 | `competencia_snt` | `diagrama_competencia` (C) |
| **P4** | `CTB_pedestres_nao_motorizados` | 68–71 | `regra_excecao` | `comparacao` |
| **P4** | `CTB_direitos_deveres` | 72–79 | conceitual | `texto_destaque` |
| **P5** | `CTB_educacao_transito` | 74–79 | conceitual | `texto_destaque` |
| **P5** | `CTB_lei_completa` | meta | — | não gerar questão "sobre a lei" |

**Slugs operacionais no banco** (subdivisões de `CTB_circulacao_conduta` — válidos em `topico`, alinhar ao edital):

`CTB_estacionamento_parada` | `CTB_velocidade` | `CTB_cinto_seguranca` | `CTB_preferencia` | `CTB_posicionamento_via` | `CTB_disposicoes_preliminares`

---

## 7. Resoluções CONTRAN — eixos de cobrança

Lista **somente** da Retificação 01/2026 — ver `conteudo-programatico.md` e `conteúdo/FONTES.md`.

| Eixo | Resoluções (slug) | Mecanismo | Prio |
|------|-------------------|-----------|------|
| **Processo / multas / MBFT** | 918, 991, 900, 985, 1003, 1009, 1012 | prazo + competência + procedimento | **P1** |
| **Alcoolemia** | 432 | `regra_excecao` (amarra art. 165-A) | **P1** |
| **Veículos / equipamentos** | 993, 968, 970, 227, 242, 36, 914, 955, 940 | obrigatório ↔ facultativo | **P2** |
| **Mobilidade / habilitação / registro** | 996, 1020, 911, 1013 | `termo_unico` + `numero_vizinho` | **P3** (alto ROI — normas recentes) |

| Ref. | Slug | Assunto | Nota IDECAN |
|------|------|---------|-------------|
| 2.1.1 | `CONTRAN_1013_free_flow` | Free flow / pedágios | Norma 2024 — "cara de prova 2026" |
| 2.1.2 | `CONTRAN_227_iluminacao` | Iluminação veículos | Par com Res. 970 |
| 2.1.3 | `CONTRAN_996_mobilidade` | Ciclomotores, patinete elétrico | Tema quente pós-retificação |
| 2.1.4 | `CONTRAN_940_capacete` | Capacete motos | `regra_excecao` por tipo |
| 2.2.x | `CONTRAN_993_equipamentos` etc. | Segurança veicular | Assertivas frequentes |
| 2.3.1 | `CONTRAN_911_registro` | Antes de registro/licenciamento | |
| 2.3.2 | `CONTRAN_1020_habilitacao` | Habilitação 2025 | **Prioridade lacuna** |
| 2.4.1 | `CONTRAN_432_alcoolemia` | Teste alcoolemia | Sempre com 165-A |
| 2.4.8 | `CONTRAN_900_recursos` | Defesa e recursos | Fluxograma processual |
| 2.4.3–7 | `CONTRAN_985_mbft` + alterações | MBFT | Já saturado no banco — evitar repetir eixo |

### SENATRAN

| Ref. | Slug | Uso |
|------|------|-----|
| 3.1 | `SENATRAN_966_curso_agente` | Curso de Agente de Trânsito — nicho, mas literalmente o cargo |

---

## 8. Mapa arquétipo visual (estudo reverso)

Consultar também [PADRAO-AULA-COMPLETA-v3.md](../../estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md).

| Sinal na questão | Arquétipo | Família | JSON ouro |
|------------------|-----------|---------|-----------|
| `caso_pratico` + `regra_excecao` | `fluxograma_decisao` | A | `ctb-normas-circulacao-art29.json` |
| Assertivas I–V | `matriz_assertivas` | B | `ctb-velocidade-218.json` |
| `competencia_snt` dominante | `diagrama_competencia` | C | `ctb-competencias-snt.json` |
| `gravidade` / `pegadinha_prazo` / % | `tabela_gradacao` | D | `ctb-velocidade-218-caso.json` |
| Qualquer questão | Tela `distratores` obrigatória (v2) | — | slugs no `passo_a_passo` |

**Gatilhos visuais no chat** (`professor-cadeia` `<protocolo_visual>`): mapa SNT → fluxograma processual → tabela gravidade/prazo → timeline autuação→recurso.

---

## 9. Cobertura do banco × lacunas

Contagem em `content/questoes/legislacao_transito/lote-*.json` — **105 questões** (2026-07-10).

### Saturado (evitar novo lote no mesmo eixo sem `index:questoes`)

| Slug | Qtd |
|------|-----|
| `CTB_circulacao_conduta` | 29 |
| `CTB_infracoes` | 19 |
| `CONTRAN_985_mbft` | 9 |
| `CTB_crimes_transito` | 7 |
| `CONTRAN_991_multas` | 7 |

### Coberto, mas raso (1–4 questões — priorizar aprofundamento)

| Slug | Qtd |
|------|-----|
| `CTB_penalidades` | 4 |
| `CTB_processo_administrativo` | 3 |
| `CONTRAN_900_recursos` | 3 |
| `CTB_conducao_embriaguez` | 2 |
| `CTB_sinalizacao` | 2 |
| `CTB_habilitacao` | 2 |
| Demais com 1 Q | snt, engenharia, veículos, pedestres, sub-slugs circulação, 432, 940, 36, 911, 918, 996, 914, 242, 227 |

### Lacuna (0 questões no banco — Anexo I exige cobertura)

**CTB:** `CTB_direitos_deveres` | `CTB_educacao_transito` | `CTB_lei_completa`

**CONTRAN:** `CONTRAN_1013_free_flow` | `CONTRAN_993_equipamentos` | `CONTRAN_968_identificacao` | `CONTRAN_970_sinalizacao_iluminacao` | `CONTRAN_955_cargas_externas` | `CONTRAN_1020_habilitacao` | `CONTRAN_1009_alteracoes` | `CONTRAN_1003_mbft` | `CONTRAN_1012_rsv` | `CONTRAN_procedimentos_operacionais`

**SENATRAN:** `SENATRAN_966_curso_agente`

---

## 10. Fila de geração por ROI

Ordem recomendada para próximos lotes (`examinador-idecan` + `estudo-reverso-visual`):

1. **Normas recentes com lacuna zero:** `CONTRAN_996_mobilidade` (aprofundar), `CONTRAN_1013_free_flow`, `CONTRAN_1020_habilitacao`
2. **P1 rasos:** `CTB_snt_competencias`, `CTB_processo_administrativo` — maiores pegadinhas medidas (68 cada) com poucas questões
3. **Bateria `gravidade`:** cruzar infração × gravidade × pontos × multa × medida — Família D
4. **Alcoolemia completa:** `CTB_conducao_embriaguez` + `CONTRAN_432` — art. 165-A obrigatório
5. **Lacunas edital:** `CTB_direitos_deveres`, SENATRAN 966, CONTRAN 993/968/970/955
6. **Não priorizar:** novos lotes só de `CTB_circulacao_conduta` ou `CONTRAN_985_mbft` sem eixo novo

**Meta MVP** (skill examinador): CTB **360** questões totais no banco — acompanhar progresso global.

---

## 11. Macetes de prova por eixo (mnemônicos operacionais)

| Eixo | Macete | Fundamento |
|------|--------|------------|
| Prevalência de sinais | **Agente > Semáforo > Sinalização > Regras gerais** | art. 89 CTB |
| Recusa etilômetro | **Recusou = 165-A** (infração autônoma, sem precisar medir) | art. 165-A |
| Competência recurso | **CONTRAN norma · CETRAN julga 2ª instância** | arts. 12–14 CTB |
| Infração × crime | **Mesmo fato, regimes diferentes** — administrativo não substitui CP | arts. 291+ |
| Medidas administrativas | **R³** — Retenção, Remoção, Recolhimento (não confundir) | arts. 269–270 |
| Órgão federal | **SENATRAN** (não DENATRAN) | desde 2019 |

---

## 12. Anti-padrões (trânsito)

- Citar §3º do art. 165 como vigente — usar **art. 165-A**
- Usar DENATRAN como órgão atual
- Distrator de gravidade sem par plausível (grave↔gravíssima)
- Questão de CONTRAN fora da lista retificada (edital original págs. 42–43)
- Caso prático sem vínculo com papel do **agente de trânsito** / STTP
- Enunciado > 600 chars sem necessidade (corpus médio 404)
- Gerar lote só de `CTB_circulacao_conduta` quando `cobertura.json` marca eixo repetido

---

## 13. Paridade IDECAN — coleta Tec Concursos

**Status:** 🟢 **Manutenção** — Corpus local **168 Q** já atinge meta **80–120** para DNA estatístico. Prioridade é **cobertura edital** (lacunas CONTRAN/SENATRAN no banco), não nova coleta em massa.

| Métrica | Valor |
|---------|-------|
| Corpus local | **168** questões (CTB + CONTRAN) |
| Meta paridade (camada 1) | ✅ Atingida |
| Tec (referência) | Buscar `Legislação de Trânsito` ou `Código de Trânsito Brasileiro (CTB)` + IDECAN |

**Quando reexportar do Tec:** apenas para eixos novos pós-retificação (ex.: Res. 1013, 1020, 996) se `validate:indistinguibilidade` reprovar lote inédito. Fluxo: ver [perfil-banca.md](../perfil-banca.md) § Paridade IDECAN.

---

## Changelog

- **1.2** (2026-07-19) — §13 Paridade IDECAN: corpus OK; foco em lacunas edital, não coleta massiva.
- **1.1** (2026-07-10) — Front-matter alinhado ao corpus 2026-07-10; cobertura corrigida 106→105; campo `grupo` adicionado.
- **1.0** (2026-07-10) — Perfil inicial: corpus 168 Q IDECAN; sub-mecanismos de trânsito; 14 microtópicos CTB + 22 CONTRAN + SENATRAN; cobertura 106 Q do banco; fila ROI; mapa visual Famílias A–D.
