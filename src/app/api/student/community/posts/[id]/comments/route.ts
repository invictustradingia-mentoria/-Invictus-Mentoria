import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getActor } from '@/lib/chat-utils'
import { cleanPostText, containsUrl, shapeComment, MAX_COMMENT_LEN, NO_LINKS_MESSAGE } from '@/lib/community-shared'
import { resolveMentionsForTexts, notifyMentions } from '@/lib/mentions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }
const COMMENT_INCLUDE = { reactions: { select: { type: true, userId: true } } } as const

// Listar comentarios de un post (orden cronológico), con sus reacciones.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })

    const comments = await prismaDash.postComment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: 'asc' },
      take: 200,
      include: COMMENT_INCLUDE,
    })
    const mentions = await resolveMentionsForTexts(comments.map((c: any) => c.content))
    return NextResponse.json(
      { comments: comments.map((c: any) => ({ ...shapeComment(c, me.id), mentions })), meId: me.id },
      { headers: NO_STORE }
    )
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
    if (containsUrl(content)) return NextResponse.json({ error: NO_LINKS_MESSAGE }, { status: 400 })

    const post = await prismaDash.post.findUnique({ where: { id: params.id }, select: { id: true } })
    if (!post) return NextResponse.json({ error: 'La publicación no existe.' }, { status: 404 })

    const comment = await prismaDash.postComment.create({
      data: { postId: params.id, authorId: me.id, authorName: me.name, authorRole: me.role, content },
      include: COMMENT_INCLUDE,
    })
    const mentions = await notifyMentions({ text: content, actorId: me.id, actorName: me.name, actorRole: me.role, postId: params.id, commentId: comment.id })
    return NextResponse.json({ comment: { ...shapeComment(comment, me.id), mentions } })
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
