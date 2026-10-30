import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { getActor } from '@/lib/chat-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Foto de perfil de un miembro (solo para usuarios con sesión). El navegador la guarda 5 minutos.
export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const me = await getActor()
    if (!me) return new Response('No autorizado', { status: 401 })

    const u = await prismaDash.user.findUnique({ where: { id: params.id }, select: { avatarUrl: true } })
    const v: string | null | undefined = u?.avatarUrl
    if (!v) return new Response('Sin foto', { status: 404 })

    if (/^https:\/\//i.test(v)) return NextResponse.redirect(v, 302)
    if (v.startsWith('/') && !v.startsWith('//')) return NextResponse.redirect(new URL(v, req.url), 302)

    const m = /^data:(image\/(?:png|jpe?g|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/i.exec(v)
    if (!m) return new Response('Formato no válido', { status: 404 })

    const bytes = new Uint8Array(Buffer.from(m[2], 'base64'))
    return new Response(bytes, {
      headers: { 'Content-Type': m[1].toLowerCase(), 'Cache-Control': 'private, max-age=300' },
    })
  } catch {
    return new Response('Error', { status: 500 })
  }
}