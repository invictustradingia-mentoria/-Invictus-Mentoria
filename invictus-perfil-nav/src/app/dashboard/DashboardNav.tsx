'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  PlayCircle,
  FolderOpen,
  Headphones,
  User,
  ShieldCheck,
  KeyRound,
  LogOut,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

export function DashboardNav({ role }: { role: string }) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Mis clases',
      icon: PlayCircle,
      exact: true,
    },
    {
      href: '/dashboard/resources',
      label: 'Recursos',
      icon: FolderOpen,
      exact: false,
    },
    {
      href: '/dashboard/support',
      label: 'Soporte',
      icon: Headphones,
      exact: false,
    },
    {
      href: '/dashboard/profile',
      label: 'Mi Perfil',
      icon: User,
      exact: false,
    },
  ]

  return (
    <div className="flex flex-col justify-between flex-1">
      <nav className="px-3.5 space-y-1.5 mt-2 text-[13px]">
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-full font-medium transition-all ${
                isActive
                  ? 'text-[#0284c7] bg-[#fffaf8] border border-[#fcd5c3] shadow-sm'
                  : 'text-[#555] hover:text-[#1d1d1f] hover:bg-[#f8f8fa]'
              }`}
            >
              <Icon
                size={16}
                className={isActive ? 'text-[#0284c7]' : 'text-[#888]'}
              />
              <span>{item.label}</span>
            </Link>
          )
        })}

        {role === 'ADMIN' && (
          <div className="pt-3">
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl font-semibold text-[#8a38ec] bg-[#f8f4fe] border border-[#ecdcfd] hover:bg-[#f3eafd] transition-colors"
            >
              <ShieldCheck size={16} />
              <span>Panel Administrador</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Footer Items del Sidebar */}
      <div className="p-4 border-t border-[#f0f0f4] space-y-1 text-[12px] text-[#777]">
        <Link
          href="/dashboard/profile"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
            pathname === '/dashboard/profile'
              ? 'text-[#0284c7] font-semibold bg-[#fffaf8]'
              : 'hover:text-[#111] hover:bg-[#f8f8fa]'
          }`}
        >
          <KeyRound size={14} className="text-[#999]" />
          <span>Seguridad y Contraseña</span>
        </Link>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#999] hover:text-red-500 hover:bg-red-50/50 transition-colors text-left"
        >
          <LogOut size={14} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </div>
  )
}
