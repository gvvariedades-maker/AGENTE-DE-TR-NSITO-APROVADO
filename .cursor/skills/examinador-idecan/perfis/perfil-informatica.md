---
disciplina: informatica
peso_prova: 4/60 questões · 4/100 pontos · 1 pt/questão
grupo: gerais
minimo_eliminacao: 1 ponto (1 acerto evita zero) — RISCO DE ZERAR
consumido_por: [examinador-idecan, professor-cadeia, estudo-reverso-visual]
corpus_base: 486 questões IDECAN (análise 2026-07-10)
cobertura_banco: 6 questões em content/questoes/informatica/ (atualizado 2026-07-10)
fonte_legal: conceitos atuais Windows/Linux/Office/Internet (sem versão obsoleta — Anexo I, Noções de Informática)
versao: 1.0
---

# Perfil vertical — Noções de Informática

> Aprofundamento por disciplina. DNA transversal da banca: [perfil-banca.md](../perfil-banca.md).
> Microtópicos e itens do Anexo I: [conteudo-programatico.md](../conteudo-programatico.md) → `informatica`.
> Cobertura do banco: `content/questoes/_index/cobertura.json` (rodar `npm run index:questoes` antes de lotes).

## 1. Peso estratégico

| Métrica | Valor |
|---------|-------|
| Questões na prova | **4 de 60** |
| Pontos na prova | 4 de 100 (1,00 pt/acerto) |
| Mínimo eliminatório | 1 ponto — **zerar elimina**; disciplina de alto risco por ser curta |
| Cobertura no banco | **6 questões** |
| Tempo de estudo alvo | 8–10% da preparação; alto ROI por ser decoreba objetiva |

**Regra de ROI:** só 4 questões, mas **risco de zerar** → cada acerto é seguro contra eliminação. Conteúdo estável e memorizável (atalhos, extensões, segurança) → ótimo custo-benefício. Priorizar os eixos de maior frequência: segurança, SO e Internet.

---

## 2. Perfil estatístico (corpus 486 questões IDECAN)

Fonte: `.cursor/skills/examinador-idecan/scripts/corpus-idecan-stats.json` → `por_disciplina.informatica`.

| Dimensão | Valor medido | Regra de fabricação |
|----------|--------------|---------------------|
| Enunciado médio | **466 chars** (σ 249) | Caso curto ou conceito: **250–500 chars** |
| Alternativa média | **55 chars** (curta) | Alternativas objetivas: **40–80 chars** |
| Sem comando explícito | 65,0% | Conceito direto |
| Comando `correta` | 17,1% | Usar comando explícito em ≥50% das inéditas (edital CG) |
| Assertivas (I, II, III…) | 8,6% | Frequente em segurança e Office |
| INCORRETA | 5,1% | Negação mental de cada alternativa |
| **Correspondência** | **4,1%** (o maior de todas as disciplinas) | Associação coluna/coluna é **assinatura IDECAN em informática** |
| Gabaritos (corpus 4–5 alt.) | C 116 · B 111 · D 107 · A 106 · E 46 | Em lote A–D: **~25% por letra**, máx. 2 consecutivos |

**Padrão IDECAN em informática:** conceito objetivo de Windows/Office/Internet/segurança; assertivas e **correspondência** aparecem mais aqui que em qualquer outra disciplina.

---

## 3. Mecanismos de distrator — análogos técnicos

Os 5 slugs obrigatórios traduzidos para informática. Distribuição medida: `excecao` 134 · `pode_deve` 125 · `gravidade` 25 · `percentual` 5 · `competencia` 1 · `prazo` 1.

| Slug | Tradução em informática | Onde vive |
|------|-------------------------|-----------|
| `numero_vizinho` | Versão/atalho/nomenclatura/extensão vizinha e plausível | atalhos, extensões, protocolos, portas |
| `termo_unico` | Função/conceito similar com nome trocado | Office (funções), malwares, protocolos |
| `regra_excecao` | "sempre/nunca/todo" onde há exceção técnica | segurança, permissões, backup |

**Priorizar na fabricação:** `regra_excecao` + `termo_unico` (as duas mais medidas) + `numero_vizinho` (atalho/extensão/versão). `competencia`/`prazo`/`percentual` são residuais — não forçar.

---

## 4. Sub-mecanismos específicos

