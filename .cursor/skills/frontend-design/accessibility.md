# Acessibilidade (WCAG 2.1 AA)

Checklist bloqueante antes de entregar qualquer tela.

## Contraste

- [ ] Texto normal: ratio ≥ 4.5:1 contra o fundo
- [ ] Texto grande (≥18px ou ≥14px bold): ratio ≥ 3:1
- [ ] Componentes UI e bordas de foco: ratio ≥ 3:1
- [ ] Testar em **tema claro** (modo padrão do app)

## Teclado e foco

- [ ] Toda ação interativa alcançável via Tab
- [ ] Ordem de tab lógica (progresso → enunciado → alternativas → navegação)
- [ ] `focus-visible:ring-3 focus-visible:ring-ring/50` (padrão dos botões shadcn)
- [ ] Atalhos A/B/C/D/E não substituem foco visível — complementam no desktop
- [ ] Sem armadilhas de foco em modais ou drawers

## Semântica

- [ ] Um `<h1>` por página
- [ ] Hierarquia h1 → h2 → h3 sem saltos
- [ ] `<html lang="pt-BR">` (já no layout)
- [ ] Botões para ações; links para navegação
- [ ] `aria-label` em botões só com ícone
- [ ] `aria-pressed` ou `aria-checked` em alternativas selecionadas

## Cor e informação

- [ ] Status (acerto/erro/revisão) não depende só de cor — incluir texto, ícone ou letra
- [ ] Timer e contagem com `tabular-nums` para leitura estável
- [ ] Alertas de tempo crítico (30 min) com `Alert` + texto explícito

## Touch e mobile

- [ ] Alvos de toque ≥ 44×44px (alternativas: `min-h-11`)
- [ ] Espaçamento entre alvos clicáveis adjacentes
- [ ] Enunciado scrollável sem cortar texto essencial
- [ ] `viewport` sem zoom bloqueado para usuários com baixa visão — revisar `maximumScale` se necessário

## Movimento

- [ ] Respeitar `prefers-reduced-motion` em animações não essenciais
- [ ] Transições sutis (`transition-colors`) — sem parallax ou auto-play

## Formulários

- [ ] Labels visíveis associados a inputs
- [ ] Erros de validação com texto descritivo (`aria-invalid` + mensagem)
- [ ] Login: estados de loading e erro anunciáveis

## PWA

- [ ] `themeColor` coerente com identidade
- [ ] Título e descrição em `metadata` descritivos (já em layout.tsx)
