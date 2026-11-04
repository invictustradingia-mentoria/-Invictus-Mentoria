import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isStaff, isAdminRole } from '@/lib/access'
import { prismaDash } from '@/lib/prisma-dashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function getStaff() {
  const session: any = await getServerSession(authOptions)
  if (!session?.user || !isStaff(session.user.role)) return null
  return session.user as { id: string; name?: string | null; email?: string | null; role: string; viewLevel?: string | null }
}

function allowedStudentRoles(staff: { role: string; viewLevel?: string | null }): string[] | null {
  if (staff.role !== 'EDITOR') return null
  if (staff.viewLevel === 'CLUB') return ['CLUB']
  if (staff.viewLevel === 'MENTORIA') return ['MENTORIA']
  return null
}

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function POST(req: Request) {
  try {
    const staff = await getStaff()
    if (!staff) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const entryId = clean(body.entryId, 100)
    const content = clean(body.content, 1500)
    if (!entryId) return NextResponse.json({ error: 'Falta la operación a comentar' }, { status: 400 })
    if (!content) return NextResponse.json({ error: 'Escribí un comentario' }, { status: 400 })

    const entry = await prismaDash.journalEntry.findUnique({
      where: { id: entryId },
      include: { account: { include: { user: { select: { role: true } } } } },
    })
    if (!entry) return NextResponse.json({ error: 'Operación no encontrada' }, { status: 404 })

    const roles = allowedStudentRoles(staff)
    if (roles && !roles.includes(entry.account.user.role)) {
      return NextResponse.json({ error: 'No tenés permiso para comentar en este journal' }, { status: 403 })
    }

    const comment = await prismaDash.journalComment.create({
      data: {
        entryId,
        authorId: staff.id,
        authorName: staff.name || staff.email || 'Equipo Invictus',
        authorRole: staff.role,
        content,
      },
    })

    return NextResponse.json({ item: comment })
  } catch (err: any) {
    console.error('POST admin/journal/comments:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const staff = await getStaff()
    if (!staff) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Falta el id' }, { status: 400 })

    const comment = await prismaDash.journalComment.findUnique({ where: { id } })
    if (!comment) return NextResponse.json({ error: 'Comentario no encontrado' }, { status: 404 })

    // El admin puede borrar cualquier comentario; el editor solo los suyos.
    if (!isAdminRole(staff.role) && comment.authorId !== staff.id) {
      return NextResponse.json({ error: 'Solo podés borrar tus propios comentarios' }, { status: 403 })
    }

    await prismaDash.journalComment.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE admin/journal/comments:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
