-- Migration: Fix comments with NULL user_id
-- Date: 2025-12-06
-- Description: Remove comments with NULL user_id and add NOT NULL constraint

-- 1. Verificar quantos comentários têm user_id NULL
DO $$
DECLARE
    null_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO null_count FROM comments WHERE user_id IS NULL;
    RAISE NOTICE 'Encontrados % comentários com user_id NULL', null_count;
END $$;

-- 2. Deletar comentários com user_id NULL (não podem ser corrigidos)
DELETE FROM comments WHERE user_id IS NULL;

-- 3. Garantir que a coluna user_id existe e não tem constraint NOT NULL ainda
-- (o TypeORM vai adicionar a constraint automaticamente)

-- 4. Log de conclusão
DO $$
BEGIN
    RAISE NOTICE 'Migration concluída: comentários com user_id NULL foram removidos';
END $$;

