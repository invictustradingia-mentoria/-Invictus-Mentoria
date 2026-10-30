import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prismaDash } from '@/lib/prisma-dashboard'
import { findValidToken } from '@/lib/auth-tokens'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ¿El enlace sigue siendo válido? (para avisar antes de pedir la contraseña)
export async function GET(req: Request) {
  try {
    const token = new URL(req.url).searchParams.get('token') || ''
    const row = await findValidToken(token)
    return NextResponse.json({ valid: !!row }, { headers: { 'Cache-Control': 'no-store' } })
  } catch {
    return NextResponse.json({ valid: false })
  }
}

// Guarda la contraseña nueva y deja el enlace (y cualquier otro pendiente) inutilizable.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const token = typeof body.token === 'string' ? body.token : ''
    const password = typeof body.password === 'string' ? body.password : ''

    if (password.length < 8) return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres.' }, { status: 400 })
    if (password.length > 100) return NextResponse.json({ error: 'La contraseña es demasiado larga.' }, { status: 400 })

    const row = await findValidToken(token)
    if (!row) return NextResponse.json({ error: 'Este enlace venció o ya fue usado. Pide uno nuevo desde “¿Olvidaste tu contraseña?”.' }, { status: 400 })

    const user = await prismaDash.user.findUnique({ where: { id: row.userId }, select: { id: true } })
    if (!user) return NextResponse.json({ error: 'No se encontró la cuenta.' }, { status: 400 })

    await prismaDash.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(password, 10) } })
    await prismaDash.passwordReset.updateMany({ where: { userId: user.id, usedAt: null }, data: { usedAt: new Date() } })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('reset-password:', err)
    return NextResponse.json({ error: 'No se pudo guardar la contraseña. Inténtalo de nuevo.' }, { status: 500 })
  }
}