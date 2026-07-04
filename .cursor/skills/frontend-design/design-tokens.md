# Design Tokens

Fonte de verdade: `src/app/globals.css`. Não duplicar valores em hex no código — usar variáveis CSS ou classes Tailwind semânticas.

## Cores (OKLCH)

| Token Tailwind | Uso |
|----------------|-----|
| `bg-background` / `text-foreground` | Superfície base e texto principal |
| `bg-card` / `text-card-foreground` | Cards e painéis elevados |
| `bg-muted` / `text-muted-foreground` | Fundos secundários, legendas, hints |
| `bg-primary` / `text-primary-foreground` | CTA principal, links de ação |
| `bg-secondary` / `text-secondary-foreground` | Ações secundárias, badges neutros |
| `bg-destructive` / `text-destructive` | Erro, eliminação, alertas críticos |
| `border-border` | Bordas estruturais |
| `ring-ring` | Focus visible |

## Cores de domínio (estudo)

Mapear via Badge, borda lateral ou ícone + texto (nunca só cor):

| Significado | Abordagem |
|-------------|-----------|
| Acerto | `text-green-500` ou badge com borda verde — preferir token custom futuro |
| Erro | `destructive` ou `text-destructive` |
| Revisão pendente | amarelo/âmbar com `Badge variant="outline"` |
| Institucional / info | `primary` ou `bg-primary/5 border-primary/30` (padrão da home) |

**Nota:** quando tokens semânticos de status forem adicionados ao `globals.css`, migrar e remover utilitários Tailwind de cor bruta.

## Tipografia

| Elemento | Classe sugerida |
|----------|-----------------|
| Título de página | `text-2xl font-bold tracking-tight md:text-3xl` |
| Seção | `text-lg font-semibold` |
| Card title | `CardTitle` (text-base) |
| Enunciado de questão | `text-lg leading-relaxed` (mínimo 18px) |
| Corpo / lista | `text-sm` |
| Números (timer, dias) | `tabular-nums` |
| Código / lei seca | `font-mono text-sm` |

Fontes: Geist Sans (`--font-sans`), Geist Mono (`--font-geist-mono`).

## Espaçamento e layout

| Padrão | Classe |
|--------|--------|
| Padding de página | `p-4 md:p-8` |
| Gap entre seções | `gap-6` |
| Gap entre cards | `gap-3` ou `gap-4` |
| Largura máxima conteúdo | `max-w-5xl mx-auto` |
| Grid responsivo | `grid gap-4 sm:grid-cols-2` ou `sm:grid-cols-3` |

## Radius

Escala via `--radius` (0.625rem base):

- `rounded-lg` — botões, itens de lista
- `rounded-xl` — cards (padrão shadcn do projeto)

Não inventar `rounded-3xl` em tudo.

## Tema claro (padrão)

Tema claro ativo por padrão em `layout.tsx`. Fundo `bg-background` quase branco com leve tom azul institucional.

Contraste mínimo: 4.5:1 texto normal, 3:1 texto grande — validar em fundo claro.

## Proibido

```tsx
// ❌ cores Tailwind arbitrárias
className="bg-blue-500 text-gray-300"

// ❌ hex inline
style={{ color: "#3b82f6" }}

// ✅ tokens semânticos
className="bg-primary text-primary-foreground"
className="border-primary/30 bg-primary/5"
```
