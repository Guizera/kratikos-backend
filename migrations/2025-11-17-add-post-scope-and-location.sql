-- Migration: Adicionar Scope e Localização aos Posts
-- Data: 17/11/2025
-- Descrição: Adiciona campos para classificar posts como internacional, nacional ou regional
--            e armazenar localização para posts regionais

-- =============================================================================
-- PARTE 1: Adicionar campo de scope
-- =============================================================================

-- Adicionar coluna scope com constraint
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS scope VARCHAR(20) DEFAULT 'nacional';

-- Adicionar constraint de validação
ALTER TABLE posts 
ADD CONSTRAINT IF NOT EXISTS check_post_scope 
  CHECK (scope IN ('internacional', 'nacional', 'regional'));

-- =============================================================================
-- PARTE 2: Adicionar campos de localização (para posts regionais)
-- =============================================================================

-- Latitude e Longitude (DECIMAL para precisão)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS location_lat DECIMAL(10, 8);

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS location_lng DECIMAL(11, 8);

-- Range em kilômetros (padrão 50km)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS location_range_km INT DEFAULT 50;

-- Informações de endereço (opcional, para facilitar busca)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS location_city VARCHAR(100);

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS location_state VARCHAR(50);

ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS location_country VARCHAR(50) DEFAULT 'Brasil';

-- =============================================================================
-- PARTE 3: Criar índices para performance
-- =============================================================================

-- Índice para filtrar por scope
CREATE INDEX IF NOT EXISTS idx_posts_scope 
ON posts(scope);

-- Índice composto para posts regionais (localização)
CREATE INDEX IF NOT EXISTS idx_posts_location 
ON posts(location_lat, location_lng) 
WHERE scope = 'regional';

-- Índice para ordenação por scope e data
CREATE INDEX IF NOT EXISTS idx_posts_scope_created 
ON posts(scope, created_at DESC);

-- Índice para posts regionais por estado/cidade
CREATE INDEX IF NOT EXISTS idx_posts_regional_area 
ON posts(location_state, location_city) 
WHERE scope = 'regional';

-- =============================================================================
-- PARTE 4: Adicionar comentários nas colunas
-- =============================================================================

COMMENT ON COLUMN posts.scope IS 
  'Escopo do post: internacional (mundial), nacional (Brasil) ou regional (área específica)';

COMMENT ON COLUMN posts.location_lat IS 
  'Latitude para posts regionais (formato decimal)';

COMMENT ON COLUMN posts.location_lng IS 
  'Longitude para posts regionais (formato decimal)';

COMMENT ON COLUMN posts.location_range_km IS 
  'Range em quilômetros para posts regionais (raio de alcance)';

COMMENT ON COLUMN posts.location_city IS 
  'Cidade do post regional (opcional)';

COMMENT ON COLUMN posts.location_state IS 
  'Estado do post regional (opcional)';

COMMENT ON COLUMN posts.location_country IS 
  'País do post (padrão: Brasil)';

-- =============================================================================
-- PARTE 5: Atualizar posts existentes
-- =============================================================================

-- Definir scope padrão 'nacional' para todos os posts existentes
UPDATE posts 
SET scope = 'nacional' 
WHERE scope IS NULL;

-- Marcar notícias internacionais baseado no país (se existir coluna)
-- Nota: Ajustar conforme estrutura atual da tabela de notícias
UPDATE posts 
SET scope = 'internacional' 
WHERE type = 'noticia' 
  AND location_country IS NOT NULL 
  AND location_country != 'Brasil';

-- =============================================================================
-- PARTE 6: Validações adicionais
-- =============================================================================

-- Adicionar constraint: posts regionais devem ter localização
-- Nota: Comentado por enquanto para não bloquear posts existentes
-- Descomentar após migração e validação
/*
ALTER TABLE posts 
ADD CONSTRAINT check_regional_location 
  CHECK (
    (scope = 'regional' AND location_lat IS NOT NULL AND location_lng IS NOT NULL) 
    OR 
    (scope != 'regional')
  );
*/

-- =============================================================================
-- ROLLBACK (se necessário)
-- =============================================================================
-- Para reverter esta migration, execute:
/*
ALTER TABLE posts DROP CONSTRAINT IF EXISTS check_post_scope;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS check_regional_location;
DROP INDEX IF EXISTS idx_posts_scope;
DROP INDEX IF EXISTS idx_posts_location;
DROP INDEX IF EXISTS idx_posts_scope_created;
DROP INDEX IF EXISTS idx_posts_regional_area;
ALTER TABLE posts DROP COLUMN IF EXISTS scope;
ALTER TABLE posts DROP COLUMN IF EXISTS location_lat;
ALTER TABLE posts DROP COLUMN IF EXISTS location_lng;
ALTER TABLE posts DROP COLUMN IF EXISTS location_range_km;
ALTER TABLE posts DROP COLUMN IF EXISTS location_city;
ALTER TABLE posts DROP COLUMN IF EXISTS location_state;
ALTER TABLE posts DROP COLUMN IF EXISTS location_country;
*/

-- =============================================================================
-- FIM DA MIGRATION
-- =============================================================================

-- Verificar estrutura da tabela posts
SELECT 
  column_name, 
  data_type, 
  column_default, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'posts'
ORDER BY ordinal_position;

