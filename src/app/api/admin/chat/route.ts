import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { avatarIds } from '@/lib/chat-avatars'
import { getStaff, cleanText, MAX_LEN } from '@/lib/chat-utils'
import { resolveMentionsForTexts, notifyMentions } from '@/lib/mentions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }
const MAX_PINNED = 3
const REPLY_SELECT = { id: true, userName: true, content: true, deletedAt: true }

// Feed completo para moderar (incluye mensajes eliminados) + sanciones vigentes.
export async function GET() {
  try {
    const admin = await getStaff()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })

    const messages = await prismaDash.chatMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 150,
      include: { replyTo: { select: REPLY_SELECT } },
    })
    const now = new Date()
    const sanctions = await prismaDash.chatSanction.findMany({
      where: { OR: [{ until: null }, { until: { gt: now } }] },
      orderBy: { createdAt: 'desc' },
    })

    const ids = Array.from(new Set([...messages.map((m: any) => m.userId), ...sanctions.map((s: any) => s.userId)]))
    const users = ids.length
      ? await prismaDash.user.findMany({ where: { id: { in: ids } }, select: { id: true, email: true, name: true, role: true } })
      : []
    const byId = new Map<string, any>(users.map((u: any) => [u.id, u]))
    const sanctionByUser = new Map<string, any>(sanctions.map((s: any) => [s.userId, s]))

    const avatars = await avatarIds(ids)
    const mentions = await resolveMentionsForTexts(messages.map((m: any) => m.content))

    return NextResponse.json(
      {
        avatars,
        mentions,
        messages: messages.reverse().map((m: any) => ({
          ...m,
          userEmail: byId.get(m.userId)?.email || null,
          sanction: sanctionByUser.get(m.userId)?.kind || null,
        })),
        sanctions: sanctions.map((s: any) => ({
          id: s.id,
          userId: s.userId,
          kind: s.kind,
          reason: s.reason,
          until: s.until,
          createdAt: s.createdAt,
          userName: byId.get(s.userId)?.name || null,
          userEmail: byId.get(s.userId)?.email || null,
        })),
      },
      { headers: NO_STORE }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}

// Publicar un mensaje del equipo (opcionalmente fijado, opcionalmente respondiendo a otro).
export async function POST(req: Request) {
  try {
    const admin = await getStaff()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const content = cleanText(body?.content)
    if (!content) return NextResponse.json({ error: 'Escribe un mensaje.' }, { status: 400 })
    if (content.length > MAX_LEN * 2) return NextResponse.json({ error: 'El mensaje es demasiado largo.' }, { status: 400 })

    const pinned = body?.pinned === true
    if (pinned && (await prismaDash.chatMessage.count({ where: { pinned: true, deletedAt: null } })) >= MAX_PINNED) {
      return NextResponse.json({ error: `Ya hay ${MAX_PINNED} mensajes fijos. Quita uno para fijar otro.` }, { status: 400 })
    }

    let replyToId: string | null = null
    if (typeof body?.replyToId === 'string' && body.replyToId) {
      const target = await prismaDash.chatMessage.findUnique({ where: { id: body.replyToId }, select: { id: true } })
      if (target) replyToId = target.id
    }

    const message = await prismaDash.chatMessage.create({
      data: { userId: admin.id, userName: admin.name, userRole: admin.role, content, pinned, replyToId },
      include: { replyTo: { select: REPLY_SELECT } },
    })

    const mentionedUsers = await notifyMentions({
      text: content,
      actorId: admin.id,
      actorName: admin.name,
      actorRole: admin.role,
      chatMessageId: message.id,
    })

    return NextResponse.json({ message, mentions: mentionedUsers })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

// Acciones sobre un mensaje: delete | restore | pin | unpin
export async function PATCH(req: Request) {
  try {
    const admin = await getStaff()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { id, action } = await req.json().catch(() => ({}))
    if (!id || typeof id !== 'string') return NextResponse.json({ error: 'Falta el mensaje.' }, { status: 400 })

    const msg = await prismaDash.chatMessage.findUnique({ where: { id }, select: { id: true } })
    if (!msg) return NextResponse.json({ error: 'El mensaje no existe.' }, { status: 404 })

    if (action === 'delete') {
      await prismaDash.chatMessage.update({ where: { id }, data: { deletedAt: new Date(), deletedBy: admin.id, pinned: false } })
    } else if (action === 'restore') {
      await prismaDash.chatMessage.update({ where: { id }, data: { deletedAt: null, deletedBy: null } })
    } else if (action === 'pin') {
      const already = await prismaDash.chatMessage.count({ where: { pinned: true, deletedAt: null, NOT: { id } } })
      if (already >= MAX_PINNED) {
        return NextResponse.json({ error: `Ya hay ${MAX_PINNED} mensajes fijos. Quita uno para fijar otro.` }, { status: 400 })
      }
      await prismaDash.chatMessage.update({ where: { id }, data: { pinned: true, deletedAt: null, deletedBy: null } })
    } else if (action === 'unpin') {
      await prismaDash.chatMessage.update({ where: { id }, data: { pinned: false } })
    } else {
      return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
