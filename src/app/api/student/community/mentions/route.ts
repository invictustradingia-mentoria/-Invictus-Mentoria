import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getActor } from '@/lib/chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

// Autocompletar @usuario: busca por nombre de usuario o nombre, solo entre cuentas aprobadas.
export async function GET(req: Request) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })

    const q = new URL(req.url).searchParams.get('q')?.trim() || ''
    if (q.length < 1) return NextResponse.json({ users: [] }, { headers: NO_STORE })

    const users = await prismaDash.user.findMany({
      where: {
        status: 'APPROVED',
        username: { not: null },
        OR: [{ username: { contains: q, mode: 'insensitive' } }, { name: { contains: q, mode: 'insensitive' } }],
      },
      select: { id: true, name: true, username: true, role: true, avatarUrl: true },
      orderBy: { name: 'asc' },
      take: 8,
    })

    return NextResponse.json(
      { users: users.map((u: any) => ({ id: u.id, name: u.name || 'Usuario', username: u.username, role: u.role, avatarUrl: u.avatarUrl })) },
      { headers: NO_STORE }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}
