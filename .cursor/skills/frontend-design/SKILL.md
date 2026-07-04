---
name: frontend-design
description: Especialista em design de interfaces production-grade para Next.js + Tailwind + shadcn/ui. Define direção visual, composição, tipografia, tokens semânticos, estados de componente, mobile-first, dark mode e WCAG 2.1 AA. Evita estética genérica de IA. Usa Firecrawl para benchmarks e Canvas para protótipos ou auditorias visuais. Acionar ao criar telas, dashboards, fluxos UX, redesign, revisão visual, design system ou quando o usuário pedir UI, layout, componentes ou acessibilidade.
---

# Frontend Design

Designer front-end sênior + engenheiro UI para o **Agente de Trânsito Aprovado** (PWA de estudo, IDECAN/STTP).

**Personalidade visual:** institucional confiável, foco noturno, zero distração — legível às 23h no celular, não startup neon.

## Fontes obrigatórias (ler antes de codar)

| Fonte | Caminho |
|-------|---------|
| UX de estudo | `.cursor/rules/06-ui-ux-estudo.mdc` |
| Design system (globs) | `.cursor/rules/08-design-system.mdc` |
| Tokens CSS | `src/app/globals.css` |
| Componentes base | `src/components/ui/` |
| Layout raiz | `src/app/layout.tsx` (`dark` fixo no `<html>`) |

**Prioridade:** regras do projeto > tokens existentes > pesquisa externa.

## Workflow

```
- [ ] 0. Contexto — ler fontes acima; listar componentes ui/ disponíveis
- [ ] 1. Brief — tela/fluxo, dispositivo primário, modo claro/escuro
- [ ] 2. Pesquisa — se tela nova ou redesign: Firecrawl (ver inspiration.md)
- [ ] 3. Direção visual — 1 parágrafo (template abaixo) antes de codar
- [ ] 4. Implementação — shadcn + tokens semânticos + mobile-first
- [ ] 5. Canvas — se mockup, A/B ou auditoria visual (ver canvas-patterns.md)
- [ ] 6. Pre-delivery — accessibility.md + anti-slop.md (bloqueante)
```

## Direção visual (obrigatório — 1 parágrafo)

Antes de qualquer código, escrever:

- **Personalidade:** [ex.: foco noturno, institucional, clareza de prova]
- **Hierarquia:** [o que o olho vê primeiro]
- **Cor:** [semântica — primary só em CTA; status em badges]
- **Evitar:** [2–3 anti-padrões específicos desta tela]

## Implementação

### Stack (não alterar)

- Next.js 15 App Router, Server Components por padrão
- `"use client"` só com interatividade (timer, atalhos, seleção de alternativa)
- Tailwind + shadcn/ui em `@/components/ui/*`
- `cn()` de `@/lib/utils` para classes condicionais

### Tokens

Usar classes semânticas: `bg-background`, `text-foreground`, `border-border`, `bg-primary`, `text-muted-foreground`, `bg-destructive`.

**Proibido:** `bg-blue-500`, `text-gray-400`, hex solto no JSX.

Detalhes: [design-tokens.md](design-tokens.md)

### Composição

- Importar de `@/components/ui/*` — nunca recriar Button, Card, Badge, Progress, Tabs, Alert
- Mobile-first: estilos base = mobile; `sm:` / `md:` para desktop
- Uma ação primária por tela
- Textos de usuário em **português BR**

Padrões por tela: [component-patterns.md](component-patterns.md)

### Domínio de estudo (não negociável)

Da rule `06-ui-ux-estudo.mdc`:

- Enunciados: `text-lg` mínimo (≥18px), `leading-relaxed`
- Dark mode obrigatório (já ativo no layout)
- Semáforo: verde acerto, vermelho erro, amarelo revisão, azul institucional
- Simulado: barra de progresso, timer visível, alerta 30 min finais
- Desktop: atalhos A/B/C/D/E nas alternativas
- Modo foco: esconder navegação lateral

## Pesquisa externa (Firecrawl MCP)

Quando a estética ou o padrão UX não estiver claro:

1. `firecrawl_search` com queries de [inspiration.md](inspiration.md)
2. Extrair hierarquia, densidade, padrão de navegação — **não copiar pixel a pixel**
3. Registrar decisões na direção visual

## Canvas vs código

| Entrega | Onde |
|---------|------|
| Mockup, A/B, auditoria visual, paleta interativa | `.canvas.tsx` (ver [canvas-patterns.md](canvas-patterns.md)) |
| Tela de produção | `src/` |

Ler a skill `canvas` ao criar ou editar `.canvas.tsx`.

## Supabase MCP (UI data-driven)

Para dashboards com métricas reais (Semáforo, SRS):

1. `list_tables` → schema
2. `execute_sql` → amostra de dados para estados loading/empty/error
3. Prototipar estados vazios com mensagem útil, não placeholder genérico

## Pre-delivery (bloqueante)

Rodar cada item de [accessibility.md](accessibility.md) e [anti-slop.md](anti-slop.md).

**Squint test:** desfocar mentalmente — uma coisa deve se destacar; o resto é suporte.

## Formato de revisão visual

Ao auditar código existente:

- 🔴 **Crítico** — A11y, contraste, touch target, quebra mobile
- 🟡 **Sugestão** — hierarquia, densidade, consistência de tokens
- 🟢 **Opcional** — micro-melhorias de polish

## Recursos

- [design-tokens.md](design-tokens.md) — paleta OKLCH e escala
- [retencao-visual.md](retencao-visual.md) — padrões com evidência para retenção
- [anti-slop.md](anti-slop.md) — padrões proibidos
- [component-patterns.md](component-patterns.md) — composições shadcn
- [accessibility.md](accessibility.md) — checklist WCAG
- [inspiration.md](inspiration.md) — queries Firecrawl
- [canvas-patterns.md](canvas-patterns.md) — quando usar Canvas
- [examples/dashboard-semaforo.md](examples/dashboard-semaforo.md)
- [examples/questao-mobile.md](examples/questao-mobile.md)
