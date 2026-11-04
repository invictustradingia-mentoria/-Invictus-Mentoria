import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getActor } from '@/lib/chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Eliminar un post propio.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const post = await prismaDash.post.findUnique({ where: { id: params.id }, select: { authorId: true } })
    if (!post) return NextResponse.json({ error: 'La publicación no existe.' }, { status: 404 })
    if (post.authorId !== me.id) return NextResponse.json({ error: 'No puedes eliminar esta publicación.' }, { status: 403 })

    await prismaDash.post.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
