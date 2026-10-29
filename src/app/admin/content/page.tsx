'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Video, Trash2, Layers, Upload, Link as LinkIcon, CheckCircle2, AlertCircle,
  ShieldCheck, Sparkles, Pencil, X, Save, EyeOff,
} from 'lucide-react'

const BUCKET = 'videos'

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
  id: string
  title: string
  description: string
  videoUrl: string
  duration: string
  order: string
  isPublished: boolean
  allowedRole: 'CLUB' | 'MENTORIA'
  moduleId: string
}

interface EditModuleState {
  id: string
  title: string
  description: string
  order: string
  isPublished: boolean
}

async function safeJson(res: Response): Promise<any> {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { error: `Respuesta no válida del servidor (HTTP ${res.status})` }
  }
}

const inputCls =
  'w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822] bg-gray-50/50'

export default function AdminContentPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [activeTab, setActiveTab] = useState<'courses' | 'resources'>('courses')
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  // Formulario Módulo
  const [modTitle, setModTitle] = useState('')
  const [modDesc, setModDesc] = useState('')
  const [loadingMod, setLoadingMod] = useState(false)

  // Formulario Lección
  const [selectedModuleId, setSelectedModuleId] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDesc, setLessonDesc] = useState('')
  const [videoSourceType, setVideoSourceType] = useState<'url' | 'upload'>('url')
  const [lessonUrl, setLessonUrl] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [lessonRole, setLessonRole] = useState<'CLUB' | 'MENTORIA'>('CLUB')
  const [duration, setDuration] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')

  // Edición
  const [editLesson, setEditLesson] = useState<EditLessonState | null>(null)
  const [editModule, setEditModule] = useState<EditModuleState | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  // Recursos
  const [resources, setResources] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/content', { cache: 'no-store' })
      const data = await safeJson(res)
      if (res.ok && Array.isArray(data.modules)) {
        setModules(data.modules)
      } else if (!res.ok) {
        console.error('Error cargando contenido:', data)
      }
    } catch (err) {
      console.error('Error cargando contenido:', err)
    }

    try {
      const resRes = await fetch('/api/admin/resources', { cache: 'no-store' })
      const resData = await safeJson(resRes)
      if (resRes.ok && Array.isArray(resData.resources)) setResources(resData.resources)
    } catch (err) {
      console.error('Error cargando recursos:', err)
    }
  }

  const showNotification = (text: string, type: 'success' | 'error') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 6000)
  }

  // ---------- Crear módulo ----------
  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modTitle.trim()) {
      showNotification('Ingresa un título para el módulo', 'error')
      return
    }

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
        if (created?.id) {
          setModules((prev) => [...prev, { ...created, lessons: created.lessons ?? [] }])
          setSelectedModuleId(created.id)
        } else {
          await loadData()
        }
        setModTitle('')
        setModDesc('')
        showNotification('¡Módulo creado correctamente!', 'success')
      } else {
        showNotification(data.error || data.message || `Error al crear el módulo (HTTP ${res.status})`, 'error')
      }
    } catch (err) {
      console.error(err)
      showNotification('Error de conexión al crear el módulo', 'error')
    } finally {
      setLoadingMod(false)
    }
  }

  // ---------- Subida de video ----------
  const uploadVideoToStorage = async (file: File): Promise<string | null> => {
    setUploadStatus('Preparando subida...')

    const signRes = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: file.name }),
    })
    const signData = await safeJson(signRes)

    if (!signRes.ok || !signData.token || !signData.path) {
      showNotification(signData.error || `No se pudo preparar la subida (HTTP ${signRes.status})`, 'error')
      return null
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnon) {
      showNotification('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en Netlify', 'error')
      return null
    }

    setUploadStatus(`Subiendo video (${(file.size / 1024 / 1024).toFixed(1)} MB)... no cierres la página`)

    const supabase = createClient(supabaseUrl, supabaseAnon)
    const { error } = await supabase.storage
      .from(BUCKET)
      .uploadToSignedUrl(signData.path, signData.token, file, {
        contentType: file.type || 'video/mp4',
      })

    if (error) {
      showNotification(`Error al subir el video: ${error.message}`, 'error')
      return null
    }

    return signData.url as string
  }

  // ---------- Crear lección ----------
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedModuleId || !lessonTitle.trim()) {
      showNotification('Selecciona un módulo e ingresa un título', 'error')
      return
    }
    if (videoSourceType === 'url' && !lessonUrl.trim()) {
      showNotification('Ingresa el enlace del video', 'error')
      return
    }
    if (videoSourceType === 'upload' && !videoFile) {
      showNotification('Selecciona un archivo de video', 'error')
      return
    }

    setUploading(true)
    setUploadStatus('')
    let finalVideoUrl = lessonUrl.trim()

    try {
      if (videoSourceType === 'upload' && videoFile) {
        const uploadedUrl = await uploadVideoToStorage(videoFile)
        if (!uploadedUrl) return
        finalVideoUrl = uploadedUrl
      }

      setUploadStatus('Guardando la clase...')

      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModuleId,
          title: lessonTitle.trim(),
          description: lessonDesc.trim(),
          videoUrl: finalVideoUrl,
          duration: duration ? parseInt(duration, 10) : 1200,
          allowedRole: lessonRole,
        }),
      })

      const data = await safeJson(res)

      if (res.ok && data.success !== false && !data.error) {
        setLessonTitle('')
        setLessonDesc('')
        setLessonUrl('')
        setVideoFile(null)
        setDuration('')
        await loadData()
        showNotification('¡Clase publicada con éxito!', 'success')
      } else {
        showNotification(data.error || data.message || `Error al publicar la clase (HTTP ${res.status})`, 'error')
      }
    } catch (err) {
      console.error(err)
      showNotification('Error de red al guardar la lección', 'error')
    } finally {
      setUploading(false)
      setUploadStatus('')
    }
  }

  // ---------- Eliminar ----------
  const handleDelete = async (type: 'module' | 'lesson' | 'resource', id: string) => {
    const msg =
      type === 'module'
        ? '¿Eliminar este módulo? También se eliminarán TODAS sus clases.'
        : '¿Confirmas la eliminación de este registro?'
    if (!confirm(msg)) return
    try {
      const res = await fetch(`/api/admin/delete?type=${type}&id=${id}`, { method: 'DELETE' })
      if (res.ok) {
        await loadData()
        showNotification('Registro eliminado con éxito', 'success')
      } else {
        const data = await safeJson(res)
        showNotification(data.error || 'Error al eliminar el registro', 'error')
      }
    } catch (err) {
      console.error(err)
      showNotification('Error de conexión al eliminar', 'error')
    }
  }

  // ---------- Editar lección ----------
  const openEditLesson = async (lessonId: string, moduleId: string) => {
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, { cache: 'no-store' })
      const data = await safeJson(res)
      if (!res.ok || !data.lesson) {
        showNotification(data.error || `No se pudo cargar la clase (HTTP ${res.status})`, 'error')
        return
      }
      const l = data.lesson
      setEditLesson({
        id: l.id,
        title: l.title ?? '',
        description: l.description ?? '',
        videoUrl: l.videoUrl ?? '',
        duration: l.duration ? String(l.duration) : '',
        order: String(l.order ?? 0),
        isPublished: l.isPublished !== false,
        allowedRole: l.allowedRole === 'MENTORIA' ? 'MENTORIA' : 'CLUB',
        moduleId: l.moduleId ?? moduleId,
      })
    } catch (err) {
      console.error(err)
      showNotification('Error de conexión al cargar la clase', 'error')
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
          title: editLesson.title,
          description: editLesson.description,
          videoUrl: editLesson.videoUrl,
          duration: editLesson.duration,
          order: editLesson.order,
          isPublished: editLesson.isPublished,
          allowedRole: editLesson.allowedRole,
          moduleId: editLesson.moduleId,
        }),
      })
      const data = await safeJson(res)
      if (res.ok && data.success) {
        setEditLesson(null)
        await loadData()
        showNotification('Clase actualizada correctamente', 'success')
      } else {
        showNotification(data.error || `Error al guardar (HTTP ${res.status})`, 'error')
      }
    } catch (err) {
      console.error(err)
      showNotification('Error de conexión al guardar la clase', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  // ---------- Editar módulo ----------
  const openEditModule = (mod: Module) => {
    setEditModule({
      id: mod.id,
      title: mod.title ?? '',
      description: mod.description ?? '',
      order: String(mod.order ?? 0),
      isPublished: mod.isPublished !== false,
    })
  }

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editModule) return
    setSavingEdit(true)
    try {
      const res = await fetch(`/api/admin/modules/${editModule.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editModule.title,
          description: editModule.description,
          order: editModule.order,
          isPublished: editModule.isPublished,
        }),
      })
      const data = await safeJson(res)
      if (res.ok && data.success) {
        setEditModule(null)
        await loadData()
        showNotification('Módulo actualizado correctamente', 'success')
      } else {
        showNotification(data.error || `Error al guardar (HTTP ${res.status})`, 'error')
      }
    } catch (err) {
      console.error(err)
      showNotification('Error de conexión al guardar el módulo', 'error')
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 bg-[#fdfdfd] min-h-screen">
      {/* Encabezado Principal */}
      <div className="bg-gradient-to-r from-[#111111] via-[#1d1d1f] to-[#2d2d30] text-white p-6 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-black/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-[#e25822]" />
            <span className="text-[11px] font-bold tracking-widest text-[#e25822] uppercase">Panel de Gestión</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Gestor Integral de Cursos y Contenido</h1>
          <p className="text-xs text-gray-400 mt-1">Administración de módulos, clases, archivos y permisos por nivel de suscripción.</p>
        </div>

        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'courses' ? 'bg-[#e25822] text-white shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            Módulos y Clases
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'resources' ? 'bg-[#e25822] text-white shadow-md' : 'text-gray-300 hover:text-white'
            }`}
          >
            Archivos y Recursos
          </button>
        </div>
      </div>

      {/* Notificación */}
      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-rose-50 border-rose-200 text-rose-700'
          }`}
        >
          {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message.text}
        </div>
      )}

      {activeTab === 'courses' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bloque 1: Crear Módulo */}
            <div className="bg-white rounded-3xl p-6 border border-[#ededf0] shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                  <div className="w-8 h-8 rounded-xl bg-[#fff4ef] flex items-center justify-center text-[#e25822]">
                    <Layers size={18} />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#1d1d1f]">Paso 1. Crear Nuevo Módulo</h2>
                    <p className="text-[11px] text-gray-400">Organiza las lecciones en secciones principales</p>
                  </div>
                </div>

                <form onSubmit={handleCreateModule} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Título del Módulo</label>
                    <input
                      type="text"
                      value={modTitle}
                      onChange={(e) => setModTitle(e.target.value)}
                      placeholder="Ej. Módulo 1: Introducción a la Plataforma"
                      className={inputCls}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Descripción Breve</label>
                    <input
                      type="text"
                      value={modDesc}
                      onChange={(e) => setModDesc(e.target.value)}
                      placeholder="Resumen del contenido que abarcará este módulo..."
                      className={inputCls}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loadingMod}
                    className="w-full py-3 rounded-2xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#e25822] disabled:opacity-50 transition-all shadow-sm cursor-pointer"
                  >
                    {loadingMod ? 'Creando Módulo...' : 'Crear Módulo'}
                  </button>
                </form>
              </div>
            </div>

            {/* Bloque 2: Publicar Clase */}
            <div className="bg-white rounded-3xl p-6 border border-[#ededf0] shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-xl bg-[#fff4ef] flex items-center justify-center text-[#e25822]">
                  <Video size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1d1d1f]">Paso 2. Publicar Lección o Clase</h2>
                  <p className="text-[11px] text-gray-400">Asigna la clase a un módulo y define el rol requerido</p>
                </div>
              </div>

              <form onSubmit={handleCreateLesson} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Módulo Destino</label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold bg-gray-50/50 text-[#1d1d1f] focus:outline-none focus:border-[#e25822]"
                    required
                  >
                    <option value="">-- Selecciona el módulo ({modules.length} disponibles) --</option>
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Título de la Clase</label>
                    <input
                      type="text"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      placeholder="Ej. Estrategias Operativas"
                      className={inputCls}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                      <ShieldCheck size={14} className="text-[#e25822]" /> Acceso de Rol
                    </label>
                    <select
                      value={lessonRole}
                      onChange={(e) => setLessonRole(e.target.value as 'CLUB' | 'MENTORIA')}
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-[#e25822] bg-orange-50/40 focus:outline-none focus:border-[#e25822]"
                    >
                      <option value="CLUB">CLUB (Solo Club)</option>
                      <option value="MENTORIA">MENTORIA (Mentoría + Club)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Descripción (opcional)</label>
                    <input
                      type="text"
                      value={lessonDesc}
                      onChange={(e) => setLessonDesc(e.target.value)}
                      placeholder="Breve resumen de la clase"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Duración en segundos (opcional)</label>
                    <input
                      type="number"
                      min={1}
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="1200 = 20 min"
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Origen del video */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Fuente del Video</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setVideoSourceType('url')}
                      className={`flex items-center justify-center gap-2 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                        videoSourceType === 'url' ? 'bg-[#fff4ef] border-[#e25822] text-[#e25822]' : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      <LinkIcon size={14} />
                      Enlace Externo (YouTube / URL)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSourceType('upload')}
                      className={`flex items-center justify-center gap-2 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
                        videoSourceType === 'upload' ? 'bg-[#fff4ef] border-[#e25822] text-[#e25822]' : 'bg-gray-50 border-gray-200 text-gray-600'
                      }`}
                    >
                      <Upload size={14} />
                      Subir de PC
                    </button>
                  </div>

                  {videoSourceType === 'url' ? (
                    <input
                      type="url"
                      value={lessonUrl}
                      onChange={(e) => setLessonUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className={inputCls}
                    />
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center bg-gray-50/50">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/x-matroska,.mkv"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1d1d1f] file:text-white hover:file:bg-[#e25822] cursor-pointer"
                      />
                      {videoFile && (
                        <p className="text-[11px] text-gray-500 mt-2">
                          {videoFile.name} ({(videoFile.size / 1024 / 1024).toFixed(1)} MB)
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {uploading && uploadStatus && (
                  <p className="text-[11px] font-bold text-[#e25822] animate-pulse">{uploadStatus}</p>
                )}

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-3 rounded-2xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#e25822] disabled:opacity-50 transition-all shadow-md cursor-pointer"
                >
                  {uploading ? 'Procesando y Guardando...' : 'Publicar Clase'}
                </button>
              </form>
            </div>
          </div>

          {/* Listado */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#1d1d1f] flex items-center gap-2">
              <Layers size={16} className="text-[#e25822]" /> Módulos y Clases Existentes
            </h3>

            {modules.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 text-xs text-gray-400">
                Aún no has creado ningún módulo. Utiliza el formulario del Paso 1 para comenzar.
              </div>
            ) : (
              modules.map((mod) => {
                const lessons = mod.lessons ?? []
                return (
                  <div key={mod.id} className="bg-white rounded-3xl p-5 border border-[#ededf0] shadow-sm space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100">
                      <div>
                        <h4 className="text-sm font-bold text-[#1d1d1f] flex items-center gap-2">
                          {mod.title}
                          {mod.isPublished === false && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-gray-200 text-gray-600 uppercase">
                              <EyeOff size={10} /> Oculto
                            </span>
                          )}
                        </h4>
                        <p className="text-[11px] text-gray-400">{mod.description || 'Sin descripción asignada'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModule(mod)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 hover:bg-[#fff4ef] hover:text-[#e25822] transition-all cursor-pointer"
                        >
                          <Pencil size={14} /> Editar Módulo
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete('module', mod.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                        >
                          <Trash2 size={14} /> Eliminar Módulo
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 pl-2">
                      {lessons.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No hay clases publicadas en este módulo.</p>
                      ) : (
                        lessons.map((lesson) => (
                          <div key={lesson.id} className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/80 border border-gray-100 text-xs">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-gray-400 text-[11px]">#{lesson.order}</span>
                              <div>
                                <p className="font-bold text-[#1d1d1f]">{lesson.title}</p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-[#e25822] uppercase">
                                    Acceso: {lesson.allowedRole === 'MENTORIA' ? 'MENTORIA (Mentoría + Club)' : 'CLUB (Solo Club)'}
                                  </span>
                                  {lesson.isPublished === false && (
                                    <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-md bg-gray-200 text-gray-600 uppercase">
                                      <EyeOff size={10} /> Oculta
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => openEditLesson(lesson.id, mod.id)}
                                className="p-2 rounded-xl text-gray-500 hover:bg-[#fff4ef] hover:text-[#e25822] transition-all cursor-pointer"
                                title="Editar clase"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete('lesson', lesson.id)}
                                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                                title="Eliminar clase"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 border border-[#ededf0] shadow-sm">
          <h2 className="text-sm font-bold text-[#1d1d1f] mb-4">Gestión de Archivos y Recursos</h2>
          <p className="text-xs text-gray-400">
            Pestaña para gestionar PDFs y enlaces complementarios. ({resources.length} recursos cargados)
          </p>
        </div>
      )}

      {/* ===== Modal: editar clase ===== */}
      {editLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#1d1d1f]">Editar clase</h3>
              <button type="button" onClick={() => setEditLesson(null)} className="rounded-xl p-1.5 text-gray-500 hover:bg-gray-100 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={editLesson.title}
                  onChange={(e) => setEditLesson({ ...editLesson, title: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={editLesson.description}
                  onChange={(e) => setEditLesson({ ...editLesson, description: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Enlace del video</label>
                <input
                  type="text"
                  value={editLesson.videoUrl}
                  onChange={(e) => setEditLesson({ ...editLesson, videoUrl: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Módulo</label>
                  <select
                    value={editLesson.moduleId}
                    onChange={(e) => setEditLesson({ ...editLesson, moduleId: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold bg-gray-50/50 focus:outline-none focus:border-[#e25822]"
                  >
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center gap-1">
                    <ShieldCheck size={14} className="text-[#e25822]" /> Acceso de Rol
                  </label>
                  <select
                    value={editLesson.allowedRole}
                    onChange={(e) => setEditLesson({ ...editLesson, allowedRole: e.target.value as 'CLUB' | 'MENTORIA' })}
                    className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs font-bold text-[#e25822] bg-orange-50/40 focus:outline-none focus:border-[#e25822]"
                  >
                    <option value="CLUB">CLUB (Solo Club)</option>
                    <option value="MENTORIA">MENTORIA (Mentoría + Club)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Orden</label>
                  <input
                    type="number"
                    value={editLesson.order}
                    onChange={(e) => setEditLesson({ ...editLesson, order: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Duración (segundos)</label>
                  <input
                    type="number"
                    min={1}
                    value={editLesson.duration}
                    onChange={(e) => setEditLesson({ ...editLesson, duration: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editLesson.isPublished}
                  onChange={(e) => setEditLesson({ ...editLesson, isPublished: e.target.checked })}
                  className="h-4 w-4 accent-[#e25822]"
                />
                Clase visible para los alumnos
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditLesson(null)}
                  className="flex-1 rounded-2xl bg-gray-100 py-3 text-xs font-bold text-gray-700 hover:bg-gray-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#1d1d1f] py-3 text-xs font-bold text-white hover:bg-[#e25822] disabled:opacity-50 cursor-pointer"
                >
                  <Save size={14} /> {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Modal: editar módulo ===== */}
      {editModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#1d1d1f]">Editar módulo</h3>
              <button type="button" onClick={() => setEditModule(null)} className="rounded-xl p-1.5 text-gray-500 hover:bg-gray-100 cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={editModule.title}
                  onChange={(e) => setEditModule({ ...editModule, title: e.target.value })}
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={editModule.description}
                  onChange={(e) => setEditModule({ ...editModule, description: e.target.value })}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Orden</label>
                <input
                  type="number"
                  value={editModule.order}
                  onChange={(e) => setEditModule({ ...editModule, order: e.target.value })}
                  className={inputCls}
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={editModule.isPublished}
                  onChange={(e) => setEditModule({ ...editModule, isPublished: e.target.checked })}
                  className="h-4 w-4 accent-[#e25822]"
                />
                Módulo visible para los alumnos
              </label>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModule(null)}
                  className="flex-1 rounded-2xl bg-gray-100 py-3 text-xs font-bold text-gray-700 hover:bg-gray-200 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-[#1d1d1f] py-3 text-xs font-bold text-white hover:bg-[#e25822] disabled:opacity-50 cursor-pointer"
                >
                  <Save size={14} /> {savingEdit ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}