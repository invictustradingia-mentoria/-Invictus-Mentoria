'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Video, Trash2, Layers, Upload, Link as LinkIcon, CheckCircle2, AlertCircle, Sparkles,
  Pencil, X, Save, EyeOff, Globe, Users, GraduationCap, ChevronDown, Plus, Film, XCircle,
} from 'lucide-react'

const BUCKET = 'videos'
const MAX_MB = 50
const VIDEO_EXT = ['mp4', 'webm', 'mkv', 'mov']

type Access = 'ALL' | 'CLUB' | 'MENTORIA'

interface Lesson {
  id: string
  title: string
  videoUrl: string
  allowedRole: string
  order: number
  isPublished?: boolean
}
interface Module {
  id: string
  title: string
  description: string | null
  order?: number
  isPublished?: boolean
  lessons?: Lesson[]
}
interface EditLessonState {
  id: string; title: string; description: string; videoUrl: string
  duration: string; order: string; isPublished: boolean; allowedRole: Access; moduleId: string
}
interface EditModuleState { id: string; title: string; description: string; order: string; isPublished: boolean }

const ACCESS: Record<Access, { label: string; desc: string; icon: any; badge: string; card: string }> = {
  ALL: {
    label: 'Para todos', desc: 'Club y Mentoría', icon: Globe,
    badge: 'bg-emerald-100 text-emerald-700', card: 'border-emerald-400 bg-emerald-50 text-emerald-700',
  },
  CLUB: {
    label: 'Solo Club', desc: 'Solo alumnos del Club', icon: Users,
    badge: 'bg-sky-100 text-sky-700', card: 'border-sky-400 bg-sky-50 text-sky-700',
  },
  MENTORIA: {
    label: 'Solo Mentoría', desc: 'Solo alumnos de Mentoría', icon: GraduationCap,
    badge: 'bg-sky-100 text-[#0284c7]', card: 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7]',
  },
}

const normalizeAccess = (v?: string): Access => (v === 'CLUB' || v === 'MENTORIA' ? v : 'ALL')

async function safeJson(res: Response): Promise<any> {
  const text = await res.text()
  if (!text) return {}
  try { return JSON.parse(text) } catch { return { error: `El servidor devolvió una respuesta no válida (HTTP ${res.status}).` } }
}

// Traduce errores técnicos de la subida a un motivo y una solución
function explainUploadError(raw: string, file: File): { title: string; detail: string } {
  const m = raw.toLowerCase()
  const mb = (file.size / 1024 / 1024).toFixed(1)
  if (m.includes('exceeded') || m.includes('maximum allowed size') || m.includes('too large') || m.includes('413')) {
    return {
      title: 'El video es demasiado pesado',
      detail: `Tu archivo pesa ${mb} MB y Supabase solo admite hasta ${MAX_MB} MB en este plan. Comprímelo (por ejemplo con HandBrake), o súbelo a YouTube/Vimeo y pega el enlace.`,
    }
  }
  if (m.includes('bucket') && m.includes('not found')) {
    return { title: 'No existe el bucket "videos"', detail: 'En Supabase → Storage crea un bucket llamado exactamente "videos" y márcalo como público.' }
  }
  if (m.includes('mime') || m.includes('not supported') || m.includes('invalid file')) {
    return { title: 'Formato de video no admitido', detail: 'Usa MP4, WebM, MKV o MOV. Lo más compatible es MP4 (H.264).' }
  }
  if (m.includes('failed to fetch') || m.includes('network') || m.includes('load failed')) {
    return { title: 'Se cortó la conexión durante la subida', detail: 'Revisa tu internet y vuelve a intentarlo. Con videos grandes, una conexión inestable suele cortar la subida.' }
  }
  if (m.includes('invalid') && (m.includes('jwt') || m.includes('key') || m.includes('signature') || m.includes('token'))) {
    return { title: 'Clave de Supabase incorrecta o vencida', detail: 'Revisa NEXT_PUBLIC_SUPABASE_ANON_KEY y SUPABASE_SERVICE_ROLE_KEY en Netlify y haz un redeploy.' }
  }
  if (m.includes('row-level security') || m.includes('policy') || m.includes('unauthorized')) {
    return { title: 'Supabase rechazó la subida por permisos', detail: 'La URL de subida venció o el bucket tiene políticas restrictivas. Vuelve a intentarlo; si persiste, revisa las políticas del bucket "videos".' }
  }
  return { title: 'No se pudo subir el video', detail: raw }
}