### 4.1 Segurança da informação (eixo mais cobrável)
- Confundir tipos de malware: **vírus ↔ worm ↔ trojan ↔ ransomware ↔ spyware** (`termo_unico`).
- Phishing ↔ pharming ↔ spam; backup incremental ↔ diferencial ↔ completo.
- **Arquétipo:** `comparacao` (A) ou `matriz_assertivas` (B).

### 4.2 Sistema operacional (Windows/Linux)
- Atalhos vizinhos: Ctrl+C/X/V, Ctrl+Z/Y, Win+E/D/L (`numero_vizinho`).
- Caminho de pastas, área de transferência × área de trabalho.
- **Arquétipo:** `tabela_gradacao` (D) para tabela de atalhos.

### 4.3 Internet e protocolos
- HTTP ↔ HTTPS ↔ FTP ↔ SMTP ↔ POP ↔ IMAP; TLS/SSL; URL vs URI.
- Internet ↔ intranet ↔ extranet (`termo_unico`).
- **Arquétipo:** `comparacao` (A).

### 4.4 Planilhas / editor de texto
- Funções Excel: SE, SOMA, MÉDIA, CONT.SE, PROCV — trocar sintaxe/argumento (`termo_unico`).
- **Arquétipo:** `matriz_assertivas` (B).

---

## 5. Pares confundíveis clássicos

| A | ↔ | B | Microtópico |
|---|---|---|-------------|
| Vírus | ↔ | Worm ↔ Trojan ↔ Ransomware | segurança/malwares |
| Phishing | ↔ | Pharming ↔ Spam | segurança |
| HTTP | ↔ | HTTPS (TLS) | protocolos |
| Internet | ↔ | Intranet ↔ Extranet | redes |
| POP3 | ↔ | IMAP ↔ SMTP | correio eletrônico |
| Backup completo | ↔ | incremental ↔ diferencial | backup |
| Área de transferência | ↔ | Área de trabalho | Windows |
| Função SE | ↔ | SOMASE ↔ CONT.SE | planilhas |
| .docx | ↔ | .xlsx ↔ .pptx ↔ .pdf | extensões |
| Firewall | ↔ | Antivírus | segurança |

---

## 6. Microtópicos — priorização P1→P5

Fonte Anexo I: `conteudo-programatico.md` § informatica.

| Prio | Item Anexo I | Microtópico | Mecanismo dominante | Arquétipo visual |
|------|--------------|-------------|---------------------|------------------|
| **P1** | 8.1–8.5 | Segurança (malware, phishing, backup, antivírus/firewall, assinatura digital) | `termo_unico` + `regra_excecao` | `comparacao` (A) / `matriz_assertivas` (B) |
| **P1** | 2.1–2.4 | SO Windows/Linux (pastas, atalhos, área de transferência) | `numero_vizinho` | `tabela_gradacao` (D) |
| **P1** | 7.1–7.7 | Internet/navegação (protocolos, URL, intranet/extranet, nuvem) | `termo_unico` + `numero_vizinho` | `comparacao` (A) |
| **P2** | 4.1–4.6 | Planilhas (fórmulas, funções, gráficos) | `termo_unico` | `matriz_assertivas` (B) |
| **P2** | 3.1–3.6 | Editor de textos (formatação, tabelas, quebras) | `numero_vizinho` | `matriz_assertivas` (B) |
| **P2** | 5.1–5.3 | Correio eletrônico (POP/IMAP/SMTP, anexos) | `termo_unico` | `comparacao` (A) |
| **P3** | 1.1–1.2 | Hardware (armazenamento, memórias, periféricos, extensões) | `numero_vizinho` | `tabela_gradacao` (D) |
| **P3** | 6.1–6.5 | Ferramentas online (Teams, Meet, Zoom, Skype, Hangout) | `termo_unico` | `comparacao` (A) |

**Slugs de `topico` já usados no banco:** `extensoes_arquivos` · `manipulacao_arquivos_pastas` · `planilhas_formulas` · `ferramentas_comunicacao_online` · `internet_protocolos_url` · `seguranca_informacao_malwares`.

---

## 7. Fontes por eixo

Informática **não tem lei** — a `<cadeia_anti_alucinacao>` valida contra o **comportamento canônico atual** do software/protocolo (sem versão obsoleta).

