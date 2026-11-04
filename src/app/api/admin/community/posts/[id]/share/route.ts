import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getStaff } from '@/lib/chat-utils'
import { cleanPostText, shapePost, containsUrl, MAX_POST_LEN, NO_LINKS_MESSAGE } from '@/lib/community-shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AUTHOR_SELECT = { select: { id: true, name: true, role: true } } as const
const INCLUDE = {
  author: AUTHOR_SELECT,
  reactions: { select: { type: true, userId: true } },
  _count: { select: { comments: true, shares: true } },
  sharedFrom: { include: { author: AUTHOR_SELECT } },
} as const

// Compartir un post desde el panel del equipo (misma lógica que el lado alumno).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getStaff()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const content = cleanPostText(body?.content, MAX_POST_LEN)
    if (content && containsUrl(content)) return NextResponse.json({ error: NO_LINKS_MESSAGE }, { status: 400 })

    const original = await prismaDash.post.findUnique({ where: { id: params.id }, select: { id: true, sharedFromId: true } })
    if (!original) return NextResponse.json({ error: 'La publicación no existe.' }, { status: 404 })

    const targetId = original.sharedFromId || original.id

    const post = await prismaDash.post.create({
      data: { authorId: admin.id, content, sharedFromId: targetId },
      include: INCLUDE,
    })
    return NextResponse.json({ post: shapePost(post, admin.id) })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
