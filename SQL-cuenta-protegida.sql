-- Ejecutar UNA vez en Supabase > SQL Editor
ALTER TABLE users ADD COLUMN IF NOT EXISTS "isProtected" BOOLEAN NOT NULL DEFAULT false;

-- Marca la cuenta como protegida y le da rol MENTORIA (ve Club y Mentoria)
UPDATE users
SET role = 'MENTORIA', status = 'APPROVED', "isBanned" = false, "isProtected" = true
WHERE email = 'fileuploadpaid@gmail.com';
