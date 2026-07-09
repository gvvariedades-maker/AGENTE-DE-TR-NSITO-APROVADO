# Prompts e guia de UI para alta retenção

Documentação de referência para construir front-end com foco em **retenção de estudo** (concurso IDECAN/STTP). Use no **Agent mode**.

## Qual skill usar

| Objetivo | Skill | Entrega |
|----------|-------|---------|
| Criar ou melhorar tela no app | `frontend-design` | Código em `src/` |
| Prototipar A/B ou auditar visual antes de codar | `canvas` + `canvas-patterns.md` | `.canvas.tsx` |
| Implementar mockup que já existe no Figma | `figma-implement-design` | Código em `src/` |
| Escolher o fluxo certo | `ui-workflow` | Roteamento |

**Não usar:** `figma-generate-design` (código → Figma). O projeto é code-first.

## Evidência → decisão de UI

| Princípio | Base | Implementação no app |
|-----------|------|---------------------|
| Prática de recuperação | Testing effect (Roediger & Karpicke) | Recall gate — alternativas ocultas até tentativa |
| Carga cognitiva baixa | CLT (Sweller, 1988) | Uma questão/tela, modo foco, progressive disclosure |
| Uma decisão por tela | GOV.UK / NN/g forms | Mobile: enunciado → alternativas → navegação |
| Feedback adaptativo | Frontiers in Psychology, 2021 | Acerto = KR breve; erro = feedback elaborado em blocos |
| SRS visual | Anki / FSRS | Ciclo aprendendo → jovem → maduro; heatmap 7 dias |
| Clareza mobile | Quiz UX 2025–2026 | `text-lg`, touch ≥44px, hierarquia pergunta > opções |
| Consistência | Heatmaps Duolingo/Anki | Barra de progresso, timer, semáforo no dashboard |
| Uma ação primária | Peps McCrea LID | Um CTA por fase: revelar → confirmar → próximo |

**Evitar:** gamificação vazia (streak sem recall), gabarito antes da tentativa, feedback longo de uma vez, múltiplos CTAs na mesma viewport.

Detalhes e componentes: [retencao-visual.md](../frontend-design/retencao-visual.md)

## Prompt base (copiar e colar)

Substitua `[TELA]` pela descrição da tela ou fluxo.

```text
Use o skill frontend-design + ui-workflow.

Contexto: PWA de estudo para concurso Agente de Trânsito STTP/IDECAN.
Objetivo: máxima RETENÇÃO de conteúdo, não estética chamativa.

Leia obrigatoriamente antes de codar:
- .cursor/skills/frontend-design/retencao-visual.md
- .cursor/rules/06-ui-ux-estudo.mdc
- .cursor/rules/08-design-system.mdc
- src/app/globals.css

Princípios de retenção (não negociáveis):
1. Uma questão por tela no mobile; carga cognitiva mínima
2. Recall gate: enunciado visível ANTES das alternativas (modo estudo)
3. Uma ação primária por fase (revelar → confirmar → próximo)
4. Feedback adaptativo: acerto = confirmação breve; erro = elaborado em blocos
5. Modo foco esconde navegação; timer visível em simulado
6. Sem gamificação vazia, sem múltiplos CTAs competindo
7. Enunciado text-lg (≥18px), touch targets ≥44px, contraste WCAG AA

Stack: Next.js 15 + shadcn/ui + tokens semânticos.
Proibido: cores Tailwind cruas, hex solto, design system paralelo.

Tela a construir: [TELA]

Antes de codar, escreva 1 parágrafo de direção visual (personalidade, hierarquia, cor, evitar).
Se layout incerto, prototipe A/B em Canvas antes de implementar em src/.
Ao final, rode checklist de accessibility.md e anti-slop.md.
```

## Prompts por tipo de tela

### Questão mobile (estudo ou simulado)

```text
Use frontend-design + ui-workflow.

Leia: retencao-visual.md + examples/questao-mobile.md + 06-ui-ux-estudo.mdc

Tela: [estudo reverso | simulado espelho 60Q | revisão de erros]

Requisitos:
- Barra sticky: progresso + timer (simulado) + Qn/60
- Enunciado scrollável (text-lg leading-relaxed)
- Alternativas com área de toque ampla; atalhos A–D no desktop (edital item 10.4)
- Modo estudo: confiança FSRS pós-resposta + aula visual v2 (sem recall livre no player)
- Modo simulado: sem correção durante; alerta timer ≤30 min
- Modo foco: esconder nav lateral

Implementar em src/ com shadcn. Pre-delivery: accessibility + anti-slop.
```

### Dashboard Semáforo de Aprovação

