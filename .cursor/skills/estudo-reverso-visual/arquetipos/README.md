# Arquétipos visuais

Templates para cada `tipo` de tela no JSON. O campo raiz `arquetipo` escolhe a estratégia principal; ver [mapeamento em DOCUMENTACAO.md](../DOCUMENTACAO.md#4-mapeamento-arquetipo--tipo-de-tela).

| Arquivo | `arquetipo` | `tipo` JSON | Quando usar |
|---------|-------------|-------------|-------------|
| [fluxograma-decisao.md](./fluxograma-decisao.md) | `fluxograma_decisao` | `fluxograma` | Caso prático, `regra_excecao`. **MÉTODO:** caminho linear do caso (ver § MÉTODO no template) |
| [comparacao-pode-deve.md](./comparacao-pode-deve.md) | `comparacao` | `comparacao` | `pegadinha_pode_deve`, pares confundíveis |
| [tabela-gradacao.md](./tabela-gradacao.md) | `tabela_gradacao` | `tabela_gradacao` | Prazos, percentuais, `gravidade`, `numero_vizinho` |
| [matriz-assertivas.md](./matriz-assertivas.md) | `matriz_assertivas` | `matriz_assertivas` | Questões tipo assertivas I–V |
| [diagrama-competencia.md](./diagrama-competencia.md) | `diagrama_competencia` | `diagrama_competencia` | `competencia_snt` (CONTRAN/CETRAN/…) |
| [trecho-legal-grifado.md](./trecho-legal-grifado.md) | `trecho_legal` | `trecho_legal` | `termo_unico`, dispositivo na letra da lei |
| [linha-tempo.md](./linha-tempo.md) | `linha_tempo` | `linha_tempo` | Alteração legislativa, sequência temporal |

**Tela de distratores** usa `tipo: comparacao` com formato canônico — ver [DOCUMENTACAO.md §5](../DOCUMENTACAO.md#5-distratores-por-mecanismo-idecan).

**`texto_destaque`** — contexto, glossário, macete; sem template separado (texto + `destaques[]`).

Ordem de escolha do arquétipo principal: [SKILL.md — tabela de decisão](../SKILL.md#tabela-de-decisão-do-arquétipo-principal-com-desempate).

**Padrão ouro aula completa v3:** [PADRAO-AULA-COMPLETA-v3.md](../exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md) — hub + [familias/](../exemplos-ouro/familias/).
