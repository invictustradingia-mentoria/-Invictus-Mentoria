import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET Modules + Lessons
export async function GET() {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
        },
      },
    })
    return NextResponse.json(modules)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener módulos' }, { status: 500 })
  }
}

// POST create Module
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { title, description } = await req.json()
    if (!title) return NextResponse.json({ error: 'Título requerido' }, { status: 400 })

    const count = await prisma.module.count()
    const moduleItem = await prisma.module.create({
      data: {
        title,
        description,
        order: count + 1,
      },
    })

    return NextResponse.json(moduleItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear módulo' }, { status: 500 })
  }
}

// PUT / DELETE for editing/deleting module
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    await prisma.module.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar módulo' }, { status: 500 })
  }
}
