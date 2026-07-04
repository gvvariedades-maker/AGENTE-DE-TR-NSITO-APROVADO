# Pesquisa de Inspiração (Firecrawl MCP)

Usar **antes** de inventar estética ou padrões UX complexos. Extrair princípios — não copiar layouts.

## Quando pesquisar

- Tela nova sem referência no projeto
- Redesign de dashboard ou fluxo de simulado
- Dúvida sobre densidade, hierarquia ou padrão mobile
- Auditoria contra guidelines externas

## Queries modelo

| Objetivo | Query |
|----------|-------|
| Dashboard educacional dark | `education study app dashboard dark mode mobile first 2025` |
| A11y checklist | `WCAG 2.1 AA focus visible contrast ratio checklist` |
| Guidelines Vercel | `site:vercel.com web interface guidelines accessibility` |
| Composição shadcn | `shadcn ui semantic tokens composition patterns` |
| Timer / prova | `exam timer progress bar UX mobile` |
| Evitar AI slop | `minimal institutional web app design no gradient` |

## Workflow

1. `firecrawl_search` com query + `limit: 5`
2. Se necessário, scrape da página mais relevante (`scrapeOptions.formats: ["markdown"]`)
3. Para extrair branding de site de referência: `scrapeOptions.formats: ["branding"]`
4. Registrar em 4 linhas:

```markdown
## Ref: [nome]
- Hierarquia: [ex.: stats em grid 3col, CTA fixo no rodapé mobile]
- Densidade: [ex.: enunciado com padding generoso]
- Aplicar: [1 decisão concreta para este projeto]
- Não copiar: [ex.: ilustrações, gradientes, sidebar complexa]
```

5. Chamar `firecrawl_search_feedback` com o `id` da busca após processar

## O que NÃO fazer com resultados

- Copiar paleta hex de terceiros — adaptar aos tokens OKLCH do projeto
- Importar bibliotecas de UI diferentes do stack
- Adicionar animações pesadas vistas em landing pages de marketing
- Usar referências de apps com UX oposta (feed infinito, stories, gamificação exagerada)

## Fontes confiáveis para guidelines (não estética)

- [Vercel Web Interface Guidelines](https://vercel.com/design/guidelines)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- Documentação shadcn/ui para composição de componentes
