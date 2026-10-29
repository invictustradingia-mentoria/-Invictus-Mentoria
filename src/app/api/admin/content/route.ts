import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session: any = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const modules = await prismaDash.module.findMany({
      orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      include: { lessons: { orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] } },
    })

    return NextResponse.json({ modules })
  } catch (err: any) {
    console.error('GET content:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}