'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { CheckCircle2, Circle, PlayCircle, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, Check, BookOpen, AlertCircle, Download, CheckCircle } from 'lucide-react'
import SecurePlayer from '@/components/dashboard/SecurePlayer'

interface Lesson {
  id: string; title: string; description: string | null
  duration: number | null; order: number; allowedRole: string
}
interface Mod { id: string; title: string; description: string | null; createdAt?: string; lessons: Lesson[] }

const STORE_KEY = 'invictus:lastLesson'
const NEW_DAYS = 14

function fmtDuration(s: number | null) {
  if (!s) return null
  const sec = Math.round(s)
  const m = Math.floor(sec / 60)
  const r = sec % 60
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m}:${String(r).padStart(2, '0')}`
}

function CourseContent({
  modules, progress, currentId, openMods, onToggle, onOpen,
}: {
  modules: Mod[]; progress: Record<string, boolean>; currentId: string | null
  openMods: Set<string>; onToggle: (id: string) => void; onOpen: (id: string) => void
}) {
  return (
    <div className="space-y-3">
      {modules.map((mod, i) => {
        const done = mod.lessons.filter((l) => progress[l.id]).length
        const n = mod.lessons.length
        const pct = Math.round((done / n) * 100)
        const complete = pct === 100
        const open = openMods.has(mod.id)
        const isNew = !!mod.createdAt && !complete && Date.now() - new Date(mod.createdAt).getTime() < NEW_DAYS * 86400000
        return (
          <div key={mod.id} className="dz-glass overflow-hidden rounded-2xl">
            <button type="button" onClick={() => onToggle(mod.id)} className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left cursor-pointer">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black ${complete ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {complete ? <Check size={18} /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{mod.title}</p>
                  {isNew && <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">Nuevo</span>}
                </div>
                <p className={`mt-0.5 text-[11px] font-semibold ${complete ? 'text-emerald-600' : 'text-slate-500'}`}>
                  {complete ? `Módulo completado · ${n} clases` : `${n} clases · ${pct}% completado`}
                </p>
              </div>
              <div className="dz-track hidden h-1.5 w-28 shrink-0 overflow-hidden rounded-full sm:block">
                <div className={`h-full rounded-full transition-all duration-500 ${complete ? 'dz-fill-done' : pct > 0 ? 'dz-fill-part' : 'dz-fill-none'}`} style={{ width: `${Math.max(pct, pct > 0 ? 8 : 0)}%` }} />
              </div>
              <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="space-y-1 border-t border-slate-200/60 p-2">
                {mod.lessons.map((l, li) => {
                  const completed = !!progress[l.id]
                  const current = l.id === currentId
                  const d = fmtDuration(l.duration)
                  return (
                    <button key={l.id} type="button" onClick={() => onOpen(l.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all cursor-pointer ${current ? 'dz-cur' : 'hover:bg-slate-100'}`}>
                      {completed ? <CheckCircle2 size={21} className="shrink-0 text-emerald-500" />
                        : current ? <PlayCircle size={21} className="shrink-0 text-amber-500" />
                        : <Circle size={21} className="shrink-0 text-slate-300" />}
                      <div className="min-w-0 flex-1">
                        <p className={`text-[13px] font-bold ${current ? 'text-amber-600' : completed ? 'text-slate-700' : 'text-slate-800'}`}>{l.title}</p>
                        <p className={`text-[11px] font-semibold ${current ? 'text-amber-600' : completed ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {completed ? 'Vista' : 'Pendiente'}{current ? ' · la estás viendo' : ''}{d ? ` · ${d}` : ''}
                        </p>
                      </div>
                      {l.allowedRole === 'MENTORIA' && <span className="shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-black uppercase text-amber-700">Mentoría</span>}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function ClasesPage() {
  const [modules, setModules] = useState<Mod[]>([])
  const [progress, setProgress] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'lesson'>('list')
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [openMods, setOpenMods] = useState<Set<string>>(new Set())
  const [firstLoad, setFirstLoad] = useState(true)

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/student/courses', { cache: 'no-store' })
      if (res.status === 401) { window.location.href = '/login'; return }
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setModules(data.modules)
      const p: Record<string, boolean> = {}
      Object.entries<any>(data.progress).forEach(([k, v]) => { p[k] = !!v.completed })
      setProgress(p)
      setError(null)
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar el contenido')
    } finally {
      setLoading(false)
    }
  }, [])

  // Sincronización: cada 20 s y al volver a la pestaña
  useEffect(() => {
    load()
    const t = setInterval(load, 20000)
    const onVis = () => { if (document.visibilityState === 'visible') load() }
    document.addEventListener('visibilitychange', onVis)
    return () => { clearInterval(t); document.removeEventListener('visibilitychange', onVis) }
  }, [load])

  const flat = useMemo(() => modules.flatMap((m) => m.lessons), [modules])

  // Primera carga: abre el módulo de la última lección, o el primero
  useEffect(() => {
    if (!firstLoad || modules.length === 0) return
    let last: string | null = null
    try { last = localStorage.getItem(STORE_KEY) } catch {}
    const target = flat.find((l) => l.id === last) ?? flat.find((l) => !progress[l.id]) ?? flat[0]
    if (target) {
      setCurrentId(target.id)
      const mod = modules.find((m) => m.lessons.some((l) => l.id === target.id))
      setOpenMods(new Set(mod ? [mod.id] : [modules[0].id]))
    }
    setFirstLoad(false)
  }, [firstLoad, modules, flat, progress])

  // Si la lección actual fue eliminada por el admin
  useEffect(() => {
    if (currentId && flat.length && !flat.some((l) => l.id === currentId)) {
      setCurrentId(flat[0].id)
    }
    if (flat.length === 0 && view === 'lesson') setView('list')
  }, [flat, currentId, view])

  const current = flat.find((l) => l.id === currentId) ?? null
  const idx = current ? flat.findIndex((l) => l.id === current.id) : -1
  const modIdx = current ? modules.findIndex((m) => m.lessons.some((l) => l.id === current.id)) : -1
  const currentModule = modIdx >= 0 ? modules[modIdx] : null
  const lessonNo = currentModule && current ? currentModule.lessons.findIndex((l) => l.id === current.id) + 1 : 0
  const total = flat.length
  const done = flat.filter((l) => progress[l.id]).length
  const pct = total ? Math.round((done / total) * 100) : 0

  const toggleModule = (id: string) => setOpenMods((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const openLesson = (id: string) => {
    setCurrentId(id)
    setView('lesson')
    try { localStorage.setItem(STORE_KEY, id) } catch {}
    try { sessionStorage.setItem('invictus:viewing', id) } catch {}
    const mod = modules.find((x) => x.lessons.some((l) => l.id === id))
    if (mod) setOpenMods((prev) => new Set(prev).add(mod.id))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const toggleComplete = async () => {
    if (!current) return
    const next = !progress[current.id]
    setProgress((p) => ({ ...p, [current.id]: next }))
    try {
      const res = await fetch('/api/student/progress', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId: current.id, completed: next }),
      })
      if (!res.ok) throw new Error()
    } catch {
      setProgress((p) => ({ ...p, [current.id]: !next }))
      setError('No se pudo guardar tu progreso. Revisa tu conexión e inténtalo de nuevo.')
    }
  }

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-xs font-bold text-slate-400">Cargando tus clases...</div>
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-5 md:p-8">
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs font-bold text-rose-700">
          <AlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {total === 0 ? (
        <div className="dz-glass rounded-3xl p-12 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">Aún no hay clases disponibles para tu membresía</p>
          <p className="mt-1 text-xs text-slate-400">Cuando se publiquen, aparecerán aquí automáticamente.</p>
        </div>
      ) : view === 'list' ? (
        <>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[.2em] text-amber-500">Tu campus</p>
              <h1 className="font-display mt-1 text-3xl font-bold tracking-tight text-slate-900">Mis clases</h1>
              <p className="mt-1 text-xs font-semibold text-slate-500">{done} de {total} clases completadas · {pct}%</p>
            </div>
            <button type="button" onClick={() => openLesson(currentId ?? flat[0].id)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 px-6 py-3 text-xs font-black text-white shadow-lg shadow-sky-500/30 transition-transform hover:scale-105 cursor-pointer">
              <PlayCircle size={17} /> {done === 0 ? 'Empezar' : 'Continuar donde lo dejaste'}
            </button>
          </div>

          <div className="dz-track h-2 overflow-hidden rounded-full">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>

          <div>
            <h2 className="font-display mb-3 text-xl font-bold text-slate-900">Contenido del curso</h2>
            <CourseContent modules={modules} progress={progress} currentId={currentId} openMods={openMods} onToggle={toggleModule} onOpen={openLesson} />
          </div>
        </>
      ) : (
        current && (
          <>
            <button type="button" onClick={() => { setView('list'); try { sessionStorage.removeItem('invictus:viewing') } catch {} }} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 cursor-pointer">
              <ArrowLeft size={15} /> Volver a las lecciones
            </button>

            <div>
              <p className="text-[11px] font-black uppercase tracking-[.2em] text-amber-500">Módulo {modIdx + 1}</p>
              <h1 className="font-display mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{currentModule?.title}</h1>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-5 lg:col-span-2">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-[.2em] text-amber-500">Clase {modIdx + 1}.{lessonNo}</p>
                  <h2 className="font-display mt-1 text-2xl font-bold tracking-tight text-slate-900">{current.title}</h2>
                </div>

                <SecurePlayer key={current.id} lessonId={current.id} title={current.title} />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button type="button" onClick={toggleComplete}
                    className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-black transition-all cursor-pointer ${
                      progress[current.id] ? 'border border-emerald-300 bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-sky-600 text-white shadow-md shadow-sky-500/30 hover:bg-sky-700'
                    }`}>
                    <CheckCircle size={16} /> {progress[current.id] ? 'Clase completada' : 'Marcar como completada'}
                  </button>
                  <div className="flex gap-2">
                    <button type="button" disabled={idx <= 0} onClick={() => openLesson(flat[idx - 1].id)}
                      className="dz-glass inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-sky-300 disabled:opacity-40 cursor-pointer">
                      <ChevronLeft size={15} /> Anterior
                    </button>
                    <button type="button" disabled={idx >= flat.length - 1} onClick={() => openLesson(flat[idx + 1].id)}
                      className="dz-glass inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-sky-300 disabled:opacity-40 cursor-pointer">
                      Siguiente <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900">Sobre esta clase</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{current.description || 'Esta clase no tiene descripción.'}</p>
                </div>

                <div>
                  <h2 className="font-display mb-3 mt-2 text-xl font-bold text-slate-900">Contenido del curso</h2>
                  <CourseContent modules={modules} progress={progress} currentId={currentId} openMods={openMods} onToggle={toggleModule} onOpen={openLesson} />
                </div>
              </div>

              <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
                <div>
                  <h2 className="font-display flex items-center gap-2 text-xl font-bold text-slate-900"><Download size={17} className="text-sky-600" /> Material descargable</h2>
                  <div className="dz-drop mt-3 px-5 py-7 text-center">
                    <p className="text-sm leading-relaxed text-slate-600">
                      Esta clase no lleva material adjunto. Encontrarás todo lo descargable en{' '}
                      <Link href="/dashboard/resources" className="font-bold text-amber-600 underline underline-offset-2 hover:text-amber-500">Recursos</Link>.
                    </p>
                  </div>
                </div>

                <div className="dz-glass rounded-2xl p-4">
                  <div className="flex items-center justify-between text-xs font-black text-slate-700">
                    <span>Tu progreso</span><span className="text-sky-600">{pct}%</span>
                  </div>
                  <div className="dz-track mt-2 h-2 overflow-hidden rounded-full">
                    <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">{done} de {total} clases completadas</p>
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  )
}
