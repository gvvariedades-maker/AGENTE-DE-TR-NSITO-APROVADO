# Auditoria RLS × Drizzle (Fase 1 — Motor de Evidências)

## Como o app fala com o Postgres

- Server Actions e libs usam **Drizzle** via `postgres` (`src/lib/db/index.ts`), com a URL em `DATABASE_URL` / `resolveDatabaseUrl()`.
- Essa conexão tipicamente usa o role **`postgres`** (ou pooler com privilégios de serviço), **não** o JWT do usuário Supabase Auth.
- Consequência: políticas `RLS` baseadas em `auth.uid()` **não se aplicam** automaticamente a queries Drizzle. A autorização é **aplicação**: `userId` vem só de `supabase.auth.getUser()` nas Server Actions (ex.: `salvarTentativa`), nunca do cliente.

## O que o RLS ainda protege

- Clientes PostgREST / `@supabase/supabase-js` com a **anon/authenticated key** respeitam RLS.
- Tabelas de conteúdo (`topics`, `questions`, `misconceptions`, `alternative_diagnostics`, `skills`, `question_skills`): `SELECT` para `authenticated`.
- Tabelas por usuário (`attempts`, `srs_cards`, `simulados`, `learning_events`, …): `SELECT`/`INSERT` only own (`auth.uid() = user_id`).

## `learning_events` (append-only)

- Políticas: `SELECT` e `INSERT` próprios.
- **Sem** policy de `UPDATE`/`DELETE` para `authenticated`.
- `REVOKE UPDATE, DELETE ON learning_events FROM authenticated` na migration Fase 1.
- Reset de desempenho do próprio usuário (Server Action + Drizzle service role) pode apagar events do `userId` autenticado — isso é intencional e server-side.

## Regra de ouro para novas features

1. Em Server Actions: `const user = await getUser()`; se não houver user → demo / no-op.
2. Passar **somente** `user.id` como `userId` para writes.
3. Nunca aceitar `userId` do body/cliente.
4. Teste manual/aceite: usuário A não lê `learning_events` nem `user_skill_mastery` de B via cliente Supabase.

## Demo / não-UUID

- `registrarTentativa` com `questionId` não-UUID retorna `{ ok: false, demo: true }` sem gravar — fluxo de preview intacto.

## Fase 2 — skills / question_skills

- Conteúdo read-only via PostgREST (`SELECT` authenticated).
- Escrita só via Drizzle/scripts (`bootstrap:skills`); `REVOKE INSERT/UPDATE/DELETE` para `authenticated`.
- `misconceptions.skill_id` → `skills.id` (opcional); `skill_code` permanece como espelho textual.

## Fase 3 — user_skill_mastery

- PK `(user_id, skill_id)`; scores `recall` / `transfer` / `calibration` (0–1) e `mastery_probability = min(recall, transfer) × calibração`.
- Estados: `unseen` | `learning` | `consolidating` | `mastered` | `at_risk`.
- RLS: `SELECT` / `INSERT` / `UPDATE` only own (`auth.uid() = user_id`); **sem** `DELETE` via PostgREST (`REVOKE DELETE`).
- Escrita no app: Drizzle na mesma transação de `registrarTentativa` (`updateSkillMastery`).
- Reset de desempenho (Server Action) apaga mastery do `userId` autenticado — intencional.
- Painel debug: `/desempenho?debug=mastery` (só autenticado).
- Domínio de tópico: se cobertura skill primary ≥ 50%, agrega mastery; senão fallback 2 acertos ≥ 1h.

## Fase 5 — transfer + holdout

- `questions.assessment_pool`: `learning` | `transfer` | `holdout` | `simulation` (default `learning`).
- `question_relations`: conteúdo read-only (`SELECT` authenticated); escrita só via scripts/service.
- Holdout **excluído** de Motor ATA, revisão SRS, novas aleatórias e caderno de simulado.
- Liberação explícita: `selectReleasedHoldout` quando `mastery_probability` da skill primary ≥ 0.75.
- Auditoria: `npm run audit:holdout` (`scripts/audit-holdout-leakage.ts`).
- Bootstrap ~10% LT: `npm run bootstrap:holdout -- --dry-run` / `--apply`.
