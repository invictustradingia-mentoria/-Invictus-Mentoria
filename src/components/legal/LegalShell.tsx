import Link from 'next/link'

const LINKS = [
  { href: '/legal/terminos', label: 'Términos y Condiciones' },
  { href: '/legal/privacidad', label: 'Privacidad' },
  { href: '/legal/cookies', label: 'Cookies' },
  { href: '/legal/reembolsos', label: 'Reembolsos' },
  { href: '/legal/riesgo', label: 'Aviso de Riesgo' },
]

export default function LegalShell({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="font-bold text-slate-900 tracking-tight">
            INVICTUS <span className="text-sky-600">CAMPUS</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-sky-600 hover:underline">
            ← Volver al inicio
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-5 py-10 grid gap-10 md:grid-cols-[220px_1fr]">
        <nav className="md:sticky md:top-10 md:self-start">
          <p className="text-xs font-bold uppercase tracking-wide text-slate-400 mb-3">Legal</p>
          <ul className="space-y-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <main className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-10">
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-1">{title}</h1>
          <p className="text-xs text-slate-400 mb-8">Última actualización: {updated}</p>
          <div className="prose-legal space-y-6 text-[15px] leading-relaxed text-slate-700">
            {children}
          </div>
        </main>
      </div>

      <footer className="border-t border-slate-200 bg-white py-8">
        <p className="mx-auto max-w-5xl px-5 text-xs text-slate-400">
          © 2026 Invictus Campus. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  )
}
