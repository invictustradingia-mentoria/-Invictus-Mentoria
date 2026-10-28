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
    const userRole = (session?.user as any)?.role?.toUpperCase()

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Permisos de administrador requeridos' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description } = body

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'El título del módulo es obligatorio' }, { status: 400 })
    }

    const currentCount = await prisma.module.count()

    // Creamos el módulo sin el include para evitar cualquier error de columnas pendientes en la BD
    const newModule = await prisma.module.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        order: currentCount + 1,
        isPublished: true,
      },
    })

    // Devolvemos el módulo con un array de lecciones vacío para que el frontend lo incorpore al instante
    return NextResponse.json({ success: true, module: { ...newModule, lessons: [] } })
  } catch (error: any) {
    console.error('Error al crear módulo:', error)
    return NextResponse.json(
      { error: error?.message || 'Error interno al crear el módulo' },
      { status: 500 }
    )
  }
}