'use client'

export const dynamic = 'force-dynamic'

import { useSession } from 'next-auth/react'
import { 
  Sparkles, 
  ShieldCheck, 
  ArrowRight, 
  TrendingUp, 
  Video, 
  Users, 
  CheckCircle2, 
  Zap, 
  Lock, 
  BarChart2 
} from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1d1d1f] flex flex-col justify-between selection:bg-[#e25822] selection:text-white">
      
      {/* Header / Nav */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center font-black tracking-wider text-sm shadow-sm">
            IT
          </div>
          <span className="font-black text-sm tracking-tight text-[#1d1d1f]">INVICTUS TRADING</span>
        </div>

        <div className="flex items-center gap-4">
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
            <div className="flex items-center gap-3">
              <a
                href="/login"
                className="text-xs font-bold text-gray-600 hover:text-[#1d1d1f] transition-all px-3 py-2"
              >
                Iniciar Sesión
              </a>
              <a
                href="/register"
                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#e25822] transition-all shadow-sm"
              >
                Registrarse
              </a>
            </div>
          )}
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="w-full max-w-6xl mx-auto px-6 py-16 md:py-24 space-y-20">
        
        {/* Hero Content */}
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#fff4ef] text-[#e25822] text-xs font-bold border border-orange-100 shadow-sm">
            <Sparkles size={14} /> Comunidad Exclusiva de Futuros y Metodología ICT
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#1d1d1f] leading-[1.1]">
            Domina el Mercado con <span className="text-[#e25822]">Invictus Trading</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Especialistas en operativa de <strong className="text-[#1d1d1f]">Micro Nasdaq (MNQ)</strong>. Aprende lectura institucional, gestión de riesgo y ejecución milimétrica en vivo junto a traders profesionales.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a
              href={session ? '/dashboard' : '/login'}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-bold bg-[#e25822] text-white hover:bg-[#c9491b] transition-all shadow-md flex items-center justify-center gap-2 group"
            >
              Acceder a la Plataforma <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-bold bg-white border border-gray-200 text-[#1d1d1f] hover:bg-gray-50 transition-all shadow-sm text-center"
            >
              Solicitar Membresía
            </a>
          </div>
        </div>

        {/* Value Grid / Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
          <div className="bg-white p-8 rounded-3xl border border-[#ededf0] shadow-sm space-y-4 hover:border-orange-200 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#fff4ef] text-[#e25822] flex items-center justify-center font-bold">
              <TrendingUp size={22} />
            </div>
            <h3 className="text-lg font-black text-[#1d1d1f]">Especialistas en MNQ</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Operamos exclusivamente Micro Nasdaq con reglas claras de scalping y swing intradía basadas en liquidez y order blocks.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#ededf0] shadow-sm space-y-4 hover:border-orange-200 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#fff4ef] text-[#e25822] flex items-center justify-center font-bold">
              <Video size={22} />
            </div>
            <h3 className="text-lg font-black text-[#1d1d1f]">Clases en Vivo</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Sesiones de operativa en tiempo real durante la apertura de Nueva York, análisis de pre-mercado y mentorías interactivas.
            </p>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#ededf0] shadow-sm space-y-4 hover:border-orange-200 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#fff4ef] text-[#e25822] flex items-center justify-center font-bold">
              <Users size={22} />
            </div>
            <h3 className="text-lg font-black text-[#1d1d1f]">Club Privado</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Forma parte de una comunidad enfocada en el crecimiento constante, compartiendo bitácoras, retroalimentación y mentalidad ganadora.
            </p>
          </div>
        </div>

        {/* Callout / Stats Section */}
        <div className="bg-[#1d1d1f] text-white p-8 md:p-12 rounded-3xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e25822]/20 text-[#e25822] text-xs font-bold border border-[#e25822]/30">
              <Zap size={14} /> Acceso Inmediato
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">¿Listo para llevar tu trading al siguiente nivel?</h3>
            <p className="text-xs md:text-sm text-gray-300">
              Desbloquea los módulos de formación avanzada, grabaciones exclusivas y herramientas del club hoy mismo.
            </p>
          </div>

          <a
            href="/login"
            className="px-8 py-4 rounded-2xl text-xs font-bold bg-[#e25822] text-white hover:bg-[#c9491b] transition-all shadow-md shrink-0"
          >
            Ingresar al Área de Miembros
          </a>
        </div>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-gray-100 text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>&copy; {new Date().getFullYear()} Invictus Trading. Todos los derechos reservados.</span>
        <div className="flex items-center gap-6">
          <a href="/login" className="hover:text-[#1d1d1f] transition-colors">Iniciar Sesión</a>
          <a href="/register" className="hover:text-[#1d1d1f] transition-colors">Registro</a>
        </div>
      </footer>
    </div>
  )
}