import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Todos los campos son obligatorios' }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres' }, { status: 400 })
    }

    const cleanEmail = email.toLowerCase().trim()

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'El correo electrónico ya se encuentra registrado' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        password: hashedPassword,
        role: 'USER',
      },
    })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error: any) {
    console.error('Error en registro API:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor: ' + (error.message || 'Desconocido') },
      { status: 500 }
    )
  }
}