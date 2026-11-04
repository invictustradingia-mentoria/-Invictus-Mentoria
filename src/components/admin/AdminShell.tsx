'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Users, Radio, BookOpen, ExternalLink, LogOut, Menu, X, MessageSquare, Video, LifeBuoy, Star, FolderOpen, LineChart } from 'lucide-react'
import { EDITOR_PATHS } from '@/lib/access'
import ThemeToggle from '@/components/ThemeToggle'

const NAV = [
  { href: '/admin', label: 'GestiÃ³n de Alumnos', icon: Users, exact: true },
  { href: '/admin/live', label: 'Live Activity', icon: Radio },
  { href: '/admin/content', label: 'Gestor de Contenido', icon: BookOpen },
  { href: '/admin/chat', label: 'Chat de la Comunidad', icon: MessageSquare },
  { href: '/admin/llamadas', label: 'Llamadas de Zoom', icon: Video },
  { href: '/admin/soporte', label: 'Soporte', icon: LifeBuoy },
  { href: '/admin/testimonios', label: 'Testimonios', icon: Star },
  { href: '/admin/recursos', label: 'Recursos', icon: FolderOpen },
  { href: '/admin/journal', label: 'Trading Journal', icon: LineChart },
]

export default function AdminShell({ name, role, children }: { name: string; role?: string; children: ReactNode }) {
  const pathname = usePathname() || ''
  const router = useRouter()
  const isEditor = role === 'EDITOR'
  const nav = isEditor ? NAV.filter((n) => EDITOR_PATHS.includes(n.href)) : NAV
  // El editor solo puede entrar a sus secciones; cualquier otra lo lleva al Gestor de Contenido.
  const blocked = isEditor && !EDITOR_PATHS.some((p) => pathname.startsWith(p))
  useEffect(() => {
    if (blocked) router.replace('/admin/content')
  }, [blocked, router])
  const [open, setOpen] = useState(false)
  const padded = ['/admin/chat', '/admin/llamadas', '/admin/soporte'].some((p) => pathname.startsWith(p))

  const side = (
    <div className="flex h-full flex-col">
      <div className="px-6 py-6">
        <p className="text-lg font-black tracking-tight text-[#1d1d1f]">INVICTUS <span className="text-[#0284c7]">{isEditor ? 'EDITOR' : 'ADMIN'}</span></p>
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{isEditor ? 'Panel de ediciÃ³n' : 'Panel de administraciÃ³n'}</p>
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map((n) => {
          const active = n.exact ? pathname === n.href : pathname.startsWith(n.href)
          return (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold transition-all ${active ? 'bg-[#f0f9ff] text-[#0284c7]' : 'text-gray-600 hover:bg-gray-50'}`}>
              <n.icon size={17} /> {n.label}
            </Link>
          )
        })}
      </nav>
      <div className="space-y-1 border-t border-gray-100 p-3">
        <Link href="/dashboard/clases" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-500 hover:bg-gray-50"><ExternalLink size={16} /> Ver modo alumno</Link>
        <p className="truncate px-3 pt-1 text-[11px] font-bold text-gray-700">{name}{isEditor && <span className="ml-1.5 rounded-md bg-indigo-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-indigo-700">Editor</span>}</p>
        <ThemeToggle />
        <button type="button" onClick={() => signOut({ callbackUrl: '/login' })} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-500 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"><LogOut size={16} /> Cerrar sesiÃ³n</button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#fdfdfd]">
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
        <span className="text-sm font-black text-[#1d1d1f]">INVICTUS <span className="text-[#0284c7]">{isEditor ? 'EDITOR' : 'ADMIN'}</span></span>
        <div className="flex items-center gap-1"><ThemeToggle variant="icon" /><button type="button" onClick={() => setOpen(!open)} aria-label="MenÃº" className="rounded-lg p-1.5 cursor-pointer">{open ? <X size={22} /> : <Menu size={22} />}</button></div>
      </div>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-2xl">{side}</aside>
        </div>
      )}
      <aside className="fixed inset-y-0 left-0 hidden w-64 border-r border-gray-200 bg-white lg:block">{side}</aside>
      <main className="min-w-0 lg:pl-64">
        <div className={padded ? 'p-4 sm:p-6 lg:p-8' : ''}>{blocked ? null : children}</div>
      </main>
    </div>
  )
}
