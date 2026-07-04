# Canvas para Design Front-End

Canvas = artefato visual **standalone** ao lado do chat. Código de produção = arquivos em `src/`.

Ler a skill `canvas` (built-in) ao criar ou editar qualquer `.canvas.tsx`.

## Quando usar Canvas

| Cenário | Canvas |
|---------|--------|
| Comparar layout A vs B antes de implementar | Sim |
| Auditoria visual categorizada (🔴🟡🟢) | Sim |
| Explorar paleta + escala tipográfica | Sim |
| Mapa de estados de um componente | Sim |
| Implementar tela no app Next.js | Não — codar em `src/` |
| Fix pontual de CSS | Não |
| Debug de hydration ou lógica | Não |

## Quando NÃO usar

- Usuário pediu código no projeto
- Debugging ativo
- MCP consultado só como passo intermediário para outra entrega

## Regras Canvas (design)

Mesma filosofia anti-slop do app:

- Cores via `useHostTheme()` — sem hex hardcoded
- Sem gradientes, box-shadows, emojis decorativos
- Hierarquia clara — squint test
- Misturar seções abertas com cards
- **Nunca** renderizar empty states ou placeholders

## Estrutura sugerida — auditoria visual

```tsx
// Seções típicas (componentes cursor/canvas)
// H1: título da auditoria
// Callout tone="warning": resumo de issues críticas
// Grid de Stat: contagem por severidade
// Table: arquivo | issue | severidade | sugestão
// CollapsibleSection por categoria (A11y, Tokens, Mobile)
```

## Estrutura sugerida — mockup A/B

```tsx
// Row com duas colunas (mobile: Stack vertical)
// Coluna A: "Atual" — descrição + lista de problemas
// Coluna B: "Proposto" — wireframe com componentes canvas
// Callout: decisão recomendada
```

## Link para o usuário

Sempre incluir link markdown com path absoluto para o `.canvas.tsx` criado.

## Relação com código

Após aprovação no Canvas:

1. Traduzir para shadcn em `src/`
2. Usar tokens de `globals.css`, não tokens do canvas
3. Rodar checklist de accessibility.md no código final
