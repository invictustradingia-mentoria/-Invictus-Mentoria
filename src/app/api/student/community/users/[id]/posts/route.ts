import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { avatarIds } from '@/lib/chat-avatars'
import { getActor } from '@/lib/chat-utils'
import { shapePost } from '@/lib/community-shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }
const INCLUDE = {
  author: { select: { id: true, name: true, role: true } },
  reactions: { select: { type: true, userId: true } },
  _count: { select: { comments: true } },
} as const

// Publicaciones hechas por un usuario puntual (para su página de perfil).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })

    const posts = await prismaDash.post.findMany({
      where: { authorId: params.id },
      orderBy: { createdAt: 'desc' },
      take: 60,
      include: INCLUDE,
    })

    const avatars = await avatarIds([params.id])

    return NextResponse.json({ posts: posts.map((p: any) => shapePost(p, me.id)), avatars }, { headers: NO_STORE })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}
