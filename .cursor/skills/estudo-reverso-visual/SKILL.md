---
name: estudo-reverso-visual
description: Especialista em micro-aulas visuais de alta retenção para o player pós-questão do Agente de Trânsito Aprovado. Skill unificada com dois modos — EXPRESSA (estudo_reverso_visual, 3-5 telas) e COMPLETA (estudo_reverso_visual_completo v2, 7-11 telas, trilha padrão do app). Arquétipos Mayer + dual coding, gate de carga cognitiva por componente, distratores mapeados por mecanismo IDECAN, coerência v1↔v2 verificada. Use ao criar estudo reverso visual (expressa ou aula completa), popular content/questoes/, retrofit de questões sem aula completa ou encadear após examinador-idecan.
---

# Estudo Reverso Visual (unificada)

> **Documentação completa:** [DOCUMENTACAO.md](./DOCUMENTACAO.md) — arquitetura, validação, retrofit, integração app.

versão 3.4 — v3.3 + far-transfer obrigatório no macete, checklist de eficácia pós-aula (3×15s) e coerência de eixo vizinho. Changelog no fim.

Designer instrucional + examinador IDECAN. Cada micro-aula consolida **uma questão específica** — nunca genérica, nunca reusada entre microtópicos.

## Base científica (e o que ela obriga)

| Princípio | Obrigação prática |
|---|---|
| Testing effect (Roediger & Karpicke, 2006) | O recall é a **questão** que precede a aula; a aula NÃO reintroduz recall — a reexposição é papel do FSRS (`micro_recall` foi removido do app em 2026-07; não reintroduzir) |
| Feedback elaborado pós-teste (Andersen & Mayer, 2023) | A aula abre pelo que o aluno acabou de errar/acertar, não por teoria fria |
| Dual coding (Paivio) + CTML (Mayer) | Toda tela combina componente visual + texto mínimo; nunca 2 telas seguidas só de texto |
| Segmentação (Mayer) | 1 ideia por tela; limites por componente abaixo |
| Coerência (Mayer) | Zero elemento decorativo — cada item da tela sustenta a pegadinha |
| **Proibido** | Estilos de aprendizagem (Pashler et al., 2008) |

## Fontes obrigatórias

| Fonte | Caminho |
|---|---|
| Questão base (enunciado, comentario, mecanismos) | JSON gerado por `examinador-idecan` |
| Perfil vertical da disciplina | `../examinador-idecan/perfis/perfil-{disciplina}.md` — mapa slug→arquivo em [SKILL.md](../examinador-idecan/SKILL.md) § Mapa slug → perfil vertical; §8 mapa arquétipo por disciplina |
| Lei seca | `conteúdo/` — índice em `conteúdo/FONTES.md` (nunca só internet) |
| Didática Estratégia (opcional) | `conteúdo/estrategia/notas/` ou PDF em `estrategia/` — ordem de estudo e ênfase; **nunca** `trecho_legal` nem cópia literal |
| Tipos TS | `src/types/estudo-reverso-visual.ts` |
| Validação Zod | `src/lib/validations/estudo-reverso-visual.ts` |
| Checklist Mayer | [checklist-mayer.md](checklist-mayer.md) |
| Documentação completa | [DOCUMENTACAO.md](DOCUMENTACAO.md) |
| Templates de arquétipo | [arquetipos/](arquetipos/) |
| Exemplos ouro | [exemplos-ouro/](exemplos-ouro/) + `content/questoes/legislacao_transito/_snippets/celular-252-completo-visual.json` |
| Regra SRS | `.cursor/rules/03-estudo-reverso.mdc` |
| UI | `.cursor/skills/frontend-design/retencao-visual.md` |

`<cadeia_anti_alucinacao>`: antes de qualquer artigo/número/prazo em tela — (1) localizar o dispositivo literal em `conteúdo/`, (2) transcrever literal (grifos permitidos, paráfrase proibida em `trecho_legal`), (3) não localizou → `[verificar]` e reformular a tela sem o dado. Visual com dado não localizado = defeito de fabricação.

