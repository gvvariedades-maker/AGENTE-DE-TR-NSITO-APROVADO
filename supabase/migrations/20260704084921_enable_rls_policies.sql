-- Migration: enable_rls_policies (aplicada via MCP Supabase)

ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulados ENABLE ROW LEVEL SECURITY;
ALTER TABLE srs_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attempts_select_own" ON attempts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "attempts_insert_own" ON attempts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "simulados_select_own" ON simulados
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "simulados_insert_own" ON simulados
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "srs_select_own" ON srs_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "srs_insert_own" ON srs_cards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "srs_update_own" ON srs_cards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "topics_select_authenticated" ON topics
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "questions_select_authenticated" ON questions
  FOR SELECT TO authenticated USING (true);
