# Anti-Slop

Padrões que produzem UI genérica de IA. Se **2 ou mais** estiverem presentes, redesenhar.

## Proibido

| Padrão | Por quê |
|--------|---------|
| Gradientes decorativos | Assinatura "AI default"; conflita com flat minimal do projeto |
| `box-shadow` pesado custom | Cards já usam `ring-1 ring-foreground/10` |
| Emojis como ícones de UI | Não profissional; usar texto ou ícone SVG (lucide) |
| Wall of identical cards | Mesma estrutura repetida sem hierarquia |
| Rainbow coloring | Cada elemento uma cor diferente |
| Inter + purple gradient hero | Template reconhecível de IA |
| Hero gigante em app de estudo | Desperdiça viewport no mobile |
| `rounded-full` em tudo | Perde identidade institucional |
| Placeholder "Lorem ipsum" | Usar copy real em pt-BR do domínio |
| Criar Button/Card/Badge custom | Existem em `@/components/ui/` |

## Obrigatório

- **Hierarquia:** um elemento primário por viewport (enunciado, métrica principal, CTA)
- **Variedade:** misturar seções abertas com cards — não encapsular tudo
- **Cor com propósito:** neutro por padrão; accent só em interativo e status
- **Densidade adequada:** texto longo (enunciados) com respiro; dashboards compactos mas legíveis
- **Estados completos:** default, hover, focus-visible, disabled, loading

## Squint test

Desfocar mentalmente a tela:

1. Dá para identificar a ação principal?
2. O conteúdo mais importante tem mais peso visual?
3. Parece template genérico ou produto com intenção?

Se falhar em qualquer item → ajustar antes de entregar.

## Checklist rápido

```
- [ ] Zero gradientes decorativos
- [ ] Zero emojis na UI
- [ ] Cores via tokens semânticos
- [ ] shadcn reutilizado (sem duplicar primitivos)
- [ ] Hierarquia tipográfica clara (h1 > h2 > corpo)
- [ ] Uma CTA primária por tela
- [ ] Copy em português BR do domínio de concurso
```
