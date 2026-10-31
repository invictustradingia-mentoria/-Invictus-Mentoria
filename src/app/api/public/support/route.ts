import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { cleanText } from '@/lib/chat-utils'
import { clientIpHash, newToken, short, cleanPhone, EMAIL_RE } from '@/lib/support-utils'
import { getSupportSettings } from '@/lib/support-settings'

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
    const phoneRaw = short(body?.phone, 30)
    const phone = phoneRaw ? cleanPhone(phoneRaw) : null
    if (phoneRaw && !phone) return NextResponse.json({ error: 'El teléfono no parece válido.' }, { status: 400 })
    if (!message) return NextResponse.json({ error: 'Escribe tu consulta.' }, { status: 400 })

    // El servidor decide si soporte está fuera de línea (no se confía en el navegador).
    const { offline } = await getSupportSettings()
    if (offline && !email && !phone) {
      return NextResponse.json({ error: 'Soporte no está en línea. Déjanos al menos un teléfono o un correo para poder contactarte.' }, { status: 400 })
    }
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
        phone,
        offlineContact: offline,
        ipHash,
        unreadAdmin: 1,
        messages: {
          create: offline
            ? [
                { from: 'VISITOR', content: message },
                {
                  from: 'BOT',
                  content: 'Soporte no está en línea en este momento. Recibimos tu consulta y tus datos de contacto; apenas el equipo vuelva a estar disponible se pondrá en contacto contigo.',
                  createdAt: new Date(Date.now() + 1000),
                },
              ]
            : { from: 'VISITOR', content: message },
        },
      },
    })
    return NextResponse.json({ token, offline })
  } catch (err: any) {
    return NextResponse.json({ error: 'No pudimos enviar tu consulta. Inténtalo de nuevo.' }, { status: 500 })
  }
}
