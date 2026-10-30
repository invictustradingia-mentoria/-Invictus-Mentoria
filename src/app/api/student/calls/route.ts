import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getActor } from '@/lib/chat-utils'
import { visibleLevels } from '@/lib/access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const UNLOCK_MIN = 30 // el enlace se habilita 30 min antes
const GRACE_MIN = 60 // y sigue visible 60 min después de terminar

// Llamadas visibles según el nivel del alumno. El enlace de Zoom solo se entrega cuando corresponde.
export async function GET() {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const levels = visibleLevels(me.role)
    const isAdmin = me.role === 'ADMIN'
    const where: any = { isPublished: true }
    if (levels) where.allowedRole = { in: levels }

    const now = Date.now()
    const since = new Date(now - 24 * 3600 * 1000)

    const [upcomingRaw, pastRaw] = await Promise.all([
      prismaDash.zoomCall.findMany({ where: { ...where, startsAt: { gte: since } }, orderBy: { startsAt: 'asc' }, take: 50 }),
      prismaDash.zoomCall.findMany({ where: { ...where, startsAt: { lt: new Date(now) } }, orderBy: { startsAt: 'desc' }, take: 40 }),
    ])

    const shape = (c: any) => {
      const start = c.startsAt.getTime()
      const end = start + c.durationMin * 60000
      const unlockAt = start - UNLOCK_MIN * 60000
      const finished = now > end
      const status = finished ? 'PAST' : now >= start ? 'LIVE' : now >= unlockAt ? 'SOON' : 'UPCOMING'
      const linkOpen = isAdmin || (now >= unlockAt && now <= end + GRACE_MIN * 60000)
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        startsAt: c.startsAt,
        durationMin: c.durationMin,
        allowedRole: c.allowedRole,
        status,
        unlockAt: new Date(unlockAt),
        joinUrl: linkOpen ? c.joinUrl : null,
        meetingId: linkOpen ? c.meetingId : null,
        passcode: linkOpen ? c.passcode : null,
        recordingUrl: finished ? c.recordingUrl : null,
      }
    }

    const upcoming = upcomingRaw.map(shape).filter((c: any) => c.status !== 'PAST')
    const past = pastRaw.map(shape).filter((c: any) => c.status === 'PAST')

    return NextResponse.json({ upcoming, past, now: new Date(now) }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}