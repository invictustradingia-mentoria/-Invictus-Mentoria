import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getStaff } from '@/lib/chat-utils'
import { REACTION_TYPES } from '@/lib/community-shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Reaccionar a un comentario desde el panel del equipo (misma lógica que el lado alumno).
export async function POST(req: Request, { params }: { params: { id: string; commentId: string } }) {
  try {
    const admin = await getStaff()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const type = typeof body?.type === 'string' ? body.type.toUpperCase() : ''
    if (!REACTION_TYPES.includes(type as any)) return NextResponse.json({ error: 'Reacción no válida.' }, { status: 400 })

    const comment = await prismaDash.postComment.findUnique({ where: { id: params.commentId }, select: { id: true, postId: true } })
    if (!comment || comment.postId !== params.id) return NextResponse.json({ error: 'El comentario no existe.' }, { status: 404 })

    const existing = await prismaDash.commentReaction.findUnique({
      where: { commentId_userId: { commentId: params.commentId, userId: admin.id } },
    })

    if (existing && existing.type === type) {
      await prismaDash.commentReaction.delete({ where: { id: existing.id } })
      return NextResponse.json({ myReaction: null })
    }

    await prismaDash.commentReaction.upsert({
      where: { commentId_userId: { commentId: params.commentId, userId: admin.id } },
      update: { type },
      create: { commentId: params.commentId, userId: admin.id, type },
    })
    return NextResponse.json({ myReaction: type })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
