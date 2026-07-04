# Fontes oficiais — Edital 04/2026 STTP Campina Grande

**Prioridade:** Retificação 01/2026 > Edital original > inferência.

**Prova:** 60 questões | 4 alternativas (A–D) | 4h | IDECAN | 30/08/2026

Atualizado em: 04/07/2026

## Como atualizar

```powershell
pwsh -File scripts/sync-fontes-oficiais.ps1
```

---

## Edital e retificação

| Documento | Arquivo local | Status |
|-----------|---------------|--------|
| Edital 04/2026 | `edital/EDITAL Nº 042026, DE 19 DE MAIO DE 2026.pdf` | OK |
| Retificação 01/2026 (Leg. Trânsito + item 19.16.5-f) | `edital/Retificação do conteúdo programático específico de Legislação de Trânsito.pdf` | OK |

**Retificação relevante:** subitem 19.16.5-f passa a citar *"segurança viária e policiamento de trânsito"* (não Sistema Penal).

---

## Legislação federal (Planalto)

Texto consolidado baixado de [planalto.gov.br](https://www.planalto.gov.br).

| Lei | Arquivo | Uso no edital |
|-----|---------|---------------|
| CF/88 | `legislação federal/cf-1988.html` | Dir. Constitucional |
| Lei 9.503/97 (CTB) | `legislação federal/lei-9503-ctb.html` | Legislação de Trânsito |
| Lei 8.112/90 | `legislação federal/lei-8112-servidores.html` | Ética SP (referência) |
| Lei 8.429/92 | `legislação federal/lei-8429-improbidade.html` | Ética SP (referência) |
| Lei 12.527/11 (LAI) | `legislação federal/lei-12527-lai.html` | Ética SP — Anexo I |
| Lei 13.709/18 (LGPD) | `legislação federal/lei-13709-lgpd.html` | Ética SP — Anexo I |
| Lei 9.784/99 | `legislação federal/lei-9784-processo-administrativo.html` | Dir. Adm (apoio) |
| Lei 14.133/21 | `legislação federal/lei-14133-licitacoes.html` | Dir. Adm (apoio) |

---

## Municipal

| Documento | Arquivo | Uso no edital |
|-----------|---------|---------------|
| Lei Orgânica CG | `municipal/Lei Organica Campina Grande.pdf` | Ética SP — Anexo I 1.1 |

Fonte: [Prefeitura de Campina Grande](https://campinagrande.pb.gov.br/wp-content/uploads/2018/03/LEI_ORGANICA-DO_MUNCIPIO.pdf)

---

## SENATRAN

| Ato | Arquivo | Status |
|-----|---------|--------|
| Portaria 966/2022 (Curso Agente de Trânsito) | `senatran/PORTARIA Nº 966, DE 25 DE JULHO DE 2022.pdf` | OK |

---

## Resoluções CONTRAN (Anexo I retificado — Legislação de Trânsito)

**Usar sempre a lista da Retificação 01/2026**, não a do edital original.

| Nº | Data | Arquivo local | Status |
|----|------|---------------|--------|
| 1013 | 16/10/2024 | `resoluções CONTRAN/RESOLUÇÃO CONTRAN Nº 1.013...` | OK (PDF) |
| 227 | 09/02/2007 | — | Ver bundle IDECAN |
| 996 | 15/06/2023 | `...996...` | OK (PDF) |
| 940 | 28/03/2022 | `...940...` | OK (PDF) |
| 993 | 15/06/2023 | `...993...` | OK (PDF) |
| 968 | 20/06/2022 | `...968...` | OK (PDF) |
| 36 | 21/05/1998 | — | Ver bundle IDECAN |
| 970 | 24/06/2022 | `...970...` | OK (PDF) |
| 242 | 22/06/2007 | — | Ver bundle IDECAN |
| 914 | 28/03/2022 | — | Ver bundle IDECAN |
| 955 | 28/03/2022 | `...955...` | OK (PDF) |
| 911 | 28/03/2022 | `...911...` | OK (PDF) |
| 1020 | 01/12/2025 | `Resolução - 1020 - 2025.pdf` | OK (PDF) |
| 1009 | 24/04/2024 | `...1009...` | OK (PDF) |
| 432 | 23/01/2013 | `...432...` | OK (PDF gov.br) |
| 918 | 28/03/2022 | `...918...` | OK (PDF) |
| 985 | 15/12/2022 | `...985...` | OK (PDF) |
| 991 | 19/04/2023 | `...991...` | OK (PDF) |
| 1003 | 02/01/2024 | `...1.003...` | OK (PDF) |
| 1012 | 14/10/2024 | `...1.012...` | OK (PDF) |
| 900 | 09/03/2022 | `...900...` | OK (PDF) |

**Bundle de apoio:** `questões reais/RESOLUÇÕES DO CONTRAN - IDECAN - TEC.pdf` — contém resoluções antigas (227, 36, 242, 914) para estudo; não substitui o texto oficial do DOU.

**Links oficiais (consulta online):**

- [Portal CONTRAN — Resoluções](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes)
- [Resolução 432/2013 PDF](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolu-o-uo-432-2013c.pdf)
- [ANTTlegis — CONTRAN](https://anttlegis.antt.gov.br/action/ActionDatalegis.php?acao=exibirAto&cod_menu=7145&cod_modulo=420&nomeTitulo=codigos&sgl_orgao=CONTRAN%2FMCD)

---

## Questões reais IDECAN (calibragem de estilo — não copiar)

**Corpus analisado em 04/07/2026:** 1.463 questões — `npm run analyze:idecan` → `corpus-idecan-stats.json` + seção em `perfil-banca.md`.

| Disciplina | Arquivos em `questões reais/` |
|------------|-------------------------------|
| CTB | CTB - IDECAN - MÉDIO/SUPERIOR - TEC.pdf |
| CONTRAN | RESOLUÇÕES DO CONTRAN - IDECAN - TEC.pdf |
| Constitucional | CONSTITUCIONAL - IDECAN - SUPERIOR - TEC*.pdf |
| Dir. Administrativo | DIREITO ADMINISTRATIVO - IDECAN - SUPERIOR - TEC.pdf |
| Informática | INFORMÁTICA - IDECAN - SUPERIOR*.pdf |
| Português | PORTUGUES - IDECAN - SUPERIOR - TEC.pdf |
| Ética / LGPD | Ética no serviço público... + LGPD - IDECAN... |

---

## Pendências conhecidas

| Item | Motivo | Ação |
|------|--------|------|
| História CG/PB | Edital não cita obra ou lei específica | Curar base factual municipal (sem fonte única federal) |
| Res. 227, 36, 242, 914 (PDF isolado) | gov.br retorna 404 em alguns links | Usar bundle IDECAN + ANTTlegis até obter PDF do DOU |
| Lei 8.112 / 8.429 no Anexo I | Não listadas explicitamente em Ética SP | Incluídas como apoio doutrinário; edital foca LO CG, LGPD, LAI e princípios éticos |

---

## Verificação antes de gerar questão

1. Microtópico está no Anexo I **retificado**? → `conteudo-programatico.md`
2. Fundamento legal existe em `conteúdo/`?
3. Retificação prevalece sobre edital original?
4. Número/prazo/artigo conferido no arquivo, não de memória?

## Validação automática de citações

```bash
# Schema Zod + citações legais
npm run validate:questoes -- content/questoes/legislacao_transito/lote-001.json

# Só citações (ou texto avulso)
npm run validate:citacoes -- content/questoes/legislacao_transito/lote-001.json
npm run validate:citacoes -- --texto "CTB, art. 165-A"
```

Verifica artigos no HTML do Planalto (`conteúdo/legislação federal/`) e resoluções CONTRAN/SENATRAN pelos arquivos em `conteúdo/`. Súmulas e parágrafos não confirmados geram **aviso**, não erro.
