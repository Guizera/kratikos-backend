-- Migration: Criar tabela de reposts
-- Data: 2026-02-11
-- Descrição: Permite que usuários repostem posts de outros usuários

-- Criar tabela de reposts
CREATE TABLE IF NOT EXISTS reposts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  original_post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que um usuário não reposte o mesmo post mais de uma vez
  UNIQUE (user_id, original_post_id)
);

-- Índices para performance
CREATE INDEX idx_reposts_user_id ON reposts(user_id);
CREATE INDEX idx_reposts_original_post_id ON reposts(original_post_id);
CREATE INDEX idx_reposts_created_at ON reposts(created_at DESC);

-- Adicionar contador de reposts na tabela posts
ALTER TABLE posts ADD COLUMN IF NOT EXISTS reposts_count INTEGER DEFAULT 0;

-- Comentários
COMMENT ON TABLE reposts IS 'Tabela que armazena os reposts (compartilhamentos internos) de posts';
COMMENT ON COLUMN reposts.user_id IS 'ID do usuário que fez o repost';
COMMENT ON COLUMN reposts.original_post_id IS 'ID do post original que foi repostado';
COMMENT ON COLUMN posts.reposts_count IS 'Contador de quantas vezes o post foi repostado';
