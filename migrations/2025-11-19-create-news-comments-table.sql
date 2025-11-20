-- ========================================================================
-- Migration: Criar Tabela de Comentários em Notícias
-- Data: 19/11/2025
-- Descrição: Adiciona sistema de comentários e sub-enquetes em notícias
-- ========================================================================

-- ========================================================================
-- TABELA: news_comments
-- ========================================================================

CREATE TABLE IF NOT EXISTS news_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    news_id UUID NOT NULL REFERENCES news_articles(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES news_comments(id) ON DELETE CASCADE,
    
    -- Conteúdo do comentário
    content TEXT NOT NULL,
    
    -- Tipo: 'text' ou 'poll'
    comment_type VARCHAR(20) DEFAULT 'text' CHECK (comment_type IN ('text', 'poll')),
    
    -- Estatísticas
    likes_count INT DEFAULT 0,
    replies_count INT DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================================
-- TABELA: news_comment_poll_options (para sub-enquetes)
-- ========================================================================

CREATE TABLE IF NOT EXISTS news_comment_poll_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES news_comments(id) ON DELETE CASCADE,
    
    option_text VARCHAR(200) NOT NULL,
    votes_count INT DEFAULT 0,
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================================
-- TABELA: news_comment_poll_votes
-- ========================================================================

CREATE TABLE IF NOT EXISTS news_comment_poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    option_id UUID NOT NULL REFERENCES news_comment_poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Garantir que usuário vote apenas 1x por sub-enquete
    UNIQUE(option_id, user_id)
);

-- ========================================================================
-- TABELA: news_comment_likes
-- ========================================================================

CREATE TABLE IF NOT EXISTS news_comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES news_comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(comment_id, user_id)
);

-- ========================================================================
-- ÍNDICES
-- ========================================================================

-- Índice para buscar comentários de uma notícia
CREATE INDEX IF NOT EXISTS idx_news_comments_news_id 
ON news_comments(news_id);

-- Índice para buscar respostas de um comentário
CREATE INDEX IF NOT EXISTS idx_news_comments_parent_id 
ON news_comments(parent_comment_id) 
WHERE parent_comment_id IS NOT NULL;

-- Índice para buscar comentários por usuário
CREATE INDEX IF NOT EXISTS idx_news_comments_user_id 
ON news_comments(user_id);

-- Índice para opções de poll
CREATE INDEX IF NOT EXISTS idx_poll_options_comment_id 
ON news_comment_poll_options(comment_id);

-- Índice para votos
CREATE INDEX IF NOT EXISTS idx_poll_votes_option_id 
ON news_comment_poll_votes(option_id);

CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id 
ON news_comment_poll_votes(user_id);

-- Índice para likes
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id 
ON news_comment_likes(comment_id);

-- ========================================================================
-- COMENTÁRIOS NAS TABELAS
-- ========================================================================

COMMENT ON TABLE news_comments IS 
    'Comentários em notícias, incluindo sub-enquetes';

COMMENT ON COLUMN news_comments.comment_type IS 
    'Tipo do comentário: text (normal) ou poll (sub-enquete)';

COMMENT ON TABLE news_comment_poll_options IS 
    'Opções de voto para sub-enquetes em comentários de notícias';

COMMENT ON TABLE news_comment_poll_votes IS 
    'Votos dos usuários em sub-enquetes de comentários';

COMMENT ON TABLE news_comment_likes IS 
    'Curtidas em comentários de notícias';

-- ========================================================================
-- FUNÇÃO PARA ATUALIZAR CONTADOR DE RESPOSTAS
-- ========================================================================

CREATE OR REPLACE FUNCTION update_news_comment_replies_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_comment_id IS NOT NULL THEN
        UPDATE news_comments 
        SET replies_count = replies_count + 1 
        WHERE id = NEW.parent_comment_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_comment_id IS NOT NULL THEN
        UPDATE news_comments 
        SET replies_count = replies_count - 1 
        WHERE id = OLD.parent_comment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_news_comment_replies_count
AFTER INSERT OR DELETE ON news_comments
FOR EACH ROW EXECUTE FUNCTION update_news_comment_replies_count();

-- ========================================================================
-- FUNÇÃO PARA ATUALIZAR CONTADOR DE COMENTÁRIOS NA NOTÍCIA
-- ========================================================================

CREATE OR REPLACE FUNCTION update_news_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE news_articles 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.news_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE news_articles 
        SET comments_count = comments_count - 1 
        WHERE id = OLD.news_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_news_comments_count
AFTER INSERT OR DELETE ON news_comments
FOR EACH ROW EXECUTE FUNCTION update_news_comments_count();

-- ========================================================================
-- FUNÇÃO PARA ATUALIZAR CONTADOR DE VOTOS EM SUB-ENQUETES
-- ========================================================================

CREATE OR REPLACE FUNCTION update_poll_option_votes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE news_comment_poll_options 
        SET votes_count = votes_count + 1 
        WHERE id = NEW.option_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE news_comment_poll_options 
        SET votes_count = votes_count - 1 
        WHERE id = OLD.option_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_poll_option_votes_count
AFTER INSERT OR DELETE ON news_comment_poll_votes
FOR EACH ROW EXECUTE FUNCTION update_poll_option_votes_count();