const inputCls =
  'w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-xs text-[#1d1d1f] placeholder:text-gray-400 focus:border-[#0284c7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0284c7]/10'
const labelCls = 'mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500'

function AccessPicker({ value, onChange }: { value: Access; onChange: (v: Access) => void }) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {(Object.keys(ACCESS) as Access[]).map((k) => {
        const a = ACCESS[k]
        const active = value === k
        const Icon = a.icon
        return (
          <button
            key={k}
            type="button"
            onClick={() => onChange(k)}
            className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left transition-all cursor-pointer ${
              active ? a.card : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <Icon size={18} className="shrink-0" />
            <span>
              <span className="block text-xs font-bold leading-tight">{a.label}</span>
              <span className="block text-[10px] opacity-70">{a.desc}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function AdminContentPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null)
  const [closed, setClosed] = useState<Set<string>>(new Set())
  const lessonFormRef = useRef<HTMLDivElement>(null)

  // Módulo
  const [modTitle, setModTitle] = useState('')
  const [modDesc, setModDesc] = useState('')
  const [loadingMod, setLoadingMod] = useState(false)

  // Clase
  const [selectedModuleId, setSelectedModuleId] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDesc, setLessonDesc] = useState('')
  const [videoSource, setVideoSource] = useState<'url' | 'upload'>('url')
  const [lessonUrl, setLessonUrl] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [access, setAccess] = useState<Access>('ALL')
  const [duration, setDuration] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [status, setStatus] = useState('')
  const [formError, setFormError] = useState<{ title: string; detail: string } | null>(null)

  // Edición
  const [editLesson, setEditLesson] = useState<EditLessonState | null>(null)
  const [editModule, setEditModule] = useState<EditModuleState | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  const notify = (text: string, type: 'success' | 'error') => {
    setToast({ text, type })
    setTimeout(() => setToast(null), 6000)
  }

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/content', { cache: 'no-store' })
      const data = await safeJson(res)
      if (res.ok && Array.isArray(data.modules)) setModules(data.modules)
      else notify(data.error || `No se pudo cargar el contenido (HTTP ${res.status})`, 'error')
    } catch {
      notify('No se pudo conectar con el servidor para cargar el contenido', 'error')
    } finally {
      setLoadingData(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const totals = useMemo(() => {
    const lessons = modules.reduce((n, m) => n + (m.lessons?.length ?? 0), 0)
    return { modules: modules.length, lessons }
  }, [modules])

  // ---------- Crear módulo ----------
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modTitle.trim()) return notify('Escribe un título para el módulo', 'error')
    setLoadingMod(true)
    try {
      const res = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: modTitle.trim(), description: modDesc.trim() }),
      })
      const data = await safeJson(res)
      if (res.ok && !data.error) {
        const created = data.module ?? data.data ?? null
        await loadData()
        if (created?.id) setSelectedModuleId(created.id)
        setModTitle(''); setModDesc('')
        notify('Módulo creado. Ya puedes agregarle clases.', 'success')
      } else {
        notify(data.error || data.message || `No se pudo crear el módulo (HTTP ${res.status})`, 'error')
      }
    } catch {
      notify('Error de conexión al crear el módulo', 'error')
    } finally {
      setLoadingMod(false)
    }
  }

  // ---------- Subida de video ----------
  const uploadVideo = async (file: File): Promise<string | null> => {
    setStatus('Preparando la subida...')
    const signRes = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name, fileSize: file.size }),
    })
    const sign = await safeJson(signRes)
    if (!signRes.ok || !sign.token || !sign.path) {
      setFormError(explainUploadError(sign.error || `El servidor rechazó la subida (HTTP ${signRes.status})`, file))
      return null
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !anon) {
      setFormError({
        title: 'Falta configurar Supabase en el navegador',
        detail: 'Agrega NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Netlify (Environment variables) y haz "Clear cache and deploy site".',
      })
      return null
    }

    setStatus(`Subiendo ${(file.size / 1024 / 1024).toFixed(1)} MB... no cierres esta página`)
    try {
      const supabase = createClient(supabaseUrl, anon)
      const { error } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(sign.path, sign.token, file, { contentType: file.type || 'video/mp4' })
      if (error) {
        setFormError(explainUploadError(error.message || String(error), file))
        return null
      }
    } catch (err: any) {
      setFormError(explainUploadError(err?.message || 'failed to fetch', file))
      return null
    }
    return sign.url as string
  }

  const onPickFile = (file: File | null) => {
    setFormError(null)
    if (!file) return setVideoFile(null)
    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    if (!VIDEO_EXT.includes(ext)) {
      setVideoFile(null)
      return setFormError({ title: 'Formato no admitido', detail: `El archivo es .${ext}. Usa MP4, WebM, MKV o MOV (lo más compatible es MP4).` })
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setVideoFile(null)
      return setFormError({
        title: 'El video es demasiado pesado',
        detail: `Pesa ${(file.size / 1024 / 1024).toFixed(1)} MB y el máximo es ${MAX_MB} MB. Comprímelo o súbelo a YouTube/Vimeo y usa "Enlace externo".`,
      })
    }
    setVideoFile(file)
  }

  // ---------- Publicar clase ----------
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!selectedModuleId) return setFormError({ title: 'Falta el módulo', detail: 'Elige a qué módulo pertenece la clase. Si no hay ninguno, crea uno primero.' })
    if (!lessonTitle.trim()) return setFormError({ title: 'Falta el título', detail: 'Escribe el título de la clase.' })
    if (videoSource === 'url') {
      if (!/^https?:\/\//i.test(lessonUrl.trim())) return setFormError({ title: 'Enlace no válido', detail: 'El enlace debe empezar con https:// (por ejemplo, un enlace de YouTube).' })
    } else if (!videoFile) {
      return setFormError({ title: 'No elegiste ningún video', detail: 'Selecciona un archivo de video de tu computadora.' })
    }

    setPublishing(true)
    try {
      let finalUrl = lessonUrl.trim()
      if (videoSource === 'upload' && videoFile) {
        const uploaded = await uploadVideo(videoFile)
        if (!uploaded) return
        finalUrl = uploaded
      }

      setStatus('Guardando la clase...')
      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModuleId,
          title: lessonTitle.trim(),
          description: lessonDesc.trim(),
          videoUrl: finalUrl,
          duration: duration ? parseInt(duration, 10) : null,
          allowedRole: access,
        }),
      })
      const data = await safeJson(res)
      if (res.ok && data.success) {
        setLessonTitle(''); setLessonDesc(''); setLessonUrl(''); setVideoFile(null); setDuration('')
        await loadData()
        setClosed((prev) => { const n = new Set(prev); n.delete(selectedModuleId); return n })
        notify(`Clase publicada (${ACCESS[access].label}).`, 'success')
      } else {
        setFormError({ title: 'No se pudo guardar la clase', detail: data.error || data.message || `Error del servidor (HTTP ${res.status})` })
      }
    } catch {
      setFormError({ title: 'Error de conexión', detail: 'No se pudo comunicar con el servidor. Revisa tu internet e inténtalo de nuevo.' })
    } finally {
      setPublishing(false)
      setStatus('')
    }
  }

  // ---------- Eliminar ----------
  const handleDelete = async (type: 'module' | 'lesson', id: string, name: string, lessonCount = 0) => {
    const msg = type === 'module'
      ? `¿Eliminar el módulo "${name}"?${lessonCount ? ` También se eliminarán sus ${lessonCount} clase(s).` : ''} Esta acción no se puede deshacer.`
      : `¿Eliminar la clase "${name}"? Esta acción no se puede deshacer.`
    if (!confirm(msg)) return
    try {
      const res = await fetch(`/api/admin/delete?type=${type}&id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        if (type === 'module' && selectedModuleId === id) setSelectedModuleId('')
        await loadData()
        notify(type === 'module' ? 'Módulo eliminado' : 'Clase eliminada', 'success')
      } else {
        const data = await safeJson(res)
        notify(data.error || `No se pudo eliminar (HTTP ${res.status})`, 'error')
      }
    } catch {
      notify('Error de conexión al eliminar', 'error')
    }
  }

  // ---------- Editar clase ----------
  const openEditLesson = async (lessonId: string, moduleId: string) => {
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, { cache: 'no-store' })
      const data = await safeJson(res)
      if (!res.ok || !data.lesson) return notify(data.error || `No se pudo cargar la clase (HTTP ${res.status})`, 'error')
      const l = data.lesson
      setEditLesson({
        id: l.id, title: l.title ?? '', description: l.description ?? '', videoUrl: l.videoUrl ?? '',
        duration: l.duration ? String(l.duration) : '', order: String(l.order ?? 0),
        isPublished: l.isPublished !== false, allowedRole: normalizeAccess(l.allowedRole), moduleId: l.moduleId ?? moduleId,
      })
    } catch {
      notify('Error de conexión al cargar la clase', 'error')
    }
  }

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editLesson) return
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/admin/lessons/${editLesson.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editLesson.title, description: editLesson.description, videoUrl: editLesson.videoUrl,
          duration: editLesson.duration, order: editLesson.order, isPublished: editLesson.isPublished,
          allowedRole: editLesson.allowedRole, moduleId: editLesson.moduleId,
        }),
      })
      const data = await safeJson(res)
      if (res.ok && data.success) {
        setEditLesson(null); await loadData(); notify('Clase actualizada', 'success')
      } else notify(data.error || `No se pudo guardar (HTTP ${res.status})`, 'error')
    } catch {
      notify('Error de conexión al guardar', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  // ---------- Editar módulo ----------
  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModule) return
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/admin/modules/${editModule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editModule.title, description: editModule.description,
          order: editModule.order, isPublished: editModule.isPublished,
        }),
      })
      const data = await safeJson(res)
      if (res.ok && data.success) {
        setEditModule(null); await loadData(); notify('Módulo actualizado', 'success')
      } else notify(data.error || `No se pudo guardar (HTTP ${res.status})`, 'error')
    } catch {
      notify('Error de conexión al guardar', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  const addLessonTo = (moduleId: string) => {
    setSelectedModuleId(moduleId)
    lessonFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const toggleModule = (id: string) =>
    setClosed((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  return (
    <div className="mx-auto max-w-6xl space-y-6 bg-[#fdfdfd] p-5 md:p-8">
      {/* Encabezado */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-[#111111] via-[#1d1d1f] to-[#2d2d30] p-6 text-white shadow-lg md:flex-row md:items-center md:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Sparkles size={16} className="text-[#0284c7]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0284c7]">Panel de gestión</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Contenido de cursos</h1>
          <p className="mt-1 text-xs text-gray-400">Crea módulos, sube clases y decide quién puede verlas.</p>
        </div>
        <div className="flex gap-3">
          <div className="rounded-2xl bg-white/10 px-5 py-3 text-center">
            <p className="text-2xl font-black">{totals.modules}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-300">Módulos</p>
          </div>
          <div className="rounded-2xl bg-white/10 px-5 py-3 text-center">
            <p className="text-2xl font-black">{totals.lessons}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-gray-300">Clases</p>
          </div>
        </div>
      </div>

      {/* Aviso */}
      {toast && (
        <div className={`flex items-start gap-2 rounded-2xl border p-4 text-xs font-bold ${
          toast.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : <AlertCircle size={16} className="mt-0.5 shrink-0" />}
          <span>{toast.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Paso 1: módulo */}
        <div className="rounded-3xl border border-[#ededf0] bg-white p-6 shadow-sm lg:col-span-2 lg:self-start">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f9ff] text-[#0284c7]"><Layers size={20} /></span>
            <div>
              <h2 className="text-sm font-bold text-[#1d1d1f]">1. Nuevo módulo</h2>
              <p className="text-[11px] text-gray-400">Una sección que agrupa varias clases</p>
            </div>
          </div>
          <form onSubmit={handleCreateModule} className="space-y-4">
            <div>
              <label className={labelCls}>Título</label>
              <input value={modTitle} onChange={(e) => setModTitle(e.target.value)} placeholder="Ej. Módulo 1: Introducción" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Descripción (opcional)</label>
              <input value={modDesc} onChange={(e) => setModDesc(e.target.value)} placeholder="Qué se verá en este módulo" className={inputCls} />
            </div>
            <button type="submit" disabled={loadingMod}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1d1d1f] py-3 text-xs font-bold text-white transition-all hover:bg-[#0284c7] disabled:opacity-50 cursor-pointer">
              <Plus size={15} /> {loadingMod ? 'Creando...' : 'Crear módulo'}
            </button>
          </form>
        </div>

        {/* Paso 2: clase */}
        <div ref={lessonFormRef} className="scroll-mt-6 rounded-3xl border border-[#ededf0] bg-white p-6 shadow-sm lg:col-span-3">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0f9ff] text-[#0284c7]"><Video size={20} /></span>
            <div>
              <h2 className="text-sm font-bold text-[#1d1d1f]">2. Publicar clase</h2>
              <p className="text-[11px] text-gray-400">Elige el módulo, el video y quién puede verla</p>
            </div>
          </div>

          <form onSubmit={handleCreateLesson} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Módulo</label>
                <select value={selectedModuleId} onChange={(e) => setSelectedModuleId(e.target.value)} className={inputCls}>
                  <option value="">{modules.length ? 'Selecciona un módulo' : 'Primero crea un módulo'}</option>
                  {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Título de la clase</label>
                <input value={lessonTitle} onChange={(e) => setLessonTitle(e.target.value)} placeholder="Ej. Lectura de order blocks" className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className={labelCls}>Descripción (opcional)</label>
                <input value={lessonDesc} onChange={(e) => setLessonDesc(e.target.value)} placeholder="Breve resumen" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Duración (seg.)</label>
                <input type="number" min={1} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="1200 = 20 min" className={inputCls} />
              </div>
            </div>

            <div>
              <label className={labelCls}>¿Quién puede ver esta clase?</label>
              <AccessPicker value={access} onChange={setAccess} />
            </div>

            <div>
              <label className={labelCls}>Video</label>
              <div className="mb-3 grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
                {([['url', LinkIcon, 'Enlace (YouTube / Vimeo)'], ['upload', Upload, 'Subir desde mi PC']] as const).map(([k, Icon, label]) => (
                  <button key={k} type="button" onClick={() => { setVideoSource(k); setFormError(null) }}
                    className={`flex items-center justify-center gap-2 rounded-lg py-2 text-xs font-bold transition-all cursor-pointer ${
                      videoSource === k ? 'bg-white text-[#0284c7] shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}>
                    <Icon size={14} /> {label}
                  </button>
                ))}
              </div>

              {videoSource === 'url' ? (
                <input value={lessonUrl} onChange={(e) => setLessonUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." className={inputCls} />
              ) : (
                <label className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/60 px-4 py-6 text-center transition-colors hover:border-[#0284c7] hover:bg-[#f0f9ff]/40">
                  <Film size={26} className="text-gray-400" />
                  {videoFile ? (
                    <>
                      <span className="text-xs font-bold text-[#1d1d1f]">{videoFile.name}</span>
                      <span className="text-[11px] text-gray-500">{(videoFile.size / 1024 / 1024).toFixed(1)} MB · clic para cambiar</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-gray-700">Haz clic para elegir un video</span>
                      <span className="text-[11px] text-gray-400">MP4, WebM, MKV o MOV · máximo {MAX_MB} MB</span>
                    </>
                  )}
                  <input type="file" accept="video/mp4,video/webm,video/x-matroska,video/quicktime,.mkv,.mov" className="hidden"
                    onChange={(e) => onPickFile(e.target.files?.[0] || null)} />
                </label>
              )}
            </div>

            {formError && (
              <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4">
                <XCircle size={18} className="mt-0.5 shrink-0 text-rose-500" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-rose-700">{formError.title}</p>
                  <p className="mt-1 break-words text-[11px] leading-relaxed text-rose-600">{formError.detail}</p>
                </div>
                <button type="button" onClick={() => setFormError(null)} className="text-rose-400 hover:text-rose-600 cursor-pointer"><X size={15} /></button>
              </div>
            )}

            {publishing && status && (
              <div className="rounded-xl border border-[#0284c7]/20 bg-[#f0f9ff] p-3">
                <p className="mb-2 text-[11px] font-bold text-[#0284c7]">{status}</p>
                <div className="h-1.5 overflow-hidden rounded-full bg-[#0284c7]/15">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-[#0284c7]" />
                </div>
              </div>
            )}

            <button type="submit" disabled={publishing}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0284c7] py-3.5 text-xs font-bold text-white shadow-md shadow-[#0284c7]/20 transition-all hover:bg-[#c94a1a] disabled:opacity-50 cursor-pointer">
              <Upload size={15} /> {publishing ? 'Publicando...' : 'Publicar clase'}
            </button>
          </form>
        </div>
      </div>

      {/* Listado */}
      <div className="space-y-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#1d1d1f]">
          <Layers size={16} className="text-[#0284c7]" /> Módulos y clases publicados
        </h3>

        {loadingData ? (
          <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center text-xs text-gray-400">Cargando contenido...</div>
        ) : modules.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
            <Layers size={28} className="mx-auto mb-2 text-gray-300" />
            <p className="text-xs font-bold text-gray-600">Todavía no hay módulos</p>
            <p className="mt-1 text-[11px] text-gray-400">Crea el primero con el formulario de arriba.</p>
          </div>
        ) : (
          modules.map((mod) => {
            const lessons = mod.lessons ?? []
            const isClosed = closed.has(mod.id)
            return (
              <div key={mod.id} className="overflow-hidden rounded-3xl border border-[#ededf0] bg-white shadow-sm">
                <div className="flex flex-wrap items-center gap-2 px-5 py-4">
                  <button type="button" onClick={() => toggleModule(mod.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left cursor-pointer">
                    <ChevronDown size={18} className={`shrink-0 text-gray-400 transition-transform ${isClosed ? '-rotate-90' : ''}`} />
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#1d1d1f]">
                        <span className="truncate">{mod.title}</span>
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500">{lessons.length} clase{lessons.length === 1 ? '' : 's'}</span>
                        {mod.isPublished === false && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-gray-200 px-2 py-0.5 text-[10px] font-bold uppercase text-gray-600"><EyeOff size={10} /> Oculto</span>
                        )}
                      </p>
                      {mod.description && <p className="truncate text-[11px] text-gray-400">{mod.description}</p>}
                    </div>
                  </button>
                  <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => addLessonTo(mod.id)}
                      className="flex items-center gap-1 rounded-lg bg-[#f0f9ff] px-3 py-1.5 text-[11px] font-bold text-[#0284c7] hover:bg-[#ffe6da] cursor-pointer">
                      <Plus size={13} /> Agregar clase
                    </button>
                    <button type="button" title="Editar módulo"
                      onClick={() => setEditModule({ id: mod.id, title: mod.title ?? '', description: mod.description ?? '', order: String(mod.order ?? 0), isPublished: mod.isPublished !== false })}
                      className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-[#0284c7] cursor-pointer"><Pencil size={15} /></button>
                    <button type="button" title="Eliminar módulo" onClick={() => handleDelete('module', mod.id, mod.title, lessons.length)}
                      className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 cursor-pointer"><Trash2 size={15} /></button>
                  </div>
                </div>

                {!isClosed && (
                  <div className="space-y-2 border-t border-gray-100 bg-gray-50/50 px-5 py-4">
                    {lessons.length === 0 ? (
                      <p className="text-xs italic text-gray-400">Este módulo aún no tiene clases.</p>
                    ) : (
                      lessons.map((lesson) => {
                        const a = ACCESS[normalizeAccess(lesson.allowedRole)]
                        const AIcon = a.icon
                        return (
                          <div key={lesson.id} className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[11px] font-black text-gray-500">{lesson.order}</span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-bold text-[#1d1d1f]">{lesson.title}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${a.badge}`}><AIcon size={11} /> {a.label}</span>
                                {lesson.isPublished === false && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-600"><EyeOff size={10} /> Oculta</span>
                                )}
                              </div>
                            </div>
                            <button type="button" title="Editar clase" onClick={() => openEditLesson(lesson.id, mod.id)}
                              className="rounded-lg p-2 text-gray-500 hover:bg-[#f0f9ff] hover:text-[#0284c7] cursor-pointer"><Pencil size={15} /></button>
                            <button type="button" title="Eliminar clase" onClick={() => handleDelete('lesson', lesson.id, lesson.title)}
                              className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 cursor-pointer"><Trash2 size={15} /></button>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Modal: editar clase */}
      {editLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#1d1d1f]">Editar clase</h3>
              <button type="button" onClick={() => setEditLesson(null)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div><label className={labelCls}>Título</label>
                <input value={editLesson.title} onChange={(e) => setEditLesson({ ...editLesson, title: e.target.value })} className={inputCls} required /></div>
              <div><label className={labelCls}>Descripción</label>
                <input value={editLesson.description} onChange={(e) => setEditLesson({ ...editLesson, description: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Enlace del video</label>
                <input value={editLesson.videoUrl} onChange={(e) => setEditLesson({ ...editLesson, videoUrl: e.target.value })} className={inputCls} required /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 sm:col-span-1"><label className={labelCls}>Módulo</label>
                  <select value={editLesson.moduleId} onChange={(e) => setEditLesson({ ...editLesson, moduleId: e.target.value })} className={inputCls}>
                    {modules.map((m) => <option key={m.id} value={m.id}>{m.title}</option>)}
                  </select></div>
                <div><label className={labelCls}>Orden</label>
                  <input type="number" value={editLesson.order} onChange={(e) => setEditLesson({ ...editLesson, order: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Duración (seg.)</label>
                  <input type="number" min={1} value={editLesson.duration} onChange={(e) => setEditLesson({ ...editLesson, duration: e.target.value })} className={inputCls} /></div>
              </div>
              <div><label className={labelCls}>¿Quién puede verla?</label>
                <AccessPicker value={editLesson.allowedRole} onChange={(v) => setEditLesson({ ...editLesson, allowedRole: v })} /></div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input type="checkbox" checked={editLesson.isPublished} onChange={(e) => setEditLesson({ ...editLesson, isPublished: e.target.checked })} className="h-4 w-4 accent-[#0284c7]" />
                Visible para los alumnos
              </label>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setEditLesson(null)} className="flex-1 rounded-xl bg-gray-100 py-3 text-xs font-bold text-gray-700 hover:bg-gray-200 cursor-pointer">Cancelar</button>
                <button type="submit" disabled={savingEdit} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1d1d1f] py-3 text-xs font-bold text-white hover:bg-[#0284c7] disabled:opacity-50 cursor-pointer">
                  <Save size={14} /> {savingEdit ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: editar módulo */}
      {editModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#1d1d1f]">Editar módulo</h3>
              <button type="button" onClick={() => setEditModule(null)} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 cursor-pointer"><X size={16} /></button>
            </div>
            <form onSubmit={handleSaveModule} className="space-y-4">
              <div><label className={labelCls}>Título</label>
                <input value={editModule.title} onChange={(e) => setEditModule({ ...editModule, title: e.target.value })} className={inputCls} required /></div>
              <div><label className={labelCls}>Descripción</label>
                <input value={editModule.description} onChange={(e) => setEditModule({ ...editModule, description: e.target.value })} className={inputCls} /></div>
              <div><label className={labelCls}>Orden</label>
                <input type="number" value={editModule.order} onChange={(e) => setEditModule({ ...editModule, order: e.target.value })} className={inputCls} /></div>
              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input type="checkbox" checked={editModule.isPublished} onChange={(e) => setEditModule({ ...editModule, isPublished: e.target.checked })} className="h-4 w-4 accent-[#0284c7]" />
                Visible para los alumnos
              </label>
              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setEditModule(null)} className="flex-1 rounded-xl bg-gray-100 py-3 text-xs font-bold text-gray-700 hover:bg-gray-200 cursor-pointer">Cancelar</button>
                <button type="submit" disabled={savingEdit} className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#1d1d1f] py-3 text-xs font-bold text-white hover:bg-[#0284c7] disabled:opacity-50 cursor-pointer">
                  <Save size={14} /> {savingEdit ? 'Guardando...' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}