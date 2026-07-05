# Padrões visuais para retenção

Baseado em pesquisa (testing effect, CLT, SRS, feedback elaborado). Aplicar em telas de estudo e dashboard.

## Evidências → UI

| Princípio | Fonte | Implementação no app |
|-----------|-------|---------------------|
| Prática de recuperação | Roediger & Karpicke; Learning & Instruction 2025 | `RecallGate` — alternativas ocultas até o usuário tentar |
| Feedback imediato adaptativo | Frontiers Psych 2021 | `FeedbackElaborado` — acerto = KR breve; erro = EF em blocos |
| Estudo reverso visual | Mayer CTML + dual coding | `EstudoReversoPlayer` — botão pós-resposta, 4-6 telas + micro-recall |
| Carga cognitiva baixa | CLT / IJCSIT 2025 | Uma questão/tela, modo foco, progressive disclosure |
| Chunking mobile | TechClass microlearning | Enunciado scrollável; feedback em etapas |
| SRS visual | Anki / FSRS-4.5 (`src/lib/srs.ts`) | `CicloRetencao` — aprendendo / jovem / maduro (por `stability`) |
| Consistência | Duolingo/Anki heatmaps | Barra 7 dias no dashboard |
| Uma ação primária | Peps McCrea LID | Um CTA por fase (revelar → confirmar → próximo) |

## Componentes

- `recall-gate.tsx` — gate antes das alternativas (só modo estudo)
- `feedback-elaborado.tsx` — feedback progressivo pós-resposta
- `estudo-reverso-player.tsx` — micro-aula visual segmentada pós-questão
- `estudo-reverso-trigger.tsx` — CTA após acerto ou erro
- `sessao-bar.tsx` — progresso + acertos/erros da sessão
- `focus-mode-toggle.tsx` — `html[data-foco="true"]` esconde nav
- `ciclo-retencao.tsx` — mapa SRS + heatmap semanal

## O que NÃO fazer

- Gamificação vazia (streaks sem recall) — não aumenta retenção
- Mostrar gabarito antes da tentativa
- Feedback longo de uma vez em erro (sobrecarga extrínseca)
- Múltiplos CTAs competindo na mesma viewport

## Referências

- [Testing effect](https://doi.org/10.1016/j.learninstruc.2025.102219)
- [Feedback adaptativo](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2021.706821/full)
- [Anki stats / FSRS](https://docs.ankiweb.net/stats.html)
- [CLT em UI](https://www.aufaitux.com/blog/cognitive-load-theory-ui-design/)
