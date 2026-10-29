import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import DashboardShell from '@/components/dashboard/DashboardShell'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const session: any = await getServerSession(authOptions)
  const id = session?.user?.id
  if (!id) redirect('/login')

  const user = await prismaDash.user.findUnique({
    where: { id },
    select: { name: true, email: true, role: true, avatarUrl: true, status: true, isBanned: true },
  })
  if (!user || user.isBanned || user.status !== 'APPROVED') redirect('/login')

  return (
    <DashboardShell user={{ name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl }}>
      {children}
    </DashboardShell>
  )
}