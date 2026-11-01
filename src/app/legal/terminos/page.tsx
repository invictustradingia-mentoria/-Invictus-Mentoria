import LegalShell from '@/components/legal/LegalShell'

export default function TerminosPage() {
  return (
    <LegalShell title="Términos y Condiciones" updated="31 de octubre de 2026">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Objeto</h2>
                            <p>Invictus Campus (&quot;la Plataforma&quot;) es un servicio de educación en trading y mercados financieros operado por Invictus Campus. Al registrarte y usar la Plataforma aceptás estos Términos y Condiciones en su totalidad.</p>

            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. Membresías: diferencias entre Club y Mentoría</h2>
                            <p>La Plataforma ofrece dos niveles principales de membresía, con alcances y precios distintos. Cada usuario accede únicamente al contenido correspondiente a la membresía que haya adquirido:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><b>Club:</b> acceso a los módulos y clases grabadas del programa base, material descargable asociado a cada clase, y seguimiento de tu progreso dentro del curso.</li>
                <li><b>Mentoría:</b> incluye todo lo disponible en Club, más contenido avanzado, seguimiento personalizado y los beneficios adicionales descritos al momento de la compra de ese plan.</li>
              </ul>
              <p>El nivel de membresía puede ser modificado únicamente por el equipo de administración de la Plataforma, y determina qué contenido es visible para cada cuenta.</p>

            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. Cuentas de usuario</h2>
                            <p>Cada usuario es responsable de mantener la confidencialidad de sus credenciales de acceso (usuario, correo y contraseña) y de toda actividad que ocurra bajo su cuenta. Está prohibido compartir el acceso con terceros que no hayan adquirido su propia membresía.</p>
              <p>La Plataforma puede suspender, limitar o dar de baja cuentas que incumplan estos Términos, que compartan contenido protegido fuera de la Plataforma, o que realicen un uso fraudulento del servicio.</p>

            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. Propiedad intelectual</h2>
                            <p>Todo el contenido de la Plataforma (clases, videos, material descargable, textos, gráficos y diseño) es propiedad de Invictus Campus o de sus licenciantes y está protegido por las leyes de propiedad intelectual aplicables. Se concede al usuario una licencia personal, no transferible y no exclusiva para uso educativo individual, quedando prohibida su reproducción, distribución o reventa sin autorización.</p>

            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">5. Modificaciones</h2>
                            <p>Invictus Campus puede actualizar estos Términos en cualquier momento. Los cambios relevantes serán comunicados dentro de la Plataforma. El uso continuado del servicio luego de una actualización implica la aceptación de los nuevos términos.</p>

            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">6. Contacto</h2>
                            <p>Para consultas sobre estos Términos podés escribir a través del asistente de soporte disponible en la página principal de la Plataforma.</p>

            </section>
    </LegalShell>
  )
}
