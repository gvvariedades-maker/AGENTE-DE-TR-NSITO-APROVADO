-- Fase 5 — Motor de Evidências: assessment_pool + question_relations (near/far + holdout)

-- ---------------------------------------------------------------------------
-- questions.assessment_pool
-- ---------------------------------------------------------------------------
ALTER TABLE public.questions
  ADD COLUMN IF NOT EXISTS assessment_pool text NOT NULL DEFAULT 'learning';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'questions_assessment_pool_check'
  ) THEN
    ALTER TABLE public.questions
      ADD CONSTRAINT questions_assessment_pool_check
      CHECK (assessment_pool IN ('learning', 'transfer', 'holdout', 'simulation'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS questions_assessment_pool_idx
  ON public.questions (assessment_pool);

COMMENT ON COLUMN public.questions.assessment_pool IS
  'learning | transfer | holdout | simulation — holdout fora de estudo/repetição comum';

-- ---------------------------------------------------------------------------
-- question_relations (IDs concretos de near/far; meta textual permanece em JSON)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  target_question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  relation_type text NOT NULL,
  distance smallint NOT NULL DEFAULT 1,
  invariants_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  changed_elements_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT question_relations_type_check
    CHECK (relation_type IN ('near', 'far', 'variant', 'prerequisite')),
  CONSTRAINT question_relations_distance_check
    CHECK (distance >= 1),
  CONSTRAINT question_relations_no_self
    CHECK (source_question_id <> target_question_id),
  CONSTRAINT question_relations_unique_pair
    UNIQUE (source_question_id, target_question_id, relation_type)
);

CREATE INDEX IF NOT EXISTS question_relations_source_type_idx
  ON public.question_relations (source_question_id, relation_type);

CREATE INDEX IF NOT EXISTS question_relations_target_idx
  ON public.question_relations (target_question_id);

COMMENT ON TABLE public.question_relations IS
  'Relações near/far entre questões; texto pedagógico continua em meta near_transfer/far_transfer';
COMMENT ON COLUMN public.question_relations.distance IS
  '1 = near típico; ≥2 = far / mais distante';
COMMENT ON COLUMN public.question_relations.invariants_json IS
  'O que NÃO muda entre source e target (espelho de o_que_nao_muda)';
COMMENT ON COLUMN public.question_relations.changed_elements_json IS
  'Elementos que mudam (cenário, artigo vizinho, etc.)';

-- ---------------------------------------------------------------------------
-- RLS: conteúdo read-only para authenticated (escrita via scripts/service)
-- ---------------------------------------------------------------------------
ALTER TABLE public.question_relations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS question_relations_select_authenticated ON public.question_relations;
CREATE POLICY question_relations_select_authenticated ON public.question_relations
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON public.question_relations TO authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.question_relations FROM authenticated;
