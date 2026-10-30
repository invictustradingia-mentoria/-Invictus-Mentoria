import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getAdmin } from '@/lib/chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Silenciar (MUTE, con duración en minutos) o bloquear (BAN) a un alumno del chat.
export async function POST(req: Request) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const userId = typeof body.userId === 'string' ? body.userId : ''
    const kind = body.kind === 'BAN' ? 'BAN' : body.kind === 'MUTE' ? 'MUTE' : ''
    const reason = typeof body.reason === 'string' ? body.reason.trim().slice(0, 200) || null : null
    const purge = body.purge === true
    if (!userId || !kind) return NextResponse.json({ error: 'Faltan datos.' }, { status: 400 })

    if (userId === admin.id) return NextResponse.json({ error: 'No puedes sancionarte a ti mismo.' }, { status: 400 })

    const target = await prismaDash.user.findUnique({ where: { id: userId }, select: { id: true, role: true } })
    if (!target) return NextResponse.json({ error: 'El usuario no existe.' }, { status: 404 })
    if (target.role === 'ADMIN') return NextResponse.json({ error: 'No puedes sancionar a otro administrador.' }, { status: 400 })

    let until: Date | null = null
    if (kind === 'MUTE') {
      const minutes = Math.min(Math.max(parseInt(body.minutes, 10) || 60, 1), 60 * 24 * 30)
      until = new Date(Date.now() + minutes * 60000)
    }

    await prismaDash.chatSanction.upsert({
      where: { userId },
      update: { kind, reason, until, createdBy: admin.id, createdAt: new Date() },
      create: { userId, kind, reason, until, createdBy: admin.id },
    })

    if (purge) {
      await prismaDash.chatMessage.updateMany({
        where: { userId, deletedAt: null },
        data: { deletedAt: new Date(), deletedBy: admin.id, pinned: false },
      })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

// Quitar la sanción de un alumno.
export async function DELETE(req: Request) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const userId = new URL(req.url).searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'Falta el usuario.' }, { status: 400 })
    await prismaDash.chatSanction.deleteMany({ where: { userId } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}