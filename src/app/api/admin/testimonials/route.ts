import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isStaff } from '@/lib/access'
import { prismaDash } from '@/lib/prisma-dashboard'
import { parseVideo } from '@/lib/testimonials'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const IMG_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/
const MAX_CHARS = 2_500_000

// Administrador y editor pueden gestionar los testimonios
async function guard() {
  const session: any = await getServerSession(authOptions)
  return !!session?.user && isStaff(session.user.role)
}
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')

export async function GET() {
  if (!(await guard())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const rows = await prismaDash.testimonial.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    select: { id: true, kind: true, name: true, caption: true, videoUrl: true, order: true, isPublished: true, createdAt: true, updatedAt: true },
  })
  const withImg = new Set((await prismaDash.testimonial.findMany({ where: { NOT: { image: null } }, select: { id: true } })).map((r) => r.id))
  return NextResponse.json({ items: rows.map((r) => ({ ...r, hasImage: withImg.has(r.id) })) })
}

export async function POST(req: Request) {
  try {
    if (!(await guard())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const body = await req.json()
    const image = typeof body.image === 'string' && body.image ? body.image : null
    const name = clean(body.name, 80)
    const caption = clean(body.caption, 1500)
    const videoUrl = clean(body.videoUrl, 500)

    if (image && (!IMG_RE.test(image) || image.length > MAX_CHARS)) {
      return NextResponse.json({ error: 'La imagen no es válida o pesa demasiado' }, { status: 400 })
    }
    if (videoUrl && !parseVideo(videoUrl)) {
      return NextResponse.json({ error: 'El enlace del video no es válido. Usa YouTube, Vimeo o un archivo .mp4' }, { status: 400 })
    }
    if (!image && !caption && !videoUrl) {
      return NextResponse.json({ error: 'Agrega una foto, un texto o un video' }, { status: 400 })
    }
    const kind = videoUrl ? 'VIDEO' : image ? 'IMAGE' : 'TEXT'
    // El más nuevo queda arriba
    const min = await prismaDash.testimonial.aggregate({ _min: { order: true } })
    const order = (min._min.order ?? 0) - 1
    const item = await prismaDash.testimonial.create({
      data: { kind, image, name: name || null, caption: caption || null, videoUrl: videoUrl || null, order },
      select: { id: true },
    })
    return NextResponse.json({ success: true, id: item.id })
  } catch (err: any) {
    console.error('POST testimonials:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await guard())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const body = await req.json()
    const id = typeof body.id === 'string' ? body.id : ''
    if (!id) return NextResponse.json({ error: 'Falta el id' }, { status: 400 })

    if (body.move === 'up' || body.move === 'down') {
      const all = await prismaDash.testimonial.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'desc' }], select: { id: true } })
      const i = all.findIndex((x) => x.id === id)
      const j = body.move === 'up' ? i - 1 : i + 1
      if (i < 0 || j < 0 || j >= all.length) return NextResponse.json({ success: true })
      const ids = all.map((x) => x.id)
      ;[ids[i], ids[j]] = [ids[j], ids[i]]
      await prismaDash.$transaction(ids.map((x, idx) => prismaDash.testimonial.update({ where: { id: x }, data: { order: idx } })))
      return NextResponse.json({ success: true })
    }

    const data: Record<string, any> = {}
    if (typeof body.name === 'string') data.name = clean(body.name, 80) || null
    if (typeof body.caption === 'string') data.caption = clean(body.caption, 1500) || null
    if (typeof body.isPublished === 'boolean') data.isPublished = body.isPublished
    if (typeof body.videoUrl === 'string') {
      const v = clean(body.videoUrl, 500)
      if (v && !parseVideo(v)) return NextResponse.json({ error: 'El enlace del video no es válido. Usa YouTube, Vimeo o un archivo .mp4' }, { status: 400 })
      data.videoUrl = v || null
    }
    if (body.image === null) data.image = null
    else if (typeof body.image === 'string') {
      if (!IMG_RE.test(body.image) || body.image.length > MAX_CHARS) return NextResponse.json({ error: 'La imagen no es válida o pesa demasiado' }, { status: 400 })
      data.image = body.image
    }
    if (!Object.keys(data).length) return NextResponse.json({ error: 'Nada para cambiar' }, { status: 400 })

    // No dejar un testimonio vacío
    const cur = await prismaDash.testimonial.findUnique({ where: { id }, select: { image: true, caption: true, videoUrl: true } })
    if (!cur) return NextResponse.json({ error: 'No existe' }, { status: 404 })
    const fin = { image: 'image' in data ? data.image : cur.image, caption: 'caption' in data ? data.caption : cur.caption, videoUrl: 'videoUrl' in data ? data.videoUrl : cur.videoUrl }
    if (!fin.image && !fin.caption && !fin.videoUrl) return NextResponse.json({ error: 'El testimonio no puede quedar vacío' }, { status: 400 })
    data.kind = fin.videoUrl ? 'VIDEO' : fin.image ? 'IMAGE' : 'TEXT'

    await prismaDash.testimonial.update({ where: { id }, data })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    if (!(await guard())) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const id = new URL(req.url).searchParams.get('id') || ''
    if (!id) return NextResponse.json({ error: 'Falta el id' }, { status: 400 })
    await prismaDash.testimonial.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
