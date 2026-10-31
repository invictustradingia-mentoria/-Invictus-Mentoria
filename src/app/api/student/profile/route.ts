import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import bcrypt from 'bcryptjs'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import { normalizeUsername, validateUsername } from '@/lib/username'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AVATAR_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/
const MAX_AVATAR_CHARS = 300_000

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions)
    const id = session?.user?.id
    if (!id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const user = await prismaDash.user.findUnique({
      where: { id },
      select: { name: true, username: true, email: true, phone: true, role: true, avatarUrl: true, createdAt: true },
    })
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    return NextResponse.json({ user })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session: any = await getServerSession(authOptions)
    const id = session?.user?.id
    if (!id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const data: Record<string, any> = {}

    if (typeof body.name === 'string') {
      const n = body.name.trim()
      if (!n) return NextResponse.json({ error: 'El nombre no puede estar vacío' }, { status: 400 })
      data.name = n.slice(0, 80)
    }
    if (typeof body.username === 'string') {
      const u = normalizeUsername(body.username)
      const bad = validateUsername(u)
      if (bad) return NextResponse.json({ error: bad }, { status: 400 })
      const other = await prismaDash.user.findUnique({ where: { username: u }, select: { id: true } })
      if (other && other.id !== id) return NextResponse.json({ error: 'Ese nombre de usuario ya está en uso' }, { status: 409 })
      data.username = u
    }
    if (typeof body.phone === 'string') data.phone = body.phone.trim().slice(0, 30) || null

    if (body.avatarUrl === null) {
      data.avatarUrl = null
    } else if (typeof body.avatarUrl === 'string') {
      if (!AVATAR_RE.test(body.avatarUrl) || body.avatarUrl.length > MAX_AVATAR_CHARS) {
        return NextResponse.json({ error: 'La imagen no es válida o es demasiado pesada' }, { status: 400 })
      }
      data.avatarUrl = body.avatarUrl
    }

    if (typeof body.newPassword === 'string' && body.newPassword) {
      if (body.newPassword.length < 8) {
        return NextResponse.json({ error: 'La nueva contraseña debe tener al menos 8 caracteres' }, { status: 400 })
      }
      const current = await prismaDash.user.findUnique({ where: { id }, select: { password: true } })
      const ok = current && typeof body.currentPassword === 'string' && (await bcrypt.compare(body.currentPassword, current.password))
      if (!ok) return NextResponse.json({ error: 'La contraseña actual no es correcta' }, { status: 400 })
      data.password = await bcrypt.hash(body.newPassword, 10)
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No hay cambios para guardar' }, { status: 400 })
    }

    const user = await prismaDash.user.update({
      where: { id },
      data,
      select: { name: true, username: true, email: true, phone: true, role: true, avatarUrl: true },
    })
    return NextResponse.json({ success: true, user })
  } catch (err: any) {
    if (err?.code === 'P2002') return NextResponse.json({ error: 'Ese nombre de usuario ya está en uso' }, { status: 409 })
    console.error('PATCH student/profile:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
