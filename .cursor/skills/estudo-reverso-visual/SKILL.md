---
name: estudo-reverso-visual
description: Especialista em micro-aulas visuais de alta retenção para o player pós-questão do Agente de Trânsito Aprovado. Gera estudo_reverso_visual JSON tipado por questão (arquétipos Mayer + dual coding + micro-recall), valida carga cognitiva, integra IDECAN/CTB e FSRS. Use ao criar estudo reverso visual, popular content/questoes/, implementar telas do player ou encadear após examinador-idecan.
---

# Estudo Reverso Visual — Alta Retenção

Designer instrucional + examinador IDECAN. Cada micro-aula consolida **uma questão específica**.

## Base científica

- Testing effect (Roediger & Karpicke, 2006)
- Pretesting + feedback elaborado (Andersen & Mayer, 2023)
- Dual coding (Paivio) + CTML (Mayer, 2009/2021)
- Generative recall (Fiorella & Mayer)
- Spacing + FSRS (Cepeda; open-spaced-repetition)
- **Proibido:** estilos de aprendizagem (Pashler et al., 2008)

## Workflow por questão

1. Ler enunciado + `comentario` + gabarito + `estilo_idecan`
2. Escolher arquétipo ([tabela abaixo](#tabela-de-decisao))
3. Montar 4-6 telas segmentadas
4. Ultima tela = `micro_recall` obrigatorio
5. Validar [checklist-mayer.md](checklist-mayer.md)
6. `npm run validate:estudo-reverso-visual -- arquivo.json`

## Tabela de decisão

| Sinal na questão | Arquétipo | Template |
|------------------|-----------|----------|
| `pegadinha_pode_deve` | `comparacao` | [comparacao-pode-deve.md](arquetipos/comparacao-pode-deve.md) |
| `tipo: assertivas` | `matriz_assertivas` | [matriz-assertivas.md](arquetipos/matriz-assertivas.md) |
| `pegadinha_percentual` / prazos | `tabela_gradacao` | [tabela-gradacao.md](arquetipos/tabela-gradacao.md) |
| `caso_pratico` CTB | `fluxograma_decisao` | [fluxograma-decisao.md](arquetipos/fluxograma-decisao.md) |
| competencias SNT | `diagrama_competencia` | [diagrama-competencia.md](arquetipos/diagrama-competencia.md) |
| sequencia temporal | `linha_tempo` | [linha-tempo.md](arquetipos/linha-tempo.md) |
| confusao de artigos | `trecho_legal` | [trecho-legal-grifado.md](arquetipos/trecho-legal-grifado.md) |
| contexto IDECAN | `texto_destaque` | tela 1 padrao |
| sempre (ultima) | `micro_recall` | [micro-recall.md](arquetipos/micro-recall.md) |

## Schema JSON

Campo na raiz da questão: `estudo_reverso_visual`

Tipos em `src/types/estudo-reverso-visual.ts`. Validacao Zod em `src/lib/validations/estudo-reverso-visual.ts`.

Exemplo completo: [exemplos-ouro/ctb-embriaguez.json](exemplos-ouro/ctb-embriaguez.json)

## Estrutura padrao (6 telas)

1. `texto_destaque` — O que a IDECAN testou
2. Arquétipo principal (fluxo / matriz / tabela / diagrama)
3. `comparacao` ou pegadinha visual
4. `trecho_legal` — lei seca grifada
5. `texto_destaque` — macete visual
6. `micro_recall` — fixacao ativa

## Reuso entre irmãs

- Questão-mãe: visual completo
- Irmãs: `ref_visual_id` apontando para id da mãe OU copiar telas trocando só tela `contexto`

## Integração

- Depende de: `examinador-idecan` (questão base)
- Alimenta: `src/components/estudo-reverso/estudo-reverso-player.tsx`
- Regra: `.cursor/rules/03-estudo-reverso.mdc`
- UI: `.cursor/skills/frontend-design/retencao-visual.md`

## Prompt de lote (Agent mode)

```
Use examinador-idecan + estudo-reverso-visual.

Gere content/questoes/legislacao_transito/lote-00X.json:
- 10 questoes ineditas + 3 irmaas cada (mesmo topico)
- Cada questao com estudo_reverso_visual completo (JSON tipado)
- Consultar conteudo/FONTES.md antes de citar lei
- Rodar validate:questoes, validate:indistinguibilidade,
  validate:estudo-reverso-visual — corrigir ate zero erros
- Nao commitar
```

## Anti-padrões

- Infográfico único com 10 conceitos
- Copiar diagrama de cursinho
- Visual sem fundamento legal
- Recall com resposta ambígua
- 3 telas só de texto sem componente visual
- Mermaid no JSON do app (usar JSON tipado para renderers React)

## Recursos

- [checklist-mayer.md](checklist-mayer.md)
- [exemplos-ouro/](exemplos-ouro/)
- [arquetipos/](arquetipos/)
