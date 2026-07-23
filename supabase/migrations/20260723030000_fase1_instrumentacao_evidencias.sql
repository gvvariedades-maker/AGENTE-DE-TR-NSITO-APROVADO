-- Fase 1 — Motor de Evidências: instrumentação de tentativas + diagnóstico por alternativa
-- confidence, fsrs_rating, learning_events, misconceptions, alternative_diagnostics

-- ---------------------------------------------------------------------------
-- attempts: campos de evidência
-- ---------------------------------------------------------------------------
ALTER TABLE public.attempts
  ADD COLUMN IF NOT EXISTS confidence smallint,
  ADD COLUMN IF NOT EXISTS fsrs_rating smallint,
  ADD COLUMN IF NOT EXISTS exposure_count integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS hint_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS answer_changed boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS feedback_seen_before_answer boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS diagnostics_json jsonb;

ALTER TABLE public.attempts
  DROP CONSTRAINT IF EXISTS attempts_confidence_check;
ALTER TABLE public.attempts
  ADD CONSTRAINT attempts_confidence_check
  CHECK (confidence IS NULL OR confidence BETWEEN 0 AND 3);

ALTER TABLE public.attempts
  DROP CONSTRAINT IF EXISTS attempts_fsrs_rating_check;
ALTER TABLE public.attempts
  ADD CONSTRAINT attempts_fsrs_rating_check
  CHECK (fsrs_rating IS NULL OR fsrs_rating BETWEEN 1 AND 4);

COMMENT ON COLUMN public.attempts.confidence IS 'Confiança subjetiva 0–3 (Fase 1 UI: 1|3)';
COMMENT ON COLUMN public.attempts.fsrs_rating IS 'Nota FSRS 1–4 derivada (erro sempre 1)';
COMMENT ON COLUMN public.attempts.exposure_count IS 'Quantas vezes o usuário já viu esta questão antes desta tentativa';
COMMENT ON COLUMN public.attempts.diagnostics_json IS 'Snapshot do diagnóstico por alternativa no momento da tentativa';

-- ---------------------------------------------------------------------------
-- misconceptions (catálogo; skill_id chega na Fase 2)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.misconceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  mistaken_belief text NOT NULL,
  correct_rule text NOT NULL,
  skill_code text,
  repair_strategy_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.misconceptions IS 'Crenças erradas curadas; skill_id chega na Fase 2 via skill_code';

-- ---------------------------------------------------------------------------
-- alternative_diagnostics
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alternative_diagnostics (
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  alternative text NOT NULL,
  misconception_id uuid REFERENCES public.misconceptions(id) ON DELETE SET NULL,
  error_type text,
  mechanism_slug text,
  feedback_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (question_id, alternative),
  CONSTRAINT alternative_diagnostics_letter_check
    CHECK (alternative IN ('A', 'B', 'C', 'D', 'E'))
);

CREATE INDEX IF NOT EXISTS alternative_diagnostics_mechanism_idx
  ON public.alternative_diagnostics (mechanism_slug)
  WHERE mechanism_slug IS NOT NULL;

COMMENT ON TABLE public.alternative_diagnostics IS 'Diagnóstico por alternativa (distrator IDECAN / misconception)';

-- ---------------------------------------------------------------------------
-- learning_events (append-only)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learning_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  event_type text NOT NULL,
  question_id uuid REFERENCES public.questions(id) ON DELETE SET NULL,
  session_id uuid,
  payload_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS learning_events_user_occurred_idx
  ON public.learning_events (user_id, occurred_at DESC);

CREATE INDEX IF NOT EXISTS learning_events_type_idx
  ON public.learning_events (event_type);

COMMENT ON TABLE public.learning_events IS 'Append-only: question_answered, confidence_recorded (Fase 1)';

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.misconceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alternative_diagnostics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_events ENABLE ROW LEVEL SECURITY;

-- Conteúdo: leitura autenticada
DROP POLICY IF EXISTS misconceptions_select_authenticated ON public.misconceptions;
CREATE POLICY misconceptions_select_authenticated ON public.misconceptions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS alternative_diagnostics_select_authenticated ON public.alternative_diagnostics;
CREATE POLICY alternative_diagnostics_select_authenticated ON public.alternative_diagnostics
  FOR SELECT TO authenticated USING (true);

-- Eventos: só o próprio usuário (SELECT/INSERT); sem UPDATE/DELETE para o role de app
DROP POLICY IF EXISTS learning_events_select_own ON public.learning_events;
CREATE POLICY learning_events_select_own ON public.learning_events
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS learning_events_insert_own ON public.learning_events;
CREATE POLICY learning_events_insert_own ON public.learning_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Revoga mutações de conteúdo via PostgREST (escrita via Drizzle/service role ou scripts)
GRANT SELECT ON public.misconceptions TO authenticated;
GRANT SELECT ON public.alternative_diagnostics TO authenticated;
GRANT SELECT, INSERT ON public.learning_events TO authenticated;

REVOKE UPDATE, DELETE ON public.learning_events FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.misconceptions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.alternative_diagnostics FROM authenticated;
