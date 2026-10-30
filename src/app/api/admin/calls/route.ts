import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getAdmin } from '@/lib/chat-utils'
import { parseCall } from '@/lib/calls'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const calls = await prismaDash.zoomCall.findMany({ orderBy: { startsAt: 'desc' }, take: 200 })
    return NextResponse.json({ calls }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const parsed: any = parseCall(body)
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const call = await prismaDash.zoomCall.create({ data: parsed.data })
    return NextResponse.json({ call })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}