import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { userId, status } = body

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { status },
    })

    return NextResponse.json({ success: true, user: updated })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 })
  }
}