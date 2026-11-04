import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { avatarIds } from '@/lib/chat-avatars'
import { isStaff as isStaffRole } from '@/lib/access'
import { getActor, activeSanction, cleanText, MAX_LEN, LINK_RE } from '@/lib/chat-utils'
import { resolveMentionsForTexts, notifyMentions } from '@/lib/mentions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }
const REPLY_SELECT = { id: true, userName: true, content: true, deletedAt: true }
const SELECT = {
  id: true,
  userId: true,
  userName: true,
  userRole: true,
  content: true,
  pinned: true,
  createdAt: true,
  replyToId: true,
  replyTo: { select: REPLY_SELECT },
}

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
    const mentions = await resolveMentionsForTexts([...rows.map((r: any) => r.content), ...pinned.map((r: any) => r.content)])

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
        mentions,
      },
      { headers: NO_STORE }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}

// Enviar un mensaje. Opcionalmente puede responder a otro (replyToId).
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

    const isStaff = isStaffRole(me.role)
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

    let replyToId: string | null = null
    if (typeof body?.replyToId === 'string' && body.replyToId) {
      const target = await prismaDash.chatMessage.findUnique({ where: { id: body.replyToId }, select: { id: true } })
      if (target) replyToId = target.id
    }

    const message = await prismaDash.chatMessage.create({
      data: { userId: me.id, userName: me.name, userRole: me.role, content, replyToId },
      select: SELECT,
    })

    const mentionedUsers = await notifyMentions({
      text: content,
      actorId: me.id,
      actorName: me.name,
      actorRole: me.role,
      chatMessageId: message.id,
    })

    return NextResponse.json({ message, mentions: mentionedUsers })
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
    if (msg.userId !== me.id && !isStaffRole(me.role)) {
      return NextResponse.json({ error: 'No puedes eliminar este mensaje.' }, { status: 403 })
    }

    await prismaDash.chatMessage.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: me.id, pinned: false } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
