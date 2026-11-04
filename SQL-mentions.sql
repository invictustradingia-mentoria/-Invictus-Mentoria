-- Responder mensajes en el chat global, reacciones en comentarios, menciones (@usuario) y notificaciones.
-- Requiere que SQL-community.sql, SQL-follow.sql y SQL-share.sql ya se hayan ejecutado antes.
-- Ejecutar en el SQL Editor de Supabase antes de compilar/desplegar.

-- Responder a un mensaje puntual del chat global.
ALTER TABLE "chat_messages" ADD COLUMN IF NOT EXISTS "replyToId" TEXT;
CREATE INDEX IF NOT EXISTS "chat_messages_replyToId_idx" ON "chat_messages" ("replyToId");
ALTER TABLE "chat_messages"
  DROP CONSTRAINT IF EXISTS "chat_messages_replyToId_fkey",
  ADD CONSTRAINT "chat_messages_replyToId_fkey" FOREIGN KEY ("replyToId") REFERENCES "chat_messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Reacciones por comentario (mismas 4 que los posts).
CREATE TABLE IF NOT EXISTS "comment_reactions" (
  "id"        TEXT PRIMARY KEY,
  "commentId" TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "type"      TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "comment_reactions_commentId_userId_key" ON "comment_reactions" ("commentId", "userId");
CREATE INDEX IF NOT EXISTS "comment_reactions_commentId_idx" ON "comment_reactions" ("commentId");
ALTER TABLE "comment_reactions"
  DROP CONSTRAINT IF EXISTS "comment_reactions_commentId_fkey",
  ADD CONSTRAINT "comment_reactions_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "post_comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comment_reactions"
  DROP CONSTRAINT IF EXISTS "comment_reactions_userId_fkey",
  ADD CONSTRAINT "comment_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Notificaciones (por ahora, solo menciones @usuario en posts, comentarios o el chat).
CREATE TABLE IF NOT EXISTS "notifications" (
  "id"            TEXT PRIMARY KEY,
  "userId"        TEXT NOT NULL,
  "type"          TEXT NOT NULL DEFAULT 'MENTION',
  "actorId"       TEXT NOT NULL,
  "actorName"     TEXT,
  "actorRole"     TEXT,
  "postId"        TEXT,
  "commentId"     TEXT,
  "chatMessageId" TEXT,
  "snippet"       TEXT,
  "read"          BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "notifications_userId_read_idx" ON "notifications" ("userId", "read");
CREATE INDEX IF NOT EXISTS "notifications_userId_createdAt_idx" ON "notifications" ("userId", "createdAt");
ALTER TABLE "notifications"
  DROP CONSTRAINT IF EXISTS "notifications_userId_fkey",
  ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
