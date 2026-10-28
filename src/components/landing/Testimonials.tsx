import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Rodrigo M.',
    role: 'Ex-empleado bancario',
    country: '🇦🇷',
    text: 'Después de 3 meses con Invictus, pasé de perder dinero consistentemente a tener mi primer mes en verde con +8.4% de retorno sobre mi cuenta. La metodología de gestión de riesgo cambió todo.',
    stars: 5,
    result: '+8.4% en 30 días',
  },
  {
    name: 'Valentina R.',
    role: 'Diseñadora freelance',
    country: '🇲🇽',
    text: 'Lo que más me sorprendió fue el módulo de psicología. Creía que mi problema era técnico, pero era 100% mental. Hoy opero con calma y disciplina que nunca pensé que podría tener.',
    stars: 5,
    result: 'Consistente por 6 meses',
  },
  {
    name: 'Carlos A.',
    role: 'Ingeniero de sistemas',
    country: '🇨🇴',
    text: 'Intenté aprender trading solo por 2 años sin resultados. En 4 meses con Invictus aprendí más que en esos 2 años. El sistema de SMC es brutal cuando lo entiendes correctamente.',
    stars: 5,
    result: 'De -30% a +12% mensual',
  },
]

export function Testimonials() {
  return (
    <section className="py-24 bg-dark-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-green-trading text-sm font-semibold mb-4">
            <span className="w-8 h-px bg-green-trading" />
            RESULTADOS REALES
            <span className="w-8 h-px bg-green-trading" />
          </div>
          <h2 className="section-title mb-4">
            Lo que Dicen Nuestros<br />
            <span className="text-green-trading">Traders Formados</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="glass-card p-6 flex flex-col">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, s) => (
                  <Star key={s} size={14} className="text-gold fill-gold" />
                ))}
              </div>
              <p className="text-white/60 text-sm leading-relaxed flex-1 mb-6 italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{t.name}</span>
                    <span>{t.country}</span>
                  </div>
                  <div className="text-white/40 text-xs">{t.role}</div>
                </div>
                <div className="glass-card-green px-3 py-1.5 text-xs font-bold text-green-trading">
                  {t.result}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
