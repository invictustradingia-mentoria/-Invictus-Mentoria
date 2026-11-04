-- Agrega la sesión de trading (Asia / Londres / Nueva York / solapamiento) a cada operación del journal.
-- Ejecutar en el SQL Editor de Supabase antes de compilar/desplegar.
-- (Solo si ya habías corrido SQL-journal.sql antes; si es una instalación nueva, este campo ya viene incluido ahí.)

ALTER TABLE "journal_entries" ADD COLUMN IF NOT EXISTS "session" TEXT;
