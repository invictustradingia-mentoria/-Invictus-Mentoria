'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, ShieldCheck, LayoutDashboard, LogOut } from 'lucide-react'

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session, status } = useSession()
  const role = (session?.user as any)?.role

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#ededf0]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Identical to sidebar image */}
        <Link href="/" className="inline-block">
          <h1 className="text-[17px] font-black tracking-tight flex items-center gap-1 text-[#2d2d2d]">
            <span>INVICTUS</span>
            <span className="text-[#e25822] font-extrabold">MASTER</span>
          </h1>
        </Link>

        {/* Links simples y limpios */}
        <nav className="hidden md:flex items-center gap-7 text-[13px] text-[#555] font-medium">
          <a href="#metodo" className="hover:text-[#e25822] transition-colors">
            Metodología
          </a>
          <a href="#faq" className="hover:text-[#e25822] transition-colors">
            Preguntas Frecuentes
          </a>
        </nav>

        {/* CTAs / Session */}
        <div className="hidden md:flex items-center gap-2.5">
          {status === 'authenticated' && session?.user ? (
            <div className="flex items-center gap-2">
              {role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#f8f4fe] text-[#8a38ec] border border-[#ecdcfd] hover:bg-[#f3eafd] transition-all"
                >
                  <ShieldCheck size={14} />
                  Panel Admin
                </Link>
              )}

              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e25822] hover:bg-[#cf4c17] text-white text-xs font-semibold shadow-sm transition-all"
              >
                <LayoutDashboard size={14} />
                Mi Aula
              </Link>

              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="p-2 rounded-lg text-[#999] hover:text-red-500 hover:bg-red-50 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl border border-[#e5e5ea] text-[#444] hover:text-[#111] hover:bg-[#f8f8fa] text-xs font-semibold transition-all"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl bg-[#e25822] hover:bg-[#cf4c17] text-white text-xs font-semibold shadow-[0_2px_8px_rgba(226,88,34,0.25)] transition-all"
              >
                Solicitar Acceso
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-[#666] hover:text-[#111] p-1"
          aria-label="Abrir menú"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-[#ededf0] px-4 py-4 space-y-3 text-[13px]">
          <a
            href="#metodo"
            onClick={() => setMobileOpen(false)}
            className="block text-[#555] hover:text-[#e25822]"
          >
            Metodología
          </a>
          <a
            href="#faq"
            onClick={() => setMobileOpen(false)}
            className="block text-[#555] hover:text-[#e25822]"
          >
            Preguntas Frecuentes
          </a>
          <div className="pt-2 flex flex-col gap-2">
            <Link
              href="/login"
              className="text-center py-2 rounded-xl border border-[#e5e5ea] text-xs font-semibold"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/register"
              className="text-center py-2 rounded-xl bg-[#e25822] text-white text-xs font-semibold"
            >
              Solicitar Acceso
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
