import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-[#ededf0] py-10 bg-white text-[#777]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="inline-block">
            <span className="text-[15px] font-black tracking-tight flex items-center gap-1 text-[#2d2d2d]">
              <span>INVICTUS</span>
              <span className="text-[#e25822] font-extrabold">MASTER</span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-5 text-[12px]">
            <a href="#metodo" className="hover:text-[#111] transition-colors">Metodología</a>
            <a href="#faq" className="hover:text-[#111] transition-colors">FAQ</a>
            <Link href="/login" className="hover:text-[#111] transition-colors">Aula Virtual</Link>
            <Link
              href="/admin"
              className="text-[#8a38ec] hover:underline flex items-center gap-1 font-semibold"
            >
              <ShieldCheck size={13} />
              Acceso Admin
            </Link>
          </div>

          <p className="text-[11px] text-[#999]">
            &copy; 2024 Invictus Master. Todos los derechos reservados.
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-[#f4f4f7] text-center">
          <p className="text-[11px] text-[#aaa] max-w-2xl mx-auto leading-relaxed">
            Aviso: El trading en mercados financieros implica riesgo y no es adecuado para todos los inversores. El contenido de Invictus Master es con fines exclusivamente educativos.
          </p>
        </div>
      </div>
    </footer>
  )
}