| Eixo | Fonte de verdade |
|------|------------------|
| Windows/Office | Comportamento atual documentado (Microsoft) — sem versão antiga |
| Internet/protocolos | Padrões vigentes (HTTPS/TLS, IMAP/SMTP) |
| Segurança | Conceitos consolidados (CERT.br / cartilha de segurança) |
| Referência no edital | `conteúdo/edital/` — Anexo I, Noções de Informática |

---

## 8. Mapa arquétipo visual (estudo reverso)

Consultar [PADRAO-AULA-COMPLETA-v3.md](../../estudo-reverso-visual/exemplos-ouro/PADRAO-AULA-COMPLETA-v3.md).

| Sinal na questão | Arquétipo | Família |
|------------------|-----------|---------|
| Tipos de malware / conceitos pareados | `comparacao` | A |
| Assertivas sobre segurança/Office | `matriz_assertivas` | B |
| Correspondência (coluna × coluna) | `matriz_assertivas` | B |
| Atalhos / extensões / hardware | `tabela_gradacao` | D |
| Qualquer questão | Tela `distratores` obrigatória (v2) | — |

---

## 9. Cobertura do banco × lacunas

Contagem em `content/questoes/informatica/lote-*.json` — **6 questões** (2026-07-10).

### Coberto (raso — 1 questão cada)

| Slug | Qtd |
|------|-----|
| `extensoes_arquivos` | 1 |
| `manipulacao_arquivos_pastas` | 1 |
| `planilhas_formulas` | 1 |
| `ferramentas_comunicacao_online` | 1 |
| `internet_protocolos_url` | 1 |
| `seguranca_informacao_malwares` | 1 |

### Lacuna (0 questões — Anexo I exige cobertura)

Hardware/memórias/periféricos · editor de textos (formatação, tabelas, quebras) · planilhas (gráficos, macros) · correio eletrônico (POP/IMAP/SMTP) · segurança (backup, antivírus/firewall, assinatura digital) · nuvem/redes sociais · intranet/extranet.

**Meta MVP** (skill examinador): Informática **40** questões.

---

## 10. Fila de geração por ROI

1. **Segurança** (P1, maior eixo cobrável): malware pareado + phishing + backup + firewall/antivírus.
2. **SO Windows/Linux** (P1): tabela de atalhos + pastas + área de transferência (`tabela_gradacao`).
3. **Internet/protocolos** (P1): HTTPS/TLS, POP↔IMAP↔SMTP, intranet↔extranet.
4. **Planilhas** (P2): funções SE/SOMASE/CONT.SE/PROCV.
5. **1 questão de correspondência** (assinatura IDECAN, 4,1%) para paridade de forma.
6. **Editor de texto + hardware** (P2–P3): fechar Anexo I.

---

## 11. Macetes de prova por eixo

| Eixo | Macete |
|------|--------|
| Malware | **Worm se autopropaga sozinho**; vírus precisa de hospedeiro; trojan disfarça; ransomware sequestra/criptografa |
| HTTPS | **S = Secure (TLS)** — cadeado = tráfego criptografado |
| Correio | **POP baixa e remove** (padrão); **IMAP sincroniza** e mantém no servidor |
| Atalhos | Ctrl+**C**opiar / Ctrl+**X** recortar / Ctrl+**V** colar / Ctrl+**Z** desfazer |
| Backup | Completo (tudo) → Incremental (só o que mudou desde o último) → Diferencial (desde o último completo) |
| Redes | **Intra**net = interna; **Extra**net = intranet estendida a parceiros externos |

---

## 12. Anti-padrões (informática)

- Citar versão obsoleta de Windows/Office (edital pede conceitos **atuais**)
- Distrator com atalho/extensão inexistente (usar sempre vizinho **real** e plausível)
- Enunciado > 500 chars sem necessidade (corpus médio 466)
- Alternativas longas (corpus médio 55 chars — manter objetivas)
- Ignorar `correspondencia` (é a assinatura de info na IDECAN — incluir ao menos 1 no lote)
- Afirmar comportamento de software sem passar pela `<cadeia_anti_alucinacao>` (canônico atual)

---

## Changelog

- **1.0** (2026-07-10) — Perfil inicial: corpus 486 Q IDECAN; envelope enunciado 250–500 / alternativas 40–80; correspondência (4,1%) destacada como assinatura da disciplina; mecanismos análogos técnicos; 8 microtópicos P1→P5; cobertura 6 Q do banco; fila ROI segurança→SO→internet; mapa visual Famílias A/B/D.
