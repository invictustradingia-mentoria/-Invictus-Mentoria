import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { title, description, videoUrl, duration, moduleId, allowedRole, isPublished } = body

    if (!title || !moduleId || !videoUrl) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    const lesson = await prisma.lesson.create({
      data: {
        title,
        description,
        videoUrl,
        duration: duration ? parseInt(duration) : null,
        moduleId,
        allowedRole: allowedRole || 'CLUB',
        isPublished: isPublished ?? true,
      },
    })

    return NextResponse.json({ success: true, lesson })
  } catch (error) {
    console.error('Error creating lesson:', error)
    return NextResponse.json({ error: 'Error al crear la lección' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const moduleId = searchParams.get('moduleId')

    const lessons = await prisma.lesson.findMany({
      where: moduleId ? { moduleId } : undefined,
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ lessons })
  } catch (error) {
    console.error('Error fetching lessons:', error)
    return NextResponse.json({ error: 'Error al obtener las lecciones' }, { status: 500 })
  }
}