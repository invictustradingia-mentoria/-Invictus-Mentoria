const steps = [
  {
    step: '01',
    title: 'Fundamentos Sólidos',
    description: 'Comenzamos con los conceptos esenciales para que tengas una base de acero antes de operar.',
    color: 'from-blue-500 to-blue-700',
  },
  {
    step: '02',
    title: 'Práctica en Demo',
    description: 'Aplicas todo lo aprendido en cuentas demo reales, sin riesgo y con feedback del mentor.',
    color: 'from-purple-500 to-purple-700',
  },
  {
    step: '03',
    title: 'Live Trading Supervisado',
    description: 'Das el salto a capital real con un plan de riesgo estructurado y supervisión constante.',
    color: 'from-green-600 to-green-trading',
  },
  {
    step: '04',
    title: 'Trader Independiente',
    description: 'Operas con total confianza tu propia estrategia, con criterio y disciplina probados.',
    color: 'from-gold-dark to-gold',
  },
]

export function Methodology() {
  return (
    <section id="metodologia" className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 text-green-trading text-sm font-semibold mb-4">
            <span className="w-8 h-px bg-green-trading" />
            METODOLOGÍA
            <span className="w-8 h-px bg-green-trading" />
          </div>
          <h2 className="section-title mb-4">
            Un Proceso Estructurado<br />
            <span className="text-green-trading">De Principiante a Profesional</span>
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            No aprendes por intuición. Seguimos un camino probado que maximiza la retención y minimiza los errores costosos.
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-16 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-green-trading/30 to-transparent" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <div key={i} className="glass-card p-6 text-center group hover:border-green-trading/20 transition-all duration-300">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-black text-lg mx-auto mb-4 shadow-lg`}>
                  {step.step}
                </div>
                <h4 className="font-bold text-white text-base mb-2">{step.title}</h4>
                <p className="text-white/40 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
