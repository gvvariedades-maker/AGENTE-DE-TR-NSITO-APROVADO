# Figma → Código neste projeto

Ao implementar designs do Figma no **Agente de Trânsito Aprovado**, seguir estas convenções **antes** de gerar código genérico.

## Stack (não alterar)

- Next.js 15 App Router + TypeScript strict
- Tailwind + shadcn/ui em `@/components/ui/*`
- Tokens semânticos em `src/app/globals.css`
- Dark mode fixo no `<html>` (`src/app/layout.tsx`)

## Prioridade de tradução

1. Mapear para componentes shadcn existentes (`Button`, `Card`, `Badge`, `Progress`, `Tabs`, `Alert`)
2. Usar classes semânticas: `bg-background`, `text-foreground`, `border-border`, `bg-primary`, `text-muted-foreground`
3. **Proibido:** `bg-blue-500`, hex solto no JSX, novos pacotes de ícones sem necessidade
4. Ler `.cursor/skills/frontend-design/SKILL.md` + rules `06-ui-ux-estudo.mdc` e `08-design-system.mdc`

## Domínio de estudo

- Enunciados: `text-lg` mínimo, `leading-relaxed`
- Semáforo: verde acerto, vermelho erro, amarelo revisão
- Simulado: timer visível, barra de progresso
- Textos de usuário em **português BR**

## Autenticação Figma MCP

Na primeira vez, o Cursor pede login OAuth no Figma. Sem isso, `get_design_context` e `get_screenshot` falham.