```text
Use frontend-design + ui-workflow.

Leia: examples/dashboard-semaforo.md + retencao-visual.md

Tela: dashboard principal com risco de eliminação.

Requisitos:
- Semáforo verde/amarelo/vermelho: Gerais, Específicos, Total
- Contagem regressiva para prova (30/08/2026)
- Card "Sua prova hoje": SRS + piores tópicos
- Heatmap de consistência 7 dias
- Dados reais via Supabase MCP (estados loading/empty/error úteis)

Implementar em src/. Pre-delivery: accessibility + anti-slop.
```

Rota: `src/app/(dashboard)/dashboard/page.tsx`

### Página inicial (landing `/`)

Primeira tela do app — porta de entrada antes do painel completo. **Uma ação primária** por viewport.

```text
Use frontend-design + ui-workflow.

Leia: retencao-visual.md + anti-slop.md + 06-ui-ux-estudo.mdc

Tela: landing pública em src/app/page.tsx

Requisitos:
- Hierarquia: contagem regressiva → CTA único primário → ações secundárias
- CTA primário: "Estudar CTB agora" → /estudo (modo estudo com aula visual pós-resposta)
- Secundários (outline/ghost, sem competir): Simulado → /simulado, Painel → /dashboard
- Mapa da prova: reutilizar ProvaDistribuicaoBar (não lista genérica)
- Sem dois cards com botões de peso igual lado a lado
- Copy em pt-BR, institucional, sem gamificação vazia
- Não duplicar o dashboard inteiro — landing enxuta, painel no /dashboard

Implementar em src/app/page.tsx. Pre-delivery: accessibility + anti-slop.
```

**Estado atual vs alvo**

| Atual (evitar) | Alvo (retenção) |
|----------------|-----------------|
| Dois CTAs primários iguais (Simulado + Estudo) | Um CTA primário; resto secundário |
| Ambos links → `/dashboard` | `/estudo`, `/simulado`, `/dashboard` corretos |
| Lista textual da distribuição | `ProvaDistribuicaoBar` visual |
| Sem conexão com recall/SRS | Microcopy do fluxo estudo reverso no card principal |

### Protótipo A/B (antes de codar)

```text
Use ui-workflow → Canvas.

Leia: canvas-patterns.md + anti-slop.md

Comparar layout [A] vs [B] para tela de [X].
Foco em retenção: hierarquia, uma ação primária, carga cognitiva.
Não implementar em src/ — entregar .canvas.tsx apenas.
```

### Figma → código

```text
Use figma-implement-design + ui-workflow.

URL Figma: [cole aqui]
Leia: figma-implement-design/SKILL.md + projeto.md + frontend-design/SKILL.md

Traduzir para shadcn + tokens do projeto (não CSS solto do Figma).
Aplicar princípios de retencao-visual.md na interação.
Pre-delivery: accessibility + anti-slop.
```

## Fluxo recomendado

```
Brief da tela
    ↓
ui-workflow (escolhe skill)
    ↓
frontend-design → retencao-visual + rules 06/08
    ↓
Incerto? → Firecrawl (inspiration.md) ou Canvas A/B
    ↓
Implementar em src/ (shadcn + tokens)
    ↓
Pre-delivery: accessibility.md + anti-slop.md
```

## MCPs

| MCP | Quando usar |
|-----|-------------|
| Firecrawl | Benchmark visual de apps de estudo/quiz |
| Supabase | Dashboards com métricas reais (Semáforo, SRS) |
| Figma | Só com URL de frame existente (implement-design) |

Config Figma: `.cursor/mcp.json` → OAuth na primeira vez.

## Referências externas

- [Testing effect — Learning & Instruction 2025](https://doi.org/10.1016/j.learninstruc.2025.102219)
- [Feedback adaptativo — Frontiers in Psychology 2021](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.706821/full)
- [CLT em UI](https://www.aufaitux.com/blog/cognitive-load-theory-ui-design/)
- [NN/g — reduzir carga cognitiva em forms](https://www.nngroup.com/articles/4-principles-reduce-cognitive-load/)
- [Anki stats / FSRS](https://docs.ankiweb.net/stats.html)

## Arquivos do projeto

| Arquivo | Conteúdo |
|---------|----------|
| `frontend-design/SKILL.md` | Workflow completo de implementação |
| `frontend-design/retencao-visual.md` | Padrões com evidência |
| `frontend-design/examples/` | Questão mobile, dashboard semáforo |
| `rules/06-ui-ux-estudo.mdc` | Domínio de estudo |
| `rules/08-design-system.mdc` | Tokens e shadcn |
