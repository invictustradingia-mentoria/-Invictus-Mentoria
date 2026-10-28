import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const content = await prisma.content.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(content)
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Error al obtener contenido' }, { status: 500 })
  }
}