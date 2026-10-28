import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    const email = 'invictustradingia@gmail.com'
    const passwordInput = 'Invictus777'

    // 1. Buscar el usuario exacto
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({
        ok: false,
        error: 'El usuario NO existe en Supabase',
      })
    }

    // 2. Comparar la contraseña con bcrypt
    const passwordMatch = await bcrypt.compare(passwordInput, user.password || '')

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        isBanned: user.isBanned,
        hasPassword: !!user.password,
        passwordValid: passwordMatch,
      },
    })
  } catch (error: any) {
    return NextResponse.json({
      ok: false,
      error: error.message || 'Error al conectar a la base de datos',
    })
  }
}