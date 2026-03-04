-- Migration: Adicionar campos de verificação aos usuários
-- Data: 2026-02-12
-- Descrição: Adiciona CPF (hash), níveis de verificação e estatísticas de voto

-- Adicionar campos de verificação
ALTER TABLE users ADD COLUMN IF NOT EXISTS cpf_hash VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_level INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS document_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS document_verified_at TIMESTAMP;

-- Adicionar campos de histórico de votos
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_votes INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS consistent_voting_days INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_vote_at TIMESTAMP;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_users_cpf_hash ON users(cpf_hash);
CREATE INDEX IF NOT EXISTS idx_users_verification_level ON users(verification_level);
CREATE INDEX IF NOT EXISTS idx_users_total_votes ON users(total_votes);
CREATE INDEX IF NOT EXISTS idx_users_last_vote_at ON users(last_vote_at);

-- Comentários
COMMENT ON COLUMN users.cpf_hash IS 'Hash SHA-256 do CPF (nunca armazenar CPF raw)';
COMMENT ON COLUMN users.verification_level IS '1=Básica (email), 2=Verificada (CPF), 3=Legal (CNPJ)';
COMMENT ON COLUMN users.document_verified IS 'Se documento foi verificado';
COMMENT ON COLUMN users.document_verified_at IS 'Data da verificação do documento';
COMMENT ON COLUMN users.total_votes IS 'Total de votos do usuário (histórico)';
COMMENT ON COLUMN users.consistent_voting_days IS 'Dias consecutivos votando';
COMMENT ON COLUMN users.last_vote_at IS 'Data do último voto';

-- Atualizar usuários existentes (todos começam no nível 1)
UPDATE users 
SET verification_level = 1 
WHERE verification_level IS NULL;
