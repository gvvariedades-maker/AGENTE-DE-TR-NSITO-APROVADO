# Prompt — Questão inédita IDECAN + aula completa (padrão v3.4 / examinador v2.1)

## Prompt pronto (copiar e colar)

**Arquivo:** [prompt-nova-conversa.txt](./prompt-nova-conversa.txt) — abra, `Ctrl+A`, cole em uma **nova conversa no modo Agent**. Sem markdown, sem extrair bloco de código.

| Arquivo | Uso |
|---------|-----|
| **[prompt-nova-conversa.txt](./prompt-nova-conversa.txt)** | **Padrão** — 1 questão **inédita**, tópico via `npm run proxima` |
| Este `.md` | Variantes (completo, curto, lote), checklist, tabela por disciplina |
| **[prompt-questao-real-aula.md](./prompt-questao-real-aula.md)** | Questão **real** IDECAN superior + aula — pasta `content/questoes-reais/` |

> **Política do banco:** dificuldade mínima **4** (`src/lib/validations/dificuldade-banco.ts`). O `npm run proxima` já retorna o escopo com nível 4+.
> **Eficácia:** examinador-idecan **v2.1** (transferência + eixo vizinho + calibração) · estudo-reverso-visual **v3.4** (far-transfer + E1–E3).
> **Validação:** `validate:lote` strict exige `meta.near_transfer` / `far_transfer` / `o_que_nao_muda` em nível 4+ (gate Zod T1–T4). Lotes legados: `--legacy-transferencia`.

**Variante disciplina:** no `.txt`, troque `legislacao_transito` nas duas linhas do `proxima` e em `Disciplina:`.

---

## Prompt nova conversa (espelho do .txt)

```text
Modo Agent. Skills: examinador-idecan (v2.1) + estudo-reverso-visual (v3.4).

Disciplina: legislacao_transito

Passo 0 — escolher tópico automaticamente:
→ npm run proxima -- legislacao_transito
→ Usar o bloco "Escopo pronto" retornado (tópico, recorte, família, lote, dificuldade 4+).

Gerar 1 questão inédita IDECAN + aula completa v3.4 nesse tópico.
Consultar perfil vertical da disciplina (mapa slug→arquivo na SKILL.md) para forma e mecanismos.
Se existir nota ou PDF em conteúdo/estrategia/ para o tópico: consultar organização didática (nunca copiar literal; validar lei em conteúdo/).

## Dificuldade mínima 4 (banco de treino)
- "dificuldade": 4 ou 5 — nunca 1–3
- Estrutura: caso_pratico + ≥2 mecanismos cruzados + ≥2 dispositivos no gabarito
- passo_a_passo[1]: ≥2 slugs distintos (numero_vizinho | competencia_snt | gravidade | regra_excecao | termo_unico)
- estilo_idecan: pegadinha_* | assertivas | incorreta
- Pegadinha obrigatória; gate primeira passagem item 4: número bate com dificuldade_operacional

## Questão (examinador v2.1)
- 4 alt A–D; mecanismo declarado em cada errada
- <cadeia_anti_alucinacao> em toda citação legal
- Gate 9: cada errada on-case (deriva do enunciado); competencia_snt só se o stem citar órgão/competência
- Gate 10: meta.near_transfer + meta.far_transfer + meta.o_que_nao_muda (distintos); meta.eixo_vizinho se o gabarito remete a outro artigo
- <gate_calibracao_corpus> (envelope + estilo top + mecanismo alinhado)
- meta.isca_por_alternativa (A/B/D) + meta.eixos_mecanismo quando cruzar ≥2 slugs

## Aula v3.4
- Hub: exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md + família do proxima
- estudo_reverso_visual_completo versao 2, 7–11 telas
- contexto: só iscas — análise por mecanismo fica em distratores
- Macete: regra + near + far + o que NÃO muda (eco da meta); citar eixo_vizinho se houver
- Grifos: npm run grifo:offsets → texto_grifado obrigatório; motivo ecoa id da tela
- Família A com 2 dispositivos: tela eixo2 ou hierarquia (2º fundamento do gabarito, não eixo órfão)
- Gate Mayer 8/8 + editorial 12/12 + #17 (preview:grifos) + #18 (far) + #19 (E1–E3)

## Entrega
1. Gravar lote + snippet em _snippets/
2. npm run grifo:offsets + preview:grifos no lote (ou validate:lote — 5 gates)
3. npm run index:questoes → npm run db:seed
4. Não commitar

Reportar: família, gabarito, pegadinha em 1 frase, near/far em 1 linha cada, nº de telas, E1–E3 ok?, resultado dos 5 gates, caminho do arquivo.
```

