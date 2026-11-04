-- Trading Journal: cuentas (evals), operaciones y comentarios del equipo.
-- Ejecutar en el SQL Editor de Supabase antes de compilar/desplegar.

CREATE TABLE IF NOT EXISTS "journal_accounts" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "propFirm" TEXT,
  "accountSize" DOUBLE PRECISION,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  CONSTRAINT "journal_accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "journal_accounts_userId_idx" ON "journal_accounts"("userId");

CREATE TABLE IF NOT EXISTS "journal_entries" (
  "id" TEXT PRIMARY KEY,
  "accountId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "pair" TEXT,
  "session" TEXT,
  "resultMoney" DOUBLE PRECISION,
  "resultPercent" DOUBLE PRECISION,
  "resultRR" DOUBLE PRECISION,
  "dayTag" TEXT NOT NULL DEFAULT 'NEUTRAL',
  "note" TEXT,
  "screenshotUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  CONSTRAINT "journal_entries_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "journal_accounts"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "journal_entries_accountId_idx" ON "journal_entries"("accountId");
CREATE INDEX IF NOT EXISTS "journal_entries_date_idx" ON "journal_entries"("date");

CREATE TABLE IF NOT EXISTS "journal_comments" (
  "id" TEXT PRIMARY KEY,
  "entryId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "authorName" TEXT,
  "authorRole" TEXT,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT now(),
  CONSTRAINT "journal_comments_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "journal_entries"("id") ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS "journal_comments_entryId_idx" ON "journal_comments"("entryId");
