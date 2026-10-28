import Link from 'next/link'
import { ArrowRight, Shield, Users, Clock } from 'lucide-react'

export function Hero() {
  return (
    <section className="pt-14 pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
      {/* Subtítulo naranja suave estilo imagen */}
      <span className="text-[11px] font-bold text-[#e25822] tracking-wider uppercase inline-block mb-3 bg-[#fff4ef] border border-[#fcd5c3] px-3 py-1 rounded-full">
        MENTORÍA INSTITUCIONAL EXCLUSIVA
      </span>

      {/* Titular limpio y legible */}
      <h1 className="text-3xl sm:text-5xl font-black text-[#1d1d1f] tracking-tight leading-tight">
        Aprende a Operar con Metodología y Criterio Profesional
      </h1>

      <p className="text-[#6e6e73] text-[15px] sm:text-[16px] max-w-2xl mx-auto mt-4 leading-relaxed font-normal">
        Un programa estructurado paso a paso con clases en video, gestión de riesgo y acompañamiento para que logres consistencia en tu operativa.
      </p>

      {/* Botones de llamada a la acción */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
        <Link
          href="/register"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#e25822] hover:bg-[#cf4c17] active:scale-95 text-white text-[13px] font-semibold transition-all shadow-[0_2px_10px_rgba(226,88,34,0.3)] flex items-center justify-center gap-2"
        >
          <span>Solicitar Acceso a la Mentoría</span>
          <ArrowRight size={15} />
        </Link>
        <Link
          href="/login"
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#e5e5ea] hover:bg-[#f8f8fa] text-[#444] text-[13px] font-semibold transition-all"
        >
          Ya soy miembro &middot; Iniciar Sesión
        </Link>
      </div>

      {/* Tres puntos clave debajo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto mt-12 pt-8 border-t border-[#f0f0f4] text-[12px] text-[#6e6e73]">
        <div className="flex items-center justify-center gap-2">
          <Shield size={15} className="text-[#e25822]" />
          <span>Acceso validado y exclusivo</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Clock size={15} className="text-[#e25822]" />
          <span>Clases grabadas a tu propio ritmo</span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <Users size={15} className="text-[#e25822]" />
          <span>Comunidad privada de traders</span>
        </div>
      </div>
    </section>
  )
}
