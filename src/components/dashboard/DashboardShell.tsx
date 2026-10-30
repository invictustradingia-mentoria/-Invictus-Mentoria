'use client'
import ActivityTracker from '@/components/dashboard/ActivityTracker'
import { useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { PlayCircle, UserCircle2, ShieldCheck, LogOut, Menu, X, Crown, Star, MessageSquare, Video } from 'lucide-react'
import { getMembership } from '@/lib/membership'

interface ShellUser {
  name: string | null
  email: string
  role: string
  avatarUrl: string | null
}

export function Avatar({ name, email, avatarUrl, size = 40 }: { name?: string | null; email?: string; avatarUrl?: string | null; size?: number }) {
  const initials = (name || email || '?').trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')
  if (avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={avatarUrl} alt="Foto de perfil" style={{ width: size, height: size }} className="shrink-0 rounded-full object-cover ring-2 ring-white" />
  }
  return (
    <span style={{ width: size, height: size, fontSize: size * 0.38 }} className="flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 font-black text-white ring-2 ring-white">
      {initials}
    </span>
  )
}

export default function DashboardShell({ user, children }: { user: ShellUser; children: ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const m = getMembership(user.role)
  const MIcon = m.key === 'MENTORIA' ? Crown : m.key === 'ADMIN' ? ShieldCheck : Star

  const nav = [
    { href: '/dashboard/clases', label: 'Mis clases', icon: PlayCircle },
    { href: '/dashboard/chat', label: 'Comunidad', icon: MessageSquare },
    { href: '/dashboard/llamadas', label: 'Llamadas en vivo', icon: Video },
    { href: '/dashboard/perfil', label: 'Mi perfil', icon: UserCircle2 },
  ]

  // Las páginas nuevas (chat y llamadas) llevan un margen alrededor.
  const padded = !!pathname && (pathname.startsWith('/dashboard/chat') || pathname.startsWith('/dashboard/llamadas'))

  const sidebar = (
    <div className="flex h-full flex-col">
      <Link href="/dashboard/clases" className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-cyan-400 text-xs font-black text-white shadow-md shadow-sky-300/50">IC</span>
        <span className="text-sm font-black tracking-tight text-slate-900">INVICTUS <span className="text-sky-500">CAMPUS</span></span>
      </Link>

      {/* Tarjeta de membresía */}
      <div className="px-4">
        <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${m.gradient} p-4 text-white shadow-lg ${m.glow}`}>
          <MIcon size={64} className="absolute -right-3 -top-3 opacity-20" />
          <div className="relative flex items-center gap-3">
            <Avatar name={user.name} email={user.email} avatarUrl={user.avatarUrl} size={44} />
            <div className="min-w-0">
              <p className="truncate text-sm font-black leading-tight">{user.name || 'Alumno'}</p>
              <p className="truncate text-[10px] text-white/80">{user.email}</p>
            </div>
          </div>
          <div className="relative mt-3 flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider backdrop-blur">
            <MIcon size={13} /> {m.title}
          </div>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-1 px-3">
        {nav.map((n) => {
          const active = pathname?.startsWith(n.href)
          return (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold transition-all ${active ? 'bg-sky-50 text-sky-700 ring-1 ring-sky-200' : 'text-slate-600 hover:bg-slate-50'}`}>
              <n.icon size={17} /> {n.label}
            </Link>
          )
        })}
        {user.role === 'ADMIN' && (
          <Link href="/admin" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-orange-600 hover:bg-orange-50">
            <ShieldCheck size={17} /> Panel de Administración
          </Link>
        )}
      </nav>

      <div className="border-t border-slate-100 p-3">
        <button type="button" onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 cursor-pointer">
          <LogOut size={17} /> Cerrar sesión
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800">
      <ActivityTracker />
      {/* Barra móvil */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="text-sm font-black text-slate-900">INVICTUS <span className="text-sky-500">CAMPUS</span></span>
        <button type="button" onClick={() => setOpen(!open)} aria-label="Menú" className="rounded-lg p-1.5 text-slate-700 cursor-pointer">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Menú móvil */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl">{sidebar}</aside>
        </div>
      )}

      {/* Menú escritorio */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-slate-200 bg-white lg:block">{sidebar}</aside>

      <main className="lg:pl-64">
        <div className={padded ? 'p-3 sm:p-6' : ''}>{children}</div>
      </main>
    </div>
  )
}