# Agente de Trânsito Aprovado

PWA de estudos para o concurso **Agente de Trânsito STTP Campina Grande/PB** (Edital 04/2026, banca IDECAN, prova 30/08/2026).

Stack: Next.js 15+ App Router, TypeScript, Tailwind, shadcn/ui, Supabase (Auth + PostgreSQL), Drizzle ORM, PWA.

## Setup local

1. Clone o repositório e instale dependências:

```bash
npm install
```

2. Configure o Supabase em `.env.local` (copie de `.env.example`):

```bash
npm run setup:supabase-db   # sincroniza senha + service_role via CLI (recomendado)
# ou preencha manualmente SUPABASE_PROJECT_REF, DATABASE_PASSWORD, etc.
```

3. Popule o banco (ordem importa na primeira vez):

```bash
npm run db:seed:topics   # microtópicos do Anexo I retificado
npm run db:seed          # questões JSON → questions
```

4. Inicie o app:

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Banco de dados (Supabase pooler)

O app e os scripts usam o **transaction pooler na porta 6543** por padrão (`src/lib/db/resolve-database-url.ts`). Isso evita `EMAXCONNSESSION` quando `npm run dev` e seed rodam ao mesmo tempo.

- Recomendado: `SUPABASE_PROJECT_REF` + `DATABASE_PASSWORD` (sem fixar porta no `.env`)
- Opcional: `DATABASE_PORT=6543` para forçar explicitamente
- Evite `DATABASE_URL` com `:5432` no pooler se o dev server estiver ativo

Reinicie o `npm run dev` após alterar variáveis de conexão.

## Catálogo de estudo

Rota: `/estudo/catalogo?disciplina=legislacao_transito`

- Microtópicos **com questões** no seed mostram badge `NQ` (clicável).
- **"Em breve"** = microtópico sem questões ainda.
- Alerta **"Catálogo offline do edital"** = o app não leu o banco (conexão falhou ou tabela `topics` vazia). Rode `db:seed:topics` + `db:seed` e reinicie o dev server.

Diagnóstico:

```bash
npm run check:catalogo-db
npm run check:visual-completo
```

## Estudo reverso visual

Após responder uma questão no modo estudo, abre automaticamente a trilha visual quando houver `estudo_reverso_visual_completo`. Sem `pedagogy_json`, abre a **aula completa** (7–11 telas). Com `pedagogy_json`, o `AdaptivePlayer` seleciona um subset conforme o path de intervenção (confirmação curta, reparo de misconception, etc.). A trilha termina no **macete** ou **fechamento** — sem tela de recall livre.

| Trilha | Campo JSON | Telas | Badge no player |
|--------|------------|-------|-----------------|
| Aula completa (v2) | `estudo_reverso_visual_completo` | 7–11 | "Aula completa" |
| Pedagogia adaptativa | `pedagogy` → `pedagogy_json` | subset por path | (mesmo player) |
| Expressa legado (v1) | `estudo_reverso_visual` | 3–5 | "Revisão rápida" |

| Recurso | Caminho |
|---------|---------|
| Skill Agent (geração) | `.cursor/skills/estudo-reverso-visual/SKILL.md` |
| **Documentação completa** | `.cursor/skills/estudo-reverso-visual/DOCUMENTACAO.md` |
| Exemplo ouro v1+v2 | `.cursor/skills/estudo-reverso-visual/exemplos-ouro/ctb-embriaguez.json` |
| Motor pedagógico | `.cursor/rules/03-estudo-reverso.mdc` |

### Validação visual

```bash
npm run validate:lote -- content/questoes/.../lote.json   # 5 gates (inéditas)
npm run validate:lote -- content/questoes-reais/.../lote.json   # 6 gates (+ validate:aula-real)
npm run index:questoes                                    # mapa de eixos legais já cobertos
npm run setup:git-hooks   # pre-commit em lotes staged (opcional)
npm run check:visual-completo
npm run audit:estudo-reverso
```

Lotes legados podem falhar na v3 até retrofit (distratores sem slug, `fundamento_slug` divergente) — ver seção 11 em `DOCUMENTACAO.md`.

### Questões reais IDECAN (pipeline paralelo)

Enunciados fiéis ao PDF Tec **SUPERIOR**; aulas com **paridade pedagógica** das inéditas (hub v3.4, gate editorial 12/12). Não entra no `npm run proxima` nem no índice de cobertura.

| Recurso | Caminho |
|---------|---------|
| **Guia (comece aqui)** | `content/questoes-reais/GUIA.md` |
| README do pipeline | `content/questoes-reais/README.md` |
| Prompt Agent | `.cursor/skills/examinador-idecan/prompt-questao-real-nova-conversa.txt` |
| Contrato ouro | `content/questoes-reais/_ouro/real-aula-nota-10.md` |
| Lotes seedáveis | `content/questoes-reais/{disciplina}/lote-*.json` |

```bash
npm run extract:reais-superior -- --pdf "CTB - IDECAN - SUPERIOR - TEC.pdf"
npm run validate:lote -- content/questoes-reais/legislacao_transito/lote-001.json   # 6 gates (inclui validate:aula-real)
npm run db:seed:reais   # ou: npm run db:seed -- --only-reais
```

Legado em lotes antigos: `--legacy-aula-real` e/ou `--legacy-transferencia`. Inéditas em `content/questoes/` **não** passam pelo gate `validate:aula-real`.

## Scripts úteis

| Comando | Uso |
|---------|-----|
| `npm run db:seed:topics` | Upsert microtópicos Anexo I |
| `npm run db:seed` | Importa `content/questoes/**/*.json` |
| `npm run index:questoes` | Gera `content/questoes/_index/cobertura.json` |
| `npm run validate:cobertura -- arquivo.json` | Anti-repetição de eixo/enunciado |
| `npm run validate:lote -- arquivo.json` | Gate único: questões + cobertura + IDECAN + visual v2 (+ `validate:aula-real` se path `questoes-reais/`) |
| `npm run validate:aula-real -- arquivo.json` | Paridade aula real × inédita (só `meta.origem: real_idecan`) |
| `npm run db:seed:reais` | Importa só `content/questoes-reais/**/*.json` |
| `npm run extract:reais-superior` | Extrai PDFs Tec SUPERIOR → `questoes-reais/_raw/` |
| `npm run setup:git-hooks` | Pre-commit em `content/questoes/*.json` staged |
| `npm run validate:questoes -- arquivo.json` | Schema import (v2 obrig.) + citações |
| `npm run validate:estudo-reverso-visual -- arquivo.json` | Valida v1 e v2 visual |
| `npm run audit:estudo-reverso` | Cobertura visual por lote |
| `npm run check:env` | Variáveis obrigatórias |
| `npm run check:catalogo-db` | Tópicos e questões no banco |
| `npm run check:visual-completo` | Questões com aula completa v2 |

## Material de referência

- `conteúdo/edital/` — edital + retificação
- `conteúdo/FONTES.md` — índice de legislação
- `content/questoes/` — lotes JSON inéditas para seed
- `content/questoes-reais/` — questões reais IDECAN (superior) + aulas com paridade inédita
- `.cursor/rules/` — regras do projeto para o Agent

## Deploy

Vercel (free tier). Configure as mesmas variáveis de ambiente do `.env.local` no dashboard da Vercel, incluindo conexão ao pooler (6543).
