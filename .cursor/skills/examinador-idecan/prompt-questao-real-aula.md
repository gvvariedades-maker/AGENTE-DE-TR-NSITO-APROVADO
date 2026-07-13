# Prompt — Questão REAL IDECAN (superior) + aula completa

Pipeline **paralelo** às inéditas. Não use `npm run proxima`. Não grave em `content/questoes/`.

## Prompt pronto (copiar e colar — modo Agent)

```text
Modo Agent. Skills: examinador-idecan (v2.1) + estudo-reverso-visual (v3.4).
Pipeline: QUESTÃO REAL IDECAN — nível SUPERIOR apenas.

## Escopo
- Fonte: PDFs em conteúdo/questões reais/ com "SUPERIOR" no nome (nunca MÉDIO).
- Extrair se necessário: python scripts/extrair-questoes-reais-superior.py --pdf "<NOME SUPERIOR>.pdf"
- Escolher N questões do raw (preferir 4 alternativas A–D).
- Gravá-las em content/questoes-reais/{disciplina}/lote-NNN.json
- NÃO tocar content/questoes/ nem npm run proxima.

## Por questão
1. Limpar enunciado (remover cabeçalho Tec / cargo / data) — manter texto fiel.
2. Mapear topico Anexo I + estilo_idecan + mecanismos das erradas.
3. comentario Professor Elite com cadeia_anti_alucinacao (lei em conteúdo/).
4. meta.origem = "real_idecan"; meta.nivel_escolaridade = "superior";
   meta.fonte_arquivo; meta.tec_id; tags: real_idecan, superior.
5. dificuldade = estrutural honesta (pode 1–3). NÃO forçar mínimo 4.
6. estudo_reverso_visual_completo v2 (7–11 telas) + v1 recomendada.
7. Snippet em content/questoes-reais/{disciplina}/_snippets/real-tec-{id}-completo-visual.json

## Validação / seed
- npm run validate:lote -- content/questoes-reais/.../lote-NNN.json
- npm run db:seed -- --only-reais
- Não commitar.

Reportar: tec_ids, gabaritos, fundamentos, nº telas, gates.
```

## Diferenças vs inéditas

| | Inédita | Real superior |
|--|---------|---------------|
| Pasta | `content/questoes/` | `content/questoes-reais/` |
| Enunciado | Gerado | Extraído do PDF |
| `npm run proxima` | Sim | Não |
| Dificuldade mínima 4 | Sim | Não |
| `meta.origem` | ausente | `real_idecan` |
| Indistinguibilidade D1 | erro se &lt; 4 | bypass |

## Referência

- README: `content/questoes-reais/README.md`
- Extração: `scripts/extrair-questoes-reais-superior.py`
- Exemplo ouro: `content/questoes-reais/legislacao_transito/lote-001.json`
