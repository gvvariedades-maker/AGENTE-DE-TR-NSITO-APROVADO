-- Migration: upgrade_srs_fsrs (aplicada via MCP Supabase)
-- Substitui o "SM-2 simplificado" (nunca implementado em código, apenas
-- descrito na regra 03-estudo-reverso.mdc) pelo modelo de memória do FSRS-4.5
-- (Free Spaced Repetition Scheduler), estado da arte público em repetição
-- espaçada: https://github.com/open-spaced-repetition/awesome-fsrs
--
-- `ease_factor` é removido porque nunca foi lido/atualizado por nenhuma
-- lógica (ver src/lib/retencao.ts antes desta migration) e o modelo FSRS
-- usa dificuldade + estabilidade em vez de um fator de facilidade único.

alter table public.srs_cards
  add column difficulty real not null default 5.1618,
  add column stability real not null default 0,
  add column reps integer not null default 0,
  add column lapses integer not null default 0,
  add column state text not null default 'new',
  add column last_review timestamptz;

alter table public.srs_cards
  add constraint srs_cards_state_check check (state in ('new', 'learning', 'review', 'relearning'));

alter table public.srs_cards
  drop column ease_factor;

comment on column public.srs_cards.difficulty is 'FSRS-4.5: dificuldade do item, escala 1-10 (default = w4, peso padrao)';
comment on column public.srs_cards.stability is 'FSRS-4.5: estabilidade da memoria em dias (R=90% quando t=stability)';
comment on column public.srs_cards.reps is 'Numero total de revisoes (inclui erros)';
comment on column public.srs_cards.lapses is 'Numero de vezes que o card foi esquecido (grade=again)';
comment on column public.srs_cards.state is 'new | learning | review | relearning';
