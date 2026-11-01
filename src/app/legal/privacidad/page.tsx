import LegalShell from '@/components/legal/LegalShell'

export default function PrivacidadPage() {
  return (
    <LegalShell title="Política de Privacidad" updated="31 de octubre de 2026">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Qué información recopilamos</h2>
                            <ul className="list-disc pl-5 space-y-1">
                <li>Datos de registro: nombre, nombre de usuario y correo electrónico.</li>
                <li>Datos de uso: progreso en los cursos, clases completadas y actividad dentro del dashboard.</li>
                <li>Datos técnicos: cookies y preferencias del navegador (ver nuestra Política de Cookies).</li>
                <li>Comunicaciones: mensajes enviados a través del asistente de soporte de la Plataforma.</li>
              </ul>

            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. Para qué usamos tu información</h2>
                            <ul className="list-disc pl-5 space-y-1">
                <li>Brindar acceso a los contenidos de tu membresía (Club o Mentoría).</li>
                <li>Mostrarte tu progreso dentro de los cursos.</li>
                <li>Responder tus consultas de soporte.</li>
                <li>Mejorar la Plataforma y prevenir usos fraudulentos de las cuentas.</li>
              </ul>

            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. Con quién compartimos información</h2>
                            <p>No vendemos tus datos personales. Solo compartimos información con proveedores que nos ayudan a operar la Plataforma (por ejemplo, alojamiento y base de datos), bajo obligaciones de confidencialidad, o cuando la ley lo exija.</p>

            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">4. Tus derechos</h2>
                            <p>Podés solicitar acceso, corrección o eliminación de tus datos personales escribiendo a través del asistente de soporte de la Plataforma. Atenderemos tu solicitud dentro de un plazo razonable.</p>

            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">5. Seguridad</h2>
                            <p>Aplicamos medidas técnicas y organizativas razonables para proteger tu información. Sin embargo, ningún sistema es 100% infalible, por lo que te recomendamos no compartir tu contraseña con terceros ni enviar datos bancarios por el chat de soporte.</p>

            </section>
    </LegalShell>
  )
}
