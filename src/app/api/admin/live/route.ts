import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 })
    }

    // Active in last 3 minutes
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000)

    const activeSessions = await prisma.session.findMany({
      where: {
        lastSeen: { gte: threeMinutesAgo },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            isBanned: true,
            registeredIp: true,
          },
        },
      },
      orderBy: { lastSeen: 'desc' },
    })

    // General recent logs
    const recentLogs = await prisma.activityLog.findMany({
      take: 25,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    // Specific security alerts (recording attempts, screenshot attempts, devtools)
    const securityAlerts = await prisma.activityLog.findMany({
      where: {
        action: {
          startsWith: 'SECURITY_',
        },
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            isBanned: true,
            registeredIp: true,
          },
        },
        lesson: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json({
      activeUsers: activeSessions,
      recentLogs,
      securityAlerts,
    })
  } catch (error) {
    console.error('Live activity fetch error:', error)
    return NextResponse.json({ error: 'Error al obtener actividad en vivo' }, { status: 500 })
  }
}
