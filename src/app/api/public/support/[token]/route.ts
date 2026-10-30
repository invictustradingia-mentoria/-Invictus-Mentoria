import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { cleanText } from '@/lib/chat-utils'
import { TOKEN_RE } from '@/lib/support-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

// El visitante consulta su conversación (el token secreto es su "llave").
export async function GET(_req: Request, { params }: { params: { token: string } }) {
  try {
    if (!TOKEN_RE.test(params.token)) return NextResponse.json({ error: 'No encontrada' }, { status: 404, headers: NO_STORE })
    const thread = await prismaDash.supportThread.findUnique({
      where: { token: params.token },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 200 } },
    })
    if (!thread) return NextResponse.json({ error: 'No encontrada' }, { status: 404, headers: NO_STORE })
    return NextResponse.json(
      {
        thread: { status: thread.status, name: thread.name },
        messages: thread.messages.map((m: any) => ({ id: m.id, from: m.from, content: m.content, createdAt: m.createdAt })),
      },
      { headers: NO_STORE }
    )
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}

// El visitante envía otro mensaje.
export async function POST(req: Request, { params }: { params: { token: string } }) {
  try {
    if (!TOKEN_RE.test(params.token)) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    const thread = await prismaDash.supportThread.findUnique({ where: { token: params.token } })
    if (!thread) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    if (thread.status === 'CLOSED') return NextResponse.json({ error: 'Esta conversación fue cerrada.' }, { status: 409 })

    const body = await req.json().catch(() => ({}))
    const content = cleanText(body?.message)
    if (!content) return NextResponse.json({ error: 'Escribe un mensaje.' }, { status: 400 })
    if (content.length > 1000) return NextResponse.json({ error: 'El mensaje es demasiado largo.' }, { status: 400 })

    const lastStaff = await prismaDash.supportMessage.findFirst({
      where: { threadId: thread.id, from: 'STAFF' },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    })
    const pending = await prismaDash.supportMessage.findMany({
      where: { threadId: thread.id, from: 'VISITOR', ...(lastStaff ? { createdAt: { gt: lastStaff.createdAt } } : {}) },
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: { createdAt: true },
    })
    if (pending.length && Date.now() - pending[0].createdAt.getTime() < 2000) {
      return NextResponse.json({ error: 'Vas muy rápido. Espera un momento.' }, { status: 429 })
    }
    if (pending.length >= 8) {
      return NextResponse.json({ error: 'Ya enviaste varios mensajes. Espera la respuesta del equipo.' }, { status: 429 })
    }

    const message = await prismaDash.supportMessage.create({ data: { threadId: thread.id, from: 'VISITOR', content } })
    await prismaDash.supportThread.update({
      where: { id: thread.id },
      data: { unreadAdmin: { increment: 1 }, lastMessageAt: new Date() },
    })
    return NextResponse.json({ message: { id: message.id, from: message.from, content: message.content, createdAt: message.createdAt } })
  } catch {
    return NextResponse.json({ error: 'No se pudo enviar.' }, { status: 500 })
  }
}