import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { isStaff } from '@/lib/access'
import AdminShell from '@/components/admin/AdminShell'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session: any = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')
  // Administrador (todo el panel) o editor (solo contenido, chat, llamadas y soporte)
  if (!isStaff(session.user.role)) redirect('/dashboard/clases')
  return (
    <AdminShell role={session.user.role} name={session.user.name || session.user.email || 'Administrador'}>
      {children}
    </AdminShell>
  )
}
