import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getActor } from '@/lib/chat-utils'
import { cleanPostText, shapePost, containsUrl, MAX_POST_LEN, NO_LINKS_MESSAGE } from '@/lib/community-shared'
import { notifyMentions } from '@/lib/mentions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AUTHOR_SELECT = { select: { id: true, name: true, role: true } } as const
const INCLUDE = {
  author: AUTHOR_SELECT,
  reactions: { select: { type: true, userId: true } },
  _count: { select: { comments: true, shares: true } },
  sharedFrom: { include: { author: AUTHOR_SELECT } },
} as const

// Compartir un post: crea una nueva publicación propia que apunta al post original.
// Si el post original ya era un compartido, se comparte el original de verdad (no se anida).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const content = cleanPostText(body?.content, MAX_POST_LEN)
    if (content && containsUrl(content)) return NextResponse.json({ error: NO_LINKS_MESSAGE }, { status: 400 })

    const original = await prismaDash.post.findUnique({ where: { id: params.id }, select: { id: true, sharedFromId: true } })
    if (!original) return NextResponse.json({ error: 'La publicación no existe.' }, { status: 404 })

    const targetId = original.sharedFromId || original.id

    const post = await prismaDash.post.create({
      data: { authorId: me.id, content, sharedFromId: targetId },
      include: INCLUDE,
    })
    const mentions = content ? await notifyMentions({ text: content, actorId: me.id, actorName: me.name, actorRole: me.role, postId: post.id }) : []
    return NextResponse.json({ post: { ...shapePost(post, me.id), mentions } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
