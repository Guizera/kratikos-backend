-- Migration: Criar tabela post_likes
-- Data: 17/11/2025
-- Descrição: Tabela para armazenar curtidas dos posts

CREATE TABLE IF NOT EXISTS post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_post_likes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_likes_post FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  
  -- Constraint: um usuário só pode curtir um post uma vez
  CONSTRAINT unique_user_post_like UNIQUE (user_id, post_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_created_at ON post_likes(created_at DESC);

-- Comentários
COMMENT ON TABLE post_likes IS 'Armazena as curtidas dos posts';
COMMENT ON COLUMN post_likes.id IS 'ID do like';
COMMENT ON COLUMN post_likes.user_id IS 'ID do usuário que curtiu';
COMMENT ON COLUMN post_likes.post_id IS 'ID do post curtido';
COMMENT ON COLUMN post_likes.created_at IS 'Data da curtida';

