import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getStaff } from '@/lib/chat-utils'
import { IMAGE_DATA_URL_RE, MAX_AVATAR_CHARS, MAX_COVER_CHARS } from '@/lib/community-shared'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Editar foto de perfil / portada propias desde el panel del equipo (admin/editor).
export async function PATCH(req: Request) {
  try {
    const admin = await getStaff()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json().catch(() => ({}))
    const data: Record<string, any> = {}

    if (body.avatarUrl === null) {
      data.avatarUrl = null
    } else if (typeof body.avatarUrl === 'string') {
      if (!IMAGE_DATA_URL_RE.test(body.avatarUrl) || body.avatarUrl.length > MAX_AVATAR_CHARS) {
        return NextResponse.json({ error: 'La imagen no es válida o es demasiado pesada.' }, { status: 400 })
      }
      data.avatarUrl = body.avatarUrl
    }

    if (body.coverUrl === null) {
      data.coverUrl = null
    } else if (typeof body.coverUrl === 'string') {
      if (!IMAGE_DATA_URL_RE.test(body.coverUrl) || body.coverUrl.length > MAX_COVER_CHARS) {
        return NextResponse.json({ error: 'La foto de portada no es válida o es demasiado pesada.' }, { status: 400 })
      }
      data.coverUrl = body.coverUrl
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No hay cambios para guardar.' }, { status: 400 })
    }

    const user = await prismaDash.user.update({
      where: { id: admin.id },
      data,
      select: { name: true, role: true, avatarUrl: true, coverUrl: true },
    })
    return NextResponse.json({ success: true, user })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
