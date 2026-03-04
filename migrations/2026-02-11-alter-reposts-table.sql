-- Migration: Ajustar tabela reposts para corresponder ao código
-- Data: 2026-02-11
-- Descrição: Renomear post_id para original_post_id e adicionar campos faltantes

-- Renomear coluna post_id para original_post_id
ALTER TABLE reposts 
RENAME COLUMN post_id TO original_post_id;

-- Adicionar coluna updated_at se não existir
ALTER TABLE reposts 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Atualizar constraint UNIQUE (se necessário remover a antiga e criar nova)
ALTER TABLE reposts 
DROP CONSTRAINT IF EXISTS reposts_user_id_post_id_key;

ALTER TABLE reposts 
ADD CONSTRAINT reposts_user_id_original_post_id_key UNIQUE (user_id, original_post_id);

-- Adicionar ON DELETE CASCADE nas foreign keys (se necessário recriar)
ALTER TABLE reposts 
DROP CONSTRAINT IF EXISTS reposts_user_id_fkey;

ALTER TABLE reposts 
ADD CONSTRAINT reposts_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE reposts 
DROP CONSTRAINT IF EXISTS reposts_post_id_fkey;

ALTER TABLE reposts 
ADD CONSTRAINT reposts_original_post_id_fkey 
FOREIGN KEY (original_post_id) REFERENCES posts(id) ON DELETE CASCADE;

-- Adicionar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_reposts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Adicionar trigger para updated_at
DROP TRIGGER IF EXISTS trigger_update_reposts_updated_at ON reposts;

CREATE TRIGGER trigger_update_reposts_updated_at
BEFORE UPDATE ON reposts
FOR EACH ROW
EXECUTE FUNCTION update_reposts_updated_at();

-- Recriar índices com nomes corretos
DROP INDEX IF EXISTS idx_reposts_post_id;

CREATE INDEX IF NOT EXISTS idx_reposts_user_id ON reposts(user_id);
CREATE INDEX IF NOT EXISTS idx_reposts_original_post_id ON reposts(original_post_id);
CREATE INDEX IF NOT EXISTS idx_reposts_created_at ON reposts(created_at DESC);

-- Adicionar contador de reposts na tabela posts (se ainda não existir)
ALTER TABLE posts 
ADD COLUMN IF NOT EXISTS reposts_count INTEGER DEFAULT 0;

-- Comentários
COMMENT ON COLUMN reposts.original_post_id IS 'ID do post original que foi repostado';
COMMENT ON COLUMN reposts.updated_at IS 'Data de atualização do repost';
COMMENT ON COLUMN posts.reposts_count IS 'Contador de quantas vezes o post foi repostado';

-- Atualizar contadores existentes (caso já existam reposts)
UPDATE posts 
SET reposts_count = (
    SELECT COUNT(*) 
    FROM reposts 
    WHERE reposts.original_post_id = posts.id
);
