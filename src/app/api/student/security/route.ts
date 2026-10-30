import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import { SIGNALS, LOCK_THRESHOLD, WINDOW_MS, signalLabel } from '@/lib/video-security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

// ¿Sigo bloqueado? (el reproductor lo consulta cada pocos segundos mientras está bloqueado)
export async function GET() {
  try {
    const s: any = await getServerSession(authOptions)
    if (!s?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })
    const lock = await prismaDash.videoLock.findUnique({ where: { userId: s.user.id } }).catch(() => null)
    return NextResponse.json({ locked: !!lock?.locked, reason: lock?.locked ? lock.reason : null }, { headers: NO_STORE })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}

// El reproductor informa una señal sospechosa. El servidor decide si corresponde bloquear.
export async function POST(req: Request) {
  try {
    const s: any = await getServerSession(authOptions)
    if (!s?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    if (s.user.role === 'ADMIN') return NextResponse.json({ locked: false })

    const body = await req.json().catch(() => ({}))
    const signal = typeof body.signal === 'string' ? body.signal : ''
    const def = SIGNALS[signal]
    if (!def) return NextResponse.json({ error: 'Señal no válida' }, { status: 400 })

    const userId: string = s.user.id
    const lessonId = typeof body.lessonId === 'string' ? body.lessonId.slice(0, 60) : null

    const existing = await prismaDash.videoLock.findUnique({ where: { userId } })
    if (existing?.locked) return NextResponse.json({ locked: true, reason: existing.reason })

    // Evita registrar la misma señal repetida en pocos segundos
    const recentSame = await prismaDash.videoIncident.findFirst({
      where: { userId, signal, createdAt: { gt: new Date(Date.now() - 3000) } },
      select: { id: true },
    })
    if (recentSame) return NextResponse.json({ locked: false })

    let lessonTitle: string | null = null
    if (lessonId) {
      const l = await prismaDash.lesson.findUnique({ where: { id: lessonId }, select: { title: true } }).catch(() => null)
      lessonTitle = l?.title || null
    }

    const fwd = req.headers.get('x-forwarded-for')
    const ip = fwd ? fwd.split(',')[0].trim() : req.headers.get('x-real-ip') || null

    await prismaDash.videoIncident.create({
      data: {
        userId,
        userName: s.user.name || null,
        userEmail: s.user.email || null,
        lessonId,
        lessonTitle,
        signal,
        score: def.score,
        ip,
        userAgent: (req.headers.get('user-agent') || '').slice(0, 300) || null,
      },
    })

    // Suma de puntos desde el último desbloqueo (o los últimos 10 minutos)
    const since = new Date(Math.max(Date.now() - WINDOW_MS, existing?.unlockedAt ? existing.unlockedAt.getTime() : 0))
    const agg = await prismaDash.videoIncident.aggregate({
      where: { userId, createdAt: { gt: since } },
      _sum: { score: true },
    })
    const total = agg._sum.score || 0

    if (total >= LOCK_THRESHOLD) {
      const reason = signalLabel(signal)
      await prismaDash.videoLock.upsert({
        where: { userId },
        create: { userId, userName: s.user.name || null, userEmail: s.user.email || null, locked: true, reason, lessonId, lessonTitle },
        update: { userName: s.user.name || null, userEmail: s.user.email || null, locked: true, reason, lessonId, lessonTitle, lockedAt: new Date() },
      })
      return NextResponse.json({ locked: true, reason })
    }
    return NextResponse.json({ locked: false })
  } catch (err: any) {
    console.error('POST student/security:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}