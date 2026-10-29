import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import { visibleLevels } from '@/lib/access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function youtubeId(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0] || null
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') return u.searchParams.get('v')
      const parts = u.pathname.split('/')
      if (['embed', 'shorts', 'live'].includes(parts[1])) return parts[2] || null
    }
  } catch {}
  return null
}

function vimeoEmbed(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.replace(/^www\./, '') !== 'vimeo.com') return null
    const id = u.pathname.split('/').filter(Boolean)[0]
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}?title=0&byline=0&portrait=0` : null
  } catch {
    return null
  }
}

export async function GET(req: Request) {
  try {
    const session: any = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

    const lessonId = new URL(req.url).searchParams.get('lessonId') || ''
    if (!lessonId) return NextResponse.json({ error: 'Falta la lección' }, { status: 400 })

    const lesson = await prismaDash.lesson.findUnique({ where: { id: lessonId }, include: { module: true } })
    if (!lesson || !lesson.isPublished || !lesson.module.isPublished) {
      return NextResponse.json({ error: 'La lección no existe' }, { status: 404 })
    }

    const levels = visibleLevels(session.user.role)
    if (levels && !levels.includes(lesson.allowedRole)) {
      return NextResponse.json({ error: 'No tienes acceso a esta lección' }, { status: 403 })
    }

    const watermark = session.user.email || session.user.name || 'Alumno'
    const url = lesson.videoUrl

    const yt = youtubeId(url)
    if (yt) return NextResponse.json({ type: 'youtube', id: yt, watermark })

    const vm = vimeoEmbed(url)
    if (vm) return NextResponse.json({ type: 'embed', src: vm, watermark })

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
    }

    return NextResponse.json({ type: 'file', url, watermark })
  } catch (err: any) {
    console.error('GET student/video:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}