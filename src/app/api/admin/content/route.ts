import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const modules = await prisma.module.findMany({
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    })

    return NextResponse.json({ modules })
  } catch (error) {
    console.error('Error fetching content:', error)
    return NextResponse.json({ error: 'Error al obtener el contenido' }, { status: 500 })
  }
}