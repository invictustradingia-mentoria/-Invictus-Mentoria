import LegalShell from '@/components/legal/LegalShell'

export default function CookiesPage() {
  return (
    <LegalShell title="Política de Cookies" updated="31 de octubre de 2026">
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">1. Qué son las cookies</h2>
                            <p>Las cookies son pequeños archivos que se almacenan en tu navegador para recordar tus preferencias y mejorar tu experiencia dentro de la Plataforma. Al ingresar por primera vez te mostramos un aviso para que elijas qué categorías de cookies aceptás.</p>

            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">2. Categorías que usamos</h2>
                            <ul className="list-disc pl-5 space-y-1">
                <li><b>Necesarias:</b> imprescindibles para que la Plataforma funcione (inicio de sesión, seguridad, recordar tu tema claro/oscuro). No se pueden desactivar.</li>
                <li><b>Analíticas:</b> nos ayudan a entender cómo se usa la Plataforma para mejorarla.</li>
                <li><b>Marketing:</b> permiten mostrar comunicaciones y promociones relevantes sobre Club y Mentoría.</li>
              </ul>

            </section>
            <section>
              <h2 className="text-lg font-bold text-slate-900 mb-2">3. Cómo gestionar tus preferencias</h2>
                            <p>Podés aceptar o rechazar las cookies no esenciales desde el aviso de cookies que aparece al ingresar a la Plataforma, o cambiar tu elección en cualquier momento borrando los datos del sitio desde la configuración de tu navegador.</p>

            </section>
    </LegalShell>
  )
}
