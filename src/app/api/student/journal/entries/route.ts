import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DAY_TAGS = ['GOOD', 'BAD', 'NEUTRAL']
const SESSIONS = ['APERTURA_NY', 'NY_18HS', 'ASIA', 'LONDRES']

async function getUser() {
  const session: any = await getServerSession(authOptions)
  if (!session?.user?.id) return null
  return session.user as { id: string }
}

const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null)

async function ownAccount(accountId: string, userId: string) {
  const acc = await prismaDash.journalAccount.findUnique({ where: { id: accountId } })
  return acc && acc.userId === userId ? acc : null
}

export async function GET(req: Request) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('accountId')
    if (!accountId) return NextResponse.json({ error: 'Falta el id de la cuenta' }, { status: 400 })

    const acc = await ownAccount(accountId, user.id)
    if (!acc) return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })

    const entries = await prismaDash.journalEntry.findMany({
      where: { accountId },
      orderBy: { date: 'desc' },
      include: {
        comments: { orderBy: { createdAt: 'asc' } },
      },
    })

    return NextResponse.json({ items: entries })
  } catch (err: any) {
    console.error('GET student/journal/entries:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const accountId = clean(body.accountId, 100)
    if (!accountId) return NextResponse.json({ error: 'Falta la cuenta de la operación' }, { status: 400 })

    const acc = await ownAccount(accountId, user.id)
    if (!acc) return NextResponse.json({ error: 'Cuenta no encontrada' }, { status: 404 })

    const dateRaw = body.date ? new Date(body.date) : new Date()
    const date = Number.isNaN(dateRaw.getTime()) ? new Date() : dateRaw

    const dayTag = DAY_TAGS.includes(body.dayTag) ? body.dayTag : 'NEUTRAL'
    const session = SESSIONS.includes(body.session) ? body.session : null

    const entry = await prismaDash.journalEntry.create({
      data: {
        accountId,
        date,
        pair: clean(body.pair, 40) || null,
        session,
        resultMoney: num(body.resultMoney),
        resultPercent: num(body.resultPercent),
        resultRR: num(body.resultRR),
        dayTag,
        note: clean(body.note, 2000) || null,
        screenshotUrl: clean(body.screenshotUrl, 1000) || null,
      },
    })

    return NextResponse.json({ item: { ...entry, comments: [] } })
  } catch (err: any) {
    console.error('POST student/journal/entries:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getUser()
    if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const id = clean(body.id, 100)
    if (!id) return NextResponse.json({ error: 'Falta el id de la operación' }, { status: 400 })

    const existing = await prismaDash.journalEntry.findUnique({ where: { id }, include: { account: true } })
    if (!existing || existing.account.userId !== user.id) {
      return NextResponse.json({ error: 'Operación no encontrada' }, { status: 404 })
    }

    const data: Record<string, any> = {}
    if (body.date) {
      const d = new Date(body.date)
      if (!Number.isNaN(d.getTime())) data.date = d
    }
    if (body.pair !== undefined) data.pair = clean(body.pair, 40) || null
    if (body.session !== undefined) {
      if (body.session !== null && !SESSIONS.includes(body.session)) return NextResponse.json({ error: 'Sesión no válida' }, { status: 400 })
      data.session = body.session
    }
    if (body.resultMoney !== undefined) data.resultMoney = num(body.resultMoney)
    if (body.resultPercent !== undefined) data.resultPercent = num(body.resultPercent)
    if (body.resultRR !== undefined) data.resultRR = num(body.resultRR)
    if (typeof body.dayTag === 'string') {
      if (!DAY_TAGS.includes(body.dayTag)) return NextResponse.json({ error: 'Etiqueta no válida' }, { status: 400 })
      data.dayTag = body.dayTag
    }
    if (body.note !== undefined) data.note = clean(body.note, 2000) || null
    if (body.screenshotUrl !== undefined) data.screenshotUrl = clean(body.screenshotUrl, 1000) || null

    const item = await prismaDash.journalEntry.update({ where: { id }, data })
    return NextResponse.json({ item })
  } catch (err: any) {
    console.error('PATCH student/journal/entries:', err)
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

    const existing = await prismaDash.journalEntry.findUnique({ where: { id }, include: { account: true } })
    if (!existing || existing.account.userId !== user.id) {
      return NextResponse.json({ error: 'Operación no encontrada' }, { status: 404 })
    }

    await prismaDash.journalEntry.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE student/journal/entries:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
