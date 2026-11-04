import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getActor } from '@/lib/chat-utils'
import { cleanPostText, MAX_COMMENT_LEN } from '@/lib/community-shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

// Listar comentarios de un post (orden cronológico).
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })

    const comments = await prismaDash.postComment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: 'asc' },
      take: 200,
    })
    return NextResponse.json({ comments, meId: me.id }, { headers: NO_STORE })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}

// Comentar un post.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const content = cleanPostText(body?.content, MAX_COMMENT_LEN)
    if (!content) return NextResponse.json({ error: 'Escribe un comentario.' }, { status: 400 })

    const post = await prismaDash.post.findUnique({ where: { id: params.id }, select: { id: true } })
    if (!post) return NextResponse.json({ error: 'La publicación no existe.' }, { status: 404 })

    const comment = await prismaDash.postComment.create({
      data: { postId: params.id, authorId: me.id, authorName: me.name, authorRole: me.role, content },
    })
    return NextResponse.json({ comment })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

// Eliminar un comentario propio. Se pasa el id del comentario como ?commentId=...
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const commentId = new URL(req.url).searchParams.get('commentId')
    if (!commentId) return NextResponse.json({ error: 'Falta el comentario.' }, { status: 400 })

    const comment = await prismaDash.postComment.findUnique({ where: { id: commentId }, select: { authorId: true, postId: true } })
    if (!comment || comment.postId !== params.id) return NextResponse.json({ error: 'El comentario no existe.' }, { status: 404 })
    if (comment.authorId !== me.id) return NextResponse.json({ error: 'No puedes eliminar este comentario.' }, { status: 403 })

    await prismaDash.postComment.delete({ where: { id: commentId } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
