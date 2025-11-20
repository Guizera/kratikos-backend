# 📊 Sistema Completo de Interações - Kratikos

## ✅ **IMPLEMENTAÇÃO COMPLETA**

### 🎯 **1. POSTS (Propostas, Discussões)**

#### **Funcionalidades:**
| Ação | Status | Endpoints |
|------|--------|-----------|
| **Curtir** | ✅ | `POST /posts/:id/like`<br>`DELETE /posts/:id/like`<br>`GET /posts/:id/liked` |
| **Compartilhar** | ✅ | `POST /posts/:id/share` |
| **Comentar** | ✅ | `POST /comments`<br>`GET /comments/post/:postId` |
| **Sub-enquetes** | ✅ | `POST /comments` (commentType: 'poll')<br>`POST /comments/poll/options/:optionId/vote` |
| **Curtir Comentários** | ✅ | `POST /comments/:id/like`<br>`DELETE /comments/:id/like` |
| **Respostas Aninhadas** | ✅ | `POST /comments` (parentId)<br>`GET /comments/:id/replies` |

#### **Banco de Dados:**
- ✅ `posts` - Post principal
- ✅ `post_likes` - Curtidas em posts
- ✅ `comments` - Comentários (texto ou poll)
- ✅ `comment_likes` - Curtidas em comentários
- ✅ `comment_poll_options` - Opções de sub-enquetes
- ✅ `comment_poll_votes` - Votos em sub-enquetes

---

### 🗳️ **2. ENQUETES (Polls)**

#### **Arquitetura:**
Enquetes criam um **Post** associado com `type: 'enquete'`.
Herdam **TODAS** as funcionalidades de posts.

#### **Funcionalidades:**
| Ação | Status | Endpoints | Observação |
|------|--------|-----------|------------|
| **Votar** | ✅ | `POST /polls/:id/vote`<br>`DELETE /polls/:id/vote`<br>`GET /polls/:id/vote` | Funcionalidade exclusiva de polls |
| **Curtir** | ✅ | `POST /posts/:postId/like` | Via Post associado |
| **Compartilhar** | ✅ | `POST /posts/:postId/share` | Via Post associado |
| **Comentar** | ✅ | `POST /comments` (postId) | Via Post associado |
| **Sub-enquetes** | ✅ | `POST /comments` (commentType: 'poll') | Em comentários |
| **Curtir Comentários** | ✅ | `POST /comments/:id/like` | Em comentários |

#### **Banco de Dados:**
- ✅ `polls` - Dados da enquete
- ✅ `poll_options` - Opções de voto
- ✅ `poll_votes` - Votos dos usuários
- ✅ `posts` - Post associado (PostType.ENQUETE)
- ✅ **Herda todas as tabelas de posts** (likes, comments, etc.)

---

### 📰 **3. NOTÍCIAS (News)**

#### **Funcionalidades:**
| Ação | Status | Endpoints |
|------|--------|-----------|
| **Curtir** | ✅ | `POST /news/:id/like`<br>`DELETE /news/:id/like`<br>`GET /news/:id/liked` |
| **Compartilhar** | ✅ | `POST /news/:id/share` |
| **Comentar** | ✅ | `POST /news/:id/comments`<br>`GET /news/:id/comments` |
| **Sub-enquetes** | ✅ | `POST /news/:id/comments` (commentType: 'poll')<br>`POST /news/comments/poll/options/:optionId/vote` |
| **Curtir Comentários** | ✅ | `POST /news/comments/:id/like`<br>`DELETE /news/comments/:id/like` |
| **Respostas Aninhadas** | ✅ | `POST /news/:id/comments` (parentCommentId)<br>`GET /news/comments/:id/replies` |

#### **Banco de Dados:**
- ✅ `news_articles` - Notícia principal
- ✅ `news_likes` - Curtidas em notícias
- ✅ `news_shares` - Compartilhamentos
- ✅ `news_comments` - Comentários (texto ou poll)
- ✅ `news_comment_likes` - Curtidas em comentários
- ✅ `news_comment_poll_options` - Opções de sub-enquetes
- ✅ `news_comment_poll_votes` - Votos em sub-enquetes

---

## 🔥 **CONTADORES AUTOMÁTICOS**

Todos os contadores são atualizados automaticamente via **triggers SQL**:

### **Posts:**
- `likes_count` - Atualizado ao curtir/descurtir
- `comments_count` - Atualizado ao comentar
- `shares_count` - Atualizado ao compartilhar

### **Comentários:**
- `likes_count` - Atualizado ao curtir comentário
- `replies_count` - Atualizado ao responder

### **Sub-enquetes:**
- `votes_count` - Atualizado ao votar

