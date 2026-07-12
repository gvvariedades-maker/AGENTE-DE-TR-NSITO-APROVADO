# Fontes oficiais — Edital 04/2026 STTP Campina Grande

**Prioridade:** Retificação 01/2026 > Edital original > inferência.

**Prova:** 60 questões | 4 alternativas (A–D) | 4h | IDECAN | 30/08/2026

**Última sincronização:** 06/07/2026 (`scripts/sync-fontes-oficiais.ps1`)  
**Consolidação:** 06/07/2026 (`scripts/consolidar-conteudo.mjs`) — nomes normalizados, duplicatas removidas

## Como atualizar

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-fontes-oficiais.ps1
```

O script gera `conteúdo/sync-manifest.json` com URLs, bytes e falhas, e ao final executa `consolidar-conteudo.mjs`. Em Windows PowerShell 5, a pasta `conteúdo/` é resolvida via `FONTES.md` (evita duplicar pasta com encoding errado).

**CTB:** o HTML consolidado deve ter **≥ 800 KB** (versão truncada ~450 KB falha no validador para artigos recentes como 165-A). O sync rebaixa automaticamente se estiver incompleto.

**Fontes adicionais locais:** se existir `D:\CONCURSO DE AGENTE DE TRÂNSITO DE CAMPINA GRANDE PB 2026\`, editais, resoluções e PDFs IDECAN são copiados automaticamente.

---

## Edital e retificações

| Documento | Arquivo local | Status | Fonte |
|-----------|---------------|--------|-------|
| Edital 04/2026 | `edital/EDITAL Nº 042026, DE 19 DE MAIO DE 2026.pdf` | OK | Pasta local + Prefeitura CG |
| Retificação 01/2026 (Leg. Trânsito + item 19.16.5-f) | `edital/Retificação do conteúdo programático específico de Legislação de Trânsito.pdf` | OK | [Semanário Oficial CG 05/06/2026](https://campinagrande.pb.gov.br/wp-content/uploads/2026/06/SEMANARIO-OFICIAL-No-2.990-01-A-05-DE-JUNHO-DE-2026-1.pdf) |
| Retificação 04/2026 (prorrogação inscrições) | `edital/Retificação Nº 04-2026 prorrogação inscrições.pdf` | OK | [Separata 22/06/2026](https://campinagrande.pb.gov.br/wp-content/uploads/2026/06/SEPARATA-DO-SEMANARIO-OFICIAL-22-DE-JUNHO-DE-2026.pdf) |

**Retificação relevante:** subitem 19.16.5-f passa a citar *"segurança viária e policiamento de trânsito"* (não Sistema Penal).

---

## Legislação federal (Planalto)

Texto consolidado baixado de [planalto.gov.br](https://www.planalto.gov.br) em 06/07/2026.

| Lei | Arquivo | Uso no edital | Status |
|-----|---------|---------------|--------|
| CF/88 | `legislação federal/cf-1988.html` | Dir. Constitucional | OK |
| Lei 9.503/97 (CTB) | `legislação federal/lei-9503-ctb.html` | Legislação de Trânsito | OK (~1,2 MB; art. 165-A validado) |
| Lei 8.112/90 | `legislação federal/lei-8112-servidores.html` | Ética SP (apoio) | OK |
| Lei 8.429/92 | `legislação federal/lei-8429-improbidade.html` | Ética SP (apoio) | OK |
| Lei 12.527/11 (LAI) | `legislação federal/lei-12527-lai.html` | Ética SP — Anexo I | OK |
| Lei 13.709/18 (LGPD) | `legislação federal/lei-13709-lgpd.html` | Ética SP — Anexo I | OK |
| Lei 9.784/99 | `legislação federal/lei-9784-processo-administrativo.html` | Dir. Adm (apoio) | OK |
| Lei 14.133/21 | `legislação federal/lei-14133-licitacoes.html` | Dir. Adm (apoio) | OK |

---

## História de Campina Grande/PB

| Documento | Arquivo | Uso no edital | Status |
|-----------|---------|---------------|--------|
| Base factual curada | `historia-cg-pb/base-factual.md` | História CG/PB — Anexo I | OK |

Fontes de referência: [Prefeitura CG](https://campinagrande.pb.gov.br/historia/), [Câmara Municipal CG](https://www.camaracg.pb.gov.br/historia/), IBGE.

---

## Municipal

| Documento | Arquivo | Uso no edital | Status |
|-----------|---------|---------------|--------|
| Lei Orgânica CG | `municipal/Lei Organica Campina Grande.pdf` | Ética SP — Anexo I 1.1 | OK |

Fonte: [Prefeitura de Campina Grande](https://campinagrande.pb.gov.br/wp-content/uploads/2018/03/LEI_ORGANICA-DO_MUNCIPIO.pdf)

---

## SENATRAN

| Ato | Arquivo | Status | Fonte |
|-----|---------|--------|-------|
| Portaria 966/2022 (Curso Agente de Trânsito) | `senatran/PORTARIA Nº 966, DE 25 DE JULHO DE 2022.pdf` | OK | [gov.br/transportes](https://www.gov.br/transportes/pt-br/assuntos/transito/arquivos-senatran/portarias/2022/Portaria9662022.pdf) |

---

## Resoluções CONTRAN (Anexo I retificado — Legislação de Trânsito)

**Usar sempre a lista da Retificação 01/2026**, não a do edital original.

| Nº | Data | Arquivo local | Status |
|----|------|---------------|--------|
| 1013 | 16/10/2024 | `resoluções CONTRAN/RESOLUÇÃO CONTRAN Nº 1.013, DE 16 DE OUTUBRO DE 2024.pdf` | OK |
| 227 | 09/02/2007 | `...227, DE 9 DE FEVEREIRO DE 2007.pdf` | OK (`cons227.pdf`) |
| 996 | 15/06/2023 | `...996, DE 15 DE JUNHO DE 2023.pdf` | OK |
| 940 | 28/03/2022 | `...940, DE 28 DE MARÇO DE 2022.pdf` | OK |
| 993 | 15/06/2023 | `...993, DE 15 DE JUNHO DE 2023.pdf` | OK |
| 968 | 20/06/2022 | `...968, DE 20 DE JUNHO DE 2022.pdf` | OK |
| 36 | 21/05/1998 | `...36, DE 21 DE MAIO DE 1998.html` | OK (HTML oficial — PDF indisponível no gov.br) |
| 970 | 24/06/2022 | `...970, DE 24 DE JUNHO DE 2022.pdf` | OK |
| 242 | 22/06/2007 | `...242, DE 22 DE JUNHO DE 2007.pdf` | OK |
| 914 | 28/03/2022 | `...914, DE 28 DE MARÇO DE 2022.pdf` | OK |
| 955 | 28/03/2022 | `...955, DE 28 DE MARÇO DE 2022.pdf` | OK |
| 911 | 28/03/2022 | `...911, DE 28 DE MARÇO DE 2022.pdf` | OK |
| 1020 | 01/12/2025 | `Resolução - 1020 - 2025.pdf` | OK |
| 1009 | 24/04/2024 | `...1.009, DE 24 DE ABRIL DE 2024.pdf` | OK |
| 432 | 23/01/2013 | `...432, DE 23 DE JANEIRO DE 2013.pdf` | OK |
| 918 | 28/03/2022 | `...918, DE 28 DE MARÇO DE 2022.pdf` | OK |
| 985 | 15/12/2022 | `...985, DE 15 DE DEZEMBRO DE 2022.pdf` | OK |
| 991 | 19/04/2023 | `...991, DE 19 DE ABRIL DE 2023.pdf` | OK |
| 1003 | 21/12/2023 | `...1.003, DE 21 DE DEZEMBRO DE 2023.pdf` | OK (vigor 02/01/2024) |
| 1012 | 14/10/2024 | `...1.012, DE 14 DE OUTUBRO DE 2024.pdf` | OK |
| 900 | 09/03/2022 | `...900, DE 9 DE MARÇO DE 2022.pdf` | OK |
| — | — | Procedimentos operacionais (MBFT / 985) | Coberto por 985 + alterações 1003/1009/1012 |

**Bundle de apoio:** `resoluções CONTRAN/RESOLUÇÕES DO CONTRAN - IDECAN - TEC.pdf` — cópia local; não substitui texto oficial do DOU.

**Links oficiais (consulta online):**

- [Portal CONTRAN — Resoluções](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes)
- [Resolução 432/2013 PDF](https://www.gov.br/transportes/pt-br/assuntos/transito/conteudo-contran/resolucoes/resolu-o-uo-432-2013c.pdf)
- [ANTTlegis — CONTRAN](https://anttlegis.antt.gov.br/action/ActionDatalegis.php?acao=exibirAto&cod_menu=7145&cod_modulo=420&nomeTitulo=codigos&sgl_orgao=CONTRAN%2FMCD)

---

## Material Estratégia Concursos (uso pessoal — não copiar literalmente)

Apostilas e PDFs comentados para estudo e referência no Cursor. **Não** entram no app nem no `analyze:idecan` — fundamento legal das questões inéditas continua vindo de `legislação federal/` e `resoluções CONTRAN/`.

| Documento | Arquivo | Disciplina | Status |
|-----------|---------|------------|--------|
| Legislação de Trânsito 01 | `estrategia/legislacao-transito/Legislação de Trânsito 01.pdf` | Legislação de Trânsito | OK (local 12/07/2026) |

**Origem:** `D:\CONCURSO DE AGENTE DE TRÂNSITO DE CAMPINA GRANDE PB 2026\`

---

## Questões reais IDECAN (calibragem de estilo — não copiar)

**Corpus:** `npm run analyze:idecan` → `corpus-idecan-stats.json` + `perfil-banca.md`.

| Disciplina | Arquivos em `questões reais/` | Status |
|------------|-------------------------------|--------|
| CTB | `CTB - IDECAN - MÉDIO - TEC.pdf`, `CTB - IDECAN - SUPERIOR - TEC.pdf` | OK (local) |
| CONTRAN | `RESOLUÇÕES DO CONTRAN - IDECAN - TEC.pdf` (também em `resoluções CONTRAN/`) | OK |
| Constitucional | `CONSTITUCIONAL - IDECAN - SUPERIOR - TEC.pdf`, `... 01.pdf`, `... 02.pdf` | OK |
| Dir. Administrativo | `DIREITO ADMINISTRATIVO - IDECAN - SUPERIOR - TEC.pdf` | OK |
| Informática | `INFORMÁTICA - IDECAN - SUPERIOR -TEC.pdf`, `... 01 - TEC.pdf`, `... 02 - TEC.pdf` | OK |
| Português | `PORTUGUES - IDECAN - SUPERIOR - TEC.pdf` | OK |
| Ética / LGPD | `Ética no serviço público...`, `Lei Geral de Proteção de Dados Pessoais (LGPD)...` | OK |
| **História CG/PB** | `HISTORIA CAMPINA GRANDE - IDECAN - CG 2021 GCM AAd ASE - TEC.pdf` (caderno Tec Concursos `s/Q6dym3`, 11Q CG) | OK (local 11/07/2026) |

---

## Pendências conhecidas

| Item | Motivo | Ação |
|------|--------|------|
| Res. 36/1998 (PDF) | gov.br não oferece PDF direto | HTML oficial salvo localmente |
| História CG/PB — aprofundamento | Base factual cobre marcos principais | Expandir conforme simulados e lacunas detectadas |
| Dados IBGE demográficos | Séries atualizam anualmente | Conferir ano ao gerar questão numérica |

---

## Verificação antes de gerar questão

1. Microtópico está no Anexo I **retificado**? → `conteudo-programatico.md`
2. Fundamento legal existe em `conteúdo/`?
3. Retificação prevalece sobre edital original?
4. Número/prazo/artigo conferido no arquivo, não de memória?

## Validação automática de citações

```bash
npm run validate:questoes -- content/questoes/legislacao_transito/lote-001.json
npm run validate:citacoes -- content/questoes/legislacao_transito/lote-001.json
npm run validate:citacoes -- --texto "CTB, art. 165-A"
```

Verifica artigos no HTML do Planalto (`conteúdo/legislação federal/`) e resoluções CONTRAN/SENATRAN pelos arquivos em `conteúdo/`.
