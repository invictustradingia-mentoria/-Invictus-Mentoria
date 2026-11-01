import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import { visibleLevels } from '@/lib/access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const role: string = session.user.role ?? 'CLUB'
    const levels = visibleLevels(role, session.user.viewLevel)

    const items = await prismaDash.resource.findMany({
      where: levels ? { allowedRole: { in: levels } } : {},
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        description: true,
        fileUrl: true,
        fileName: true,
        fileSize: true,
        allowedRole: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ items })
  } catch (err: any) {
    console.error('GET student/resources:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
