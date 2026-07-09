-- Aula completa (Modelo B): trilha longa 8–12 telas por questão
ALTER TABLE questions
  ADD COLUMN IF NOT EXISTS estudo_reverso_visual_completo_json jsonb;

COMMENT ON COLUMN questions.estudo_reverso_visual_completo_json IS
  'Estudo reverso visual v2 (aula completa, 8–12 telas) para iniciantes/dúvida';
