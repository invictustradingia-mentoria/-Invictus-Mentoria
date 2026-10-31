import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prismaDash } from '@/lib/prisma-dashboard'
import { normalizeUsername, validateUsername } from '@/lib/username'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const password = typeof body.password === 'string' ? body.password : ''
    const username = normalizeUsername(body.username)
    const phone = typeof body.phone === 'string' ? body.phone.trim() : ''

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Ingresa un correo válido' }, { status: 400 })
    }
    const uErr = validateUsername(username)
    if (uErr) {
      return NextResponse.json({ error: uErr }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 })
    }

    const exists = await prismaDash.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'Ya existe una cuenta con ese correo' }, { status: 409 })
    }

    const taken = await prismaDash.user.findUnique({ where: { username }, select: { id: true } })
    if (taken) {
      return NextResponse.json({ error: 'Ese nombre de usuario ya está en uso' }, { status: 409 })
    }

    const ip = req.headers.get('x-nf-client-connection-ip') || req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || null
    const userAgent = req.headers.get('user-agent')

    await prismaDash.user.create({
      data: {
        name: name || null,
        email,
        username,
        password: await bcrypt.hash(password, 10),
        phone: phone || null,
        role: 'CLUB',        // fijo: el admin lo cambia después
        status: 'PENDING',   // fijo: requiere aprobación
        isBanned: false,
        registeredIp: ip,
        userAgent,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Cuenta creada. Tu solicitud quedó pendiente de aprobación.',
    })
  } catch (err: any) {
    if (err?.code === 'P2002') {
      return NextResponse.json({ error: 'Ese usuario o correo ya está en uso' }, { status: 409 })
    }
    console.error('register:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
