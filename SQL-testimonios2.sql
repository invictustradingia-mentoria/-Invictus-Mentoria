-- Ejecutar UNA vez en Supabase > SQL Editor (despues del SQL anterior de testimonios)
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS "kind" TEXT NOT NULL DEFAULT 'IMAGE';
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS "videoUrl" TEXT;
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT now();
ALTER TABLE testimonials ALTER COLUMN "image" DROP NOT NULL;
