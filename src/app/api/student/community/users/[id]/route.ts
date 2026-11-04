import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getActor } from '@/lib/chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

// Perfil público de un miembro de la comunidad (propio o ajeno): datos + contadores + si lo sigo.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })

    const user = await prismaDash.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, role: true, avatarUrl: true, coverUrl: true, createdAt: true },
    })
    if (!user) return NextResponse.json({ error: 'El usuario no existe.' }, { status: 404, headers: NO_STORE })

    const [followersCount, followingCount, postsCount, iFollow] = await Promise.all([
      prismaDash.follow.count({ where: { followingId: user.id } }),
      prismaDash.follow.count({ where: { followerId: user.id } }),
      prismaDash.post.count({ where: { authorId: user.id } }),
      user.id === me.id
        ? Promise.resolve(null)
        : prismaDash.follow.findUnique({ where: { followerId_followingId: { followerId: me.id, followingId: user.id } } }),
    ])

    return NextResponse.json(
      {
        user,
        isMe: user.id === me.id,
        followersCount,
        followingCount,
        postsCount,
        isFollowing: user.id === me.id ? null : !!iFollow,
      },
      { headers: NO_STORE }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}
