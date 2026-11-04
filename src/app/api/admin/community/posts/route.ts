import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { avatarIds } from '@/lib/chat-avatars'
import { getStaff } from '@/lib/chat-utils'
import { cleanPostText, shapePost, MAX_POST_LEN, MAX_IMAGE_CHARS, IMAGE_DATA_URL_RE } from '@/lib/community-shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }
const INCLUDE = {
  author: { select: { id: true, name: true, role: true } },
  reactions: { select: { type: true, userId: true } },
  _count: { select: { comments: true } },
} as const

// Feed de la comunidad visto por el equipo (mismo feed, con permisos de moderación).
export async function GET() {
  try {
    const admin = await getStaff()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })

    const posts = await prismaDash.post.findMany({ orderBy: { createdAt: 'desc' }, take: 60, include: INCLUDE })

    const ids = Array.from(new Set(posts.map((p: any) => p.authorId)))
    const avatars = await avatarIds(ids)

    return NextResponse.json({ posts: posts.map((p: any) => shapePost(p, admin.id)), avatars }, { headers: NO_STORE })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}

// El equipo también puede publicar en el feed (aparece con su badge de rol).
export async function POST(req: Request) {
  try {
    const admin = await getStaff()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const content = cleanPostText(body?.content, MAX_POST_LEN)
    if (!content) return NextResponse.json({ error: 'Escribe algo para publicar.' }, { status: 400 })

    let imageUrl: string | null = null
    if (typeof body?.imageUrl === 'string' && body.imageUrl) {
      if (!IMAGE_DATA_URL_RE.test(body.imageUrl) || body.imageUrl.length > MAX_IMAGE_CHARS) {
        return NextResponse.json({ error: 'La imagen no es válida o es demasiado pesada.' }, { status: 400 })
      }
      imageUrl = body.imageUrl
    }

    const post = await prismaDash.post.create({ data: { authorId: admin.id, content, imageUrl }, include: INCLUDE })
    return NextResponse.json({ post: shapePost(post, admin.id) })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
