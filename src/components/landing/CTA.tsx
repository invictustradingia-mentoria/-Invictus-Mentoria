import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function CTA() {
  return (
    <section className="py-14 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="rounded-3xl border border-[#fcd5c3] bg-[#fffaf8] p-8 sm:p-12 text-center shadow-[0_2px_12px_rgba(226,88,34,0.06)] space-y-4">
        <span className="text-[11px] font-bold text-[#e25822] tracking-wider uppercase block">
          CUPOS LIMITADOS
        </span>
        <h2 className="text-2xl sm:text-4xl font-bold text-[#1d1d1f] tracking-tight">
          Comienza Tu Formación en Trading
        </h2>
        <p className="text-[14px] text-[#6e6e73] max-w-xl mx-auto leading-relaxed">
          Envía tu solicitud de registro. Una vez validada por el Administrador, podrás acceder de inmediato al aula virtual y comenzar tus clases.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#e25822] hover:bg-[#cf4c17] active:scale-95 text-white text-[13px] font-semibold transition-all shadow-[0_2px_10px_rgba(226,88,34,0.3)] flex items-center justify-center gap-2"
          >
            <span>Solicitar Acceso Ahora</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/login"
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-[#e5e5ea] hover:bg-[#f8f8fa] text-[#444] text-[13px] font-semibold transition-all"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </section>
  )
}
