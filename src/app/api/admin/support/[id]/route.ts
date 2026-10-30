import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getAdmin, cleanText } from '@/lib/chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Conversación completa; al abrirla se marca como leída.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const thread = await prismaDash.supportThread.findUnique({
      where: { id: params.id },
      include: { messages: { orderBy: { createdAt: 'asc' }, take: 300 } },
    })
    if (!thread) return NextResponse.json({ error: 'No existe' }, { status: 404 })
    if (thread.unreadAdmin > 0) await prismaDash.supportThread.update({ where: { id: thread.id }, data: { unreadAdmin: 0 } })
    return NextResponse.json(
      {
        thread: { id: thread.id, name: thread.name, email: thread.email, status: thread.status, createdAt: thread.createdAt },
        messages: thread.messages.map((m: any) => ({ id: m.id, from: m.from, content: m.content, createdAt: m.createdAt })),
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

// Responder al visitante.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const content = cleanText(body?.content)
    if (!content) return NextResponse.json({ error: 'Escribe una respuesta.' }, { status: 400 })
    if (content.length > 2000) return NextResponse.json({ error: 'La respuesta es demasiado larga.' }, { status: 400 })

    const thread = await prismaDash.supportThread.findUnique({ where: { id: params.id }, select: { id: true } })
    if (!thread) return NextResponse.json({ error: 'No existe' }, { status: 404 })

    const message = await prismaDash.supportMessage.create({ data: { threadId: thread.id, from: 'STAFF', content } })
    await prismaDash.supportThread.update({ where: { id: thread.id }, data: { status: 'OPEN', unreadAdmin: 0, lastMessageAt: new Date() } })
    return NextResponse.json({ message: { id: message.id, from: message.from, content: message.content, createdAt: message.createdAt } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

// Cerrar o reabrir.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const { status } = await req.json().catch(() => ({}))
    if (status !== 'OPEN' && status !== 'CLOSED') return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 })
    await prismaDash.supportThread.update({ where: { id: params.id }, data: { status } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    await prismaDash.supportThread.deleteMany({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}