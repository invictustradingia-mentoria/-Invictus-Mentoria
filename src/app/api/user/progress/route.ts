import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// POST - Upsert lesson progress
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario no encontrado' }, { status: 400 })
    }

    const { lessonId, completed, watchedSecs } = await req.json()
    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId requerido' }, { status: 400 })
    }

    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: { userId, lessonId },
      },
      update: {
        completed: completed ?? false,
        watchedSecs: watchedSecs ?? 0,
      },
      create: {
        userId,
        lessonId,
        completed: completed ?? false,
        watchedSecs: watchedSecs ?? 0,
      },
    })

    return NextResponse.json({ success: true, progress })
  } catch (error) {
    console.error('Progress update error:', error)
    return NextResponse.json({ error: 'Error al actualizar progreso' }, { status: 500 })
  }
}

// GET - Get all progress for current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const progress = await prisma.lessonProgress.findMany({
      where: { userId },
      include: {
        lesson: {
          select: { id: true, title: true, moduleId: true },
        },
      },
    })

    return NextResponse.json(progress)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener progreso' }, { status: 500 })
  }
}