### **Notícias:**
- `likes_count` - Atualizado ao curtir/descurtir
- `comments_count` - Atualizado ao comentar
- `shares_count` - Atualizado ao compartilhar

---

## 📦 **MIGRATIONS NECESSÁRIAS**

### **✅ Já Criadas:**
1. `2025-11-17-create-post-likes-table.sql` - Curtidas em posts
2. `2025-11-20-expand-comments-system.sql` - Sistema completo de comentários
3. `2025-11-18-create-news-tables.sql` - Sistema de notícias
4. `2025-11-19-create-news-comments-table.sql` - Comentários em notícias

### **⚠️ Verificar se foram executadas:**
```bash
# Development
psql $DATABASE_URL -f migrations/2025-11-20-expand-comments-system.sql
psql $DATABASE_URL -f migrations/2025-11-19-create-news-comments-table.sql

# Production (Railway)
psql $RAILWAY_DATABASE_URL -f migrations/2025-11-20-expand-comments-system.sql
psql $RAILWAY_DATABASE_URL -f migrations/2025-11-19-create-news-comments-table.sql
```

---

## 🎯 **EXEMPLO DE FLUXO COMPLETO**

### **1. Criar Post:**
```json
POST /posts
{
  "title": "Proposta de novo parque",
  "content": "Vamos criar um parque na cidade!",
  "type": "proposta",
  "scope": "regional"
}
```

### **2. Curtir Post:**
```bash
POST /posts/{postId}/like
```

### **3. Comentar Post:**
```json
POST /comments
{
  "postId": "{postId}",
  "content": "Ótima ideia!",
  "commentType": "text"
}
```

### **4. Criar Sub-enquete no Comentário:**
```json
POST /comments
{
  "postId": "{postId}",
  "content": "Qual o melhor local para o parque?",
  "commentType": "poll",
  "pollOptions": [
    { "optionText": "Centro da cidade" },
    { "optionText": "Bairro Norte" },
    { "optionText": "Zona Sul" }
  ]
}
```

### **5. Votar na Sub-enquete:**
```bash
POST /comments/poll/options/{optionId}/vote
```

### **6. Curtir Comentário:**
```bash
POST /comments/{commentId}/like
```

### **7. Responder Comentário:**
```json
POST /comments
{
  "postId": "{postId}",
  "parentId": "{commentId}",
  "content": "Concordo totalmente!"
}
```

### **8. Compartilhar Post:**
```bash
POST /posts/{postId}/share
```

---

## 📱 **PRÓXIMOS PASSOS - MOBILE**

### **Falta Implementar no Flutter:**
1. ❌ Widgets de comentários para posts
2. ❌ Widgets de comentários para notícias
3. ❌ Interface de sub-enquetes em comentários
4. ❌ Contador de compartilhamentos na UI
5. ❌ Tela de respostas aninhadas

---

## ✅ **VERIFICAÇÃO FINAL**

### **Backend:**
- ✅ Entities criadas
- ✅ DTOs criados
- ✅ Services implementados
- ✅ Controllers com endpoints
- ✅ Migrations SQL criadas
- ✅ Triggers para contadores
- ✅ Build sem erros

### **Migrations Status:**
- ⚠️ **Rodar migrations localmente**
- ⚠️ **Rodar migrations no Railway**
- ⚠️ **Fazer deploy do backend**

### **Mobile:**
- ⚠️ **Implementar UI de comentários**
- ⚠️ **Integrar com endpoints do backend**

---

## 🚀 **COMANDOS ÚTEIS**

### **Verificar tabelas no banco:**
```bash
psql $DATABASE_URL -c "\dt"
```

### **Contar comentários:**
```bash
psql $DATABASE_URL -c "SELECT COUNT(*) FROM comments;"
psql $DATABASE_URL -c "SELECT COUNT(*) FROM news_comments;"
```

### **Ver sub-enquetes em comentários:**
```bash
psql $DATABASE_URL -c "SELECT * FROM comments WHERE comment_type = 'poll';"
```

### **Testar endpoints:**
```bash
# Criar comentário texto
curl -X POST https://kratikos-dev-backend-development.up.railway.app/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"postId": "uuid", "content": "Teste", "commentType": "text"}'

# Criar sub-enquete
curl -X POST https://kratikos-dev-backend-development.up.railway.app/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "postId": "uuid",
    "content": "Qual sua opinião?",
    "commentType": "poll",
    "pollOptions": [
      {"optionText": "Opção 1"},
      {"optionText": "Opção 2"}
    ]
  }'
```

---

**Última atualização:** 20/11/2025
**Status geral:** ✅ Backend 100% completo | ⚠️ Mobile aguardando implementação

