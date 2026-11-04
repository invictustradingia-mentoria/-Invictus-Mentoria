import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getActor } from '@/lib/chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Seguir / dejar de seguir a otro usuario (toggle).
export async function POST(req: Request) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const userId = typeof body?.userId === 'string' ? body.userId : ''
    if (!userId) return NextResponse.json({ error: 'Falta el usuario.' }, { status: 400 })
    if (userId === me.id) return NextResponse.json({ error: 'No podés seguirte a vos mismo.' }, { status: 400 })

    const target = await prismaDash.user.findUnique({ where: { id: userId }, select: { id: true } })
    if (!target) return NextResponse.json({ error: 'El usuario no existe.' }, { status: 404 })

    const existing = await prismaDash.follow.findUnique({
      where: { followerId_followingId: { followerId: me.id, followingId: userId } },
    })

    if (existing) {
      await prismaDash.follow.delete({ where: { id: existing.id } })
    } else {
      await prismaDash.follow.create({ data: { followerId: me.id, followingId: userId } })
    }

    const followersCount = await prismaDash.follow.count({ where: { followingId: userId } })
    return NextResponse.json({ following: !existing, followersCount })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
