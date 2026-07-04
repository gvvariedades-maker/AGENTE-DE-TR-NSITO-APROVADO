# Protocolo de teste cego IDECAN

Valida se questões **inéditas** são **indistinguíveis** de questões reais da banca em comparação lado a lado — sem copiar conteúdo.

---

## Princípio

> Misturar N questões reais + N inéditas. O avaliador tenta classificar cada uma como **REAL** ou **INÉDITA**.  
> Meta: taxa de acerto **≤ 55%** (próximo do chute em binário seria 50%; margem para conhecimento do avaliador).

---

## Quem pode avaliar

- Você (candidato) — válido, mas enviesado se participou da geração
- Outro concurseiro que conheça IDECAN — ideal
- Revisão em dupla: um gera, outro avalia

**Regra:** quem gerou o lote **não** pontua o teste cego desse lote.

---

## Tamanho da amostra

| Contexto | Reais | Inéditas | Total |
|----------|-------|----------|-------|
| Piloto (1 disciplina) | 5 | 5 | 10 |
| Lote antes do seed | 10 | 10 | 20 |
| Simulado espelho 60Q | 15 | 15 | 30 (amostra; não a prova inteira) |

Priorizar disciplinas com mais peso: **legislacao_transito**, **portugues**.

---

## Preparação do material

### 1. Selecionar questões reais

- Fonte: `conteúdo/questões reais/*.pdf` ou trechos em `exemplos-ouro.md`
- Mesma **disciplina** das inéditas
- Preferir provas IDECAN (não outras bancas)
- **Remover** número da questão, cabeçalho de concurso e marca d'água
- Anotar internamente o ID real (não mostrar ao avaliador)

### 2. Selecionar questões inéditas

- Do lote candidato a seed (`content/questoes/...`)
- Já aprovadas em `npm run validate:questoes` e `npm run validate:indistinguibilidade`
- Rubrica individual ≥ 85 (ver [rubrica-indistinguibilidade.md](rubrica-indistinguibilidade.md))

### 3. Montar o caderno cego

- Formato uniforme: só enunciado + A B C D (sem comentário, sem metadados JSON)
- Ordem **aleatória** (embaralhar real/inédita)
- Numerar apenas Q1…Q20 para o avaliador
- Gerar **gabarito secreto** (mapa índice → REAL | INÉDITA)

**Template de registro:** [templates/teste-cego-registro.json](templates/teste-cego-registro.json)

---

## Aplicação (45–60 min para 20 questões)

1. Avaliador lê instrução: *"Classifique cada questão como REAL (elaborada pela IDECAN em prova oficial) ou INÉDITA (gerada para estudo). Não consulte lei nem internet."*
2. Para cada questão, marcar **R** ou **I** e opcionalmente **confiança** (alta/média/baixa).
3. Opcional: anotar **por que** pareceu real ou inédita (diagnóstico de vícios).
4. Não revelar gabarito até o fim.

---

## Correção e métricas

| Métrica | Fórmula | Meta |
|---------|---------|------|
| **Acurácia** | acertos / total | ≤ 55% |
| **Falso positivo** | inédita classificada como real / total inéditas | ≤ 60% |
| **Falso negativo** | real classificada como inédita / total reais | ≤ 60% |
| **Confiança alta errada** | erros com confiança alta | 0 ideal |

### Interpretação

| Resultado | Significado | Ação |
|-----------|-------------|------|
| Acurácia ≤ 55% | Indistinguibilidade **atingida** no lote | Liberar seed |
| 56–70% | Próximo; vícios localizados | Revisar só questões “denunciadas” no teste |
| > 70% | Padrão detectável | Reescrever lote; atualizar perfil-banca se necessário |

---

## Diagnóstico pós-teste

Para cada erro do avaliador, classificar o motivo:

| Código | Motivo | Correção |
|--------|--------|----------|
| `TOM` | Soa a professor/cursinho | Enxugar enunciado; tom formal |
| `EXT` | Muito curto/longo | Ajustar à faixa em rubrica A2 |
| `DIST` | Distrator óbvio | Reforçar alternativas erradas |
| `PEG` | Pegadinha genérica | Aplicar pegadinha do corpus |
| `COB` | Tema estranho ao edital CG | Realinhar ao Anexo I |
| `CMD` | Comando atípico | Copiar estrutura de exemplos-ouro |

Registrar no JSON de registro do teste para iterar o skill.

---

## Frequência

| Evento | Teste cego |
|--------|------------|
| Primeiro lote de cada disciplina | Obrigatório (20 itens) |
| Lotes seguintes da mesma disciplina | Piloto 10 itens a cada 50 questões novas |
| Antes de simulado espelho publicado | Amostra 30 itens multi-disciplina |
| Após mudança em perfil-banca ou corpus | Repetir piloto na disciplina afetada |

---

## Integração no workflow do examinador

```
Gerar lote → validate:questoes → validate:indistinguibilidade
    → Rubrica manual (média ≥ 80)
    → Teste cego (acurácia ≤ 55%)
    → db:seed
```

Questões que o avaliador marcou **INÉDITA** com confiança **alta** e estavam **certas** (eram inéditas): candidatas a **exemplos ouro** — considerar adicionar trecho anonimizado em `exemplos-ouro.md`.

Questões marcadas **REAL** com confiança alta mas eram **inéditas**: **melhor elogio** — manter como referência de qualidade.

---

## Exemplo de gabarito secreto

```json
{
  "Q1": "REAL",
  "Q2": "INEDITA",
  "Q3": "INEDITA",
  "Q4": "REAL"
}
```

Ver template completo em `templates/teste-cego-registro.json`.
