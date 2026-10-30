import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createToken, siteUrl } from '@/lib/auth-tokens'
import { sendMail } from '@/lib/mailer'
import { welcomeEmail } from '@/lib/email-templates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { userId, status } = body

    const before = await prisma.user.findUnique({ where: { id: userId }, select: { status: true } })

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status },
    })

    // Al aprobar a un alumno por primera vez, le llega el correo de bienvenida con los pasos
    let emailSent: boolean | null = null
    if (status === 'APPROVED' && before?.status !== 'APPROVED') {
      try {
        const site = siteUrl(req)
        const token = await createToken(updated.id, 'WELCOME')
        const mail = welcomeEmail(updated.name, `${site}/login`, `${site}/reset-password?token=${token}`)
        await sendMail({ to: updated.email, subject: mail.subject, html: mail.html, text: mail.text })
        emailSent = true
      } catch (e: any) {
        console.error('No se pudo enviar el correo de bienvenida:', e?.message || e)
        emailSent = false
      }
    }

    const { password: _pw, ...safe } = updated as any
    return NextResponse.json({ success: true, user: safe, emailSent })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 })
  }
}