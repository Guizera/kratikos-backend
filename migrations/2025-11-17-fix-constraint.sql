-- Migration Fix: Adicionar constraint check_post_scope
-- Data: 17/11/2025
-- Descrição: Corrigir erros da migration anterior

-- =============================================================================
-- CORRIGIR ERRO 1: Constraint check_post_scope
-- =============================================================================

-- PostgreSQL não suporta IF NOT EXISTS para constraints
-- Precisamos verificar se existe antes de criar

DO $$ 
BEGIN
  -- Verificar se constraint já existe
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'check_post_scope'
  ) THEN
    -- Criar constraint
    ALTER TABLE posts 
    ADD CONSTRAINT check_post_scope 
    CHECK (scope IN ('internacional', 'nacional', 'regional'));
    
    RAISE NOTICE 'Constraint check_post_scope criada com sucesso';
  ELSE
    RAISE NOTICE 'Constraint check_post_scope já existe';
  END IF;
END $$;

-- =============================================================================
-- VERIFICAÇÃO: Atualizar posts existentes (CORRIGIDO)
-- =============================================================================

-- Verificar quais tipos existem no enum
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = 'posts_type_enum'::regtype 
ORDER BY enumsortorder;

-- Definir scope padrão 'nacional' para posts sem scope
UPDATE posts 
SET scope = 'nacional' 
WHERE scope IS NULL;

-- Se o enum tiver 'noticia', marcar como internacional
-- Se não tiver, ignorar este UPDATE
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_enum 
    WHERE enumtypid = 'posts_type_enum'::regtype 
      AND enumlabel = 'noticia'
  ) THEN
    UPDATE posts 
    SET scope = 'internacional' 
    WHERE type = 'noticia'::posts_type_enum
      AND location_country IS NOT NULL 
      AND location_country != 'Brasil';
    
    RAISE NOTICE 'Posts de notícias internacionais atualizados';
  ELSE
    RAISE NOTICE 'Enum posts_type_enum não possui valor "noticia" - ignorando UPDATE';
  END IF;
END $$;

-- =============================================================================
-- VERIFICAÇÃO FINAL
-- =============================================================================

-- Ver estrutura final da tabela posts
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts'
  AND column_name IN ('scope', 'location_lat', 'location_lng', 'location_range_km', 'location_city', 'location_state', 'location_country')
ORDER BY ordinal_position;

-- Ver constraints da tabela
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'posts'::regclass
  AND conname LIKE '%scope%';

-- Ver índices criados
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'posts'
  AND indexname LIKE '%scope%' OR indexname LIKE '%location%'
ORDER BY indexname;

-- Contar posts por scope
SELECT 
  scope,
  COUNT(*) as total
FROM posts
GROUP BY scope
ORDER BY total DESC;

