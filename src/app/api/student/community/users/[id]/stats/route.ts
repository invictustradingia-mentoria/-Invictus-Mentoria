import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getActor } from '@/lib/chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const NO_STORE = { 'Cache-Control': 'no-store' }

// Estadísticas del Trading Journal para la pestaña "Información" del perfil de un usuario.
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getActor()
    if (!me) return NextResponse.json({ error: 'No autorizado' }, { status: 401, headers: NO_STORE })

    const user = await prismaDash.user.findUnique({ where: { id: params.id }, select: { createdAt: true } })
    if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404, headers: NO_STORE })

    const accounts = await prismaDash.journalAccount.findMany({
      where: { userId: params.id },
      select: { id: true, status: true },
    })
    const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE').length
    const accountIds = accounts.map((a) => a.id)

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [monthEntries, allEntries] = await Promise.all([
      accountIds.length
        ? prismaDash.journalEntry.findMany({
            where: { accountId: { in: accountIds }, date: { gte: startOfMonth } },
            select: { resultMoney: true },
          })
        : Promise.resolve([]),
      accountIds.length
        ? prismaDash.journalEntry.findMany({
            where: { accountId: { in: accountIds } },
            select: { session: true },
          })
        : Promise.resolve([]),
    ])

    const monthResult = monthEntries.reduce((sum: number, e: any) => sum + (e.resultMoney || 0), 0)

    const sessionCounts: Record<string, number> = {}
    for (const e of allEntries as any[]) {
      if (e.session) sessionCounts[e.session] = (sessionCounts[e.session] || 0) + 1
    }
    let favoriteSession: string | null = null
    let max = 0
    for (const [k, v] of Object.entries(sessionCounts)) {
      if (v > max) {
        max = v
        favoriteSession = k
      }
    }

    return NextResponse.json(
      { activeAccounts, monthResult, favoriteSession, memberSince: user.createdAt },
      { headers: NO_STORE }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500, headers: NO_STORE })
  }
}
