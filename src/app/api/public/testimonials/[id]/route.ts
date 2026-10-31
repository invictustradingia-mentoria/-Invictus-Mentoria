import { prismaDash } from '@/lib/prisma-dashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Entrega la imagen de un testimonio
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const t = await prismaDash.testimonial.findUnique({ where: { id: params.id }, select: { image: true } })
    const m = t?.image?.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/)
    if (!t || !m) return new Response('No encontrado', { status: 404 })
    return new Response(Buffer.from(m[2], 'base64'), {
      headers: { 'Content-Type': m[1], 'Cache-Control': 'public, max-age=31536000, immutable' },
    })
  } catch {
    return new Response('Error', { status: 500 })
  }
}
