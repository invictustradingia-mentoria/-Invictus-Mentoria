import { ReactNode } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ActivityTracker } from '@/components/ActivityTracker'
import { DashboardNav } from './DashboardNav'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect('/login')
  }

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      isBanned: true,
      progress: {
        where: { completed: true },
      },
    },
  })

  if (!user || user.isBanned) {
    redirect('/login?error=BANNED')
  }

  const totalLessons = await prisma.lesson.count()
  const completedCount = user.progress.length
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  const initials = user.name
    ? user.name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'U'

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col md:flex-row text-[#2d2d2d] font-sans antialiased">
      {/* Silent activity tracker */}
      <ActivityTracker />

      {/* Sidebar estilo Apple / Etsy Master */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#ededf0] flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Brand Header */}
          <div className="px-6 pt-7 pb-5">
            <Link href="/" className="inline-block">
              <h1 className="text-[17px] font-black tracking-tight flex items-center gap-1 text-[#2d2d2d]">
                <span>INVICTUS</span>
                <span className="text-[#e25822] font-extrabold">MASTER</span>
              </h1>
            </Link>
          </div>

          {/* User Profile avatar + Progreso del curso */}
          <div className="px-6 py-4">
            <div className="flex items-center gap-3 mb-4">
              <Link href="/dashboard/profile" className="shrink-0 group">
                <div className="w-10 h-10 rounded-full bg-[#fdeee7] text-[#e25822] font-bold text-xs flex items-center justify-center border border-[#fcd5c3] overflow-hidden group-hover:border-[#e25822] transition-colors">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
              </Link>
              <div className="min-w-0">
                <Link
                  href="/dashboard/profile"
                  className="text-[13px] font-bold text-[#1d1d1f] truncate leading-tight block hover:text-[#e25822] transition-colors"
                >
                  {user.name}
                </Link>
                <p className="text-[11px] text-[#86868b] leading-tight mt-0.5">
                  Acceso completo
                </p>
              </div>
            </div>

            {/* Progreso del curso bar */}
            <div>
              <div className="flex items-center justify-between text-[11px] mb-1.5 font-medium">
                <span className="text-[#86868b]">Progreso del curso</span>
                <span className="text-[#e25822] font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full bg-[#f0f0f4] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#e25822] h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic client-aware sidebar navigation */}
        <DashboardNav role={user.role} />
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-[#fcfcfd]">
        {children}
      </main>
    </div>
  )
}
