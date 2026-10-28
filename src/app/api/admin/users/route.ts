import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET Users with filter
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const statusFilter = searchParams.get('status') // PENDING, APPROVED, REJECTED, ALL

    const whereClause: any = {}
    if (statusFilter && statusFilter !== 'ALL') {
      whereClause.status = statusFilter
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        isBanned: true,
        registeredIp: true,
        userAgent: true,
        createdAt: true,
        sessions: {
          take: 1,
          orderBy: { lastSeen: 'desc' },
          select: {
            currentPage: true,
            currentLesson: true,
            lastSeen: true,
            ip: true,
          },
        },
        _count: {
          select: {
            activityLogs: true,
            progress: true,
          },
        },
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 })
  }
}

// PATCH User approval, role, and ban
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const body = await req.json()
    const { userId, role, status, isBanned } = body

    if (!userId) {
      return NextResponse.json({ error: 'Falta userId' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role !== undefined && { role }),
        ...(status !== undefined && { status }),
        ...(isBanned !== undefined && { isBanned }),
      },
    })

    // Log admin action
    try {
      await prisma.activityLog.create({
        data: {
          userId: (session.user as any).id,
          action: 'ADMIN_MODERATION',
          page: '/admin',
          metadata: JSON.stringify({ targetUserId: userId, role, status, isBanned }),
        },
      })
    } catch {
      // Ignore log error
    }

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar usuario' }, { status: 500 })
  }
}
