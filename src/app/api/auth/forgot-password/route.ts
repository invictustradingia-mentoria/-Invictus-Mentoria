import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'
import { createToken, siteUrl } from '@/lib/auth-tokens'
import { sendMail } from '@/lib/mailer'
import { resetEmail } from '@/lib/email-templates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const GENERIC = { success: true, message: 'Si el correo está registrado y tu cuenta fue aprobada, te enviamos un enlace para crear una contraseña nueva.' }

// El alumno pide un enlace. La respuesta es siempre la misma para no revelar qué correos existen.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Ingresa un correo válido.' }, { status: 400 })
    }

    const user = await prismaDash.user.findUnique({ where: { email }, select: { id: true, name: true, email: true, status: true, isBanned: true } })
    if (!user || user.isBanned || user.status !== 'APPROVED') return NextResponse.json(GENERIC)

    // Máximo 3 solicitudes por hora por cuenta (evita llenar la bandeja de alguien)
    const recent = await prismaDash.passwordReset.count({
      where: { userId: user.id, purpose: 'RESET', createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
    })
    if (recent >= 3) return NextResponse.json(GENERIC)

    const token = await createToken(user.id, 'RESET')
    const link = `${siteUrl(req)}/reset-password?token=${token}`
    const mail = resetEmail(user.name, link)
    try {
      await sendMail({ to: user.email, subject: mail.subject, html: mail.html, text: mail.text })
    } catch (e: any) {
      console.error('forgot-password: no se pudo enviar el correo:', e?.message || e)
    }
    return NextResponse.json(GENERIC)
  } catch (err: any) {
    console.error('forgot-password:', err)
    return NextResponse.json({ error: 'No se pudo procesar la solicitud. Inténtalo de nuevo.' }, { status: 500 })
  }
}