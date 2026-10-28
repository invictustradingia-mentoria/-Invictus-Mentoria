'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1d1d1f] flex flex-col justify-between">
      {/* Header / Nav */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center font-black tracking-wider text-sm shadow-sm">
            IT
          </div>
          <span className="font-black text-sm tracking-tight text-[#1d1d1f]">INVICTUS TRADING</span>
        </div>

        <div>
          {status === 'loading' ? (
            <div className="text-xs text-gray-400 font-bold">Cargando...</div>
          ) : session ? (
            <a
              href="/admin"
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#e25822] text-white hover:bg-[#c9491b] transition-all shadow-sm flex items-center gap-2"
            >
              <ShieldCheck size={16} /> Ir al Panel
            </a>
          ) : (
            <a
              href="/login"
              className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#e25822] transition-all shadow-sm"
            >
              Iniciar Sesión
            </a>
          )}
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="w-full max-w-5xl mx-auto px-6 py-16 text-center space-y-8 my-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff4ef] text-[#e25822] text-xs font-bold border border-orange-100 shadow-sm">
          <Sparkles size={14} /> Plataforma Oficial de Mentoría y Futuros
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-[#1d1d1f] leading-tight">
          Domina el Mercado con <span className="text-[#e25822]">Invictus Trading</span>
        </h1>

        <p className="text-sm md:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed">
          Accede a formación avanzada, clases exclusivas en vivo y estrategias de alta precisión en Nasdaq (MNQ) con acompañamiento profesional.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <a
            href={session ? '/dashboard' : '/login'}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#e25822] transition-all shadow-md flex items-center justify-center gap-2"
          >
            Acceder a la Plataforma <ArrowRight size={16} />
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-gray-100 text-center text-xs text-gray-400">
        &copy; {new Date().getFullYear()} Invictus Trading. Todos los derechos reservados.
      </footer>
    </div>
  )
}