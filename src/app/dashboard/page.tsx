import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { StudentPlayer } from './StudentPlayer'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as any)?.id

  const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          registeredIp: true,
        },
      })
    : null

  const userRole = user?.role || 'CLUB'

  // Consulta protegida de módulos y clases filtradas estrictamente por rol
  const modules = await prisma.module.findMany({
    where: { isPublished: true },
    orderBy: { order: 'asc' },
    include: {
      lessons: {
        where: {
          isPublished: true,
          ...(userRole !== 'ADMIN'
            ? userRole === 'MENTORIA'
              ? { allowedRole: { in: ['CLUB', 'MENTORIA'] } }
              : { allowedRole: 'CLUB' }
            : {}),
        },
        orderBy: { order: 'asc' },
        include: {
          progress: {
            where: { userId: userId || '' },
          },
        },
      },
    },
  })

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <StudentPlayer
        modules={modules}
        userId={userId || ''}
        studentName={user?.name || ''}
        studentEmail={user?.email || ''}
        studentIp={user?.registeredIp || '127.0.0.1'}
      />
    </div>
  )
}