## Mapeamento arquetipo → `tipo` de tela

O campo raiz `arquetipo` descreve a estratégia pedagógica; cada tela usa `tipo` no JSON (renderers React):

| `arquetipo` (raiz) | `tipo` da tela no JSON |
|---|---|
| `fluxograma_decisao` | `fluxograma` |
| `comparacao` | `comparacao` |
| `matriz_assertivas` | `matriz_assertivas` |
| `tabela_gradacao` | `tabela_gradacao` |
| `trecho_legal` | `trecho_legal` |
| `linha_tempo` | `linha_tempo` |
| `diagrama_competencia` | `diagrama_competencia` |
| `texto_destaque` | `texto_destaque` |

`arquetipo_secundario` opcional quando a trilha mistura dois componentes (ex.: `tabela_gradacao` + `fluxograma_decisao`).

## Os dois modos

| | EXPRESSA (v1) | COMPLETA (v2) |
|---|---|---|
| Campo na raiz da questão | `estudo_reverso_visual` | `estudo_reverso_visual_completo` |
| Telas | 3–5 | 7–11 |
| Duração | ~30–60s | 120–300s (`duracao_estimada_seg`) |
| Público | revisão rápida | primeira exposição / dúvida (`publico_alvo: "iniciante"` quando há glossário + linha do tempo) |
| Schema | `versao: 1` | `versao: 2` obrigatório |
| Uso no app | fallback quando não há v2 | **trilha padrão** — abre sempre após confirmar resposta, quando existir |

### Política de seed

| Campo | Obrigatoriedade |
|---|---|
| `estudo_reverso_visual_completo` (v2) | **Obrigatório** em toda questão importada |
| `estudo_reverso_visual` (v1) | **Recomendado** — fallback no app; não bloqueia seed até retrofit legado |

Regra de convivência: quando ambos existem, **nunca substituir v1 por v2** — manter ambas. Retrofit = adicionar v2 sem tocar na v1 existente. Se gerar os dois de uma vez, aplicar gate de coerência v1↔v2 (item 8).

## Tabela de decisão do arquétipo principal (com desempate)

Ordem de resolução quando múltiplos sinais disparam — parar no primeiro que casar:

1. `estilo_idecan` específico da questão:

| `estilo_idecan` / sinal | Arquétipo | Template |
|---|---|---|
| `pegadinha_pode_deve` | `comparacao` | [comparacao-pode-deve.md](arquetipos/comparacao-pode-deve.md) |
| `pegadinha_percentual` / `pegadinha_prazo` | `tabela_gradacao` | [tabela-gradacao.md](arquetipos/tabela-gradacao.md) |
| `assertivas` (tipo) | `matriz_assertivas` | [matriz-assertivas.md](arquetipos/matriz-assertivas.md) |

2. Mecanismo dominante dos distratores (slugs do `passo_a_passo` da questão):

| Mecanismo dominante | Arquétipo |
|---|---|
| `competencia_snt` | `diagrama_competencia` ([diagrama-competencia.md](arquetipos/diagrama-competencia.md)) |
| `gravidade` / `numero_vizinho` | `tabela_gradacao` |
| `regra_excecao` | `fluxograma_decisao` ([fluxograma-decisao.md](arquetipos/fluxograma-decisao.md)) |
| `termo_unico` | `trecho_legal` grifado ([trecho-legal-grifado.md](arquetipos/trecho-legal-grifado.md)) |

3. `tipo` da questão: `caso_pratico` → `fluxograma_decisao`; sequência temporal genuína → `linha_tempo` ([linha-tempo.md](arquetipos/linha-tempo.md)).

Empate residual → escolher o arquétipo que expõe a **pegadinha do gabarito** (a confusão que faria o aluno marcar errado), não o que "ilustra o tema".

**Trânsito (`legislacao_transito`):** consultar §8 de [perfil-transito.md](../examinador-idecan/perfis/perfil-transito.md) antes de classificar família A|B|C|D.

## Formato canônico — tela de distratores (v2, obrigatória)

