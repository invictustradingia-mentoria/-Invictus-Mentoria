import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'
import LessonVideo from '@/components/dashboard/LessonVideo'
import { PlayCircle, Video } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClasesPage({
  searchParams,
}: {
  searchParams: { lesson?: string }
}) {
  const session: any = await getServerSession(authOptions)
  if (!session?.user) redirect('/login')

  const role: string = session.user.role ?? 'CLUB'
  // ADMIN y MENTORIA ven todo. CLUB solo ve las clases de nivel CLUB.
  const allowed = role === 'CLUB' ? ['CLUB'] : ['CLUB', 'MENTORIA']

  const modules = await prismaDash.module.findMany({
    where: { isPublished: true },
    orderBy: { order: 'asc' },
    include: {
      lessons: {
        where: { isPublished: true, allowedRole: { in: allowed } },
        orderBy: { order: 'asc' },
      },
    },
  })

  const visibleModules = modules.filter((m) => m.lessons.length > 0)
  const allLessons = visibleModules.flatMap((m) => m.lessons)
  const current = allLessons.find((l) => l.id === searchParams.lesson) ?? allLessons[0]

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-8">
      <div>
        <div className="mb-1 flex items-center gap-2 text-[#e25822]">
          <Video size={18} />
          <span className="text-[11px] font-bold uppercase tracking-widest">Clases y Grabaciones</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#1d1d1f]">Clases y Grabaciones</h1>
        <p className="mt-1 text-xs text-gray-500">Selecciona una clase de la lista para reproducirla.</p>
      </div>

      {allLessons.length === 0 ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-xs text-gray-400">
          Todavía no hay clases publicadas para tu nivel de acceso.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Reproductor */}
          <div className="space-y-4 lg:col-span-2">
            {current && (
              <>
                <LessonVideo key={current.id} url={current.videoUrl} title={current.title} />
                <div className="rounded-3xl border border-[#ededf0] bg-white p-5 shadow-sm">
                  <h2 className="text-lg font-bold text-[#1d1d1f]">{current.title}</h2>
                  {current.description && (
                    <p className="mt-2 text-sm text-gray-500">{current.description}</p>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Lista de módulos y clases */}
          <div className="space-y-4">
            {visibleModules.map((mod) => (
              <div key={mod.id} className="rounded-3xl border border-[#ededf0] bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-bold text-[#1d1d1f]">{mod.title}</h3>
                <div className="space-y-1.5">
                  {mod.lessons.map((lesson) => {
                    const active = current?.id === lesson.id
                    return (
                      <Link
                        key={lesson.id}
                        href={`/dashboard/clases?lesson=${lesson.id}`}
                        className={`flex items-center gap-2 rounded-2xl px-3 py-2.5 text-xs font-bold transition-all ${
                          active
                            ? 'bg-[#fff4ef] text-[#e25822]'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <PlayCircle size={15} className="shrink-0" />
                        <span className="line-clamp-2">{lesson.title}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}