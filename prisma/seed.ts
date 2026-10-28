/**
 * Invictus Mentoria – Database Seed Script
 * Ejecutar con: npm run db:seed
 *
 * Crea un usuario ADMIN inicial si no existe.
 * Cambia las credenciales ANTES de ejecutar en producción.
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de base de datos Invictus...')

  // ── Admin user ─────────────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@invictus-mentoria.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Invictus2024!'

  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } })

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador Invictus',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
        status: 'APPROVED',
        isBanned: false,
        registeredIp: '127.0.0.1',
        userAgent: 'Seed Script',
      },
    })
    console.log(`✅ Admin creado: ${admin.email}`)
    console.log(`   Contraseña: ${adminPassword}`)
    console.log(`   ⚠️  CAMBIA ESTA CONTRASEÑA DESDE EL PANEL /admin inmediatamente.`)
  } else {
    console.log(`ℹ️  Admin ya existe: ${adminEmail}`)
  }

  // ── Sample modules (optional) ──────────────────────────────────────────────
  const moduleCount = await prisma.module.count()
  if (moduleCount === 0) {
    const mod1 = await prisma.module.create({
      data: {
        title: 'Fundamentos del Trading Institucional',
        description: 'Bases del análisis de mercado, estructura de precio y conceptos ICT.',
        order: 1,
        isPublished: true,
      },
    })

    await prisma.lesson.createMany({
      data: [
        {
          moduleId: mod1.id,
          title: 'Introducción al Método Invictus',
          description: 'Presentación del método, filosofía de trading y objetivos del programa.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          duration: 1800,
          order: 1,
          isPublished: true,
        },
        {
          moduleId: mod1.id,
          title: 'Estructura de Mercado y Tipos de Tendencia',
          description: 'BOS, CHOCH, tendencias alcistas y bajistas en mercados institucionales.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          duration: 2400,
          order: 2,
          isPublished: true,
        },
      ],
    })

    console.log(`✅ Módulo de muestra creado con 2 lecciones.`)
  } else {
    console.log(`ℹ️  Ya existen ${moduleCount} módulos. No se crean módulos de muestra.`)
  }

  console.log('✅ Seed completado con éxito.')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
