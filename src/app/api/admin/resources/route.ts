import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isStaff, ACCESS_LEVELS } from '@/lib/access'
import { prismaDash } from '@/lib/prisma-dashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Administrador y editor pueden gestionar los recursos descargables
async function guard() {
  const session: any = await getServerSession(authOptions)
  return !!session?.user && isStaff(session.user.role)
}

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const normalizeAccess = (v: unknown) => (ACCESS_LEVELS.includes(v as string) ? (v as string) : 'ALL')

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const items = await prismaDash.resource.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ items })
}

export async function POST(req: Request) {
  try {
    if (!(await guard())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const body = await req.json()
    const title = clean(body.title, 160)
    const fileUrl = clean(body.fileUrl, 1000)
    const fileName = clean(body.fileName, 200)
    const description = clean(body.description, 500)
    const allowedRole = normalizeAccess(body.allowedRole)
    const fileSize = typeof body.fileSize === 'number' && body.fileSize > 0 ? Math.round(body.fileSize) : null

    if (!title) return NextResponse.json({ error: 'Falta el título del recurso' }, { status: 400 })
    if (!fileUrl) return NextResponse.json({ error: 'Falta el archivo o enlace del recurso' }, { status: 400 })

    const item = await prismaDash.resource.create({
      data: {
        title,
        fileUrl,
        fileName: fileName || null,
        fileSize,
        description: description || null,
        allowedRole,
      },
    })
    return NextResponse.json({ item })
  } catch (err: any) {
    console.error('POST resources:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await guard())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const body = await req.json()
    const id = clean(body.id, 100)
    if (!id) return NextResponse.json({ error: 'Falta el id' }, { status: 400 })

    const data: Record<string, any> = {}
    if (body.title !== undefined) data.title = clean(body.title, 160)
    if (body.description !== undefined) data.description = clean(body.description, 500) || null
    if (body.allowedRole !== undefined) data.allowedRole = normalizeAccess(body.allowedRole)

    const item = await prismaDash.resource.update({ where: { id }, data })
    return NextResponse.json({ item })
  } catch (err: any) {
    console.error('PATCH resources:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await guard())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Falta el id' }, { status: 400 })
    await prismaDash.resource.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE resources:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
