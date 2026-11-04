import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getActor } from '@/lib/chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

// Listar mis notificaciones (más recientes primero) + cuántas no leí.
export async function GET() {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })

    const [items, unreadCount] = await Promise.all([
      prismaDash.notification.findMany({ where: { userId: me.id }, orderBy: { createdAt: 'desc' }, take: 40 }),
      prismaDash.notification.count({ where: { userId: me.id, read: false } }),
    ])

    return NextResponse.json({ notifications: items, unreadCount }, { headers: NO_STORE })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}

// Marcar como leídas: { all: true } marca todas, { id } marca solo una.
export async function PATCH(req: Request) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    if (body?.all) {
      await prismaDash.notification.updateMany({ where: { userId: me.id, read: false }, data: { read: true } })
      return NextResponse.json({ success: true })
    }
    if (typeof body?.id === 'string') {
      const n = await prismaDash.notification.findUnique({ where: { id: body.id }, select: { userId: true } })
      if (!n || n.userId !== me.id) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
      await prismaDash.notification.update({ where: { id: body.id }, data: { read: true } })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ error: 'Falta indicar qué marcar como leído.' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