> Mantenha [prompt-nova-conversa.txt](./prompt-nova-conversa.txt) sincronizado com o bloco acima ao editar o prompt padrão.

---

## Nomenclatura (não confundir)

| Nome | O que é |
|------|---------|
| **Padrão pedagógico v3.4** | Hub + famílias A–D + far-transfer + E1–E3 → [PADRAO-AULA-COMPLETA-v3.md](../estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md) |
| **Campo JSON v2** | `estudo_reverso_visual_completo` com `"versao": 2`, 7–11 telas — formato gravado no banco e validado pelo Zod |

**Não existe `versao: 3` no schema.** Sempre produzir com o **guia v3** e gravar no **campo v2**.

Documentação de referência:

| Recurso | Caminho |
|---------|---------|
| Examinador IDECAN | [SKILL.md](./SKILL.md) |
| Perfil vertical da disciplina | `perfis/perfil-{disciplina}.md` (mapa slug→arquivo na [SKILL.md](./SKILL.md)) |
| Estudo reverso visual | [../estudo-reverso-visual/SKILL.md](../estudo-reverso-visual/SKILL.md) |
| **Hub padrão pedagógico v3** | [../estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md](../estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md) |
| Famílias A–D | [../estudo-reverso-visual/exemplos-ouro/familias/](../estudo-reverso-visual/exemplos-ouro/familias/) |
| JSON ouro A (caso) | [../estudo-reverso-visual/exemplos-ouro/ctb-normas-circulacao-art29.json](../estudo-reverso-visual/exemplos-ouro/ctb-normas-circulacao-art29.json) |
| JSON ouro B (assertivas) | [../estudo-reverso-visual/exemplos-ouro/ctb-velocidade-218.json](../estudo-reverso-visual/exemplos-ouro/ctb-velocidade-218.json) |
| JSON ouro C (SNT) | [../estudo-reverso-visual/exemplos-ouro/ctb-competencias-snt.json](../estudo-reverso-visual/exemplos-ouro/ctb-competencias-snt.json) |
| JSON ouro D (gradação) | [../estudo-reverso-visual/exemplos-ouro/ctb-velocidade-218-caso.json](../estudo-reverso-visual/exemplos-ouro/ctb-velocidade-218-caso.json) |
| Seed Família A | `content/questoes/legislacao_transito/lote-007.json` |

---

## Prompt completo (1 questão)

