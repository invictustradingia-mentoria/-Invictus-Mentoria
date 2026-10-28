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
      include: { lessons: true },
    })

    return NextResponse.json({ modules })
  } catch (error) {
    console.error('Error fetching modules:', error)
    return NextResponse.json({ error: 'Error al obtener los módulos' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Verificación flexible de administrador
    const userRole = (session?.user as any)?.role?.toUpperCase()
    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Permisos de administrador requeridos' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description } = body

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'El título del módulo es obligatorio' }, { status: 400 })
    }

    // Calcular el orden automáticamente
    const currentCount = await prisma.module.count()

    const newModule = await prisma.module.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        order: currentCount + 1,
        isPublished: true,
      },
      include: {
        lessons: true,
      },
    })

    return NextResponse.json({ success: true, module: newModule })
  } catch (error: any) {
    console.error('Error al crear módulo:', error)
    return NextResponse.json(
      { error: error?.message || 'Error interno al crear el módulo en la base de datos' },
      { status: 500 }
    )
  }
}