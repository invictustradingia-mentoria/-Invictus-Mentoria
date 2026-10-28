export function Stats() {
  const stats = [
    { value: '500+', label: 'Traders Formados', sub: 'en 12 países' },
    { value: '87%', label: 'Tasa de Rentabilidad', sub: 'promedio a 90 días' },
    { value: '4', label: 'Módulos Completos', sub: 'de contenido premium' },
    { value: '24/7', label: 'Acceso al Contenido', sub: 'desde cualquier dispositivo' },
  ]

  return (
    <section className="py-16 border-y border-white/5 bg-dark-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-trading to-green-light mb-1">
                {stat.value}
              </div>
              <div className="text-white font-semibold text-sm md:text-base">{stat.label}</div>
              <div className="text-white/40 text-xs md:text-sm">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