```text
Use as skills examinador-idecan + estudo-reverso-visual.

## Tarefa
Criar 1 questão inédita IDECAN + aula completa no padrão pedagógico v3, gravar no repositório, validar e fazer seed.

## Formato de gravação (JSON)
- Campo: estudo_reverso_visual_completo
- versao: 2 (schema atual — não usar versao 3)
- 7–11 telas

## Escopo desta questão
- Disciplina: [legislacao_transito]
- Microtópico / topico (Anexo I retificado): [CTB_circulacao_conduta]
- Recorte legal: [ex.: art. 32 ultrapassagem em via de duplo sentido]
- Dificuldade: 4 ou 5 (mínimo banco — nunca 1–3)
- Gabarito desejado: [A/B/C/D ou "distribuir conforme lote"]

## Padrão pedagógico v3 (como montar a aula)
0. Consultar perfis/perfil-{disciplina}.md (mapa slug→arquivo na SKILL.md): envelope de forma, mecanismos, pares confundíveis e fila ROI da disciplina
1. Classificar família A|B|C|D — PADRAO-AULA-COMPLETA-v3.md
2. Abrir familias/PADRAO-{X}-….md + JSON ouro da família (não copiar art.29 cego)
3. Copiar estrutura (ids, ordem, tipos, seções) da família — NUNCA reusar texto literal
4. Diagnóstico com isca por errada; macete com near + far + o que NÃO muda
5. .cursor/skills/examinador-idecan/SKILL.md (gate 10/10 + transferência + calibração + mecanismos)

## Questão (estilo IDECAN real)
- 100% inédita; fundamento legal verificável em conteúdo/ (<cadeia_anti_alucinacao>)
- 4 alternativas A–D (edital item 10.4)
- Enunciado no estilo IDECAN (caso prático Campina Grande quando couber; paridade de ofício)
- Cada errada com 1 mecanismo: numero_vizinho | competencia_snt | gravidade | regra_excecao | termo_unico
- passo_a_passo[1] nomeia o slug de cada alternativa errada
- Gate 9: cada errada on-case; competencia_snt só com órgão/competência no stem
- Gate 10 + meta: near_transfer, far_transfer, o_que_nao_muda; eixo_vizinho se couber
- meta.isca_por_alternativa + meta.eixos_mecanismo quando aplicável
- Pegadinha obrigatória se dificuldade ≥ 3
- Comentário Professor Elite completo (objeto comentario no JSON)

## Regras técnicas do campo v2
- Núcleo: contexto → arquétipo da família → contraste → distratores → caso → trecho_legal → macete
- Condicionais só com gatilho real (mapa da família, não decorar telas)
- secao válidas: diagnostico|mapa|contraste|distratores|metodo|lei|conceito|macete (glossário: omitir secao)
- Família A: fluxograma MÉTODO linear ≤4 nós, 1 resultado, sem art. no label
- trecho_legal: texto literal de conteúdo/, grifos por indexOf com `texto_grifado` (npm run grifo:offsets), motivo ecoa id da tela
- contexto: só iscas (meta.isca_por_alternativa) — análise por mecanismo fica em distratores
- Família A + 2 dispositivos: tela eixo2 ou hierarquia (2º fundamento, não competência órfã)
- Macete: near + far + o que NÃO muda; checklist E1–E3
- Gate Mayer 8/8 + editorial 12/12 + #17–#19 → npm run preview:grifos antes do validate:lote

## Entrega
1. Gravar em content/questoes/[disciplina]/lote-[NNN].json (criar lote ou acrescentar)
2. Espelhar snippet em content/questoes/[disciplina]/_snippets/
3. Atualizar exemplos-ouro/ se for arquétipo novo
4. npm run validate:lote -- [caminho do lote]
5. npm run db:seed
6. Não commitar a menos que eu peça

## Ao final, reportar
- Família A|B|C|D usada
- Gabarito e pegadinha em 1 frase
- Near-transfer e far-transfer (1 linha cada) + o que NÃO muda
- Número de telas da aula
- E1–E3 ok?
- Resultado dos 5 gates de validate:lote (inclui preview:grifos)
- Caminho do arquivo gravado
```

---

## Prompt automático (só disciplina — recomendado)

O agente escolhe o tópico por **déficit de demanda** (peso IDECAN × lacuna no banco). Prioridades em `scripts/edital-topics-prioridades.ts` (espelha perfis §9–§10).

```text
Modo Agent. Skills: examinador-idecan (v2.1) + estudo-reverso-visual (v3.4).

Disciplina: legislacao_transito

Passo 0 — escolher tópico automaticamente:
→ npm run proxima -- legislacao_transito
→ Usar o bloco "Escopo pronto" retornado (tópico, recorte, família, lote, dificuldade 4+).

Gerar 1 questão inédita IDECAN + aula completa v3.4 nesse tópico.
Consultar perfil vertical da disciplina (mapa slug→arquivo na SKILL.md) para forma e mecanismos.

Dificuldade mínima 4: caso_pratico + 2 mecanismos cruzados + 2 dispositivos no gabarito.
Questão: 4 alt A–D; mecanismos nos distratores; pegadinha obrigatória; erradas on-case (gate 9); transferência near+far+o_que_nao_muda (gate 10).
meta.isca_por_alternativa + grifos com texto_grifado (grifo:offsets).
Aula: contexto só iscas; macete com far-transfer; Mayer 8/8 + editorial #17–#19 + E1–E3.
→ validate:lote (5 gates, inclui preview:grifos) → index:questoes → db:seed. Não commitar.
```

