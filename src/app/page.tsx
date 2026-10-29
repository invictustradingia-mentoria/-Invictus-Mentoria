'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
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
  BarChart3,
  Globe,
  Star,
  ChevronDown,
  Target,
  Clock,
  Award,
  Layers,
  Activity
} from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index)
  }

  const faqs = [
    {
      q: '¿Qué activo financiero se opera principalmente en el club?',
      a: 'Nos enfocamos exclusivamente en los futuros del Micro E-mini Nasdaq-100 (MNQ). Es el activo con mejor volatilidad y liquidez para la ejecución de la metodología ICT.'
    },
    {
      q: '¿Necesito experiencia previa para unirme a la mentoría?',
      a: 'No. La formación abarca desde los fundamentos de la lectura de velas y estructura de mercado hasta conceptos avanzados de liquidez institucional y gestión de riesgo.'
    },
    {
      q: '¿Las sesiones en vivo quedan grabadas?',
      a: 'Sí, absolutamente todas las sesiones operativas de la apertura de Nueva York y las clases teóricas quedan almacenadas en la plataforma en alta definición para ver en cualquier momento.'
    },
    {
      q: '¿Sirve esta metodología para superar pruebas de fondeo?',
      a: 'Totalmente. La gestión de riesgo estricta y los ratios riesgo-beneficio aplicados en MNQ están diseñados específicamente para cumplir las reglas de empresas de fondeo (Prop Firms).'
    }
  ]

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1d1d1f] flex flex-col justify-between selection:bg-[#0284c7] selection:text-white">
      
      {/* Header / Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-gray-100/80">
        <div className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#1d1d1f] text-white flex items-center justify-center font-black tracking-wider text-sm shadow-md shadow-black/5">
              IT
            </div>
            <div className="flex flex-col">
              <span className="font-black text-sm tracking-tight text-[#1d1d1f]">INVICTUS TRADING</span>
              <span className="text-[10px] text-[#0284c7] font-bold tracking-wider uppercase">Club & Mentoria MNQ</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-gray-500">
            <a href="#metodologia" className="hover:text-[#0284c7] transition-colors">Metodología</a>
            <a href="#beneficios" className="hover:text-[#0284c7] transition-colors">Beneficios</a>
            <a href="#testimonios" className="hover:text-[#0284c7] transition-colors">Comunidad</a>
            <a href="#faq" className="hover:text-[#0284c7] transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="text-xs text-gray-400 font-bold">Cargando...</div>
            ) : session ? (
              <a
                href="/admin"
                className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-all shadow-md shadow-sky-500/15 flex items-center gap-2"
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
                  className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#0284c7] transition-all shadow-sm"
                >
                  Registrarse
                </a>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-6xl mx-auto px-6 py-12 md:py-20 space-y-28">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-8 max-w-4xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f0f9ff] text-[#0369a1] text-xs font-bold border border-sky-100/80 shadow-sm">
            <Sparkles size={14} className="text-[#0284c7]" /> Formación de Alto Rendimiento en Futuros
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#1d1d1f] leading-[1.1]">
            Ejecución Profesional en <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0284c7] to-[#0369a1]">
              Micro Nasdaq (MNQ)
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed font-normal">
            Aprende a interpretar la huella institucional mediante conceptos avanzados de ICT, liquidez y gestión de capital adaptada a cuentas personales y de fondeo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href={session ? '/dashboard' : '/login'}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-bold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 group cursor-pointer"
            >
              Acceder a la Plataforma <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-xs font-bold bg-white border border-gray-200/80 text-[#1d1d1f] hover:bg-gray-50 transition-all shadow-sm text-center"
            >
              Solicitar Unirse al Club
            </a>
          </div>

          {/* Bar de Datos Rápidos */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto border-t border-gray-100">
            <div className="p-3">
              <div className="text-xl md:text-2xl font-black text-[#1d1d1f]">100%</div>
              <div className="text-[11px] text-gray-400 font-medium">Enfoque en MNQ</div>
            </div>
            <div className="p-3">
              <div className="text-xl md:text-2xl font-black text-[#0284c7]">Sesión NY</div>
              <div className="text-[11px] text-gray-400 font-medium">Operativa en Vivo</div>
            </div>
            <div className="p-3">
              <div className="text-xl md:text-2xl font-black text-[#1d1d1f]">ICT Spec</div>
              <div className="text-[11px] text-gray-400 font-medium">Metodología Precisa</div>
            </div>
            <div className="p-3">
              <div className="text-xl md:text-2xl font-black text-[#0284c7]">Prop Firms</div>
              <div className="text-[11px] text-gray-400 font-medium">Gestión de Riesgo</div>
            </div>
          </div>
        </section>

        {/* METODOLOGÍA / PILARES */}
        <section id="metodologia" className="space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#0369a1] text-xs font-bold">
              <Layers size={14} /> La Estrategia
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-[#1d1d1f] tracking-tight">
              Los 3 Pilares de Nuestra Operativa
            </h2>
            <p className="text-xs md:text-sm text-gray-500">
              Diseñados para eliminar la especulación ciega y enfocar la operativa en la liquidez del mercado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-[#ededf0] shadow-sm space-y-4 hover:border-sky-300 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#f0f9ff] text-[#0369a1] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Target size={22} />
              </div>
              <h3 className="text-lg font-black text-[#1d1d1f]">1. Identificación de Liquidez</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Aprende dónde están colocados los Stop Loss del público para anticipar las barridas institucionales antes de los impulsos clave.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#ededf0] shadow-sm space-y-4 hover:border-sky-300 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#f0f9ff] text-[#0369a1] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <Activity size={22} />
              </div>
              <h3 className="text-lg font-black text-[#1d1d1f]">2. Order Blocks & FVG</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Ubicación exacta de las huellas dejadas por los algoritmos interbancarios para entradas de bajo riesgo y alto beneficio.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#ededf0] shadow-sm space-y-4 hover:border-sky-300 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#f0f9ff] text-[#0369a1] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
                <BarChart3 size={22} />
              </div>
              <h3 className="text-lg font-black text-[#1d1d1f]">3. Gestión de Capital Estricta</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Reglas cuantitativas de riesgo diario para proteger tu cuenta y maximizar las métricas de aprobación en evaluaciones.
              </p>
            </div>
          </div>
        </section>

        {/* BENEFICIOS / ECOSISTEMA */}
        <section id="beneficios" className="bg-white border border-[#ededf0] rounded-3xl p-8 md:p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f0f9ff] text-[#0369a1] text-xs font-bold">
              <Zap size={14} /> Ecosistema Completo
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#1d1d1f] tracking-tight leading-snug">
              Todo lo que necesitas para tu desarrollo operativo
            </h2>
            <p className="text-xs md:text-sm text-gray-500 leading-relaxed">
              No es solo un curso más; es un centro de entrenamiento dinámico donde sigues la evolución del mercado día tras día.
            </p>
            <div className="space-y-3 pt-1">
              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-sky-100 text-[#0369a1] mt-0.5">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1d1d1f]">Transmisiones en Directo</h4>
                  <p className="text-[11px] text-gray-400">Análisis y toma de decisiones en la apertura de Nueva York.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-sky-100 text-[#0369a1] mt-0.5">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1d1d1f]">Librería de Clases y Grabaciones</h4>
                  <p className="text-[11px] text-gray-400">Biblioteca estructurada por niveles de aprendizaje.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-1 rounded-full bg-sky-100 text-[#0369a1] mt-0.5">
                  <CheckCircle2 size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#1d1d1f]">Comunidad Exclusiva de Discord</h4>
                  <p className="text-[11px] text-gray-400">Intercambio de análisis y soporte continuo entre alumnos.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#fafafa] p-6 md:p-8 rounded-3xl border border-gray-100 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200/60">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-xs font-bold text-[#1d1d1f]">Estado de Sala: Nueva York</span>
              </div>
              <span className="text-[10px] font-bold text-[#0284c7] bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                MNQ Active
              </span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-white border border-gray-100 text-xs flex justify-between items-center shadow-2xs">
                <span className="font-semibold text-gray-600">Apertura NY:</span>
                <span className="font-bold text-[#1d1d1f]">09:30 EST (EE. UU.)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-gray-100 text-xs flex justify-between items-center shadow-2xs">
                <span className="font-semibold text-gray-600">Instrumento:</span>
                <span className="font-bold text-[#0284c7]">Micro Nasdaq (MNQ)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white border border-gray-100 text-xs flex justify-between items-center shadow-2xs">
                <span className="font-semibold text-gray-600">Metodología:</span>
                <span className="font-bold text-[#1d1d1f]">Inner Circle Trader (ICT)</span>
              </div>
            </div>

            <a
              href="/register"
              className="w-full py-3 rounded-2xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#0284c7] transition-all text-center block shadow-sm"
            >
              Unirme a la Sala de Trading
            </a>
          </div>
        </section>

        {/* TESTIMONIOS */}
        <section id="testimonios" className="space-y-10">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 text-[#0369a1] text-xs font-bold">
              <Users size={14} /> La Experiencia del Club
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-[#1d1d1f] tracking-tight">
              Lo que opinan nuestros miembros
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#ededf0] shadow-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed italic">
                "Entender los Order Blocks en el MNQ cambió por completo mi operativa. Pasé de sobreoperar a buscar solo 1 o 2 ejecuciones de alta calidad por día."
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#1d1d1f]">Matías G.</span>
                <span className="text-[10px] text-gray-400 font-medium">Miembro Club</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#ededf0] shadow-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed italic">
                "La claridad para explicar la toma de liquidez en directo vale oro. Logré pasar mi primera prueba de fondeo de 50k aplicando el plan de riesgo."
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#1d1d1f]">Gonzalo R.</span>
                <span className="text-[10px] text-gray-400 font-medium">Trader Fondeado</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#ededf0] shadow-sm space-y-4">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} fill="currentColor" />
                ))}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed italic">
                "La comunidad de Discord y el orden que tiene la plataforma web te mantienen enfocado. Excelente acompañamiento profesional."
              </p>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-bold text-[#1d1d1f]">Ailén P.</span>
                <span className="text-[10px] text-gray-400 font-medium">Miembro Mentoría</span>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-black text-[#1d1d1f] tracking-tight">
              Preguntas Frecuentes
            </h2>
            <p className="text-xs text-gray-400">Resolvemos tus dudas antes de ingresar al club</p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white border border-[#ededf0] rounded-2xl overflow-hidden transition-all shadow-2xs"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left text-xs font-bold text-[#1d1d1f] flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50/50"
                >
                  <span>{faq.q}</span>
                  <ChevronDown 
                    size={16} 
                    className={`text-gray-400 transition-transform ${openFaq === idx ? 'rotate-180 text-[#0284c7]' : ''}`} 
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-4 text-xs text-gray-500 leading-relaxed border-t border-gray-50 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* CALLOUT FINAL */}
        <section className="bg-[#1d1d1f] text-white p-8 md:p-14 rounded-3xl shadow-lg shadow-black/10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0284c7]/20 text-[#38bdf8] text-xs font-bold border border-[#0284c7]/30">
              <Zap size={14} /> Acceso Inmediato
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">
              Eleva tu nivel operativo desde hoy
            </h3>
            <p className="text-xs md:text-sm text-gray-300 leading-relaxed">
              Únete a Invictus Trading y accede a la plataforma de mentoria, clases grabadas y salas de análisis en vivo.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <a
              href="/login"
              className="px-8 py-4 rounded-2xl text-xs font-bold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-all shadow-md text-center cursor-pointer"
            >
              Iniciar Sesión
            </a>
            <a
              href="/register"
              className="px-8 py-4 rounded-2xl text-xs font-bold bg-white/10 text-white hover:bg-white/20 transition-all text-center border border-white/10 cursor-pointer"
            >
              Registrarse
            </a>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 border-t border-gray-100 text-center text-xs text-gray-400 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span>&copy; {new Date().getFullYear()} Invictus Trading. Todos los derechos reservados.</span>
        <div className="flex items-center gap-6 font-medium">
          <a href="/login" className="hover:text-[#1d1d1f] transition-colors">Iniciar Sesión</a>
          <a href="/register" className="hover:text-[#1d1d1f] transition-colors">Registro</a>
        </div>
      </footer>
    </div>
  )
}