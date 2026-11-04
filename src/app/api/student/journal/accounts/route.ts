import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const STATUSES = ['ACTIVE', 'PASSED', 'FAILED', 'FUNDED']
const ACCOUNT_TYPES = ['EVAL', 'PA']

async function getUser() {
  const session: any = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return session.user as { id: string }
}

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function GET() {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const accounts = await prismaDash.journalAccount.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { entries: { select: { resultMoney: true, date: true }, orderBy: { date: 'asc' } } },
    })

    const items = accounts.map((a) => {
      const totalEntries = a.entries.length
      const totalResultMoney = a.entries.reduce((sum, e) => sum + (e.resultMoney || 0), 0)
      const wins = a.entries.filter((e) => (e.resultMoney || 0) > 0).length
      const winRate = totalEntries > 0 ? Math.round((wins / totalEntries) * 100) : 0
      const series = a.entries.map((e) => ({ date: e.date, resultMoney: e.resultMoney }))
      const { entries, ...rest } = a
      return { ...rest, totalEntries, totalResultMoney, winRate, series }
    })

    return NextResponse.json({ items })
  } catch (err: any) {
    console.error('GET student/journal/accounts:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const name = clean(body.name, 120)
    if (!name) return NextResponse.json({ error: 'Poné un nombre a la cuenta (ej: Eval 1 - FTMO 100k)' }, { status: 400 })

    if (!ACCOUNT_TYPES.includes(body.accountType)) {
      return NextResponse.json({ error: 'Elegí si la cuenta es Eval o PA' }, { status: 400 })
    }
    const accountType = body.accountType

    const propFirm = clean(body.propFirm, 80) || null
    const status = STATUSES.includes(body.status) ? body.status : 'ACTIVE'
    const accountSize = typeof body.accountSize === 'number' && body.accountSize > 0 ? body.accountSize : null

    const account = await prismaDash.journalAccount.create({
      data: { userId: user.id, name, propFirm, accountType, status, accountSize },
    })

    return NextResponse.json({ item: { ...account, totalEntries: 0, totalResultMoney: 0, winRate: 0, series: [] } })
  } catch (err: any) {
    console.error('POST student/journal/accounts:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const id = clean(body.id, 100)
    if (!id) return NextResponse.json({ error: 'Falta el id de la cuenta' }, { status: 400 })

    const target = await prismaDash.journalAccount.findUnique({ where: { id } })
    if (!target || target.userId !== user.id) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    const data: Record<string, any> = {}
    if (typeof body.name === 'string') {
      const n = clean(body.name, 120)
      if (!n) return NextResponse.json({ error: 'El nombre no puede quedar vacío' }, { status: 400 })
      data.name = n
    }
    if (body.propFirm !== undefined) data.propFirm = clean(body.propFirm, 80) || null
    if (typeof body.accountType === 'string') {
      if (!ACCOUNT_TYPES.includes(body.accountType)) return NextResponse.json({ error: 'Tipo de cuenta no válido' }, { status: 400 })
      data.accountType = body.accountType
    }
    if (typeof body.status === 'string') {
      if (!STATUSES.includes(body.status)) return NextResponse.json({ error: 'Estado no válido' }, { status: 400 })
      data.status = body.status
    }
    if (body.accountSize !== undefined) {
      data.accountSize = typeof body.accountSize === 'number' && body.accountSize > 0 ? body.accountSize : null
    }

    const item = await prismaDash.journalAccount.update({ where: { id }, data })
    return NextResponse.json({ item })
  } catch (err: any) {
    console.error('PATCH student/journal/accounts:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Falta el id' }, { status: 400 })

    const target = await prismaDash.journalAccount.findUnique({ where: { id } })
    if (!target || target.userId !== user.id) {
      return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })
    }

    await prismaDash.journalAccount.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE student/journal/accounts:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
