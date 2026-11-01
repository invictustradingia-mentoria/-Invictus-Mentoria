import LegalShell from '@/components/legal/LegalShell'

export default function RiesgoPage() {
  return (
    <LegalShell title="Aviso de Riesgo" updated="31 de octubre de 2026">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Contenido exclusivamente educativo</h2>
                            <p>Todo el material disponible en Invictus Campus (clases, mentorías, material descargable y cualquier otro contenido) tiene <b>fines exclusivamente educativos</b>. Nada de lo publicado en la Plataforma constituye asesoramiento financiero, recomendación de inversión, ni una oferta para comprar o vender ningún instrumento financiero.</p>

            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. El trading implica riesgo real de pérdida</h2>
                            <p>Operar en mercados financieros (forex, acciones, futuros, criptomonedas u otros instrumentos) implica un <b>riesgo significativo de pérdida de capital</b>, que puede incluir la pérdida total de los fondos invertidos. Los resultados pasados, propios o de terceros, <b>no garantizan resultados futuros</b>.</p>

            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. Responsabilidad del usuario</h2>
                            <p>Cada usuario es el único responsable de las decisiones de inversión u operativa que tome, dentro o fuera de la Plataforma. Invictus Campus no gestiona cuentas de terceros ni opera capital de los usuarios, y recomienda consultar con un asesor financiero matriculado antes de tomar decisiones de inversión.</p>

            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. Sin garantías de rentabilidad</h2>
                            <p>Ningún instructor, mentor o miembro del equipo de Invictus Campus garantiza rentabilidad, ganancias o resultados específicos derivados del uso del contenido educativo de la Plataforma.</p>

            </section>
    </LegalShell>
  )
}
