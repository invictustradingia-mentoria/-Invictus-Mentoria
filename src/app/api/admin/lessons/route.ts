import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    const userRole = (session?.user as any)?.role?.toUpperCase()

    if (!session || userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Permisos de administrador requeridos' }, { status: 403 })
    }

    const body = await req.json()
    const { title, description, videoUrl, duration, moduleId, allowedRole } = body

    if (!title || !moduleId) {
      return NextResponse.json({ error: 'El título y el módulo son obligatorios' }, { status: 400 })
    }

    // Asegurar valores por defecto válidos
    const cleanRole = allowedRole?.toUpperCase() === 'MENTORIA' ? 'MENTORIA' : 'CLUB'
    const finalVideoUrl = videoUrl && videoUrl.trim() !== '' ? videoUrl.trim() : 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'

    // Contar las lecciones existentes en el módulo para asignar orden
    const lessonCount = await prisma.lesson.count({ where: { moduleId } })

    const lesson = await prisma.lesson.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        videoUrl: finalVideoUrl,
        duration: duration ? parseInt(duration) : 1200,
        moduleId,
        allowedRole: cleanRole,
        order: lessonCount + 1,
        isPublished: true,
      },
    })

    return NextResponse.json({ success: true, lesson })
  } catch (error: any) {
    console.error('Error al crear lección:', error)
    return NextResponse.json({ error: error?.message || 'Error al guardar la lección' }, { status: 500 })
  }
}