-- Script para corrigir opções de enquetes órfãs
-- Execute este script no banco de dados de produção

-- 1. Ver quantas opções estão órfãs (sem poll_id ou com poll_id inválido)
SELECT COUNT(*) as total_orfas 
FROM poll_options 
WHERE poll_id IS NULL 
   OR poll_id NOT IN (SELECT id FROM polls);

-- 2. Deletar opções órfãs (sem poll_id ou com poll_id inválido)
DELETE FROM poll_options 
WHERE poll_id IS NULL 
   OR poll_id NOT IN (SELECT id FROM polls);

-- 3. Ver quantas enquetes estão sem opções
SELECT p.id, p.question, 
       (SELECT COUNT(*) FROM poll_options WHERE poll_id = p.id) as num_options
FROM polls p
HAVING num_options = 0;

-- 4. (Opcional) Deletar enquetes sem opções
-- DESCOMENTE se quiser deletar as enquetes antigas sem opções:
-- DELETE FROM posts WHERE id IN (
--   SELECT post_id FROM polls p 
--   WHERE (SELECT COUNT(*) FROM poll_options WHERE poll_id = p.id) = 0
-- );
-- DELETE FROM polls WHERE (SELECT COUNT(*) FROM poll_options WHERE poll_id = polls.id) = 0;

-- 5. Verificar se ainda há problemas
SELECT 
  (SELECT COUNT(*) FROM polls) as total_polls,
  (SELECT COUNT(*) FROM poll_options) as total_options,
  (SELECT COUNT(*) FROM poll_options WHERE poll_id IS NULL) as options_sem_poll;
