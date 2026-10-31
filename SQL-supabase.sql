-- Ejecutar UNA vez en Supabase > SQL Editor
ALTER TABLE users ADD COLUMN IF NOT EXISTS "username" TEXT;

-- Asigna un usuario único a las cuentas existentes (a partir de su correo)
WITH base AS (
  SELECT id,
         CASE WHEN length(b) < 3 THEN 'alumno' ELSE left(b, 14) END AS b,
         "createdAt"
  FROM (SELECT id, "createdAt", regexp_replace(lower(split_part(email, '@', 1)), '[^a-z0-9_]', '', 'g') AS b FROM users WHERE username IS NULL) t
), numbered AS (
  SELECT id, b, row_number() OVER (PARTITION BY b ORDER BY "createdAt", id) AS rn FROM base
)
UPDATE users u
SET username = CASE WHEN n.rn = 1 THEN n.b ELSE n.b || '_' || n.rn END
FROM numbered n
WHERE u.id = n.id
  AND NOT EXISTS (SELECT 1 FROM users x WHERE x.username = CASE WHEN n.rn = 1 THEN n.b ELSE n.b || '_' || n.rn END);

CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users ("username");
