import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const BUCKET = 'videos'

export async function POST(req: Request) {
  try {
    // Solo administradores
    const session: any = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { fileName } = await req.json()
    if (!fileName || typeof fileName !== 'string') {
      return NextResponse.json({ error: 'Falta el nombre del archivo' }, { status: 400 })
    }

    const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
    const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()

    const missing: string[] = []
    if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
    if (!serviceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY')

    if (missing.length > 0) {
      return NextResponse.json(
        {
          error: `El servidor no ve estas variables: ${missing.join(', ')}. Revisa el nombre, que tengan alcance Functions/Runtime en Netlify y haz un redeploy.`,
        },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    })

    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_')
    const path = `${Date.now()}-${safeName}`

    const { data, error } = await supabase.storage.from(BUCKET).createSignedUploadUrl(path)
    if (error || !data) {
      return NextResponse.json(
        { error: error?.message || 'No se pudo crear la URL de subida' },
        { status: 500 }
      )
    }

    const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)

    return NextResponse.json({
      success: true,
      path,
      token: data.token,
      url: pub.publicUrl,
    })
  } catch (err: any) {
    console.error('Error en /api/admin/upload:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}