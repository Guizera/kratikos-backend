-- Migração para adicionar suporte a autenticação social (Google e Apple)
-- Data: 2025-10-15

-- Adicionar colunas para autenticação social na tabela users
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS google_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS apple_id VARCHAR(255),
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- Tornar password_hash nullable (pois usuários sociais não precisam de senha)
ALTER TABLE users 
  ALTER COLUMN password_hash DROP NOT NULL;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_apple_id ON users(apple_id);

-- Adicionar constraints únicos para IDs sociais
ALTER TABLE users 
  ADD CONSTRAINT unique_google_id UNIQUE(google_id);
  
ALTER TABLE users 
  ADD CONSTRAINT unique_apple_id UNIQUE(apple_id);

-- Comentários nas colunas
COMMENT ON COLUMN users.google_id IS 'ID único do usuário no Google (para login social)';
COMMENT ON COLUMN users.apple_id IS 'ID único do usuário na Apple (para login social)';
COMMENT ON COLUMN users.photo_url IS 'URL da foto do perfil do usuário';