**Variantes:**

| Comando | Uso |
|---------|-----|
| `npm run proxima -- legislacao_transito` | 1 tópico + Escopo pronto |
| `npm run proxima -- portugues --n 5` | top 5 deficitários da disciplina |
| `npm run proxima -- all` | próximo tópico de **toda a prova** (peso × déficit × slot edital) |
| `npm run proxima -- legislacao_transito --json` | saída JSON para o agente |

Slugs de disciplina: `legislacao_transito` | `portugues` | `informatica` | `historia_cg_pb` | `legislacao_etica_sp` | `direito_administrativo` | `direito_constitucional` | `all`

---

## Prompt curto (tópico já definido)

```text
Modo Agent. Skills: examinador-idecan + estudo-reverso-visual.

Questão inédita IDECAN + aula completa:
- Padrão pedagógico v3 (hub + família A|B|C|D)
- Gravar em estudo_reverso_visual_completo, versao 2, 7–11 telas

Escopo:
- Disciplina: [SLUG — ver tabela por disciplina abaixo]
- topico: [SLUG_TOPICO do Anexo I / cobertura.json]
- Recorte legal: [DISPOSITIVO — ver §7 do perfil da disciplina]
- Dificuldade: 4 ou 5 (mínimo banco)
- Gabarito: [A/B/C/D ou distribuir conforme lote]

Consultar antes de gerar:
- perfil vertical: perfis/perfil-{disciplina}.md (mapa slug→arquivo na SKILL.md) — §2 forma, §3 mecanismos, §8 família, §9 lacunas, §10 fila ROI
- perfil-banca.md + conteudo-programatico.md
- npm run index:questoes → content/questoes/_index/cobertura.json (eixo livre)

Siga:
- .cursor/skills/estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md
- familias/PADRAO-{A|B|C|D}-….md + JSON ouro da família
- .cursor/skills/examinador-idecan/SKILL.md (<cadeia_anti_alucinacao>, <gate_primeira_passagem>, mecanismos por distrator)

Questão:
- 4 alternativas A–D; cada errada com 1 slug: numero_vizinho | competencia_snt | gravidade | regra_excecao | termo_unico
- passo_a_passo[1] nomeia o mecanismo de cada alternativa errada
- Gate 9: erradas on-case; competencia_snt só com órgão/competência no stem
- Gate 10: meta.near_transfer + far_transfer + o_que_nao_muda; eixo_vizinho se couber
- meta.isca_por_alternativa (A/B/D)
- Pegadinha obrigatória se dificuldade ≥ 3

Diagnóstico: contexto só iscas; distratores com análise por mecanismo.
Grifos: npm run grifo:offsets → texto_grifado; motivo ecoa id da tela.
Macete com near + far + o que NÃO muda; E1–E3.
<cadeia_anti_alucinacao> em toda citação legal.
Gate primeira passagem 10/10 → Mayer 8/8 + editorial #17–#19 → validate:lote (5 gates) → index:questoes → db:seed. Não commitar.

Gravar em: content/questoes/[SLUG]/lote-[NNN].json
```

### O que trocar por disciplina

Só muda o bloco **Escopo + Consultar**. Resolver o arquivo pelo mapa slug→arquivo em [SKILL.md](./SKILL.md).