Tela `comparacao` com `id: "distratores"` (ou título contendo "errada"). Uma linha por alternativa **errada**; coluna 1 = letra + slug; coluna 2 = por que engana.

```json
{
  "id": "distratores",
  "titulo": "Por que cada alternativa erra",
  "tipo": "comparacao",
  "conteudo": {
    "colunas": ["Alternativa", "Mecanismo + por quê"],
    "linhas": [
      ["A — regra_excecao", "Trata recusa como impedimento — art. 165-A é infração autônoma."],
      ["B — termo_unico", "Confunde autuação administrativa com perícia criminal obrigatória."],
      ["D — regra_excecao", "Exige confirmação no etilômetro — a recusa já configura infração."]
    ]
  }
}
```

Slugs válidos (mesmos do `examinador-idecan`): `numero_vizinho`, `competencia_snt`, `gravidade`, `regra_excecao`, `termo_unico`.

Exemplo ouro completo: [exemplos-ouro/ctb-embriaguez.json](exemplos-ouro/ctb-embriaguez.json).

## Limites de carga cognitiva por componente (validáveis)

| Componente | Limite |
|---|---|
| Qualquer tela (v1) | ≤ 120 palavras |
| Qualquer tela (v2) | ≤ 150 palavras |
| `fluxograma` MÉTODO (`secao: metodo`) | ≤ 4 nós, cadeia linear, 1 `resultado`, sem `art.` no `label` |
| `fluxograma` / `fluxograma_decisao` (demais) | ≤ 7 nós, ≤ 2 níveis de ramificação |
| `comparacao` | ≤ 5 linhas × 2 colunas |
| `tabela_gradacao` | ≤ 5 faixas |
| `linha_tempo` | ≤ 6 marcos |
| `matriz_assertivas` | ≤ 5 assertivas |
| `diagrama_competencia` | ≤ 8 nós |
| `trecho_legal` | ≤ 80 palavras de lei, ≤ 3 grifos por trecho |

Estourou o limite → dividir em 2 telas (segmentação), nunca comprimir removendo precisão legal.

## Modo EXPRESSA — estrutura

Obrigatórias (3):
1. `texto_destaque` — o que a IDECAN testou (1 frase + veredito do aluno)
2. **Arquétipo principal** (tabela de decisão)
3. `texto_destaque` — macete visual (**inclui far-transfer em 1 linha** quando `meta.far_transfer` existe; se estourar 120 palavras, priorizar regra + far)

Condicionais (+até 2, só se o gatilho existir):
- `comparacao` da pegadinha — se o mecanismo dominante é par confundível (pode↔deve, grave↔gravíssima, CONTRAN↔CETRAN)
- `trecho_legal` grifado — se a pegadinha mora na letra da lei (`termo_unico`, `regra_excecao`)

3 telas quando os condicionais não disparam; 5 quando ambos disparam. Nunca preencher tela para "chegar em 5".

## Modo COMPLETA — estrutura

Núcleo obrigatório (7, nesta ordem — progressão problema → mecanismo → lei → memorização):
1. `texto_destaque` — o que a IDECAN testou
2. **Arquétipo principal** (tabela de decisão)
3. `comparacao` — contraste central da pegadinha
4. `comparacao` — **análise dos distratores, organizada por mecanismo** (formato canônico acima)
5. `comparacao` ou `fluxograma` — caso concreto do enunciado resolvido
6. `trecho_legal` — dispositivo principal grifado
7. `texto_destaque` — macete (**near-transfer + far-transfer + o que NÃO muda** — ver § Transferência)

Condicionais (+até 4, só com gatilho real — inserir **antes** do arquétipo principal quando forem pré-treino):
- `texto_destaque` glossário/pré-treino (≤3 termos) — se a questão usa ≥2 termos técnicos que um iniciante não conhece
- `linha_tempo` contexto legislativo — se houve alteração legal relevante ao tópico (ex.: Lei 13.281, art. 165-A)
- `trecho_legal` 2 — se § único/inciso distinto é o eixo da pegadinha
- `comparacao` extra — se há segundo par confundível no mesmo microtópico **ou** se `meta.eixo_vizinho` existe e cabe tabela "dispositivo × função" (não decorar)

