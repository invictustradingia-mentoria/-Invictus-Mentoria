import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const modules = await prisma.module.findMany({
      orderBy: { order: 'asc' },
      include: { lessons: true },
    })

    return NextResponse.json({ modules })
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json({ error: 'Error al obtener módulos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description } = body

    if (!title) {
      return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
    }

    // Calcular el orden automático
    const count = await prisma.module.count()

    const newModule = await prisma.module.create({
      data: {
        title,
        description,
        order: count + 1,
      },
      include: { lessons: true },
    })

    return NextResponse.json({ success: true, module: newModule })
  } catch (error) {
    console.error('Error creating module:', error)
    return NextResponse.json({ error: 'Error al crear el módulo' }, { status: 500 })
  }
}