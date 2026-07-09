# Checklist Mayer (gate bloqueante — espelho do `<gate_mayer>` v3)

Documentação completa: [DOCUMENTACAO.md](./DOCUMENTACAO.md).

Reprovou **1 item** → corrigir antes de `npm run validate:estudo-reverso-visual`.

**Gate editorial 12/12** (itens 9–16): ver [PADRAO-AULA-COMPLETA-v3.md](./exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md).

## Gate 8/8

- [ ] **1.** Cada tela tem 1 ideia central identificável em ≤ 5s?
- [ ] **2.** Nenhuma sequência de 2 telas só `texto_destaque`? *(exceção: contexto→glossário; qualquer→macete — validador Zod)*
- [ ] **3.** Todo dado legal passou pela `<cadeia_anti_alucinacao>` (`conteúdo/FONTES.md`)?
- [ ] **4.** Tela de distratores (v2) nomeia o slug de mecanismo de cada errada? *(validador Zod)*
- [ ] **5.** Arquétipo expõe a pegadinha do gabarito (não só ilustra o tema)?
- [ ] **6.** Limites por componente respeitados? *(validador Zod — ver tabela na SKILL)*
- [ ] **7.** Zero elemento decorativo (cada item sustenta a pegadinha)?
- [ ] **8.** Coerência v1↔v2: mesmo `fundamento_slug`, macetes não contraditórios? *(validador Zod quando ambos existem)*

## Limites rápidos

| Componente | Limite |
|---|---|
| Palavras/tela v1 | ≤ 120 |
| Palavras/tela v2 | ≤ 150 |
| `macete_visual` | ≤ 80 caracteres |
| `fluxograma` MÉTODO | ≤ 4 nós, linear, 1 resultado |
| `fluxograma` (demais) | ≤ 7 nós |
| `comparacao` | ≤ 5 linhas |
| `tabela_gradacao` | ≤ 5 faixas |
| `linha_tempo` | ≤ 6 eventos |
| `matriz_assertivas` | ≤ 5 itens |
| `diagrama_competencia` | ≤ 8 nós |
| `trecho_legal` | ≤ 80 palavras, ≤ 3 grifos |

## Comando

```bash
npm run validate:estudo-reverso-visual -- arquivo.json
```
