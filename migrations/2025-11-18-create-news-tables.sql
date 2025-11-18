-- ========================================================================
-- MIGRATION: Criar tabelas para armazenar notícias no banco
-- Data: 2025-11-18
-- Descrição: Sistema completo de notícias com sincronização, busca e interações
-- ========================================================================

-- Extensão necessária para UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================================
-- TABELA PRINCIPAL: news_articles
-- ========================================================================
CREATE TABLE IF NOT EXISTS news_articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Conteúdo
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content TEXT,
    
    -- Mídia
    image_url TEXT,
    
    -- Fonte
    source_name VARCHAR(200) NOT NULL,
    source_url TEXT NOT NULL,
    author VARCHAR(200),
    
    -- Categorização
    category VARCHAR(50) NOT NULL,
    tags TEXT[], -- Array de tags
    scope VARCHAR(20) DEFAULT 'nacional',
    
    -- Localização (para notícias regionais)
    location_lat DECIMAL(10, 8),
    location_lng DECIMAL(11, 8),
    location_city VARCHAR(100),
    location_state VARCHAR(50),
    location_country VARCHAR(50) DEFAULT 'Brasil',
    
    -- Datas
    published_at TIMESTAMP WITH TIME ZONE NOT NULL,
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Engajamento
    views_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    shares_count INT DEFAULT 0,
    
    -- Metadados
    external_id VARCHAR(500), -- ID/URL da API externa (para evitar duplicatas)
    language VARCHAR(10) DEFAULT 'pt',
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint para evitar duplicatas
    CONSTRAINT unique_external_source UNIQUE (external_id, source_url)
);

-- ========================================================================
-- TABELA: news_likes (curtidas em notícias)
-- ========================================================================
CREATE TABLE IF NOT EXISTS news_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    news_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_news_like_user 
        FOREIGN KEY(user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_news_like_news 
        FOREIGN KEY(news_id) 
        REFERENCES news_articles(id) 
        ON DELETE CASCADE,
    
    CONSTRAINT unique_user_news_like UNIQUE (user_id, news_id)
);

-- ========================================================================
-- TABELA: news_shares (compartilhamentos de notícias)
-- ========================================================================
CREATE TABLE IF NOT EXISTS news_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID, -- Pode ser null para compartilhamentos anônimos
    news_id UUID NOT NULL,
    platform VARCHAR(50), -- 'whatsapp', 'twitter', 'facebook', 'link', etc
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_news_share_user 
        FOREIGN KEY(user_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL,
    
    CONSTRAINT fk_news_share_news 
        FOREIGN KEY(news_id) 
        REFERENCES news_articles(id) 
        ON DELETE CASCADE
);

-- ========================================================================
-- ÍNDICES PARA PERFORMANCE
-- ========================================================================

-- Índices principais
CREATE INDEX IF NOT EXISTS idx_news_published_at 
    ON news_articles(published_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_scope 
    ON news_articles(scope);

CREATE INDEX IF NOT EXISTS idx_news_category 
    ON news_articles(category);

CREATE INDEX IF NOT EXISTS idx_news_active 
    ON news_articles(is_active) 
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_news_location 
    ON news_articles(location_lat, location_lng) 
    WHERE scope = 'regional';

CREATE INDEX IF NOT EXISTS idx_news_scope_published 
    ON news_articles(scope, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_news_external_id 
    ON news_articles(external_id);

-- Índices para likes
CREATE INDEX IF NOT EXISTS idx_news_likes_user 
    ON news_likes(user_id);

CREATE INDEX IF NOT EXISTS idx_news_likes_news 
    ON news_likes(news_id);

CREATE INDEX IF NOT EXISTS idx_news_likes_created 
    ON news_likes(created_at DESC);

-- Índices para shares
CREATE INDEX IF NOT EXISTS idx_news_shares_news 
    ON news_shares(news_id);

CREATE INDEX IF NOT EXISTS idx_news_shares_platform 
    ON news_shares(platform);

CREATE INDEX IF NOT EXISTS idx_news_shares_created 
    ON news_shares(created_at DESC);

-- ========================================================================
-- FULL-TEXT SEARCH (PostgreSQL)
-- ========================================================================
CREATE INDEX IF NOT EXISTS idx_news_search 
    ON news_articles 
    USING gin(
        to_tsvector('portuguese', 
            coalesce(title, '') || ' ' || 
            coalesce(description, '') || ' ' || 
            coalesce(content, '')
        )
    );

-- ========================================================================
-- COMENTÁRIOS NAS TABELAS E COLUNAS
-- ========================================================================

COMMENT ON TABLE news_articles IS 
    'Tabela principal de notícias sincronizadas de APIs externas';

COMMENT ON COLUMN news_articles.external_id IS 
    'ID ou URL da notícia na fonte externa (para evitar duplicatas)';

COMMENT ON COLUMN news_articles.scope IS 
    'Escopo da notícia: internacional, nacional ou regional';

COMMENT ON COLUMN news_articles.tags IS 
    'Array de palavras-chave extraídas do conteúdo';

COMMENT ON COLUMN news_articles.is_active IS 
    'Flag para soft-delete ou desativar notícias';

COMMENT ON TABLE news_likes IS 
    'Tabela para armazenar curtidas dos usuários em notícias';

COMMENT ON TABLE news_shares IS 
    'Tabela para rastrear compartilhamentos de notícias';

-- ========================================================================
-- CONSTRAINT DE VALIDAÇÃO
-- ========================================================================
-- Adicionar constraints (ignorar erro se já existirem)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_news_scope'
    ) THEN
        ALTER TABLE news_articles 
            ADD CONSTRAINT check_news_scope 
            CHECK (scope IN ('internacional', 'nacional', 'regional'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'check_news_language'
    ) THEN
        ALTER TABLE news_articles 
            ADD CONSTRAINT check_news_language 
            CHECK (language IN ('pt', 'en', 'es', 'fr', 'other'));
    END IF;
END $$;

-- ========================================================================
-- DADOS INICIAIS (OPCIONAL)
-- ========================================================================
-- Você pode adicionar algumas notícias de exemplo se desejar

-- ========================================================================
-- FIM DA MIGRATION
-- ========================================================================

