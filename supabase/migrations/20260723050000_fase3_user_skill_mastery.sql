-- Fase 3 — Motor de Evidências: user_skill_mastery (scores enxutos + estados)

-- ---------------------------------------------------------------------------
-- user_skill_mastery
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_skill_mastery (
  user_id uuid NOT NULL,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  recall_score real NOT NULL DEFAULT 0,
  transfer_score real NOT NULL DEFAULT 0,
  calibration_score real NOT NULL DEFAULT 0.5,
  mastery_probability real NOT NULL DEFAULT 0,
  state text NOT NULL DEFAULT 'unseen',
  novel_correct_count integer NOT NULL DEFAULT 0,
  delayed_correct_count integer NOT NULL DEFAULT 0,
  high_confidence_error_count integer NOT NULL DEFAULT 0,
  last_evidence_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill_id),
  CONSTRAINT user_skill_mastery_recall_check
    CHECK (recall_score >= 0 AND recall_score <= 1),
  CONSTRAINT user_skill_mastery_transfer_check
    CHECK (transfer_score >= 0 AND transfer_score <= 1),
  CONSTRAINT user_skill_mastery_calibration_check
    CHECK (calibration_score >= 0 AND calibration_score <= 1),
  CONSTRAINT user_skill_mastery_probability_check
    CHECK (mastery_probability >= 0 AND mastery_probability <= 1),
  CONSTRAINT user_skill_mastery_state_check
    CHECK (state IN ('unseen', 'learning', 'consolidating', 'mastered', 'at_risk')),
  CONSTRAINT user_skill_mastery_novel_check
    CHECK (novel_correct_count >= 0),
  CONSTRAINT user_skill_mastery_delayed_check
    CHECK (delayed_correct_count >= 0),
  CONSTRAINT user_skill_mastery_high_conf_check
    CHECK (high_confidence_error_count >= 0)
);

CREATE INDEX IF NOT EXISTS user_skill_mastery_user_state_idx
  ON public.user_skill_mastery (user_id, state);

CREATE INDEX IF NOT EXISTS user_skill_mastery_skill_idx
  ON public.user_skill_mastery (skill_id);

CREATE INDEX IF NOT EXISTS user_skill_mastery_user_updated_idx
  ON public.user_skill_mastery (user_id, updated_at DESC);

COMMENT ON TABLE public.user_skill_mastery IS
  'Mastery enxuto por skill: recall/transfer/calibration → mastery_probability + state';
COMMENT ON COLUMN public.user_skill_mastery.mastery_probability IS
  'min(recall, transfer) × fator calibração';
COMMENT ON COLUMN public.user_skill_mastery.state IS
  'unseen | learning | consolidating | mastered | at_risk';

-- ---------------------------------------------------------------------------
-- RLS: só o próprio usuário (SELECT/INSERT/UPDATE); sem DELETE via PostgREST
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_skill_mastery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS user_skill_mastery_select_own ON public.user_skill_mastery;
CREATE POLICY user_skill_mastery_select_own ON public.user_skill_mastery
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS user_skill_mastery_insert_own ON public.user_skill_mastery;
CREATE POLICY user_skill_mastery_insert_own ON public.user_skill_mastery
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS user_skill_mastery_update_own ON public.user_skill_mastery;
CREATE POLICY user_skill_mastery_update_own ON public.user_skill_mastery
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE ON public.user_skill_mastery TO authenticated;
REVOKE DELETE ON public.user_skill_mastery FROM authenticated;
