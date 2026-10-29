import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import { BookOpen, ExternalLink, FileText } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MaterialPage() {
  const session: any = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const role: string = session.user.role ?? 'CLUB'
  const allowed = role === 'CLUB' ? ['CLUB'] : ['CLUB', 'MENTORIA']

  const resources = await prismaDash.resource.findMany({
    where: { allowedRole: { in: allowed } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
      <div>
        <div className="mb-1 flex items-center gap-2 text-[#e25822]">
          <BookOpen size={18} />
          <span className="text-[11px] font-bold uppercase tracking-widest">Material Educativo</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#1d1d1f]">Material Educativo</h1>
        <p className="mt-1 text-xs text-gray-500">PDFs, guías y enlaces complementarios.</p>
      </div>

      {resources.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-xs text-gray-400">
          Todavía no hay material disponible para tu nivel de acceso.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resources.map((r) => (
            <a
              key={r.id}
              href={r.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col justify-between rounded-3xl border border-[#ededf0] bg-white p-5 shadow-sm transition-all hover:border-[#e25822]"
            >
              <div>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#fff4ef] text-[#e25822]">
                  <FileText size={18} />
                </div>
                <h3 className="text-sm font-bold text-[#1d1d1f]">{r.title}</h3>
                {r.description && <p className="mt-1 text-xs text-gray-500">{r.description}</p>}
              </div>
              <span className="mt-4 flex items-center gap-1 text-xs font-bold text-[#e25822]">
                Abrir recurso <ExternalLink size={13} />
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}