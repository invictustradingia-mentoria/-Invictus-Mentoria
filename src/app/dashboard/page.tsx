'use client'

export const dynamic = 'force-dynamic'

import { useSession } from 'next-auth/react'
import { 
  TrendingUp, 
  Video, 
  BookOpen, 
  ArrowUpRight, 
  PlayCircle, 
  ShieldCheck, 
  Clock, 
  Sparkles
} from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()
  const user = session?.user as any

  return (
    <div className="space-y-8 pb-12 selection:bg-[#0284c7] selection:text-white">
      {/* Banner de Bienvenida */}
      <div className="relative overflow-hidden bg-white border border-[#ededf0] rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[#f0f9ff] rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f9ff] text-[#0369a1] text-xs font-bold border border-sky-100 shadow-sm">
              <Sparkles size={13} className="text-[#0284c7]" /> Área Exclusiva de Club y Mentoría MNQ
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-[#1d1d1f]">
              Bienvenido de nuevo, <span className="text-[#0284c7]">{user?.name || 'Trader'}</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-500 max-w-xl">
              Tu enfoque principal es el Nasdaq (MNQ) bajo la metodología ICT y ejecución institucional. Revisa tus clases pendientes y la operativa de hoy.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/dashboard/clases"
              className="px-5 py-3 rounded-2xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#0284c7] transition-all shadow-sm flex items-center gap-2"
            >
              <Video size={16} /> Ver Clases en Vivo
            </a>
          </div>
        </div>
      </div>

      {/* Grid de Estadísticas / Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#ededf0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-500">Activo Operado</span>
            <TrendingUp size={18} className="text-[#0284c7]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1d1d1f]">MNQ (Nasdaq)</h3>
            <p className="text-[10px] text-[#0284c7] font-bold flex items-center gap-1 mt-1">
              <ArrowUpRight size={12} /> Alta Precisión ICT
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#ededf0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-500">Nivel de Acceso</span>
            <ShieldCheck size={18} className="text-[#0284c7]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1d1d1f]">
              {user?.role === 'ADMIN' ? 'Administrador' : 'Miembro Club'}
            </h3>
            <p className="text-[10px] text-gray-400 mt-1">Acceso Completo Activo</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#ededf0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-500">Módulos Activos</span>
            <BookOpen size={18} className="text-[#0284c7]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1d1d1f]">Mentoria ICT</h3>
            <p className="text-[10px] text-gray-400 mt-1">Contenido actualizado</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#ededf0] shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-bold text-gray-500">Sesiones</span>
            <Clock size={18} className="text-[#0284c7]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[#1d1d1f]">En Vivo</h3>
            <p className="text-[10px] text-gray-400 mt-1">Sala de trading abierta</p>
          </div>
        </div>
      </div>

      {/* Sección Principal de Contenido / Accesos Directos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-[#ededf0] shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#0369a1] text-[11px] font-bold">
              <PlayCircle size={14} /> Destacado del Día
            </div>
            <h2 className="text-xl font-black text-[#1d1d1f]">Lectura de Order Blocks y Liquidez en MNQ</h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Domina la estructura de mercado de temporalidades menores y cómo identificar los puntos institucionales clave en la sesión de Nueva York operando Micro Nasdaq.
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
              <Clock size={14} className="text-[#0284c7]" /> Duración: 1h 45m • Nivel Avanzado
            </div>
            <a
              href="/dashboard/clases"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-all shadow-sm text-center flex items-center justify-center gap-2"
            >
              Reproducir Clase <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <div className="bg-[#1d1d1f] text-white p-6 md:p-8 rounded-3xl shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0284c7] text-white flex items-center justify-center font-black shadow-md">
              IT
            </div>
            <h3 className="text-lg font-black tracking-tight">Comunidad Invictus</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Comparte tus análisis de MNQ, revisa configuraciones con otros traders y potencia tu disciplina operativa.
            </p>
          </div>

          <a
            href="/dashboard/support"
            className="w-full py-3 rounded-xl text-xs font-bold bg-white text-[#1d1d1f] hover:bg-gray-100 transition-all text-center shadow-sm"
          >
            Soporte y Contacto
          </a>
        </div>
      </div>
    </div>
  )
}