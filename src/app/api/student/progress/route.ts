import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import { visibleLevels } from '@/lib/access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const lessonId = typeof body.lessonId === 'string' ? body.lessonId : ''
    const completed = body.completed === true
    if (!lessonId) return NextResponse.json({ error: 'Falta la lección' }, { status: 400 })

    const lesson = await prismaDash.lesson.findUnique({ where: { id: lessonId }, include: { module: true } })
    if (!lesson || !lesson.isPublished || !lesson.module.isPublished) {
      return NextResponse.json({ error: 'La lección no existe' }, { status: 404 })
    }

    const levels = visibleLevels(session.user.role)
    if (levels && !levels.includes(lesson.allowedRole)) {
      return NextResponse.json({ error: 'No tienes acceso a esta lección' }, { status: 403 })
    }

    await prismaDash.lessonProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      update: { completed },
      create: { userId, lessonId, completed },
    })
    if (completed) {
      await prismaDash.activityLog.create({
        data: { userId, lessonId, action: 'LESSON_COMPLETE', page: '/dashboard/clases' },
      })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('POST student/progress:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}