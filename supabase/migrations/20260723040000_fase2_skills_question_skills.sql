-- Fase 2 — Motor de Evidências: skills + question_skills + misconceptions.skill_id

-- ---------------------------------------------------------------------------
-- skills
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  topic_id uuid REFERENCES public.topics(id) ON DELETE SET NULL,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'microtopico',
  edital_weight real NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT skills_kind_check
    CHECK (kind IN ('microtopico', 'cluster', 'device')),
  CONSTRAINT skills_edital_weight_check
    CHECK (edital_weight >= 0)
);

CREATE INDEX IF NOT EXISTS skills_topic_id_idx
  ON public.skills (topic_id)
  WHERE topic_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS skills_kind_active_idx
  ON public.skills (kind, active);

COMMENT ON TABLE public.skills IS 'Habilidades de domínio (microtópico edital + clusters finos CTB)';
COMMENT ON COLUMN public.skills.code IS 'Código estável (ex.: CTB_infracoes ou CTB_cluster_snt_competencias)';
COMMENT ON COLUMN public.skills.kind IS 'microtopico | cluster | device';

-- ---------------------------------------------------------------------------
-- question_skills
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.question_skills (
  question_id uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  skill_id uuid NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'primary',
  weight real NOT NULL DEFAULT 1,
  transfer_level text NOT NULL DEFAULT 'T1',
  PRIMARY KEY (question_id, skill_id),
  CONSTRAINT question_skills_role_check
    CHECK (role IN ('primary', 'secondary', 'distractor')),
  CONSTRAINT question_skills_transfer_level_check
    CHECK (transfer_level IN ('T0', 'T1', 'T2', 'T3')),
  CONSTRAINT question_skills_weight_check
    CHECK (weight >= 0)
);

CREATE UNIQUE INDEX IF NOT EXISTS question_skills_one_primary_idx
  ON public.question_skills (question_id)
  WHERE role = 'primary';

CREATE INDEX IF NOT EXISTS question_skills_skill_role_idx
  ON public.question_skills (skill_id, role);

COMMENT ON TABLE public.question_skills IS 'Cobertura questão↔skill; primary = microtópico do tópico';
COMMENT ON COLUMN public.question_skills.transfer_level IS 'T0–T3; default T1 até curadoria';

-- ---------------------------------------------------------------------------
-- misconceptions.skill_id (FK; skill_code permanece para bootstrap)
-- ---------------------------------------------------------------------------
ALTER TABLE public.misconceptions
  ADD COLUMN IF NOT EXISTS skill_id uuid REFERENCES public.skills(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS misconceptions_skill_id_idx
  ON public.misconceptions (skill_id)
  WHERE skill_id IS NOT NULL;

COMMENT ON COLUMN public.misconceptions.skill_id IS 'Skill canônica (Fase 2); skill_code é espelho textual';
COMMENT ON COLUMN public.misconceptions.skill_code IS 'Código textual da skill (espelho de skills.code)';

-- ---------------------------------------------------------------------------
-- RLS (conteúdo: leitura autenticada; escrita só via service/scripts)
-- ---------------------------------------------------------------------------
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS skills_select_authenticated ON public.skills;
CREATE POLICY skills_select_authenticated ON public.skills
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS question_skills_select_authenticated ON public.question_skills;
CREATE POLICY question_skills_select_authenticated ON public.question_skills
  FOR SELECT TO authenticated USING (true);

GRANT SELECT ON public.skills TO authenticated;
GRANT SELECT ON public.question_skills TO authenticated;

REVOKE INSERT, UPDATE, DELETE ON public.skills FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.question_skills FROM authenticated;
