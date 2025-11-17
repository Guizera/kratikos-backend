-- Migration: Criar tabela poll_votes
-- Data: 17/11/2025
-- Descrição: Tabela para armazenar votos nas enquetes

CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  poll_id UUID NOT NULL,
  option_id UUID NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  
  -- Foreign keys
  CONSTRAINT fk_poll_votes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_poll_votes_poll FOREIGN KEY (poll_id) REFERENCES polls(id) ON DELETE CASCADE,
  CONSTRAINT fk_poll_votes_option FOREIGN KEY (option_id) REFERENCES poll_options(id) ON DELETE CASCADE,
  
  -- Constraint: um usuário só pode votar uma vez por enquete
  CONSTRAINT unique_user_poll_vote UNIQUE (user_id, poll_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_id ON poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_user_id ON poll_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_option_id ON poll_votes(option_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_created_at ON poll_votes(created_at DESC);

-- Comentários
COMMENT ON TABLE poll_votes IS 'Armazena os votos nas enquetes';
COMMENT ON COLUMN poll_votes.id IS 'ID do voto';
COMMENT ON COLUMN poll_votes.user_id IS 'ID do usuário que votou';
COMMENT ON COLUMN poll_votes.poll_id IS 'ID da enquete';
COMMENT ON COLUMN poll_votes.option_id IS 'ID da opção escolhida';
COMMENT ON COLUMN poll_votes.created_at IS 'Data do voto';

