import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import { visibleLevels } from '@/lib/access'
import { resolveVideo, cleanVideoInput } from '@/lib/video-source'
import { activeLock } from '@/lib/video-security'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const session: any = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const lessonId = new URL(req.url).searchParams.get('lessonId') || ''
    if (!lessonId) return NextResponse.json({ error: 'Falta la lección' }, { status: 400 })

    // Alumno bloqueado por seguridad: no se entrega el video hasta que un administrador lo habilite
    if (session.user.role !== 'ADMIN') {
      const lock = await activeLock(session.user.id)
      if (lock) {
        return NextResponse.json(
          { error: 'Acceso a videos suspendido por seguridad.', locked: true, reason: lock.reason },
          { status: 403 }
        )
      }
    }

    const lesson = await prismaDash.lesson.findUnique({ where: { id: lessonId }, include: { module: true } })
    if (!lesson || !lesson.isPublished || !lesson.module.isPublished) {
      return NextResponse.json({ error: 'La lección no existe' }, { status: 404 })
    }

    const levels = visibleLevels(session.user.role)
    if (levels && !levels.includes(lesson.allowedRole)) {
      return NextResponse.json({ error: 'No tienes acceso a esta lección' }, { status: 403 })
    }

    const watermark = session.user.email || session.user.name || 'Alumno'
    const url = cleanVideoInput(lesson.videoUrl) || String(lesson.videoUrl || '').trim()

    // Video subido a Supabase: enlace firmado de corta duración
    const marker = '/storage/v1/object/public/videos/'
    const idx = url.indexOf(marker)
    if (idx !== -1) {
      const path = decodeURIComponent(url.slice(idx + marker.length).split('?')[0])
      const supabaseUrl = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim()
      const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
      if (supabaseUrl && key) {
        const supabase = createClient(supabaseUrl, key, { auth: { persistSession: false } })
        const { data } = await supabase.storage.from('videos').createSignedUrl(path, 3600)
        if (data?.signedUrl) return NextResponse.json({ type: 'file', url: data.signedUrl, watermark })
      }
      return NextResponse.json({ type: 'file', url, watermark })
    }

    if (!/^https?:\/\//i.test(url)) return NextResponse.json({ error: 'El enlace del video no es válido.' }, { status: 422 })

    const r = resolveVideo(url)
    if (r.type === 'youtube') return NextResponse.json({ type: 'youtube', id: r.id, watermark })
    if (r.type === 'hls') return NextResponse.json({ type: 'hls', url: r.url, watermark })
    if (r.type === 'file') return NextResponse.json({ type: 'file', url: r.url, watermark })
    return NextResponse.json({ type: 'embed', src: r.src, watermark })
  } catch (err: any) {
    console.error('GET student/video:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}