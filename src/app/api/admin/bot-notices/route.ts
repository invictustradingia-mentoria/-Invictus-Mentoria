import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getAdmin, cleanText } from '@/lib/chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const notices = await prismaDash.botNotice.findMany({ orderBy: { createdAt: 'desc' }, take: 50 })
    return NextResponse.json({ notices }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    const content = cleanText(body?.content)
    if (!content) return NextResponse.json({ error: 'Escribe el aviso.' }, { status: 400 })
    if (content.length > 300) return NextResponse.json({ error: 'El aviso no puede superar los 300 caracteres.' }, { status: 400 })
    const active = await prismaDash.botNotice.count({ where: { isActive: true } })
    if (active >= 5) return NextResponse.json({ error: 'Máximo 5 avisos activos. Desactiva o elimina uno.' }, { status: 400 })
    const notice = await prismaDash.botNotice.create({ data: { content } })
    return NextResponse.json({ notice })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const { id, isActive } = await req.json().catch(() => ({}))
    if (typeof id !== 'string' || typeof isActive !== 'boolean') return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
    if (isActive) {
      const active = await prismaDash.botNotice.count({ where: { isActive: true, NOT: { id } } })
      if (active >= 5) return NextResponse.json({ error: 'Máximo 5 avisos activos.' }, { status: 400 })
    }
    await prismaDash.botNotice.update({ where: { id }, data: { isActive } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Falta el aviso.' }, { status: 400 })
    await prismaDash.botNotice.deleteMany({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}