7 telas = núcleo puro. 11 = núcleo + 4 condicionais. Tela condicional sem gatilho = decoração = reprovação.

### Transferência no macete (obrigatória — consome `examinador-idecan` v2.1)

A última tela (`macete`) **deve** conter, no `conteudo.texto` ou em `macete_visual` + texto:

1. **Regra** (1 frase) — o invariante do gabarito
2. **Near-transfer** — eco de `meta.near_transfer` (cenário próximo)
3. **Far-transfer** — eco de `meta.far_transfer` (cenário distante)
4. **O que NÃO muda** — eco de `meta.o_que_nao_muda` (invariante legal)

Formato canônico sugerido (1 tela, sem estourar 150 palavras):

```
[Regra 1 frase]
Near: …
Far: …
Não muda: …
[+ se meta.eixo_vizinho] Cadeia: próximo = art. X
```

Alternativa (quando near/far não cabem no texto_destaque sem estourar limite): tela condicional `comparacao` **imediatamente antes** do macete, com colunas `O que muda` | `O que NÃO muda` (≤3 linhas) — conta no teto de 11.

Sem far-transfer distinto do near → **reprova** gate editorial #18.

### Coerência de eixo vizinho

Se a questão traz `meta.eixo_vizinho` (ou `comentario.estudo_reverso` cita o artigo seguinte):

- Macete (ou tela `eixo2`/hierarquia da Família A) **nomeia** o vizinho em 1 frase ("próximo na cadeia: art. X — não cobrado aqui").
- Não abrir aula genérica do vizinho — só âncora de cadeia.
- Gate Mayer item 8 (coerência v1↔v2): se v1 e v2 existem, ambas mencionam o mesmo vizinho ou ambas omitem.

### `<checklist_eficacia_pos_aula>` (3 perguntas × 15s)

Antes de gravar a aula, o elaborador responde **sim** às 3 — se qualquer for "não", cortar tela decorativa ou reescrever macete/contraste:

| # | Pergunta (o aluno deve conseguir em ≤15s após a aula) |
|---|---|
| E1 | Qual é o **invariante** legal (o que NÃO muda entre near e far)? |
| E2 | Por que a **errada mais tentadora** cai (slug + 1 fato do stem)? |
| E3 | Em um cenário **novo** (far-transfer), a mesma regra aplica — sim/não e por quê? |

Registrar em `meta.eficacia_pos_aula: ["E1","E2","E3"]` na aula completa (ou na raiz) quando as 3 passam. Gate editorial #19.

### Padrão ouro v3 (hub + famílias A–D)

**Comece pelo hub:** [exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md](exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md)

| Família | Sinal | Guia | JSON ouro |
|---------|-------|------|-----------|
| **A** Caso/regra-exceção | `caso_pratico` + `regra_excecao` | [familias/PADRAO-A-caso-regra-excecao.md](exemplos-ouro/familias/PADRAO-A-caso-regra-excecao.md) | [ctb-normas-circulacao-art29.json](exemplos-ouro/ctb-normas-circulacao-art29.json) |
| **B** Assertivas | I–V no enunciado | [familias/PADRAO-B-assertivas.md](exemplos-ouro/familias/PADRAO-B-assertivas.md) | [ctb-velocidade-218.json](exemplos-ouro/ctb-velocidade-218.json) |
| **C** Competência SNT | `competencia_snt` | [familias/PADRAO-C-competencia-snt.md](exemplos-ouro/familias/PADRAO-C-competencia-snt.md) | [ctb-competencias-snt.json](exemplos-ouro/ctb-competencias-snt.json) |
| **D** Gradação | % / prazo / `gravidade` | [familias/PADRAO-D-gradacao.md](exemplos-ouro/familias/PADRAO-D-gradacao.md) | [ctb-velocidade-218-caso.json](exemplos-ouro/ctb-velocidade-218-caso.json) |

