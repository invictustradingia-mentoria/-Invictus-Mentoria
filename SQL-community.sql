-- Comunidad estilo Facebook: perfil (portada) + feed de posts con reacciones y comentarios.
-- Ejecutar en el SQL Editor de Supabase antes de compilar/desplegar.

ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "coverUrl" TEXT;

CREATE TABLE IF NOT EXISTS "posts" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "authorId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "posts_createdAt_idx" ON "posts" ("createdAt");
CREATE INDEX IF NOT EXISTS "posts_authorId_idx" ON "posts" ("authorId");

ALTER TABLE "posts"
  DROP CONSTRAINT IF EXISTS "posts_authorId_fkey",
  ADD CONSTRAINT "posts_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "post_reactions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "post_reactions_postId_userId_key" ON "post_reactions" ("postId", "userId");
CREATE INDEX IF NOT EXISTS "post_reactions_postId_idx" ON "post_reactions" ("postId");

ALTER TABLE "post_reactions"
  DROP CONSTRAINT IF EXISTS "post_reactions_postId_fkey",
  ADD CONSTRAINT "post_reactions_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_reactions"
  DROP CONSTRAINT IF EXISTS "post_reactions_userId_fkey",
  ADD CONSTRAINT "post_reactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE IF NOT EXISTS "post_comments" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "postId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "authorName" TEXT,
  "authorRole" TEXT,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "post_comments_postId_idx" ON "post_comments" ("postId");

ALTER TABLE "post_comments"
  DROP CONSTRAINT IF EXISTS "post_comments_postId_fkey",
  ADD CONSTRAINT "post_comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "post_comments"
  DROP CONSTRAINT IF EXISTS "post_comments_authorId_fkey",
  ADD CONSTRAINT "post_comments_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
