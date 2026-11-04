import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isStaff } from '@/lib/access'
import { prismaDash } from '@/lib/prisma-dashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function getStaff() {
  const session: any = await getServerSession(authOptions)
  if (!session?.user || !isStaff(session.user.role)) return null
  return session.user as { id: string; role: string; viewLevel?: string | null }
}

// Para un EDITOR, qué roles de alumno puede ver, según el nivel que le dio el admin.
function allowedStudentRoles(staff: { role: string; viewLevel?: string | null }): string[] | null {
  if (staff.role !== 'EDITOR') return null // ADMIN ve todo
  if (staff.viewLevel === 'CLUB') return ['CLUB']
  if (staff.viewLevel === 'MENTORIA') return ['MENTORIA']
  return null // ALL
}

export async function GET(req: Request) {
  try {
    const staff = await getStaff()
    if (!staff) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const roles = allowedStudentRoles(staff)

    if (userId) {
      const student = await prismaDash.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true },
      })
      if (!student) return NextResponse.json({ error: 'Alumno no encontrado' }, { status: 404 })
      if (roles && !roles.includes(student.role)) {
        return NextResponse.json({ error: 'No tenés permiso para ver el journal de este alumno' }, { status: 403 })
      }

      const accounts = await prismaDash.journalAccount.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          entries: {
            orderBy: { date: 'desc' },
            include: { comments: { orderBy: { createdAt: 'asc' } } },
          },
        },
      })

      return NextResponse.json({ student, accounts })
    }

    const where = roles
      ? { role: { in: roles }, journalAccounts: { some: {} } }
      : { journalAccounts: { some: {} } }

    const students = await prismaDash.user.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        journalAccounts: {
          select: {
            id: true,
            entries: { select: { resultMoney: true, date: true, session: true }, orderBy: { date: 'asc' } },
          },
        },
      },
    })

    const items = students.map((s) => {
      const totalAccounts = s.journalAccounts.length
      const allEntries = s.journalAccounts.flatMap((a) => a.entries)
      const totalEntries = allEntries.length
      const totalResultMoney = allEntries.reduce((sum, e) => sum + (e.resultMoney || 0), 0)
      const wins = allEntries.filter((e) => (e.resultMoney || 0) > 0).length
      const winRate = totalEntries > 0 ? Math.round((wins / totalEntries) * 100) : 0
      const sorted = [...allEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      const series = sorted.map((e) => ({ date: e.date, resultMoney: e.resultMoney }))
      const lastEntryAt = allEntries.reduce<string | null>((latest, e) => {
        const t = new Date(e.date).toISOString()
        return !latest || t > latest ? t : latest
      }, null)
      const sessionCounts: Record<string, number> = {}
      for (const e of allEntries) {
        if (!e.session) continue
        sessionCounts[e.session] = (sessionCounts[e.session] || 0) + 1
      }
      let mostSession: string | null = null
      let mostSessionCount = 0
      for (const [sess, count] of Object.entries(sessionCounts)) {
        if (count > mostSessionCount) { mostSession = sess; mostSessionCount = count }
      }
      return { id: s.id, name: s.name, email: s.email, role: s.role, totalAccounts, totalEntries, totalResultMoney, winRate, series, lastEntryAt, mostSession }
    })

    return NextResponse.json({ items })
  } catch (err: any) {
    console.error('GET admin/journal:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
