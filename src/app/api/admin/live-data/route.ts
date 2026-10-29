import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import { parseUA } from '@/lib/useragent'
import { lookupGeo } from '@/lib/geo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const s: any = await getServerSession(authOptions)
    if (!s?.user || s.user.role !== 'ADMIN') return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const now = Date.now()
    const onlineSince = new Date(now - 3 * 60 * 1000)
    const daySince = new Date(now - 24 * 3600 * 1000)

    const sessions = await prismaDash.session.findMany({
      where: { lastSeen: { gte: daySince }, token: { startsWith: 'web-' } },
      orderBy: { lastSeen: 'desc' },
      take: 300,
      include: { user: { select: { id: true, name: true, email: true, role: true, avatarUrl: true } } },
    })

    const ips = Array.from(new Set(sessions.map((x) => x.ip).filter(Boolean) as string[])).slice(0, 60)
    const geoMap = new Map<string, Awaited<ReturnType<typeof lookupGeo>>>()
    await Promise.all(ips.map(async (ip) => geoMap.set(ip, await lookupGeo(ip))))

    const lessonIds = Array.from(new Set(sessions.map((x) => x.currentLesson).filter(Boolean) as string[]))
    const events = await prismaDash.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { name: true, email: true, role: true } }, lesson: { select: { title: true } } },
    })
    const lessons = lessonIds.length
      ? await prismaDash.lesson.findMany({ where: { id: { in: lessonIds } }, select: { id: true, title: true } })
      : []
    const lessonTitle = new Map(lessons.map((l) => [l.id, l.title]))

    const rows = sessions.map((x) => {
      const ua = parseUA(x.userAgent)
      const g = x.ip ? geoMap.get(x.ip) ?? null : null
      return {
        id: x.id,
        online: x.lastSeen >= onlineSince,
        lastSeen: x.lastSeen,
        page: x.currentPage,
        lesson: x.currentLesson ? lessonTitle.get(x.currentLesson) ?? null : null,
        ip: x.ip,
        ...ua,
        country: g?.country ?? null,
        countryCode: g?.countryCode ?? null,
        city: g?.city ?? null,
        lat: g?.lat ?? null,
        lon: g?.lon ?? null,
        user: x.user,
      }
    })

    const count = (arr: (string | null)[]) => {
      const m = new Map<string, number>()
      arr.forEach((k) => { const key = k || 'Desconocido'; m.set(key, (m.get(key) || 0) + 1) })
      return Array.from(m, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
    }

    const security = await prismaDash.securityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 40 })
    const uniqueUsers24 = new Set(sessions.map((x) => x.userId)).size
    const onlineUsers = new Set(rows.filter((r) => r.online).map((r) => r.user.id)).size

    return NextResponse.json({
      stats: { onlineUsers, uniqueUsers24, events: events.length, alerts: security.length },
      sessions: rows,
      browsers: count(rows.map((r) => r.browser)),
      systems: count(rows.map((r) => r.os)),
      devices: count(rows.map((r) => r.device)),
      countries: count(rows.map((r) => r.country)),
      events: events.map((e) => ({
        id: e.id, action: e.action, page: e.page, createdAt: e.createdAt, ip: e.ip,
        user: e.user, lesson: e.lesson?.title ?? null,
      })),
      security: security.map((x) => ({ id: x.id, action: x.action, email: x.email, details: x.details, ip: x.ipAddress, createdAt: x.createdAt })),
    })
  } catch (err: any) {
    console.error('live-data:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}