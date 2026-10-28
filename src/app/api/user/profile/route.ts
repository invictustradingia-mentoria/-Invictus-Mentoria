import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

// GET - Fetch current user profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const userId = (session.user as any).id
    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario no encontrado' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
        createdAt: true,
        registeredIp: true,
        _count: {
          select: {
            progress: true,
            activityLogs: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: 'Error al obtener perfil' }, { status: 500 })
  }
}

// PATCH - Update user profile (name, phone, avatarUrl, password)
export async function PATCH(req: NextRequest) {
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
    const { name, phone, avatarUrl, currentPassword, newPassword } = body

    const updateData: any = {}

    if (name?.trim()) updateData.name = name.trim()
    if (phone !== undefined) updateData.phone = phone || null
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl || null

    // Password change flow
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Debes proporcionar tu contraseña actual para cambiarla.' },
          { status: 400 }
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'La nueva contraseña debe tener al menos 6 caracteres.' },
          { status: 400 }
        )
      }

      // Verify current password
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { password: true } })
      if (!user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })

      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return NextResponse.json({ error: 'La contraseña actual no es correcta.' }, { status: 400 })
      }

      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No se proporcionaron datos para actualizar.' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 })
  }
}
