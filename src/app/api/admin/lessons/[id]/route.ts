import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ROLES = ['ALL', 'CLUB', 'MENTORIA']

async function isAdmin() {
  const session: any = await getServerSession(authOptions)
  return !!session?.user && session.user.role === 'ADMIN'
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const lesson = await prismaDash.lesson.findUnique({ where: { id: params.id } })
    if (!lesson) return NextResponse.json({ error: 'Clase no encontrada' }, { status: 404 })

    return NextResponse.json({ lesson })
  } catch (err: any) {
    console.error('GET lesson:', err)
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
    if (typeof body.videoUrl === 'string') {
      if (!body.videoUrl.trim()) return NextResponse.json({ error: 'El enlace del video no puede estar vacío' }, { status: 400 })
      data.videoUrl = body.videoUrl.trim()
    }
    if (body.duration !== undefined) {
      const d = parseInt(String(body.duration), 10)
      data.duration = Number.isFinite(d) && d > 0 ? d : null
    }
    if (body.order !== undefined) {
      const o = parseInt(String(body.order), 10)
      if (Number.isFinite(o)) data.order = o
    }
    if (typeof body.isPublished === 'boolean') data.isPublished = body.isPublished
    if (typeof body.allowedRole === 'string') {
      if (!ROLES.includes(body.allowedRole)) return NextResponse.json({ error: 'Rol no válido' }, { status: 400 })
      data.allowedRole = body.allowedRole
    }
    if (typeof body.moduleId === 'string' && body.moduleId) {
      const mod = await prismaDash.module.findUnique({ where: { id: body.moduleId } })
      if (!mod) return NextResponse.json({ error: 'El módulo destino no existe' }, { status: 400 })
      data.moduleId = body.moduleId
    }

    const lesson = await prismaDash.lesson.update({ where: { id: params.id }, data })
    return NextResponse.json({ success: true, lesson })
  } catch (err: any) {
    console.error('PATCH lesson:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    await prismaDash.lesson.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE lesson:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}