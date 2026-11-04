import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { avatarIds } from '@/lib/chat-avatars'
import { getActor } from '@/lib/chat-utils'
import { shapePost } from '@/lib/community-shared'
import { resolveMentionsForTexts } from '@/lib/mentions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }
const AUTHOR_SELECT = { select: { id: true, name: true, role: true } } as const
const INCLUDE = {
  author: AUTHOR_SELECT,
  reactions: { select: { type: true, userId: true } },
  _count: { select: { comments: true, shares: true } },
  sharedFrom: { include: { author: AUTHOR_SELECT } },
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

    const ids = Array.from(
      new Set([params.id, ...posts.flatMap((p: any) => (p.sharedFrom ? [p.sharedFrom.authorId] : []))])
    )
    const avatars = await avatarIds(ids)
    const mentions = await resolveMentionsForTexts(
      posts.flatMap((p: any) => [p.content, ...(p.sharedFrom ? [p.sharedFrom.content] : [])])
    )

    return NextResponse.json({ posts: posts.map((p: any) => ({ ...shapePost(p, me.id), mentions })), avatars }, { headers: NO_STORE })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}
