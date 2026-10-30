import { NextResponse } from 'next/server'
import { prismaDash } from '@/lib/prisma-dashboard'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Avisos fijos que el equipo publica y se muestran dentro del asistente de la página principal.
export async function GET() {
  try {
    const rows = await prismaDash.botNotice.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, content: true },
    })
    return NextResponse.json({ notices: rows }, { headers: { 'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30' } })
  } catch {
    return NextResponse.json({ notices: [] })
  }
}