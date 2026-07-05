INSERT INTO topics (disciplina, nome) SELECT 'legislacao_transito', 'CTB_conducao_embriaguez' WHERE NOT EXISTS (SELECT 1 FROM topics WHERE nome = 'CTB_conducao_embriaguez');
INSERT INTO topics (disciplina, nome) SELECT 'legislacao_transito', 'CTB_snt_competencias' WHERE NOT EXISTS (SELECT 1 FROM topics WHERE nome = 'CTB_snt_competencias');
INSERT INTO topics (disciplina, nome) SELECT 'legislacao_transito', 'CTB_sinalizacao' WHERE NOT EXISTS (SELECT 1 FROM topics WHERE nome = 'CTB_sinalizacao');
INSERT INTO topics (disciplina, nome) SELECT 'legislacao_transito', 'CTB_infracoes' WHERE NOT EXISTS (SELECT 1 FROM topics WHERE nome = 'CTB_infracoes');
INSERT INTO topics (disciplina, nome) SELECT 'legislacao_transito', 'CTB_processo_administrativo' WHERE NOT EXISTS (SELECT 1 FROM topics WHERE nome = 'CTB_processo_administrativo');
INSERT INTO topics (disciplina, nome) SELECT 'legislacao_transito', 'CTB_circulacao_conduta' WHERE NOT EXISTS (SELECT 1 FROM topics WHERE nome = 'CTB_circulacao_conduta');
INSERT INTO topics (disciplina, nome) SELECT 'legislacao_transito', 'CTB_engenharia_fiscalizacao' WHERE NOT EXISTS (SELECT 1 FROM topics WHERE nome = 'CTB_engenharia_fiscalizacao');
