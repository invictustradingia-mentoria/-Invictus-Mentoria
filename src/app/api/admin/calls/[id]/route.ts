import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getAdmin } from '@/lib/chat-utils'
import { parseCall } from '@/lib/calls'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const parsed: any = parseCall(body, true)
    if (parsed.error) return NextResponse.json({ error: parsed.error }, { status: 400 })
    const call = await prismaDash.zoomCall.update({ where: { id: params.id }, data: parsed.data })
    return NextResponse.json({ call })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    await prismaDash.zoomCall.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}