| `disciplina` | Perfil | `topico` (exemplos) | Recorte legal | Família / forma |
|--------------|--------|---------------------|---------------|-----------------|
| `legislacao_transito` | perfil-transito.md | `CTB_infracoes`, `CTB_snt_competencias`, `CONTRAN_432_alcoolemia` | CTB + resolução CONTRAN (só retificação 01/2026) | Caso STTP 250–500 chars · A/C/D |
| `portugues` | perfil-portugues.md | `leitura_interpretacao_textual`, `concordancia_nominal_verbal` | Norma culta (sem lei — validar gramática) | **Texto-base 800–1500 + 3–4 Q no mesmo texto** · A/B |
| `informatica` | perfil-informatica.md | `seguranca_informacao_malwares`, `planilhas_formulas` | Conceitos atuais Windows/Office (sem lei) | Enunciado 250–500 / alt 40–80 · B/D · **≥1 correspondência no lote** |
| `direito_constitucional` | perfil-constitucional.md | `cf_art5_*`, `cf_remedios_*` (evitar art. 144 saturado) | CF/88 (`cf-1988.html`) | Caso 300–550 · C (competência) / A (remédios) |
| `direito_administrativo` | perfil-administrativo.md | `dir_adm_4_5` (poder polícia), `dir_adm_1_1` (lacuna) | CF 37–41 + Lei 9.784 + Lei 14.133 (nunca CONTRAN) | Caso STTP 250–450 · A / B |
| `legislacao_etica_sp` | perfil-etica-sp.md | **priorizar LGPD/LAI** (banco saturado em `etica_sp_1_1`) | LOM CG + LGPD + LAI + CF art. 37 | Caso 300–500 · A (LGPD) / C (LOM) / D (LAI) |
| `historia_cg_pb` | perfil-historia-cg-pb.md | `historia_cg_pb_formacao`, `_personagens` | **Só** `conteúdo/historia-cg-pb/base-factual.md` | Enunciado 150–400 · D (datas) / A (personagens) |

**Ajustes que mudam o corpo do prompt:**

- **portugues:** trocar "1 questão" por "1 texto-base + 3–4 questões"; comando CORRETA como padrão; `<cadeia_anti_alucinacao>` valida a **regra gramatical**, não artigo.
- **informatica:** sem lei — validar comportamento canônico do software; pedir ≥1 questão de correspondência no lote.
- **historia_cg_pb:** todo fato deve constar na `base-factual.md`; ausente → `[verificar]`. Sem lei/jurisprudência.
- **legislacao_etica_sp:** não gerar só Lei Orgânica; pedir explicitamente LGPD ou LAI (lacuna real).
- **direito_constitucional:** evitar novo art. 144 se `cobertura.json` já saturou; priorizar art. 5º / remédios.
- **direito_administrativo:** caso STTP + poder de polícia quando couber.
- **legislacao_transito:** resolução só da retificação; conferir eixo não saturado no `cobertura.json`.

---

## Prompt lote (várias questões)

```text
Modo Agent. Skills: examinador-idecan + estudo-reverso-visual.

Gerar content/questoes/[disciplina]/lote-[NNN].json:
- npm run proxima -- [disciplina] --n [N] → usar os N tópicos do ranking (1 Q por tópico; máx. 3 por microtópico no lote)
- Ou: perfis/perfil-{disciplina}.md (§9 lacunas, §10 fila ROI) se escolher tópicos manualmente
- Mix dificuldade banco: 100% níveis 4–5 (mínimo 4; validador D1)
- Gabarito: nenhuma letra >35% nem <15%; máx. 2 iguais consecutivos
- Padrão pedagógico v3 por questão (classificar família A|B|C|D)
- Campo JSON: estudo_reverso_visual_completo, versao 2, 7–11 telas
- Hub: PADRAO-AULA-COMPLETA-v3.md + família + JSON ouro correspondente
- contexto só iscas; grifos com texto_grifado; erradas on-case
- Gate primeira passagem 10/10 + Mayer 8/8 + editorial #17–#19 + E1–E3 por questão → validate:lote (5 gates) → db:seed
- Não commitar
```

---

## Checklist pós-geração (humano)

- [ ] Família A|B|C|D correta para o tipo de questão
- [ ] Questão inédita — não repete enunciado/eixo de lotes existentes
- [ ] Gabarito único e defensável com dispositivo citável
- [ ] `meta.near_transfer` / `far_transfer` / `o_que_nao_muda` preenchidos e distintos
- [ ] Aula amarrada ao enunciado desta questão (não genérica); macete com far-transfer
- [ ] E1–E3 respondíveis em 15s cada
- [ ] `estudo_reverso_visual_completo.versao === 2`
- [ ] `npm run validate:lote` passou nos 5 gates (inclui preview:grifos). Lote legado sem transferência: `--legacy-transferencia`
- [ ] Seed aplicado (`db:seed`)