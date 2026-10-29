import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import { ACCESS_LEVELS } from '@/lib/access'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const session: any = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    const videoUrl = typeof body.videoUrl === 'string' ? body.videoUrl.trim() : ''
    const moduleId = typeof body.moduleId === 'string' ? body.moduleId : ''
    const description = typeof body.description === 'string' ? body.description.trim() : ''
    const allowedRole = typeof body.allowedRole === 'string' ? body.allowedRole : 'ALL'

    if (!title) return NextResponse.json({ error: 'Falta el título de la clase' }, { status: 400 })
    if (!/^https?:\/\//i.test(videoUrl)) return NextResponse.json({ error: 'El enlace del video debe empezar con http:// o https://' }, { status: 400 })
    if (!ACCESS_LEVELS.includes(allowedRole)) return NextResponse.json({ error: 'Nivel de acceso no válido' }, { status: 400 })

    const mod = await prismaDash.module.findUnique({ where: { id: moduleId } })
    if (!mod) return NextResponse.json({ error: 'El módulo seleccionado no existe' }, { status: 400 })

    const count = await prismaDash.lesson.count({ where: { moduleId } })
    const d = parseInt(String(body.duration), 10)

    const lesson = await prismaDash.lesson.create({
      data: {
        title,
        description: description || null,
        videoUrl,
        duration: Number.isFinite(d) && d > 0 ? d : null,
        allowedRole,
        moduleId,
        order: count + 1,
        isPublished: true,
      },
    })

    return NextResponse.json({ success: true, lesson })
  } catch (err: any) {
    console.error('POST lessons:', err)
    return NextResponse.json({ error: err?.message || 'Error interno' }, { status: 500 })
  }
}