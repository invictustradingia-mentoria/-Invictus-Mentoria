import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario no encontrado' }, { status: 400 })
    }

    const body = await req.json()
    const { action, page, lessonId, lessonTitle, metadata } = body

    const forwardedFor = req.headers.get('x-forwarded-for')
    const realIp = req.headers.get('x-real-ip')
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : (realIp || '127.0.0.1')
    const ua = req.headers.get('user-agent') || 'Unknown'

    // Update active session snapshot
    await prisma.session.upsert({
      where: { token: userId },
      update: {
        currentPage: page || '/dashboard',
        currentLesson: lessonTitle || null,
        lastSeen: new Date(),
        isActive: true,
        ip: clientIp,
        userAgent: ua,
      },
      create: {
        userId,
        token: userId,
        currentPage: page || '/dashboard',
        currentLesson: lessonTitle || null,
        lastSeen: new Date(),
        isActive: true,
        ip: clientIp,
        userAgent: ua,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    // Log Activity record if action specified
    if (action) {
      await prisma.activityLog.create({
        data: {
          userId,
          action,
          page: page || null,
          lessonId: lessonId || null,
          metadata: metadata ? JSON.stringify(metadata) : null,
          ip: clientIp,
          userAgent: ua,
        },
      })
    }

    return NextResponse.json({ success: true, timestamp: new Date() })
  } catch (error: any) {
    console.error('Tracking error:', error)
    return NextResponse.json({ error: 'Error al registrar actividad' }, { status: 500 })
  }
}
