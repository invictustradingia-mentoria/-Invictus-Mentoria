import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import { createToken, siteUrl } from '@/lib/auth-tokens'
import { sendMail } from '@/lib/mailer'
import { welcomeEmail } from '@/lib/email-templates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ROLES = ['ADMIN', 'EDITOR', 'CLUB', 'MENTORIA']
const EDITOR_LEVELS = ['ALL', 'CLUB', 'MENTORIA']
const STATUSES = ['PENDING', 'APPROVED', 'REJECTED']

async function getAdmin() {
  const session: any = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'ADMIN') return null
  return session.user as { id?: string; email?: string | null }
}

export async function GET() {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado (se requiere rol ADMIN)' }, { status: 401 })

    const users = await prismaDash.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        isBanned: true,
        isProtected: true,
        phone: true,
        registeredIp: true,
        createdAt: true,
        editorLevel: true,
        welcomeEmailSentAt: true,
      },
    })

    return NextResponse.json({ users, currentEmail: admin.email ?? null })
  } catch (err: any) {
    console.error('GET students:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const body = await req.json()
    const id = body.id
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Falta el id del usuario' }, { status: 400 })
    }

    const target = await prismaDash.user.findUnique({ where: { id } })
    if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    const isSelf = (!!admin.id && admin.id === target.id) || (!!admin.email && admin.email === target.email)

    const data: Record<string, any> = {}

    if (typeof body.role === 'string') {
      if (target.isProtected) return NextResponse.json({ error: 'Esta cuenta está protegida: no se le puede cambiar el rol' }, { status: 400 })
      if (!ROLES.includes(body.role)) return NextResponse.json({ error: 'Rol no válido' }, { status: 400 })
      if (isSelf && body.role !== 'ADMIN') {
        return NextResponse.json({ error: 'No puedes quitarte tu propio rol de administrador' }, { status: 400 })
      }
      data.role = body.role
    }

    if (typeof body.status === 'string') {
      if (target.isProtected) return NextResponse.json({ error: 'Esta cuenta está protegida: no se le puede cambiar el estado' }, { status: 400 })
      if (!STATUSES.includes(body.status)) return NextResponse.json({ error: 'Estado no válido' }, { status: 400 })
      if (isSelf && body.status !== 'APPROVED') {
        return NextResponse.json({ error: 'No puedes cambiar tu propio estado de aprobación' }, { status: 400 })
      }
      data.status = body.status
    }

    if (typeof body.isBanned === 'boolean') {
      if (target.isProtected && body.isBanned) return NextResponse.json({ error: 'Esta cuenta está protegida: no se puede banear' }, { status: 400 })
      if (isSelf && body.isBanned) {
        return NextResponse.json({ error: 'No puedes banearte a ti mismo' }, { status: 400 })
      }
      data.isBanned = body.isBanned
    }

    if (typeof body.editorLevel === 'string') {
      if (!EDITOR_LEVELS.includes(body.editorLevel)) return NextResponse.json({ error: 'Nivel de editor no válido' }, { status: 400 })
      data.editorLevel = body.editorLevel
    }

    if (typeof body.name === 'string') data.name = body.name.trim() || null
    if (typeof body.phone === 'string') data.phone = body.phone.trim() || null

    if (Object.keys(data).length === 0 && body.resendWelcome !== true) {
      return NextResponse.json({ error: 'No hay cambios para guardar' }, { status: 400 })
    }

    let user = target
    if (Object.keys(data).length > 0) user = await prismaDash.user.update({
      where: { id },
      data,
      select: {
        id: true, name: true, email: true, role: true, status: true,
        isBanned: true, isProtected: true, phone: true, registeredIp: true, createdAt: true,
        editorLevel: true, welcomeEmailSentAt: true,
      },
    })

    // Correo de bienvenida: se envía al aprobar por primera vez, o si el admin pide reenviarlo
    const firstApproval = data.status === 'APPROVED' && target.status !== 'APPROVED'
    const resendWelcome = body.resendWelcome === true
    const finalStatus = data.status || target.status
    let emailSent: boolean | null = null
    let emailError: string | null = null

    if (firstApproval || (resendWelcome && finalStatus === 'APPROVED')) {
      try {
        const site = siteUrl(req)
        const token = await createToken(user.id, 'WELCOME')
        const mail = welcomeEmail(user.name, `${site}/login`, `${site}/reset-password?token=${token}`)
        await sendMail({ to: user.email, subject: mail.subject, html: mail.html, text: mail.text })
        user = await prismaDash.user.update({
          where: { id },
          data: { welcomeEmailSentAt: new Date() },
          select: {
            id: true, name: true, email: true, role: true, status: true,
            isBanned: true, isProtected: true, phone: true, registeredIp: true, createdAt: true,
            editorLevel: true, welcomeEmailSentAt: true,
          },
        })
        emailSent = true
      } catch (e: any) {
        console.error('No se pudo enviar el correo de bienvenida:', e?.message || e)
        emailSent = false
        emailError = e?.message || 'Error desconocido al enviar el correo'
      }
    } else if (resendWelcome && finalStatus !== 'APPROVED') {
      return NextResponse.json({ error: 'El usuario todavía no está aprobado: no se puede reenviar el correo de bienvenida' }, { status: 400 })
    }

    // Si se banea o rechaza, cerrar sus sesiones activas
    if (data.isBanned === true || data.status === 'REJECTED') {
      await prismaDash.session.updateMany({
        where: { userId: id, isActive: true },
        data: { isActive: false },
      })
    }

    // target (usado cuando no hay cambios de campos, solo reenvío de correo) trae la contraseña: nunca debe salir en la respuesta
    const { password: _pw, ...safeUser } = user as any
    return NextResponse.json({ success: true, user: safeUser, emailSent, emailError })
  } catch (err: any) {
    console.error('PATCH students:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const id = new URL(req.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Falta el id del usuario' }, { status: 400 })

    const target = await prismaDash.user.findUnique({ where: { id } })
    if (!target) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

    if (target.isProtected) return NextResponse.json({ error: 'Esta cuenta está protegida: no se puede eliminar' }, { status: 400 })

    const isSelf = (!!admin.id && admin.id === target.id) || (!!admin.email && admin.email === target.email)
    if (isSelf) return NextResponse.json({ error: 'No puedes eliminarte a ti mismo' }, { status: 400 })

    await prismaDash.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('DELETE students:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
