import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prismaDash?: PrismaClient }

export const prismaDash = globalForPrisma.prismaDash ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prismaDash = prismaDash
}