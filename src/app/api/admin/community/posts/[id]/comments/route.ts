import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getStaff } from '@/lib/chat-utils'
import { cleanPostText, containsUrl, shapeComment, MAX_COMMENT_LEN, NO_LINKS_MESSAGE } from '@/lib/community-shared'
import { resolveMentionsForTexts, notifyMentions } from '@/lib/mentions'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }
const COMMENT_INCLUDE = { reactions: { select: { type: true, userId: true } } } as const

// Listar comentarios de un post (vista del equipo), con sus reacciones.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getStaff()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })

    const comments = await prismaDash.postComment.findMany({
      where: { postId: params.id },
      orderBy: { createdAt: 'asc' },
      take: 200,
      include: COMMENT_INCLUDE,
    })
    const mentions = await resolveMentionsForTexts(comments.map((c: any) => c.content))
    return NextResponse.json(
      { comments: comments.map((c: any) => ({ ...shapeComment(c, admin.id), mentions })), meId: admin.id },
      { headers: NO_STORE }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}

// El equipo también puede comentar.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getStaff()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const content = cleanPostText(body?.content, MAX_COMMENT_LEN)
    if (!content) return NextResponse.json({ error: 'Escribe un comentario.' }, { status: 400 })
    if (containsUrl(content)) return NextResponse.json({ error: NO_LINKS_MESSAGE }, { status: 400 })

    const post = await prismaDash.post.findUnique({ where: { id: params.id }, select: { id: true } })
    if (!post) return NextResponse.json({ error: 'La publicación no existe.' }, { status: 404 })

    const comment = await prismaDash.postComment.create({
      data: { postId: params.id, authorId: admin.id, authorName: admin.name, authorRole: admin.role, content },
      include: COMMENT_INCLUDE,
    })
    const mentions = await notifyMentions({ text: content, actorId: admin.id, actorName: admin.name, actorRole: admin.role, postId: params.id, commentId: comment.id })
    return NextResponse.json({ comment: { ...shapeComment(comment, admin.id), mentions } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

// Moderación: el equipo puede eliminar cualquier comentario. Id como ?commentId=...
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getStaff()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const commentId = new URL(req.url).searchParams.get('commentId')
    if (!commentId) return NextResponse.json({ error: 'Falta el comentario.' }, { status: 400 })

    const comment = await prismaDash.postComment.findUnique({ where: { id: commentId }, select: { postId: true } })
    if (!comment || comment.postId !== params.id) return NextResponse.json({ error: 'El comentario no existe.' }, { status: 404 })

    await prismaDash.postComment.delete({ where: { id: commentId } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
