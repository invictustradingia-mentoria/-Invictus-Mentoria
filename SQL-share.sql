-- Función "Compartir" en el feed de Comunidad.
-- Requiere que SQL-community.sql ya se haya ejecutado antes (usa la tabla "posts").
-- Ejecutar en el SQL Editor de Supabase antes de compilar/desplegar.

ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "sharedFromId" TEXT;

CREATE INDEX IF NOT EXISTS "posts_sharedFromId_idx" ON "posts" ("sharedFromId");

ALTER TABLE "posts"
  DROP CONSTRAINT IF EXISTS "posts_sharedFromId_fkey",
  ADD CONSTRAINT "posts_sharedFromId_fkey" FOREIGN KEY ("sharedFromId") REFERENCES "posts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
