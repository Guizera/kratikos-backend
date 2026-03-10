-- ========================================================================
-- CORREÇÃO DA TABELA DE NOTIFICAÇÕES
-- ========================================================================
-- Ajusta a tabela existente para match com o código TypeORM

-- Primeiro, verificar e adicionar colunas que podem estar faltando
DO $$ 
BEGIN
  -- Adicionar recipient_id se não existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'recipient_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN recipient_id UUID;
  END IF;

  -- Adicionar sender_id se não existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'sender_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN sender_id UUID;
  END IF;

  -- Adicionar post_id se não existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'post_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN post_id UUID;
  END IF;

  -- Adicionar comment_id se não existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'comment_id'
  ) THEN
    ALTER TABLE notifications ADD COLUMN comment_id UUID;
  END IF;

  -- Adicionar is_read se não existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'is_read'
  ) THEN
    ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
  END IF;

  -- Adicionar read_at se não existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'read_at'
  ) THEN
    ALTER TABLE notifications ADD COLUMN read_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Adicionar metadata se não existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE notifications ADD COLUMN metadata JSONB;
  END IF;

  -- Adicionar updated_at se não existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE notifications ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Copiar dados de colunas snake_case antigas (se existirem)
DO $$ 
BEGIN
  -- Copiar read para is_read
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'read'
  ) THEN
    UPDATE notifications SET is_read = read WHERE is_read IS NULL;
  END IF;
END $$;

-- Adicionar constraints e foreign keys
DO $$ 
BEGIN
  -- recipient_id FK
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'notifications' AND constraint_name = 'fk_notifications_recipient'
  ) THEN
    ALTER TABLE notifications 
    ADD CONSTRAINT fk_notifications_recipient 
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  -- sender_id FK
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'notifications' AND constraint_name = 'fk_notifications_sender'
  ) THEN
    ALTER TABLE notifications 
    ADD CONSTRAINT fk_notifications_sender 
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  -- post_id FK
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'notifications' AND constraint_name = 'fk_notifications_post'
  ) THEN
    ALTER TABLE notifications 
    ADD CONSTRAINT fk_notifications_post 
    FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE;
  END IF;

  -- comment_id FK
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'notifications' AND constraint_name = 'fk_notifications_comment'
  ) THEN
    ALTER TABLE notifications 
    ADD CONSTRAINT fk_notifications_comment 
    FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE;
  END IF;

  -- Check constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'notifications' AND constraint_name = 'notifications_recipient_sender_check'
  ) THEN
    ALTER TABLE notifications 
    ADD CONSTRAINT notifications_recipient_sender_check 
    CHECK (recipient_id != sender_id);
  END IF;
END $$;

-- Criar índices (se não existirem)
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_sender_id ON notifications(sender_id);
DROP INDEX IF EXISTS idx_notifications_is_read;
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
DROP INDEX IF EXISTS idx_notifications_post_id;
CREATE INDEX idx_notifications_post_id ON notifications(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read_created ON notifications(recipient_id, is_read, created_at DESC);

-- Atualizar NOT NULL constraints após copiar dados
ALTER TABLE notifications ALTER COLUMN recipient_id SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN sender_id SET NOT NULL;
ALTER TABLE notifications ALTER COLUMN type SET NOT NULL;

-- Remover coluna antiga 'read' se existir
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'notifications' AND column_name = 'read'
  ) THEN
    ALTER TABLE notifications DROP COLUMN read;
  END IF;
END $$;

-- Atualizar comentários
COMMENT ON COLUMN notifications.recipient_id IS 'Usuário que recebe a notificação';
COMMENT ON COLUMN notifications.sender_id IS 'Usuário que gerou a ação';
COMMENT ON COLUMN notifications.post_id IS 'Post relacionado (se aplicável)';
COMMENT ON COLUMN notifications.comment_id IS 'Comentário relacionado (se aplicável)';
COMMENT ON COLUMN notifications.metadata IS 'Dados adicionais em JSON';
COMMENT ON COLUMN notifications.is_read IS 'Se a notificação foi lida';
COMMENT ON COLUMN notifications.read_at IS 'Quando foi lida';
