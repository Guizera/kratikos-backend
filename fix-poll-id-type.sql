-- Script para corrigir o tipo da coluna poll_id
-- De VARCHAR para UUID

-- 1. Ver o tipo atual
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'poll_options' AND column_name = 'poll_id';

-- 2. Converter a coluna de VARCHAR para UUID
ALTER TABLE poll_options 
ALTER COLUMN poll_id TYPE uuid USING poll_id::uuid;

-- 3. Verificar se funcionou
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'poll_options' AND column_name = 'poll_id';

-- 4. Testar o JOIN
SELECT p.question, COUNT(po.id) as num_options
FROM polls p
LEFT JOIN poll_options po ON po.poll_id = p.id
GROUP BY p.id, p.question
ORDER BY p.created_at DESC;
