import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getActor } from '@/lib/chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

// Lista de seguidores de un usuario (quiénes lo siguen a él).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })

    const rows = await prismaDash.follow.findMany({
      where: { followingId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 300,
      include: { follower: { select: { id: true, name: true, role: true, avatarUrl: true } } },
    })
    const users = rows.map((r: any) => r.follower)

    const ids = users.map((u: any) => u.id)
    const myFollowing = ids.length
      ? await prismaDash.follow.findMany({ where: { followerId: me.id, followingId: { in: ids } }, select: { followingId: true } })
      : []
    const followingSet = new Set(myFollowing.map((f: any) => f.followingId))

    return NextResponse.json(
      {
        users: users.map((u: any) => ({
          id: u.id,
          name: u.name || 'Usuario',
          role: u.role,
          avatarUrl: u.avatarUrl,
          isFollowing: u.id === me.id ? null : followingSet.has(u.id),
        })),
      },
      { headers: NO_STORE }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}
