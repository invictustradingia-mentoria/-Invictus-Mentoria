'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Circle, PlayCircle, ChevronDown, ChevronLeft, ChevronRight, ArrowLeft, Check, Crown, Star, ShieldCheck, Sparkles, Clock, BookOpen, AlertCircle } from 'lucide-react'
import SecurePlayer from '@/components/dashboard/SecurePlayer'
import { getMembership } from '@/lib/membership'

interface Lesson {
  id: string; title: string; description: string | null
  duration: number | null; order: number; allowedRole: string
}
interface Mod { id: string; title: string; description: string | null; lessons: Lesson[] }

const STORE_KEY = 'invictus:lastLesson'

function fmtDuration(s: number | null) {
  if (!s) return null
  const m = Math.round(s / 60)
  return m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`
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
        const pct = Math.round((done / mod.lessons.length) * 100)
        const open = openMods.has(mod.id)
        return (
          <div key={mod.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button type="button" onClick={() => onToggle(mod.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left cursor-pointer">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${pct === 100 ? 'bg-emerald-100 text-emerald-600' : 'bg-sky-100 text-sky-600'}`}>
                {pct === 100 ? <Check size={17} /> : i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">{mod.title}</p>
                <p className="text-[11px] text-slate-500">{done} de {mod.lessons.length} completadas</p>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-emerald-500' : 'bg-sky-500'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
              <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
              <div className="space-y-1 border-t border-slate-100 bg-slate-50/60 p-2">
                {mod.lessons.map((l) => {
                  const completed = !!progress[l.id]
                  const current = l.id === currentId
                  const d = fmtDuration(l.duration)
                  return (
                    <button key={l.id} type="button" onClick={() => onOpen(l.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all cursor-pointer ${current ? 'bg-sky-50 ring-1 ring-sky-300' : 'hover:bg-white'}`}>
                      {completed ? <CheckCircle2 size={19} className="shrink-0 text-emerald-500" />
                        : current ? <PlayCircle size={19} className="shrink-0 text-sky-500" />
                        : <Circle size={19} className="shrink-0 text-slate-300" />}
                      <div className="min-w-0 flex-1">
                        <p className={`truncate text-xs font-bold ${completed ? 'text-slate-500' : 'text-slate-800'}`}>{l.title}</p>
                        <p className="text-[10px] text-slate-400">
                          {completed ? 'Completada' : current ? 'Viendo ahora' : 'Pendiente'}{d ? ` · ${d}` : ''}
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
  const [role, setRole] = useState('CLUB')
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
      setRole(data.role)
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
  const currentModule = current ? modules.find((m) => m.lessons.some((l) => l.id === current.id)) : null
  const total = flat.length
  const done = flat.filter((l) => progress[l.id]).length
  const pct = total ? Math.round((done / total) * 100) : 0
  const m = getMembership(role)
  const MIcon = m.key === 'MENTORIA' ? Crown : m.key === 'ADMIN' ? ShieldCheck : Star

  const toggleModule = (id: string) => setOpenMods((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const openLesson = (id: string) => {
    setCurrentId(id)
    setView('lesson')
    try { localStorage.setItem(STORE_KEY, id) } catch {}    try { sessionStorage.setItem('invictus:viewing', id) } catch {}
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
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <BookOpen size={32} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">Aún no hay clases disponibles para tu membresía</p>
          <p className="mt-1 text-xs text-slate-400">Cuando se publiquen, aparecerán aquí automáticamente.</p>
        </div>
      ) : view === 'list' ? (
        <>
          {/* Banner de membresía */}
          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${m.gradient} p-7 text-white shadow-xl ${m.glow}`}>
            <MIcon size={150} className="absolute -right-6 -top-6 opacity-15" />
            <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-widest backdrop-blur">
                  <MIcon size={13} /> {m.title}
                </span>
                <h1 className="mt-3 text-2xl font-black tracking-tight sm:text-3xl">Tus lecciones</h1>
                <p className="mt-1 max-w-md text-sm text-white/85">{m.tagline}</p>
              </div>
              <button type="button" onClick={() => openLesson(currentId ?? flat[0].id)}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-black text-slate-900 shadow-lg transition-transform hover:scale-105 cursor-pointer">
                <PlayCircle size={18} /> {done === 0 ? 'Empezar' : 'Continuar donde lo dejaste'}
              </button>
            </div>
          </div>

          {/* Resumen de progreso */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Progreso', value: `${pct}%`, icon: Sparkles, color: 'text-sky-600 bg-sky-50' },
              { label: 'Completadas', value: done, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Por ver', value: total - done, icon: Clock, color: 'text-amber-600 bg-amber-50' },
              { label: 'Total', value: total, icon: BookOpen, color: 'text-slate-600 bg-slate-100' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.color}`}><s.icon size={19} /></span>
                <div>
                  <p className="text-xl font-black leading-none text-slate-900">{s.value}</p>
                  <p className="mt-1 text-[11px] font-bold text-slate-500">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-black text-slate-900">Contenido del curso</h2>
            <CourseContent modules={modules} progress={progress} currentId={currentId} openMods={openMods} onToggle={toggleModule} onOpen={openLesson} />
          </div>
        </>
      ) : (
        current && (
          <>
            <button type="button" onClick={() => { setView('list'); try { sessionStorage.removeItem('invictus:viewing') } catch {} }} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-sky-600 cursor-pointer">
              <ArrowLeft size={15} /> Volver a las lecciones
            </button>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="space-y-4 xl:col-span-2">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-sky-500">{currentModule?.title}</p>
                  <h1 className="mt-1 text-xl font-black tracking-tight text-slate-900">{current.title}</h1>
                </div>

                <SecurePlayer key={current.id} lessonId={current.id} title={current.title} />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button type="button" onClick={toggleComplete}
                    className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-black transition-all cursor-pointer ${
                      progress[current.id] ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-sky-600 text-white shadow-md shadow-sky-300/50 hover:bg-sky-700'
                    }`}>
                    <CheckCircle2 size={16} /> {progress[current.id] ? 'Completada · clic para desmarcar' : 'Marcar como completada'}
                  </button>
                  <div className="flex gap-2">
                    <button type="button" disabled={idx <= 0} onClick={() => openLesson(flat[idx - 1].id)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-sky-300 disabled:opacity-40 cursor-pointer">
                      <ChevronLeft size={15} /> Anterior
                    </button>
                    <button type="button" disabled={idx >= flat.length - 1} onClick={() => openLesson(flat[idx + 1].id)}
                      className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:border-sky-300 disabled:opacity-40 cursor-pointer">
                      Siguiente <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="text-sm font-black text-slate-900">Sobre esta clase</h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{current.description || 'Esta clase no tiene descripción.'}</p>
                </div>
              </div>

              <div className="space-y-3 xl:sticky xl:top-6 xl:self-start">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs font-black text-slate-700">
                    <span>Tu progreso</span><span className="text-sky-600">{pct}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-all duration-700" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">{done} de {total} clases completadas</p>
                </div>
                <CourseContent modules={modules} progress={progress} currentId={currentId} openMods={openMods} onToggle={toggleModule} onOpen={openLesson} />
              </div>
            </div>
          </>
        )
      )}
    </div>
  )
}