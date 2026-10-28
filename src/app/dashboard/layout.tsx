'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  BookOpen, 
  Video, 
  TrendingUp, 
  User, 
  LogOut, 
  Menu, 
  X,
  ShieldCheck
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#fdfdfd] flex items-center justify-center">
        <div className="text-xs font-bold text-gray-400 animate-pulse">Cargando plataforma...</div>
      </div>
    )
  }

  const user = session?.user as any

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1d1d1f] flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-[#ededf0] bg-white p-6 justify-between shrink-0">
        <div className="space-y-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#e25822] text-white flex items-center justify-center font-black text-xs shadow-sm">
              IT
            </div>
            <span className="font-black text-xs tracking-tight text-[#1d1d1f]">INVICTUS MENTORIA</span>
          </div>

          <nav className="space-y-1">
            <a
              href="/dashboard"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-[#f4f4f6] text-[#1d1d1f] transition-all"
            >
              <LayoutDashboard size={16} /> Panel Principal
            </a>
            <a
              href="/dashboard/clases"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-[#1d1d1f] hover:bg-gray-50 transition-all"
            >
              <Video size={16} /> Clases y Grabaciones
            </a>
            <a
              href="/dashboard/material"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-[#1d1d1f] hover:bg-gray-50 transition-all"
            >
              <BookOpen size={16} /> Material Educativo
            </a>
            <a
              href="/dashboard/operativa"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-[#1d1d1f] hover:bg-gray-50 transition-all"
            >
              <TrendingUp size={16} /> Bitácora / Operativa
            </a>

            {user?.role === 'ADMIN' && (
              <a
                href="/admin"
                className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#e25822] hover:bg-orange-50 transition-all pt-4"
              >
                <ShieldCheck size={16} /> Panel de Administración
              </a>
            )}
          </nav>
        </div>

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name ?? ''}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={18} className="text-gray-400" />
              )}
            </div>
            <div className="overflow-hidden text-ellipsis">
              <p className="text-xs font-bold text-[#1d1d1f] truncate">{user?.name || 'Alumno'}</p>
              <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>

          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
          >
            <LogOut size={14} /> Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Header Mobile */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#e25822] text-white flex items-center justify-center font-black text-xs">
            IT
          </div>
          <span className="font-black text-xs text-[#1d1d1f]">INVICTUS</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 focus:outline-none"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 p-4 space-y-3">
          <nav className="space-y-1">
            <a href="/dashboard" className="block px-3 py-2 text-xs font-bold text-[#1d1d1f]">Panel Principal</a>
            <a href="/dashboard/clases" className="block px-3 py-2 text-xs font-bold text-gray-500">Clases</a>
            <a href="/dashboard/material" className="block px-3 py-2 text-xs font-bold text-gray-500">Material</a>
            <a href="/dashboard/operativa" className="block px-3 py-2 text-xs font-bold text-gray-500">Operativa</a>
            {user?.role === 'ADMIN' && (
              <a href="/admin" className="block px-3 py-2 text-xs font-bold text-[#e25822]">Administración</a>
            )}
          </nav>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600"
          >
            Cerrar Sesión
          </button>
        </div>
      )}

      {/* Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}