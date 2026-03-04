-- Script para limpar opções órfãs antes de criar a foreign key

-- 1. Ver quantas opções órfãs existem
SELECT COUNT(*) as opcoes_orfas
FROM poll_options po
WHERE NOT EXISTS (
  SELECT 1 FROM polls p WHERE p.id = po.poll_id
);

-- 2. Ver os detalhes das opções órfãs
SELECT po.id, po.poll_id, po.content, po.votes_count
FROM poll_options po
WHERE NOT EXISTS (
  SELECT 1 FROM polls p WHERE p.id = po.poll_id
);

-- 3. DELETAR as opções órfãs
DELETE FROM poll_options
WHERE NOT EXISTS (
  SELECT 1 FROM polls p WHERE p.id = poll_options.poll_id
);

-- 4. Verificar se ainda há opções órfãs
SELECT COUNT(*) as opcoes_orfas_restantes
FROM poll_options po
WHERE NOT EXISTS (
  SELECT 1 FROM polls p WHERE p.id = po.poll_id
);

-- 5. Ver o resumo final
SELECT 
  (SELECT COUNT(*) FROM polls) as total_polls,
  (SELECT COUNT(*) FROM poll_options) as total_options,
  (SELECT COUNT(*) FROM poll_options po WHERE NOT EXISTS (
    SELECT 1 FROM polls p WHERE p.id = po.poll_id
  )) as opcoes_orfas;
