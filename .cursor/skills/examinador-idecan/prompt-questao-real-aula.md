# Prompt — Questão REAL IDECAN (superior) + aula completa

Pipeline **paralelo** às inéditas. Não use `npm run proxima`. Não grave em `content/questoes/`.

**Paridade pedagógica:** enunciado e dificuldade podem diferir do PDF; a aula completa deve ter a **mesma qualidade** das inéditas (hub v3.4 + gate editorial 12/12).

## Prompt pronto (copiar e colar)

**Arquivo:** [prompt-questao-real-nova-conversa.txt](./prompt-questao-real-nova-conversa.txt) — abra, `Ctrl+A`, cole em uma **nova conversa no modo Agent**. Troque só a linha `Disciplina:`.

| Arquivo | Uso |
|---------|-----|
| **[prompt-questao-real-nova-conversa.txt](./prompt-questao-real-nova-conversa.txt)** | **Padrão** — 1 questão **real**, próxima do PDF via disciplina |
| Este `.md` | Prompt completo, diferenças vs inéditas, referências |
| [prompt-questao-aula-completa.md](./prompt-questao-aula-completa.md) | Inéditas (`npm run proxima`) |

## Prompt completo (modo Agent)

```text
Modo Agent. Skills: examinador-idecan (v2.1) + estudo-reverso-visual (v3.4).
Pipeline: QUESTÃO REAL IDECAN — nível SUPERIOR apenas.
Paridade: aula = padrão inédita; só enunciado/dificuldade diferem.

## Escopo
- Fonte: PDFs em conteúdo/questões reais/ com "SUPERIOR" no nome (nunca MÉDIO).
- Extrair se necessário: python scripts/extrair-questoes-reais-superior.py --pdf "<NOME SUPERIOR>.pdf"
- Preferir 1 questão por vez (não lote de 5 na primeira passagem).
- Gravá-las em content/questoes-reais/{disciplina}/lote-NNN.json
- NÃO tocar content/questoes/ nem npm run proxima.

## Por questão
1. Limpar enunciado (remover cabeçalho Tec / cargo / data) — manter texto fiel.
2. Mapear topico Anexo I + estilo_idecan + mecanismos das erradas.
3. comentario Professor Elite com cadeia_anti_alucinacao (lei em conteúdo/).
4. meta.origem = "real_idecan"; meta.nivel_escolaridade = "superior";
   meta.fonte_arquivo; meta.tec_id; tags: real_idecan, superior.
5. dificuldade = estrutural honesta (pode 1–3). NÃO forçar mínimo 4.
6. Selecionar família A–D via hub:
   .cursor/skills/estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md
7. estudo_reverso_visual_completo v2 (7–11 telas) + v1 recomendada.
8. Snippet em content/questoes-reais/{disciplina}/_snippets/real-tec-{id}-completo-visual.json
9. Ouro de referência: content/questoes-reais/_ouro/real-aula-nota-10.md
   (espelho: tec_id 447700 Polícia Civil / SNT).

## Meta obrigatória (mesmo se dificuldade < 4)
- padrao_familia (A|B|C|D ou slug família)
- isca_por_alternativa (cada errada)
- near_transfer + far_transfer + o_que_nao_muda (distintos; far ≠ paráfrase do near)
- eficacia_pos_aula: ["E1","E2","E3"]
- Ecoar near/far/não muda na tela macete

## Aula v3.4 — contratos (reprova = não seedar)
- contexto: gabarito + isca por errada; SEM análise por slug (slug só em distratores)
- contraste: colunas Crença ✗ × Lei ✓ — só crença FALSA na esquerda (gate Zod)
  PROIBIDO: "Alternativa ✗ → Órgão" como única tabela de contraste; fato verdadeiro na ✗
- distratores: LETRA — slug = passo_a_passo[1]; UI humaniza
- caso: substantivos do enunciado; título sem "stem" ("Aplicando ao enunciado" ok)
- lei: literal conteúdo/ + grifo indexOf + motivo ecoa id da tela
- macete: regra + Near + Far + Não muda
- Família C: diagrama com FORA explícito quando couber; ver PADRAO-C-competencia-snt.md

## Checklist antes de gravar (reportar ✅/❌)
- Mayer 8/8
- Editorial 12/12 (#18 near/far, #19 E1–E3, #20 contraste, #21 copy sem stem)
- preview:grifos OK

## Validação / seed
- npm run validate:lote -- content/questoes-reais/.../lote-NNN.json
  (encadeia validate:aula-real automaticamente em path questoes-reais)
- npm run db:seed -- --only-reais
- Legado só com --legacy-aula-real (não usar em lote novo)
- Não commitar.

Reportar: tec_id, gabarito, família, fundamento, nº telas, checklist 12/12, gates.
```

## Diferenças vs inéditas (só o necessário)

| | Inédita | Real superior |
|--|---------|---------------|
| Pasta | `content/questoes/` | `content/questoes-reais/` |
| Enunciado | Gerado | Extraído do PDF (fiel) |
| `npm run proxima` | Sim | Não |
| Dificuldade mínima 4 | Sim | Não (honesta 1–3) |
| `meta.origem` | ausente | `real_idecan` |
| Indistinguibilidade D1 / C6 | erro / on-case | bypass (stem seco) |
| Aula / transferência / E1–E3 | obrigatório nível 4+ | **obrigatório sempre** |
| Contraste crença × lei | gate Zod | **mesmo gate** + `validate:aula-real` |

## Referência

- README: `content/questoes-reais/README.md`
- Ouro aula: `content/questoes-reais/_ouro/real-aula-nota-10.md`
- Extração: `scripts/extrair-questoes-reais-superior.py`
- Exemplo ouro conteúdo: `tec_id` 447700 em `legislacao_transito/lote-001.json`
