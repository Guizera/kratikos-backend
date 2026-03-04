-- Migration: Adicionar campos de scoring aos votos
-- Data: 2026-02-12
-- Descrição: Adiciona peso aos votos e métricas de score do usuário

-- Adicionar campos de score na tabela poll_votes
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS vote_weight DECIMAL(5,4) DEFAULT 1.0000;
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS user_score DECIMAL(3,2) DEFAULT 1.00;
ALTER TABLE poll_votes ADD COLUMN IF NOT EXISTS calculated_at TIMESTAMP DEFAULT NOW();

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_poll_votes_weight ON poll_votes(vote_weight);
CREATE INDEX IF NOT EXISTS idx_poll_votes_calculated_at ON poll_votes(calculated_at);

-- Comentários
COMMENT ON COLUMN poll_votes.vote_weight IS 'Peso final do voto (0.5000-2.0000). Votos de usuários verificados têm peso maior';
COMMENT ON COLUMN poll_votes.user_score IS 'Score do usuário no momento do voto (0.00-1.00)';
COMMENT ON COLUMN poll_votes.calculated_at IS 'Data/hora em que o score foi calculado';

-- Atualizar votos existentes (todos começam com peso 1.0)
UPDATE poll_votes 
SET vote_weight = 1.0000, user_score = 1.00, calculated_at = NOW()
WHERE vote_weight IS NULL;

-- Se houver tabela de votos em posts, adicionar também
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'post_votes') THEN
    ALTER TABLE post_votes ADD COLUMN IF NOT EXISTS vote_weight DECIMAL(5,4) DEFAULT 1.0000;
    ALTER TABLE post_votes ADD COLUMN IF NOT EXISTS user_score DECIMAL(3,2) DEFAULT 1.00;
    ALTER TABLE post_votes ADD COLUMN IF NOT EXISTS calculated_at TIMESTAMP DEFAULT NOW();
    
    CREATE INDEX IF NOT EXISTS idx_post_votes_weight ON post_votes(vote_weight);
    
    UPDATE post_votes 
    SET vote_weight = 1.0000, user_score = 1.00, calculated_at = NOW()
    WHERE vote_weight IS NULL;
  END IF;
END $$;
