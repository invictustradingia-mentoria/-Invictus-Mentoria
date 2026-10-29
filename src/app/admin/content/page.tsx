'use client'

import { useState, useEffect } from 'react'
import { Video, Trash2, Layers, Upload, Link as LinkIcon, CheckCircle2, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  videoUrl: string
  allowedRole: string
  order: number
}

interface Module {
  id: string
  title: string
  description: string | null
  lessons?: Lesson[]
}

// Lee la respuesta de forma segura (aunque el servidor devuelva HTML o vacío)
async function safeJson(res: Response): Promise<any> {
  const text = await res.text()
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return { error: `Respuesta no válida del servidor (HTTP ${res.status})` }
  }
}

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
    setTimeout(() => setMessage(null), 5000)
  }

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
          // Si la API no devuelve el módulo, recargamos la lista
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
    let finalVideoUrl = lessonUrl.trim()

    try {
      if (videoSourceType === 'upload' && videoFile) {
        const formData = new FormData()
        formData.append('file', videoFile)

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })
        const uploadData = await safeJson(uploadRes)
        const uploadedUrl = uploadData.url ?? uploadData.fileUrl ?? uploadData.path

        if (uploadRes.ok && uploadedUrl) {
          finalVideoUrl = uploadedUrl
        } else {
          showNotification(
            uploadData.error || `Error al subir el archivo (HTTP ${uploadRes.status})`,
            'error'
          )
          return
        }
      }

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
    }
  }

  const handleDelete = async (type: 'module' | 'lesson' | 'resource', id: string) => {
    if (!confirm('¿Confirmas la eliminación de este registro?')) return
    try {
      const res = await fetch(`/api/admin/delete?type=${type}&id=${id}`, {
        method: 'DELETE',
      })
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
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822] bg-gray-50/50"
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
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822] bg-gray-50/50"
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
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822] bg-gray-50/50"
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
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822] bg-gray-50/50"
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
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822] bg-gray-50/50"
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
                      className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822] bg-gray-50/50"
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
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                      <div>
                        <h4 className="text-sm font-bold text-[#1d1d1f]">{mod.title}</h4>
                        <p className="text-[11px] text-gray-400">{mod.description || 'Sin descripción asignada'}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDelete('module', mod.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all cursor-pointer"
                      >
                        <Trash2 size={14} /> Eliminar Módulo
                      </button>
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
                                <span className="inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded-md bg-orange-100 text-[#e25822] uppercase">
                                  Acceso: {lesson.allowedRole === 'MENTORIA' ? 'MENTORIA (Mentoría + Club)' : 'CLUB (Solo Club)'}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDelete('lesson', lesson.id)}
                              className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-all cursor-pointer"
                              title="Eliminar clase"
                            >
                              <Trash2 size={14} />
                            </button>
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
    </div>
  )
}