import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { cleanText } from '@/lib/chat-utils'
import { clientIpHash, newToken, short, EMAIL_RE } from '@/lib/support-utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Un visitante abre una conversación con soporte.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const name = short(body?.name, 60)
    const email = short(body?.email, 120)
    const message = cleanText(body?.message)

    if (!name) return NextResponse.json({ error: 'Escribe tu nombre.' }, { status: 400 })
    if (email && !EMAIL_RE.test(email)) return NextResponse.json({ error: 'El correo no parece válido.' }, { status: 400 })
    if (!message) return NextResponse.json({ error: 'Escribe tu consulta.' }, { status: 400 })
    if (message.length > 1000) return NextResponse.json({ error: 'La consulta es demasiado larga (máximo 1000 caracteres).' }, { status: 400 })

    const ipHash = clientIpHash(req)
    const recent = await prismaDash.supportThread.count({
      where: { ipHash, createdAt: { gt: new Date(Date.now() - 3600 * 1000) } },
    })
    if (recent >= 3) {
      return NextResponse.json({ error: 'Ya abriste varias conversaciones. Espera un rato o continúa en la anterior.' }, { status: 429 })
    }

    const token = newToken()
    await prismaDash.supportThread.create({
      data: {
        token,
        name,
        email: email || null,
        ipHash,
        unreadAdmin: 1,
        messages: { create: { from: 'VISITOR', content: message } },
      },
    })
    return NextResponse.json({ token })
  } catch (err: any) {
    return NextResponse.json({ error: 'No pudimos enviar tu consulta. Inténtalo de nuevo.' }, { status: 500 })
  }
}