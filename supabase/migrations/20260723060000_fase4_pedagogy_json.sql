-- Fase 4 — Motor de Evidências: pedagogy_json (percursos adaptativos sobre aula v2)

ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS pedagogy_json jsonb;

COMMENT ON COLUMN public.questions.pedagogy_json IS
  'PedagogyConfig: skillCodes, paths por intervenção, noviceIntro; null = aula completa (legado)';
