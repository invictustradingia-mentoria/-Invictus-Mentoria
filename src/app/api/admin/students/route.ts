import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ROLES = ['ADMIN', 'CLUB', 'MENTORIA']
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED']

async function getAdmin() {
  const session: any = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session.user as { id?: string; email?: string | null }
}

export async function GET() {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado (se requiere rol ADMIN)' }, { status: 401 })

    const users = await prismaDash.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isBanned: true,
        phone: true,
        registeredIp: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ users, currentEmail: admin.email ?? null })
  } catch (err: any) {
    console.error('GET students:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const id = body.id
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Falta el id del usuario' }, { status: 400 })
    }

    const target = await prismaDash.user.findUnique({ where: { id } })
    if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const isSelf = (!!admin.id && admin.id === target.id) || (!!admin.email && admin.email === target.email)

    const data: Record<string, any> = {}

    if (typeof body.role === 'string') {
      if (!ROLES.includes(body.role)) return NextResponse.json({ error: 'Rol no válido' }, { status: 400 })
      if (isSelf && body.role !== 'ADMIN') {
        return NextResponse.json({ error: 'No puedes quitarte tu propio rol de administrador' }, { status: 400 })
      }
      data.role = body.role
    }

    if (typeof body.status === 'string') {
      if (!STATUSES.includes(body.status)) return NextResponse.json({ error: 'Estado no válido' }, { status: 400 })
      if (isSelf && body.status !== 'APPROVED') {
        return NextResponse.json({ error: 'No puedes cambiar tu propio estado de aprobación' }, { status: 400 })
      }
      data.status = body.status
    }

    if (typeof body.isBanned === 'boolean') {
      if (isSelf && body.isBanned) {
        return NextResponse.json({ error: 'No puedes banearte a ti mismo' }, { status: 400 })
      }
      data.isBanned = body.isBanned
    }

    if (typeof body.name === 'string') data.name = body.name.trim() || null
    if (typeof body.phone === 'string') data.phone = body.phone.trim() || null

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'No hay cambios para guardar' }, { status: 400 })
    }

    const user = await prismaDash.user.update({
      where: { id },
      data,
      select: {
        id: true, name: true, email: true, role: true, status: true,
        isBanned: true, phone: true, registeredIp: true, createdAt: true,
      },
    })

    // Si se banea o rechaza, cerrar sus sesiones activas
    if (data.isBanned === true || data.status === 'REJECTED') {
      await prismaDash.session.updateMany({
        where: { userId: id, isActive: true },
        data: { isActive: false },
      })
    }

    return NextResponse.json({ success: true, user })
  } catch (err: any) {
    console.error('PATCH students:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Falta el id del usuario' }, { status: 400 })

    const target = await prismaDash.user.findUnique({ where: { id } })
    if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const isSelf = (!!admin.id && admin.id === target.id) || (!!admin.email && admin.email === target.email)
    if (isSelf) return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })

    await prismaDash.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE students:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}