Legado v2 (Família A detalhada): [PADRAO-AULA-COMPLETA-v2.md](exemplos-ouro/PADRAO-AULA-COMPLETA-v2.md)

Copiar **estrutura da família** (ids, ordem, tipos, seções) — adaptar conteúdo. Gate Mayer 8/8 + editorial 12/12 (hub v3).

## `<gate_mayer>` (binário, por aula, antes do validador npm)

Reprovou 1 item → corrigir antes de rodar qualquer npm:

1. Cada tela tem 1 ideia central identificável em ≤ 5s?
2. Nenhuma sequência de 2 telas só-texto? *(exceção: contexto→glossário; qualquer→macete)*
3. Todo dado legal passou pela `<cadeia_anti_alucinacao>`?
4. A tela de distratores nomeia o mecanismo (slug) de cada errada?
5. Arquétipo escolhido expõe a pegadinha do gabarito (não só "ilustra o tema")?
6. Limites por componente respeitados (tabela acima)?
7. Zero elemento decorativo (cada ícone/cor/box sustenta a pegadinha)?
8. **Coerência v1↔v2:** mesma pegadinha nomeada, mesmo `fundamento_slug`, macetes não contraditórios entre `estudo_reverso_visual` e `estudo_reverso_visual_completo` da mesma questão? Se há `eixo_vizinho`, ambas citam ou ambas omitem?

