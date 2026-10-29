import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function isAdmin() {
  const session: any = await getServerSession(authOptions)
  return !!session?.user && session.user.role === 'ADMIN'
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const mod = await prismaDash.module.findUnique({ where: { id: params.id } })
    if (!mod) return NextResponse.json({ error: 'Módulo no encontrado' }, { status: 404 })

    return NextResponse.json({ module: mod })
  } catch (err: any) {
    console.error('GET module:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const data: Record<string, any> = {}

    if (typeof body.title === 'string') {
      if (!body.title.trim()) return NextResponse.json({ error: 'El título no puede estar vacío' }, { status: 400 })
      data.title = body.title.trim()
    }
    if (typeof body.description === 'string') data.description = body.description.trim() || null
    if (body.order !== undefined) {
      const o = parseInt(String(body.order), 10)
      if (Number.isFinite(o)) data.order = o
    }
    if (typeof body.isPublished === 'boolean') data.isPublished = body.isPublished

    const mod = await prismaDash.module.update({ where: { id: params.id }, data })
    return NextResponse.json({ success: true, module: mod })
  } catch (err: any) {
    console.error('PATCH module:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}