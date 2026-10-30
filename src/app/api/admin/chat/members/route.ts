import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getAdmin } from '@/lib/chat-utils'
import { avatarIds } from '@/lib/chat-avatars'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Buscar alumnos por nombre o correo para silenciarlos o bloquearlos del chat.
export async function GET(req: Request) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const q = (new URL(req.url).searchParams.get('q') || '').trim().slice(0, 60)
    if (q.length < 2) return NextResponse.json({ members: [], avatars: [] })

    const users = await prismaDash.user.findMany({
      where: {
        status: 'APPROVED',
        role: { not: 'ADMIN' },
        OR: [{ name: { contains: q, mode: 'insensitive' } }, { email: { contains: q, mode: 'insensitive' } }],
      },
      select: { id: true, name: true, email: true, role: true },
      orderBy: { name: 'asc' },
      take: 15,
    })
    const ids = users.map((u: any) => u.id)
    const sanctions = ids.length
      ? await prismaDash.chatSanction.findMany({
          where: { userId: { in: ids }, OR: [{ until: null }, { until: { gt: new Date() } }] },
        })
      : []
    const kindBy = new Map<string, string>(sanctions.map((s: any) => [s.userId, s.kind]))
    const avatars = await avatarIds(ids)

    return NextResponse.json(
      { members: users.map((u: any) => ({ ...u, sanction: kindBy.get(u.id) || null })), avatars },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}