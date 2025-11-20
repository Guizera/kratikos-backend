-- ========================================================================
-- Migration: Expandir Sistema de Comentários em Posts
-- Data: 20/11/2025
-- Descrição: Adiciona sub-enquetes e curtidas em comentários
-- ========================================================================

-- ========================================================================
-- ATUALIZAR TABELA: comments
-- ========================================================================

-- Adicionar tipo de comentário (text ou poll)
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS comment_type VARCHAR(20) DEFAULT 'text' 
CHECK (comment_type IN ('text', 'poll'));

-- Adicionar contador de respostas
ALTER TABLE comments 
ADD COLUMN IF NOT EXISTS replies_count INT DEFAULT 0;

-- ========================================================================
-- TABELA: comment_poll_options (para sub-enquetes)
-- ========================================================================

CREATE TABLE IF NOT EXISTS comment_poll_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    
    option_text VARCHAR(200) NOT NULL,
    votes_count INT DEFAULT 0,
    display_order INT DEFAULT 0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================================================================
-- TABELA: comment_poll_votes
-- ========================================================================

CREATE TABLE IF NOT EXISTS comment_poll_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    option_id UUID NOT NULL REFERENCES comment_poll_options(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Garantir que usuário vote apenas 1x por sub-enquete
    UNIQUE(option_id, user_id)
);

-- ========================================================================
-- TABELA: comment_likes
-- ========================================================================

CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    liked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(comment_id, user_id)
);

-- ========================================================================
-- ÍNDICES
-- ========================================================================

-- Índice para opções de poll em comentários
CREATE INDEX IF NOT EXISTS idx_comment_poll_options_comment_id 
ON comment_poll_options(comment_id);

-- Índice para votos em sub-enquetes
CREATE INDEX IF NOT EXISTS idx_comment_poll_votes_option_id 
ON comment_poll_votes(option_id);

CREATE INDEX IF NOT EXISTS idx_comment_poll_votes_user_id 
ON comment_poll_votes(user_id);

-- Índice para likes em comentários
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id 
ON comment_likes(comment_id);

CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id 
ON comment_likes(user_id);

-- ========================================================================
-- TRIGGERS
-- ========================================================================

-- Trigger para atualizar contador de respostas
CREATE OR REPLACE FUNCTION update_comment_replies_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
        UPDATE comments 
        SET replies_count = replies_count + 1 
        WHERE id = NEW.parent_id;
    ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
        UPDATE comments 
        SET replies_count = replies_count - 1 
        WHERE id = OLD.parent_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_replies_count
AFTER INSERT OR DELETE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comment_replies_count();

-- Trigger para atualizar contador de curtidas em comentários
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comments 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.comment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_likes_count
AFTER INSERT OR DELETE ON comment_likes
FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- Trigger para atualizar contador de votos em opções de sub-enquetes
CREATE OR REPLACE FUNCTION update_comment_poll_votes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE comment_poll_options 
        SET votes_count = votes_count + 1 
        WHERE id = NEW.option_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE comment_poll_options 
        SET votes_count = votes_count - 1 
        WHERE id = OLD.option_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_poll_votes_count
AFTER INSERT OR DELETE ON comment_poll_votes
FOR EACH ROW EXECUTE FUNCTION update_comment_poll_votes_count();

-- ========================================================================
-- COMENTÁRIOS NAS TABELAS
-- ========================================================================

COMMENT ON COLUMN comments.comment_type IS 
    'Tipo do comentário: text (normal) ou poll (sub-enquete)';

COMMENT ON COLUMN comments.replies_count IS 
    'Número de respostas diretas a este comentário';

COMMENT ON TABLE comment_poll_options IS 
    'Opções de voto para sub-enquetes em comentários';

COMMENT ON TABLE comment_poll_votes IS 
    'Votos dos usuários em sub-enquetes de comentários';

COMMENT ON TABLE comment_likes IS 
    'Curtidas em comentários de posts';

-- ========================================================================
-- ATUALIZAR DADOS EXISTENTES
-- ========================================================================

-- Garantir que comentários existentes tenham comment_type = 'text'
UPDATE comments 
SET comment_type = 'text' 
WHERE comment_type IS NULL;

-- Calcular replies_count para comentários existentes
UPDATE comments c
SET replies_count = (
    SELECT COUNT(*) 
    FROM comments r 
    WHERE r.parent_id = c.id
)
WHERE replies_count = 0;

