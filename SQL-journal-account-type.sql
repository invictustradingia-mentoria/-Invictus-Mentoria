-- Trading Journal: tipo de cuenta (Eval / PA) para instalaciones ya existentes.
-- Ejecutar en el SQL Editor de Supabase antes de compilar/desplegar.

ALTER TABLE "journal_accounts" ADD COLUMN IF NOT EXISTS "accountType" TEXT NOT NULL DEFAULT 'EVAL';
