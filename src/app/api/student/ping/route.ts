import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions)
    const userId = session?.user?.id
    if (!userId) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const sid = typeof body.sid === 'string' ? body.sid.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 64) : ''
    if (!sid) return NextResponse.json({ error: 'Falta sid' }, { status: 400 })

    const page = typeof body.page === 'string' ? body.page.slice(0, 200) : null
    let lessonId: string | null = typeof body.lessonId === 'string' && body.lessonId ? body.lessonId : null
    const event = typeof body.event === 'string' ? body.event : null

    if (lessonId) {
      const l = await prismaDash.lesson.findUnique({ where: { id: lessonId }, select: { id: true } })
      if (!l) lessonId = null
    }

    const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    const userAgent = req.headers.get('user-agent')
    const token = `web-${userId.slice(-6)}-${sid}`
    const now = new Date()

    await prismaDash.session.upsert({
      where: { token },
      update: { currentPage: page, currentLesson: lessonId, isActive: true, lastSeen: now, ip, userAgent },
      create: { userId, token, ip, userAgent, currentPage: page, currentLesson: lessonId, isActive: true, lastSeen: now, expiresAt: new Date(Date.now() + 86400000) },
    })

    if (event === 'PAGE_VIEW' || event === 'LESSON_VIEW') {
      await prismaDash.activityLog.create({
        data: { userId, lessonId, action: event, page, ip, userAgent },
      })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}