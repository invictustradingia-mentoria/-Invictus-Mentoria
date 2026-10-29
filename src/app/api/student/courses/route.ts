import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import { visibleLevels } from '@/lib/access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const role: string = session.user.role ?? 'CLUB'
    const levels = visibleLevels(role)

    const modules = await prismaDash.module.findMany({
      where: { isPublished: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: {
        lessons: {
          where: { isPublished: true, ...(levels ? { allowedRole: { in: levels } } : {}) },
          orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
          select: { id: true, title: true, description: true, videoUrl: true, duration: true, order: true, allowedRole: true },
        },
      },
    })

    const visible = modules
      .filter((m) => m.lessons.length > 0)
      .map((m) => ({ id: m.id, title: m.title, description: m.description, lessons: m.lessons }))

    const ids = visible.flatMap((m) => m.lessons.map((l) => l.id))
    const rows = ids.length
      ? await prismaDash.lessonProgress.findMany({ where: { userId, lessonId: { in: ids } } })
      : []

    const progress: Record<string, { completed: boolean }> = {}
    rows.forEach((r) => { progress[r.lessonId] = { completed: r.completed } })

    return NextResponse.json({ role, modules: visible, progress })
  } catch (err: any) {
    console.error('GET student/courses:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}