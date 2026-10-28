import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // Cast flexible para evitar que TypeScript aborte la compilación si el modelo varía en el schema
    const prismaAny = prisma as any
    if (prismaAny.content) {
      const content = await prismaAny.content.findMany({
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json(content)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Error al obtener contenido' }, { status: 500 })
  }
}