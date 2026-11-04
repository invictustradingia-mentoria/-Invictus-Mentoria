import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getActor } from '@/lib/chat-utils'
import { REACTION_TYPES } from '@/lib/community-shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Reaccionar a un post. Si ya tenías la misma reacción puesta, la quita (toggle);
// si tenías otra, la cambia; si no tenías ninguna, la crea.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const type = typeof body?.type === 'string' ? body.type.toUpperCase() : ''
    if (!REACTION_TYPES.includes(type as any)) return NextResponse.json({ error: 'Reacción no válida.' }, { status: 400 })

    const post = await prismaDash.post.findUnique({ where: { id: params.id }, select: { id: true } })
    if (!post) return NextResponse.json({ error: 'La publicación no existe.' }, { status: 404 })

    const existing = await prismaDash.postReaction.findUnique({
      where: { postId_userId: { postId: params.id, userId: me.id } },
    })

    if (existing && existing.type === type) {
      await prismaDash.postReaction.delete({ where: { id: existing.id } })
      return NextResponse.json({ myReaction: null })
    }

    await prismaDash.postReaction.upsert({
      where: { postId_userId: { postId: params.id, userId: me.id } },
      update: { type },
      create: { postId: params.id, userId: me.id, type },
    })
    return NextResponse.json({ myReaction: type })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
