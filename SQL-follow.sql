-- Sistema de "Seguir" (estilo Facebook/Instagram, no mensajería privada).
-- Requiere que SQL-community.sql ya se haya ejecutado antes (usa la tabla "users").
-- Ejecutar en el SQL Editor de Supabase antes de compilar/desplegar.

CREATE TABLE IF NOT EXISTS "follows" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "followerId" TEXT NOT NULL,
  "followingId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "follows_followerId_followingId_key" ON "follows" ("followerId", "followingId");
CREATE INDEX IF NOT EXISTS "follows_followerId_idx" ON "follows" ("followerId");
CREATE INDEX IF NOT EXISTS "follows_followingId_idx" ON "follows" ("followingId");

ALTER TABLE "follows"
  DROP CONSTRAINT IF EXISTS "follows_followerId_fkey",
  ADD CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "follows"
  DROP CONSTRAINT IF EXISTS "follows_followingId_fkey",
  ADD CONSTRAINT "follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
