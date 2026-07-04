---
name: ui-workflow
description: Roteia tarefas de UI do Agente de Trânsito Aprovado para o skill correto — frontend-design (telas no app), Canvas (protótipos/A-B), ou figma-implement-design (mockup Figma → código). Acionar quando o usuário pedir UI, layout, redesign, protótipo, mockup ou implementar design do Figma.
---

# UI Workflow — Agente de Trânsito Aprovado

Escolha **um** fluxo por tarefa. Não misturar entregas.

## Roteamento

| Intenção do usuário | Skill / ferramenta | Entrega |
|---------------------|-------------------|---------|
| Melhorar ou criar tela no app | `frontend-design` | Código em `src/` |
| Comparar layouts, auditoria visual, explorar paleta | `canvas` + `frontend-design/canvas-patterns.md` | Arquivo `.canvas.tsx` |
| Implementar frame/componente que **já existe no Figma** | `figma-implement-design` + MCP Figma | Código em `src/` |
| Sincronizar código → Figma | **Não usar** (`figma-generate-design`) | — |

## Fluxo padrão (code-first)

```
1. Ler frontend-design → regras 06 + 08 + globals.css
2. Se incerto na direção visual → Firecrawl (inspiration.md)
3. Se precisa validar antes de codar → Canvas A/B
4. Implementar em src/ com shadcn + tokens semânticos
5. Pre-delivery: accessibility.md + anti-slop.md
```

## Fluxo Figma → código

Só quando o usuário fornecer URL Figma (`https://figma.com/design/...?node-id=...`):

```
1. Confirmar MCP Figma conectado (.cursor/mcp.json → oauth no primeiro uso)
2. Ler figma-implement-design/SKILL.md + projeto.md
3. get_design_context → get_screenshot → assets
4. Traduzir para shadcn/tokens do projeto (não CSS solto do Figma)
5. Pre-delivery: frontend-design (accessibility + anti-slop)
```

## MCPs úteis para UI

| MCP | Uso |
|-----|-----|
| Firecrawl | Benchmarks e referências visuais |
| Supabase | Dashboards com dados reais (Semáforo, SRS) |
| Figma | Apenas fluxo implement-design |

## Skills do projeto

- `.cursor/skills/frontend-design/` — design system e implementação
- `.cursor/skills/figma-implement-design/` — Figma → código
- Skill global `canvas` — protótipos `.canvas.tsx`
