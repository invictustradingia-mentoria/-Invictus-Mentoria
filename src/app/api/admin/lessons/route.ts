import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }
    const lessons = await prisma.lesson.findMany({ orderBy: { order: 'asc' } })
    return NextResponse.json(lessons)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener lecciones' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { moduleId, title, description, videoUrl, duration } = await req.json()
    if (!moduleId || !title || !videoUrl) {
      return NextResponse.json({ error: 'Faltan campos requeridos' }, { status: 400 })
    }

    const count = await prisma.lesson.count({ where: { moduleId } })
    const lesson = await prisma.lesson.create({
      data: {
        moduleId,
        title,
        description,
        videoUrl,
        duration: duration ? parseInt(duration) : 1200,
        order: count + 1,
      },
    })

    return NextResponse.json(lesson, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear lección' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { id, title, description, videoUrl, duration } = await req.json()
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(videoUrl && { videoUrl }),
        ...(duration !== undefined && { duration: parseInt(duration) }),
      },
    })

    return NextResponse.json(lesson)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar lección' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

    await prisma.lesson.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar lección' }, { status: 500 })
  }
}
