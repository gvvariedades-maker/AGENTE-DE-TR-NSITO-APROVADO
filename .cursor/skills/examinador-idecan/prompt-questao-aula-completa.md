# Prompt — Questão inédita IDECAN + aula completa (padrão v3)

Copie e cole em uma **nova conversa no modo Agent**. Substitua os campos entre `[colchetes]`.

## Nomenclatura (não confundir)

| Nome | O que é |
|------|---------|
| **Padrão pedagógico v3** | Hub + famílias A–D, contratos de tela, gate editorial 12/12 → [PADRAO-AULA-COMPLETA-v3.md](../estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md) |
| **Campo JSON v2** | `estudo_reverso_visual_completo` com `"versao": 2`, 7–11 telas — formato gravado no banco e validado pelo Zod |

**Não existe `versao: 3` no schema.** Sempre produzir com o **guia v3** e gravar no **campo v2**.

Documentação de referência:

| Recurso | Caminho |
|---------|---------|
| Examinador IDECAN | [SKILL.md](./SKILL.md) |
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
- Dificuldade: [3 ou 4]
- Gabarito desejado: [A/B/C/D ou "distribuir conforme lote"]

## Padrão pedagógico v3 (como montar a aula)
1. Classificar família A|B|C|D — PADRAO-AULA-COMPLETA-v3.md
2. Abrir familias/PADRAO-{X}-….md + JSON ouro da família (não copiar art.29 cego)
3. Copiar estrutura (ids, ordem, tipos, seções) da família — NUNCA reusar texto literal
4. Diagnóstico com isca por errada; macete com near-transfer
5. .cursor/skills/examinador-idecan/SKILL.md (gate + mecanismos de distrator)

## Questão (estilo IDECAN real)
- 100% inédita; fundamento legal verificável em conteúdo/ (<cadeia_anti_alucinacao>)
- 4 alternativas A–D (edital item 10.4)
- Enunciado no estilo IDECAN (caso prático Campina Grande quando couber; paridade de ofício)
- Cada errada com 1 mecanismo: numero_vizinho | competencia_snt | gravidade | regra_excecao | termo_unico
- passo_a_passo[1] nomeia o slug de cada alternativa errada
- Pegadinha obrigatória se dificuldade ≥ 3
- Comentário Professor Elite completo (objeto comentario no JSON)

## Regras técnicas do campo v2
- Núcleo: contexto → arquétipo da família → contraste → distratores → caso → trecho_legal → macete
- Condicionais só com gatilho real (mapa da família, não decorar telas)
- secao válidas: diagnostico|mapa|contraste|distratores|metodo|lei|conceito|macete (glossário: omitir secao)
- Família A: fluxograma MÉTODO linear ≤4 nós, 1 resultado, sem art. no label
- trecho_legal: texto literal de conteúdo/, grifos por indexOf, motivo ecoa id da tela
- Gate Mayer 8/8 + editorial 12/12 (hub v3) antes do npm

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
- Número de telas da aula
- Resultado dos 3 gates de validate:lote
- Caminho do arquivo gravado
```

---

## Prompt curto (tópico já definido)

```text
Modo Agent. Skills: examinador-idecan + estudo-reverso-visual.

Questão inédita IDECAN + aula completa:
- Padrão pedagógico v3 (hub + família A|B|C|D)
- Gravar em estudo_reverso_visual_completo, versao 2, 7–11 telas

Escopo:
- Disciplina/topico: [legislacao_transito] / [TOPICO]
- Recorte legal: [ARTIGO ou RESOLUÇÃO]
- Dificuldade [N], gabarito [LETRA ou distribuir]

Siga:
- .cursor/skills/estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md
- familias/PADRAO-{A|B|C|D}-….md + JSON ouro da família

Diagnóstico com isca por errada; macete com near-transfer.
<cadeia_anti_alucinacao> em toda citação legal.
Gate Mayer 8/8 + editorial 12/12 → validate:lote → db:seed. Não commitar.
```

---

## Prompt lote (várias questões)

```text
Modo Agent. Skills: examinador-idecan + estudo-reverso-visual.

Gerar content/questoes/[disciplina]/lote-[NNN].json:
- [N] questões ouro (1 por microtópico prioritário; máx. 3 por microtópico no lote)
- Mix dificuldade: ~20% 1–2, ~50% 3, ~30% 4–5
- Gabarito: nenhuma letra >35% nem <15%; máx. 2 iguais consecutivos
- Padrão pedagógico v3 por questão (classificar família A|B|C|D)
- Campo JSON: estudo_reverso_visual_completo, versao 2, 7–11 telas
- Hub: PADRAO-AULA-COMPLETA-v3.md + família + JSON ouro correspondente
- Gate Mayer 8/8 + editorial 12/12 por questão → validate:lote → db:seed
- Não commitar
```

---

## Checklist pós-geração (humano)

- [ ] Família A|B|C|D correta para o tipo de questão
- [ ] Questão inédita — não repete enunciado/eixo de lotes existentes
- [ ] Gabarito único e defensável com dispositivo citável
- [ ] Aula amarrada ao enunciado desta questão (não genérica)
- [ ] `estudo_reverso_visual_completo.versao === 2`
- [ ] `npm run validate:lote` passou nos 3 gates
- [ ] Seed aplicado (`db:seed`)
