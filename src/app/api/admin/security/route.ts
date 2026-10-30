import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import { signalLabel } from '@/lib/video-security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

async function admin(): Promise<{ id: string; name: string } | null> {
  const s: any = await getServerSession(authOptions)
  if (!s?.user?.id || s.user.role !== 'ADMIN') return null
  return { id: s.user.id, name: s.user.name || s.user.email || 'Admin' }
}

// Alumnos bloqueados + últimos incidentes (se muestra en Live Activity).
export async function GET() {
  try {
    if (!(await admin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })

    const [locks, incidents] = await Promise.all([
      prismaDash.videoLock.findMany({ where: { locked: true }, orderBy: { lockedAt: 'desc' }, take: 50 }),
      prismaDash.videoIncident.findMany({ orderBy: { createdAt: 'desc' }, take: 25 }),
    ])

    return NextResponse.json(
      {
        locks: locks.map((l: any) => ({
          userId: l.userId,
          userName: l.userName,
          userEmail: l.userEmail,
          reason: l.reason,
          lessonTitle: l.lessonTitle,
          lockedAt: l.lockedAt,
        })),
        incidents: incidents.map((i: any) => ({
          id: i.id,
          userId: i.userId,
          userName: i.userName,
          userEmail: i.userEmail,
          lessonTitle: i.lessonTitle,
          label: signalLabel(i.signal),
          score: i.score,
          ip: i.ip,
          createdAt: i.createdAt,
        })),
      },
      { headers: NO_STORE }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}

// Solo un administrador puede habilitar (unlock) o bloquear (lock) manualmente a un alumno.
export async function POST(req: Request) {
  try {
    const a = await admin()
    if (!a) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const userId = typeof body.userId === 'string' ? body.userId : ''
    const action = body.action === 'unlock' ? 'unlock' : body.action === 'lock' ? 'lock' : ''
    if (!userId || !action) return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 })

    if (action === 'unlock') {
      await prismaDash.videoLock.updateMany({
        where: { userId },
        data: { locked: false, unlockedAt: new Date(), unlockedBy: a.name },
      })
      return NextResponse.json({ success: true })
    }

    const u = await prismaDash.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, role: true } })
    if (!u) return NextResponse.json({ error: 'El usuario no existe.' }, { status: 404 })
    if (u.role === 'ADMIN') return NextResponse.json({ error: 'No puedes bloquear a un administrador.' }, { status: 400 })
    await prismaDash.videoLock.upsert({
      where: { userId },
      create: { userId, userName: u.name, userEmail: u.email, locked: true, reason: 'Bloqueo manual del administrador' },
      update: { locked: true, reason: 'Bloqueo manual del administrador', lockedAt: new Date() },
    })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}