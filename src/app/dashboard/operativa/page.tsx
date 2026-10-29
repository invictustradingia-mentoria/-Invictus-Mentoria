import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { TrendingUp } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function OperativaPage() {
  const session: any = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
      <div>
        <div className="mb-1 flex items-center gap-2 text-[#e25822]">
          <TrendingUp size={18} />
          <span className="text-[11px] font-bold uppercase tracking-widest">Bitácora / Operativa</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#1d1d1f]">Bitácora / Operativa</h1>
        <p className="mt-1 text-xs text-gray-500">Registro y seguimiento de tu operativa en MNQ.</p>
      </div>

      <div className="rounded-3xl border border-[#ededf0] bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#fff4ef] text-[#e25822]">
          <TrendingUp size={20} />
        </div>
        <h2 className="text-sm font-bold text-[#1d1d1f]">Sección en preparación</h2>
        <p className="mt-1 text-xs text-gray-400">Muy pronto podrás registrar y revisar tus operaciones desde aquí.</p>
      </div>
    </div>
  )
}