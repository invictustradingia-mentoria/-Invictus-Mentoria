import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import { normalizeUsername, validateUsername } from '@/lib/username'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/auth/check-username?u=nombre  ->  { available, message }
export async function GET(req: Request) {
  try {
    const u = normalizeUsername(new URL(req.url).searchParams.get('u'))
    const bad = validateUsername(u)
    if (bad) return NextResponse.json({ available: false, message: bad })

    // Si el usuario ya tiene sesión, su propio nombre cuenta como disponible
    const session: any = await getServerSession(authOptions).catch(() => null)
    const found = await prismaDash.user.findUnique({ where: { username: u }, select: { id: true } })
    const mine = !!found && !!session?.user?.id && found.id === session.user.id
    if (found && !mine) return NextResponse.json({ available: false, message: 'Ese nombre de usuario ya está en uso' })
    return NextResponse.json({ available: true, message: 'Disponible' })
  } catch {
    return NextResponse.json({ available: false, message: 'No se pudo comprobar, intenta de nuevo' }, { status: 500 })
  }
}
