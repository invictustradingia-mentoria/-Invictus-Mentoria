import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BUCKET = 'journal'
const MAX_MB = 8
const ALLOWED_EXT = ['png', 'jpg', 'jpeg', 'webp']

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado: iniciÃ¡ sesiÃ³n para subir una captura.' }, { status: 401 })
    }

    const { fileName, fileSize } = await req.json()
    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json({ error: 'Falta el nombre del archivo.' }, { status: 400 })
    }

    const ext = fileName.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED_EXT.includes(ext)) {
      return NextResponse.json({ error: `Formato .${ext} no admitido. UsÃ¡ PNG, JPG o WEBP.` }, { status: 400 })
    }
    if (typeof fileSize === 'number' && fileSize > MAX_MB * 1024 * 1024) {
      return NextResponse.json({ error: `La imagen pesa ${(fileSize / 1024 / 1024).toFixed(0)} MB y el mÃ¡ximo es ${MAX_MB} MB.` }, { status: 413 })
    }

    const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
    const missing: string[] = []
    if (!supabaseUrl) missing.push('SUPABASE_URL')
    if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Falta configurar en Netlify: ${missing.join(', ')}. AgrÃ©gala en Environment variables y haz un redeploy.` },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${session.user.id}/${Date.now()}-${safeName}`

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path)
    if (error || !data) {
      const m = error?.message || ''
      const friendly = /bucket/i.test(m) && /not found/i.test(m)
        ? 'No existe el bucket "journal" en Supabase Storage. CreÃ¡lo (pÃºblico) con ese nombre exacto.'
        : `Supabase no pudo preparar la subida: ${m || 'error desconocido'}`
      return NextResponse.json({ error: friendly }, { status: 500 })
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)

    return NextResponse.json({ success: true, path, token: data.token, url: pub.publicUrl })
  } catch (err: any) {
    console.error('journal/upload:', err)
    return NextResponse.json({ error: err?.message || 'Error interno del servidor' }, { status: 500 })
  }
}
