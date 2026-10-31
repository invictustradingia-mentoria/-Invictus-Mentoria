import { NextResponse } from 'next/server'
import { getSupportSettings } from '@/lib/support-settings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Dice al asistente de la página principal si soporte está en línea.
export async function GET() {
  const s = await getSupportSettings()
  return NextResponse.json({ offline: s.offline, message: s.message }, { headers: { 'Cache-Control': 'no-store' } })
}
