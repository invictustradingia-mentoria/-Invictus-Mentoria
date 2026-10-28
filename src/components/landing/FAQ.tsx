'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: '¿Cómo obtengo acceso a la plataforma?',
    a: 'Debes completar el formulario de solicitud en Registro. El Administrador revisará tus datos y activará tu cuenta en la plataforma.',
  },
  {
    q: '¿Las clases son en vivo o grabadas?',
    a: 'Las clases principales están grabadas en alta definición y organizadas por módulos en el área de alumnos para que las estudies a tu propio ritmo cuantas veces necesites.',
  },
  {
    q: '¿Necesito experiencia previa?',
    a: 'No. El curso inicia desde el Módulo 1 con los fundamentos esenciales y avanza progresivamente hacia el análisis institucional y la psicología de trading.',
  },
  {
    q: '¿Tengo acceso de por vida?',
    a: 'Sí. Una vez aprobada tu cuenta por la administración, mantienes tu acceso completo a las clases y a las futuras actualizaciones del contenido.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <span className="text-[11px] font-bold text-[#e25822] tracking-wider uppercase block">
          RESOLVEMOS TUS DUDAS
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight mt-1">
          Preguntas Frecuentes
        </h2>
      </div>

      <div className="space-y-2.5 max-w-2xl mx-auto">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="rounded-2xl border border-[#ededf0] bg-white overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-[#fafafc] transition-colors"
            >
              <span className="font-semibold text-[#1d1d1f] text-[13px] pr-4">
                {faq.q}
              </span>
              <ChevronDown
                size={16}
                className={`text-[#999] transition-transform duration-200 shrink-0 ${
                  open === i ? 'rotate-180 text-[#e25822]' : ''
                }`}
              />
            </button>
            {open === i && (
              <div className="px-5 pb-4 pt-1 text-[12px] text-[#6e6e73] leading-relaxed border-t border-[#f4f4f7]">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
