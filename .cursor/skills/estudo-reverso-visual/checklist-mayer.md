# Checklist Mayer (gate bloqueante — espelho do `<gate_mayer>` v3.4)

Documentação completa: [DOCUMENTACAO.md](./DOCUMENTACAO.md).

Reprovou **1 item** → corrigir antes de `npm run validate:estudo-reverso-visual`.

**Gate editorial** (itens 9–19): ver [PADRAO-AULA-COMPLETA-v3.md](./exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md). Itens **#18** (far-transfer distinto do near) e **#19** (E1–E3) obrigatórios em questão nova nível 4–5.

## Gate 8/8

- [ ] **1.** Cada tela tem 1 ideia central identificável em ≤ 5s?
- [ ] **2.** Nenhuma sequência de 2 telas só `texto_destaque`? *(exceção: contexto→glossário; qualquer→macete — validador Zod)*
- [ ] **3.** Todo dado legal passou pela `<cadeia_anti_alucinacao>` (`conteúdo/FONTES.md`)?
- [ ] **4.** Tela de distratores (v2) nomeia o slug de mecanismo de cada errada? *(validador Zod)*
- [ ] **5.** Arquétipo expõe a pegadinha do gabarito (não só ilustra o tema)?
- [ ] **6.** Limites por componente respeitados? *(validador Zod — ver tabela na SKILL)*
- [ ] **7.** Zero elemento decorativo (cada item sustenta a pegadinha)?
- [ ] **8.** Coerência v1↔v2: mesmo `fundamento_slug`, macetes não contraditórios? Se há `eixo_vizinho`, ambas citam ou ambas omitem? *(validador Zod quando ambos existem)*

## Gate contraste + copy (#20–#21)

- [ ] **20.** Tela `contraste`: cada linha esquerda é crença **falsa**; nenhuma afirma o mesmo órgão que a direita confirma? *(Zod `validarContrastePedagogico`)*
- [ ] **21.** Títulos sem “stem”; distratores com slug no JSON e rótulo humano no player?

## Checklist eficácia pós-aula (E1–E3) — gate editorial #19

Após Mayer 8/8, o elaborador responde **sim** às 3 (aluno em ≤15s cada):

- [ ] **E1.** Qual é o **invariante** legal (o que NÃO muda entre near e far)?
- [ ] **E2.** Por que a **errada mais tentadora** cai (slug + 1 fato do stem)?
- [ ] **E3.** Em cenário **novo** (far-transfer), a mesma regra aplica — sim/não e por quê?

Registrar `meta.eficacia_pos_aula: ["E1","E2","E3"]` quando passar.

## Gate editorial #18 (macete)

- [ ] Macete (ou tela imediata antes) distingue **o que muda × o que NÃO muda**
- [ ] **Far-transfer** ≠ paráfrase do near-transfer
- [ ] Eco de `meta.near_transfer`, `meta.far_transfer`, `meta.o_que_nao_muda` da questão

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
