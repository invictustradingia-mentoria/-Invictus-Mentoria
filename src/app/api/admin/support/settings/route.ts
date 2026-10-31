import { NextResponse } from 'next/server'
import { getStaff, cleanText } from '@/lib/chat-utils'
import { getSupportSettings, saveSupportSettings, DEFAULT_OFFLINE_MESSAGE } from '@/lib/support-settings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Estado actual: si soporte está fuera de línea y el mensaje personalizado.
export async function GET() {
  try {
    const staff = await getStaff()
    if (!staff) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const s = await getSupportSettings()
    return NextResponse.json(
      { offline: s.offline, message: s.custom ? s.message : '', defaultMessage: DEFAULT_OFFLINE_MESSAGE },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}

// Activar o desactivar el modo "soporte no disponible" y personalizar el aviso.
export async function PUT(req: Request) {
  try {
    const staff = await getStaff()
    if (!staff) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    const body = await req.json().catch(() => ({}))
    if (typeof body?.offline !== 'boolean') return NextResponse.json({ error: 'Datos inválidos.' }, { status: 400 })
    const message = cleanText(body?.message).slice(0, 400)
    await saveSupportSettings(body.offline, message)
    return NextResponse.json({ success: true, offline: body.offline, message })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}
