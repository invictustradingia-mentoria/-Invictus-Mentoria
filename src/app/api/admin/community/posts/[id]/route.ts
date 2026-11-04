import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getStaff } from '@/lib/chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Moderación: el equipo puede eliminar cualquier post, sin importar quién lo publicó.
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getStaff()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const post = await prismaDash.post.findUnique({ where: { id: params.id }, select: { id: true } })
    if (!post) return NextResponse.json({ error: 'La publicación no existe.' }, { status: 404 })

    await prismaDash.post.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
