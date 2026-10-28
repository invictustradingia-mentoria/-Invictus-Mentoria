import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, phone, userAgent } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const cleanEmail = email.trim().toLowerCase()

    // Comprobar si ya existe el correo
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })

    if (existing) {
      return NextResponse.json({ error: 'Ya existe una solicitud o cuenta con este correo' }, { status: 409 })
    }

    // Extraer dirección IP real del cliente
    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1')
    const ua = userAgent || req.headers.get('user-agent') || 'Unknown'

    const hashedPassword = await bcrypt.hash(password, 12)

    // Todos los nuevos registros entran con estado "PENDING"
    // Únicamente el Administrador puede aprobar el acceso y asignar el rol desde /admin
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: 'STUDENT',
        status: 'PENDING',
        phone: phone || null,
        registeredIp: clientIp,
        userAgent: ua,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    })

    // Registrar log de auditoría
    try {
      await prisma.activityLog.create({
        data: {
          userId: user.id,
          action: 'REGISTER_PENDING',
          page: '/register',
          ip: clientIp,
          userAgent: ua,
          metadata: JSON.stringify({ registeredAt: new Date().toISOString() }),
        },
      })
    } catch {
      // Ignorar si falla el registro de auditoría
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Tu solicitud de registro ha sido recibida con éxito y está pendiente de aprobación por el Administrador.',
        status: 'PENDING',
        user,
      },
      { status: 201 }
    )
  } catch (err: any) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Error interno al procesar el registro' }, { status: 500 })
  }
}