Itens 2, 4, 6 e 8 são parcialmente enforceados pelo validador Zod. Itens 1, 3, 5 e 7 permanecem revisão humana. Após Mayer: `<checklist_eficacia_pos_aula>` E1–E3 + gate editorial hub (#18 far-transfer, #19 eficácia).

Depois: `npm run validate:lote -- arquivo.json` até zero erros (inclui `preview:grifos`). Lotes legados: `--legacy-grifos` (sem `texto_grifado`; retrofit `npm run retrofit:grifos -- --write`) e/ou `--legacy-transferencia` (sem `meta` near/far/o_que_nao_muda em nível 4+). Checklist detalhado: [checklist-mayer.md](checklist-mayer.md).

## Workflow por questão

1. Ler enunciado + `comentario` (incl. slugs de mecanismo no `passo_a_passo`) + gabarito + `estilo_idecan` + `meta` (`near_transfer`, `far_transfer`, `o_que_nao_muda`, `eixo_vizinho`)
2. Classificar família A|B|C|D — [PADRAO-AULA-COMPLETA-v3.md](exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md)
3. Montar EXPRESSA (3–5) e COMPLETA (7–11) — estrutura da família, condicionais só com gatilho; macete com near+far+o que não muda
4. `<gate_mayer>` 8/8 + gate editorial 12/12 + #18/#19 (hub v3) + `<checklist_eficacia_pos_aula>` E1–E3
5. Grifos: `npm run grifo:offsets` → preencher `texto_grifado` → `npm run preview:grifos`
6. `npm run validate:lote -- arquivo.json` (5 gates, inclui preview de grifos)

## Prompt de lote (Agent mode)

```
Use examinador-idecan + estudo-reverso-visual.

Gere content/questoes/legislacao_transito/lote-00X.json:
- 5-10 questoes ouro (1 por microtopico prioritario)
- Cada questao com estudo_reverso_visual_completo (7-11 telas, versao 2) obrigatorio
- Estrutura da aula: exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md + família A|B|C|D
- JSON ouro da família (não copiar art.29 cego)
- estudo_reverso_visual (3-5 telas) recomendado quando possivel
- Tela de distratores mapeada pelos slugs de mecanismo do comentario
- Consultar conteudo/FONTES.md antes de citar lei
- Gate Mayer 8/8 por aula, depois validate:lote (5 gates, inclui preview:grifos) ate zero erros
- Nao commitar
```

## Integração app

- Depende de: `examinador-idecan` (questão + slugs de mecanismo)
- Roteamento: `src/lib/estudo-reverso-visual-trilha.ts` — abre v2 quando existir, senão v1
- Coluna DB: `estudo_reverso_visual_completo_json`
- Player: `src/components/estudo-reverso/estudo-reverso-player.tsx` (badge "Aula completa" na v2, "Revisão rápida" na v1)
- Reexposição espaçada: FSRS + motor ATA (`.cursor/rules/03-estudo-reverso.mdc`) — nunca dentro da aula

## Anti-padrões

- Infográfico único com 10 conceitos (viola segmentação)
- Tela condicional sem gatilho (preencher para "chegar em N telas")
- Copiar diagrama de cursinho
- Visual com dado que não passou pela `<cadeia_anti_alucinacao>`
- 2+ telas seguidas só de texto
- Mermaid no JSON do app (renderers React exigem JSON tipado)
- Reintroduzir `micro_recall` (removido 2026-07 — recall é a questão + FSRS)
- Substituir v1 por v2 (manter ambas)
- Aula genérica de microtópico não amarrada ao enunciado da questão
- Reuso de aula entre questões/microtópicos ou arquivos `lote-*-irmas.json`

## Recursos

- Perfis verticais (arquétipos por disciplina) — mapa em [../examinador-idecan/SKILL.md](../examinador-idecan/SKILL.md) § Mapa slug → perfil vertical:
  - [perfil-transito.md](../examinador-idecan/perfis/perfil-transito.md) · [perfil-portugues.md](../examinador-idecan/perfis/perfil-portugues.md) · [perfil-informatica.md](../examinador-idecan/perfis/perfil-informatica.md) · [perfil-constitucional.md](../examinador-idecan/perfis/perfil-constitucional.md) · [perfil-administrativo.md](../examinador-idecan/perfis/perfil-administrativo.md) · [perfil-etica-sp.md](../examinador-idecan/perfis/perfil-etica-sp.md) · [perfil-historia-cg-pb.md](../examinador-idecan/perfis/perfil-historia-cg-pb.md)
- [checklist-mayer.md](checklist-mayer.md)
- [exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md](exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md) — **hub padrão ouro v3 (famílias A–D)**
- [exemplos-ouro/familias/](exemplos-ouro/familias/) — guias por família
- [../examinador-idecan/prompt-nova-conversa.txt](../examinador-idecan/prompt-nova-conversa.txt) — prompt pronto (nova conversa)
- [../examinador-idecan/prompt-questao-aula-completa.md](../examinador-idecan/prompt-questao-aula-completa.md) — variantes + checklist
- [arquetipos/](arquetipos/) — templates por arquétipo
- [exemplos-ouro/](exemplos-ouro/) — incl. [ctb-normas-circulacao-art29.json](exemplos-ouro/ctb-normas-circulacao-art29.json) (canônico) e [ctb-embriaguez.json](exemplos-ouro/ctb-embriaguez.json)

## Changelog

- **3.4** — eficácia máxima: macete exige near + far-transfer + o que NÃO muda (consome `meta` do examinador v2.1); coerência de `eixo_vizinho` no macete; `<checklist_eficacia_pos_aula>` E1–E3 (15s); gate editorial hub #18/#19; EXPRESSA também ecoa far em 1 linha no macete quando houver espaço.
- **3.3** — Hub v3 + famílias A–D; contratos editoriais; gate 12/12; ouros B/C/D com `estudo_reverso_visual_completo`; retrofit art. 29.
- **3.1** — MÉTODO linear — ver [PADRAO-A-caso-regra-excecao.md](exemplos-ouro/familias/PADRAO-A-caso-regra-excecao.md) / [PADRAO-AULA-COMPLETA-v2.md](exemplos-ouro/PADRAO-AULA-COMPLETA-v2.md) §3.
- **3.0** — unificação das skills `estudo-reverso-visual` + `estudo-reverso-visual-completo`; tabela de decisão com desempate; núcleo + condicionais; distratores por slug IDECAN; gate Mayer 8 itens; limites por componente; coerência v1↔v2; `<cadeia_anti_alucinacao>`; mapeamento arquetipo→tipo; formato canônico distratores; política de seed (v2 obrigatório, v1 recomendado).
- **1.x** — skills originais separadas.
