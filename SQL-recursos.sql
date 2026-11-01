-- Agrega las columnas nuevas al modelo Resource (ya existía la tabla "resources").
-- Si por algún motivo la tabla no existiera todavía, esto también la crea.
CREATE TABLE IF NOT EXISTS resources (
  id            TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  "fileUrl"     TEXT NOT NULL,
  "fileName"    TEXT,
  "fileSize"    INTEGER,
  description   TEXT,
  "allowedRole" TEXT NOT NULL DEFAULT 'ALL',
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT now(),
  "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT now()
);

ALTER TABLE resources ADD COLUMN IF NOT EXISTS "fileName" TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS "fileSize" INTEGER;
