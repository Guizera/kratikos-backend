-- ========================================================================
-- TABELA DE NOTIFICAÇÕES
-- ========================================================================
-- Sistema de notificações estilo Instagram/Twitter
-- Notifica o usuário sobre interações em seu conteúdo

CREATE TYPE notification_type AS ENUM (
  'post_like',            -- Alguém curtiu seu post
  'comment_on_post',      -- Alguém comentou no seu post
  'comment_like',         -- Alguém curtiu seu comentário
  'reply_to_comment',     -- Alguém respondeu seu comentário
  'follow_request',       -- Pedido de follow (se perfil privado)
  'new_follower',         -- Novo seguidor
  'post_repost',          -- Alguém repostou seu post
  'mention_in_post',      -- Mencionou você em um post
  'mention_in_comment'    -- Mencionou você em um comentário
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Destinatário (quem recebe a notificação)
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Remetente (quem gerou a ação)
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Tipo de notificação
  type notification_type NOT NULL,
  
  -- Referências opcionais aos objetos relacionados
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Conteúdo da notificação (texto do comentário, etc)
  content TEXT,
  
  -- Metadata adicional (JSON)
  metadata JSONB,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT notifications_recipient_sender_check CHECK (recipient_id != sender_id)
);

-- ========================================================================
-- ÍNDICES
-- ========================================================================

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_sender_id ON notifications(sender_id);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_post_id ON notifications(post_id) WHERE post_id IS NOT NULL;

-- Índice composto para queries comuns
CREATE INDEX idx_notifications_recipient_read_created 
  ON notifications(recipient_id, is_read, created_at DESC);

-- ========================================================================
-- TRIGGER PARA UPDATED_AT
-- ========================================================================

CREATE OR REPLACE FUNCTION update_notifications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_notifications_updated_at ON notifications;
CREATE TRIGGER trigger_update_notifications_updated_at
  BEFORE UPDATE ON notifications
  FOR EACH ROW
  EXECUTE FUNCTION update_notifications_updated_at();

-- ========================================================================
-- COMENTÁRIOS
-- ========================================================================

COMMENT ON TABLE notifications IS 'Sistema de notificações para interações dos usuários';
COMMENT ON COLUMN notifications.recipient_id IS 'Usuário que recebe a notificação';
COMMENT ON COLUMN notifications.sender_id IS 'Usuário que gerou a ação';
COMMENT ON COLUMN notifications.type IS 'Tipo de notificação (like, comment, follow, etc)';
COMMENT ON COLUMN notifications.post_id IS 'Post relacionado (se aplicável)';
COMMENT ON COLUMN notifications.comment_id IS 'Comentário relacionado (se aplicável)';
COMMENT ON COLUMN notifications.content IS 'Conteúdo da notificação (texto do comentário, etc)';
COMMENT ON COLUMN notifications.metadata IS 'Dados adicionais em JSON';
COMMENT ON COLUMN notifications.is_read IS 'Se a notificação foi lida';
COMMENT ON COLUMN notifications.read_at IS 'Quando foi lida';
