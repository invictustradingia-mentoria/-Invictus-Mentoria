import { Check, Play } from 'lucide-react'

const curriculum = [
  {
    order: 1,
    title: 'Fundamentos del Trading Profesional',
    desc: 'Estructura de los mercados financieros, tipos de participantes, plataformas y órdenes.',
    lessons: '3 clases',
  },
  {
    order: 2,
    title: 'Análisis Técnico Avanzado y SMC',
    desc: 'Lectura de velas japonesas, soportes institucionales, zonas de oferta/demanda y liquidez.',
    lessons: '3 clases',
  },
  {
    order: 3,
    title: 'Gestión del Riesgo y Capital',
    desc: 'El sistema 1%, ratio riesgo beneficio, control del drawdown y cálculo de lotaje.',
    lessons: '2 clases',
  },
  {
    order: 4,
    title: 'Psicología y Plan de Trading',
    desc: 'Control emocional, eliminación del FOMO, bitácora de operaciones y consistencia.',
    lessons: '2 clases',
  },
]

export function Modules() {
  return (
    <section id="programa" className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <span className="text-[11px] font-bold text-[#e25822] tracking-wider uppercase block">
          PLAN DE FORMACIÓN
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight mt-1">
          Contenido del Curso
        </h2>
        <p className="text-[13px] text-[#6e6e73] mt-1.5">
          4 módulos estructurados para que avances paso a paso desde los fundamentos hasta la operativa en real.
        </p>
      </div>

      <div className="space-y-3">
        {curriculum.map((item, idx) => (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-[#ededf0] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] hover:border-[#fcd5c3] transition-colors"
          >
            <div className="flex items-start gap-3.5">
              {/* Check verde idéntico a la imagen */}
              <div className="w-7 h-7 rounded-full bg-[#eaf8f1] text-[#24a148] flex items-center justify-center shrink-0 mt-0.5">
                <Check size={14} className="stroke-[3]" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#e25822] uppercase tracking-wider block">
                  MÓDULO {item.order}
                </span>
                <h3 className="text-[14px] font-bold text-[#1d1d1f] uppercase tracking-tight mt-0.5">
                  {item.title}
                </h3>
                <p className="text-[12px] text-[#6e6e73] mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-[11px] font-semibold text-[#86868b] bg-[#f8f8fa] px-3 py-1 rounded-full border border-[#ededf0]">
                {item.lessons}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
