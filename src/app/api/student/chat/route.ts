import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { avatarIds } from '@/lib/chat-avatars'
import { getActor, activeSanction, cleanText, MAX_LEN, LINK_RE } from '@/lib/chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }
const SELECT = { id: true, userId: true, userName: true, userRole: true, content: true, pinned: true, createdAt: true }

// Últimos mensajes visibles + estado del usuario (se consulta cada pocos segundos).
export async function GET() {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })

    const [rows, pinned, sanction] = await Promise.all([
      prismaDash.chatMessage.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 80, select: SELECT }),
      prismaDash.chatMessage.findMany({ where: { deletedAt: null, pinned: true }, orderBy: { createdAt: 'desc' }, take: 3, select: SELECT }),
      activeSanction(me.id),
    ])

    const avatars = await avatarIds([...rows.map((r: any) => r.userId), ...pinned.map((r: any) => r.userId)])

    return NextResponse.json(
      {
        me: {
          id: me.id,
          name: me.name,
          role: me.role,
          sanction: sanction ? { kind: sanction.kind, until: sanction.until, reason: sanction.reason } : null,
        },
        messages: rows.reverse(),
        pinned,
        avatars,
      },
      { headers: NO_STORE }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}

// Enviar un mensaje.
export async function POST(req: Request) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const sanction = await activeSanction(me.id)
    if (sanction) {
      const msg =
        sanction.kind === 'BAN'
          ? 'Fuiste bloqueado del chat por el equipo de moderación.'
          : 'Estás silenciado temporalmente en el chat.'
      return NextResponse.json({ error: msg }, { status: 403 })
    }

    const body = await req.json().catch(() => ({}))
    const content = cleanText(body?.content)
    if (!content) return NextResponse.json({ error: 'Escribe un mensaje.' }, { status: 400 })
    if (content.length > MAX_LEN) {
      return NextResponse.json({ error: `El mensaje supera los ${MAX_LEN} caracteres.` }, { status: 400 })
    }

    const isStaff = me.role === 'ADMIN'
    if (!isStaff && LINK_RE.test(content)) {
      return NextResponse.json({ error: 'Por seguridad, solo el equipo puede compartir enlaces en el chat.' }, { status: 400 })
    }

    if (!isStaff) {
      const last = await prismaDash.chatMessage.findFirst({
        where: { userId: me.id },
        orderBy: { createdAt: 'desc' },
        select: { content: true, createdAt: true },
      })
      if (last) {
        const diff = Date.now() - last.createdAt.getTime()
        if (diff < 1500) return NextResponse.json({ error: 'Vas muy rápido. Espera un momento.' }, { status: 429 })
        if (diff < 30000 && last.content === content) {
          return NextResponse.json({ error: 'Ese mensaje ya lo enviaste hace un momento.' }, { status: 429 })
        }
      }
    }

    const message = await prismaDash.chatMessage.create({
      data: { userId: me.id, userName: me.name, userRole: me.role, content },
      select: SELECT,
    })
    return NextResponse.json({ message })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

// Eliminar un mensaje propio (el equipo puede eliminar cualquiera).
export async function DELETE(req: Request) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Falta el mensaje.' }, { status: 400 })

    const msg = await prismaDash.chatMessage.findUnique({ where: { id }, select: { userId: true } })
    if (!msg) return NextResponse.json({ error: 'El mensaje no existe.' }, { status: 404 })
    if (msg.userId !== me.id && me.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No puedes eliminar este mensaje.' }, { status: 403 })
    }

    await prismaDash.chatMessage.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: me.id, pinned: false } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}