import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { avatarIds } from '@/lib/chat-avatars'
import { getActor } from '@/lib/chat-utils'
import { cleanPostText, shapePost, containsUrl, MAX_POST_LEN, MAX_IMAGE_CHARS, IMAGE_DATA_URL_RE, NO_LINKS_MESSAGE } from '@/lib/community-shared'

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

// Feed de la comunidad: últimos posts con conteo de reacciones y comentarios.
export async function GET() {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })

    const posts = await prismaDash.post.findMany({ orderBy: { createdAt: 'desc' }, take: 40, include: INCLUDE })

    const ids = Array.from(
      new Set(posts.flatMap((p: any) => [p.authorId, ...(p.sharedFrom ? [p.sharedFrom.authorId] : [])]))
    )
    const avatars = await avatarIds(ids)

    return NextResponse.json({ posts: posts.map((p: any) => shapePost(p, me.id)), avatars }, { headers: NO_STORE })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}

// Publicar un nuevo post en el feed.
export async function POST(req: Request) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const content = cleanPostText(body?.content, MAX_POST_LEN)
    if (!content) return NextResponse.json({ error: 'Escribe algo para publicar.' }, { status: 400 })
    if (containsUrl(content)) return NextResponse.json({ error: NO_LINKS_MESSAGE }, { status: 400 })

    let imageUrl: string | null = null
    if (typeof body?.imageUrl === 'string' && body.imageUrl) {
      if (!IMAGE_DATA_URL_RE.test(body.imageUrl) || body.imageUrl.length > MAX_IMAGE_CHARS) {
        return NextResponse.json({ error: 'La imagen no es válida o es demasiado pesada.' }, { status: 400 })
      }
      imageUrl = body.imageUrl
    }

    const post = await prismaDash.post.create({ data: { authorId: me.id, content, imageUrl }, include: INCLUDE })
    return NextResponse.json({ post: shapePost(post, me.id) })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
