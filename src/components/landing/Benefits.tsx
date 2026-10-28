import { Video, ShieldCheck, Compass, Headphones } from 'lucide-react'

const items = [
  {
    icon: Video,
    title: 'Clases en Video HD',
    desc: 'Explicaciones claras y directas al grano, organizadas por módulos sin relleno innecesario.',
  },
  {
    icon: ShieldCheck,
    title: 'Acompañamiento & Aprobación',
    desc: 'Comunidad exclusiva supervisada manualmente por el mentor para garantizar compromiso.',
  },
  {
    icon: Compass,
    title: 'Plan de Trading Probado',
    desc: 'Reglas precisas de entrada, gestión monetaria y salida de mercado sin improvisaciones.',
  },
  {
    icon: Headphones,
    title: 'Soporte Directo',
    desc: 'Canal de comunicación para resolver dudas sobre las clases y análisis de operaciones.',
  },
]

export function Benefits() {
  return (
    <section id="metodo" className="py-12 px-4 sm:px-6 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <span className="text-[11px] font-bold text-[#e25822] tracking-wider uppercase block">
          METODOLOGÍA
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1d1d1f] tracking-tight mt-1">
          ¿Por qué Invictus Master?
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map((b, i) => {
          const Icon = b.icon
          return (
            <div
              key={i}
              className="p-5 rounded-2xl border border-[#ededf0] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-2 hover:border-[#fcd5c3] transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-[#fff4ef] text-[#e25822] flex items-center justify-center">
                <Icon size={16} />
              </div>
              <h3 className="text-[14px] font-bold text-[#1d1d1f]">{b.title}</h3>
              <p className="text-[12px] text-[#6e6e73] leading-relaxed">{b.desc}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
