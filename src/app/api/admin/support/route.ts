import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getAdmin } from '@/lib/chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Lista de conversaciones de soporte (las más recientes primero).
export async function GET() {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const rows = await prismaDash.supportThread.findMany({
      orderBy: { lastMessageAt: 'desc' },
      take: 100,
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    })
    const threads = rows.map((t: any) => ({
      id: t.id,
      name: t.name,
      email: t.email,
      status: t.status,
      unreadAdmin: t.unreadAdmin,
      lastMessageAt: t.lastMessageAt,
      createdAt: t.createdAt,
      last: t.messages[0] ? { from: t.messages[0].from, content: t.messages[0].content } : null,
    }))
    const unreadTotal = threads.filter((t: any) => t.status === 'OPEN').reduce((n: number, t: any) => n + (t.unreadAdmin > 0 ? 1 : 0), 0)
    return NextResponse.json({ threads, unreadTotal }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}