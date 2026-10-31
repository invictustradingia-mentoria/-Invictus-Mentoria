import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { parseVideo } from '@/lib/testimonials'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Lista pública para la página principal (sin el contenido de las imágenes)
export async function GET() {
  try {
    const rows = await prismaDash.testimonial.findMany({
      where: { isPublished: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, kind: true, name: true, caption: true, videoUrl: true, createdAt: true, updatedAt: true },
    })
    const withImg = new Set(
      (await prismaDash.testimonial.findMany({ where: { isPublished: true, NOT: { image: null } }, select: { id: true } })).map((r) => r.id)
    )
    const items = rows.map((r) => {
      const v = r.videoUrl ? parseVideo(r.videoUrl) : null
      return {
        id: r.id, name: r.name, text: r.caption,
        hasImage: withImg.has(r.id),
        video: v ? v.embed : null, videoDirect: v ? v.direct : false,
        v: r.updatedAt.getTime(),
      }
    })
    return NextResponse.json({ items }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ items: [] })
  }
}
