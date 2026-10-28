import { ReactNode } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import {
  TrendingUp,
  LayoutDashboard,
  Users,
  Radio,
  BookOpen,
  LogOut,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex flex-col md:flex-row text-[#2d2d2d] font-sans antialiased">
      {/* Sidebar Apple Clean White */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-[#ededf0] flex flex-col justify-between shrink-0 select-none">
        <div>
          {/* Brand */}
          <div className="px-6 pt-7 pb-5 border-b border-[#f4f4f7]">
            <Link href="/" className="inline-block">
              <h1 className="text-[17px] font-black tracking-tight flex items-center gap-1.5 text-[#2d2d2d]">
                <span>INVICTUS</span>
                <span className="text-[#e25822] font-extrabold">ADMIN</span>
              </h1>
              <span className="text-[10px] text-[#86868b] uppercase tracking-wider font-semibold block mt-0.5">
                Panel de Administración
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1 mt-2 text-[13px]">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-[#1d1d1f] hover:bg-[#f8f8fa] hover:text-[#e25822] transition-colors"
            >
              <Users size={17} className="text-[#e25822]" />
              <span>Gestión de Alumnos</span>
            </Link>

            <Link
              href="/admin/live"
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-[#1d1d1f] hover:bg-[#f8f8fa] hover:text-[#e25822] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Radio size={17} className="text-[#e25822] animate-pulse" />
                <span>Live Activity</span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#e25822] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#e25822]"></span>
              </span>
            </Link>

            <Link
              href="/admin/content"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-[#1d1d1f] hover:bg-[#f8f8fa] hover:text-[#e25822] transition-colors"
            >
              <BookOpen size={17} className="text-[#e25822]" />
              <span>Gestor de Contenido</span>
            </Link>
          </nav>
        </div>

        {/* Footer info & view student mode */}
        <div className="p-4 border-t border-[#f0f0f4] space-y-2 text-[12px]">
          <Link
            href="/dashboard"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-[#6e6e73] hover:text-[#1d1d1f] hover:bg-[#f8f8fa] transition-colors"
          >
            <span className="flex items-center gap-2 font-medium">
              <LayoutDashboard size={14} className="text-[#e25822]" />
              Ver Modo Alumno
            </span>
            <ExternalLink size={12} />
          </Link>

          <div className="pt-2 flex items-center justify-between border-t border-[#f0f0f4]">
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-[#1d1d1f] truncate max-w-[130px]">
                {session?.user?.name || 'Administrador'}
              </span>
              <span className="text-[10px] text-[#e25822] font-semibold tracking-wider uppercase">
                ADMIN
              </span>
            </div>
            <Link
              href="/api/auth/signout"
              className="p-1.5 rounded-lg text-[#999] hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut size={15} />
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-[#fcfcfd]">
        {children}
      </main>
    </div>
  )
}
