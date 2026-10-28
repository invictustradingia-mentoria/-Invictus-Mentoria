'use client'

import { useState, useEffect, useRef } from 'react'
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Video,
  Clock,
  X,
  UploadCloud,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  FileVideo,
  ShieldAlert,
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  description: string | null
  videoUrl: string
  duration: number | null
  order: number
}

interface Module {
  id: string
  title: string
  description: string | null
  order: number
  lessons: Lesson[]
}

export default function ContentManagerPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)

  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [newModuleDesc, setNewModuleDesc] = useState('')
  const [isAddingModule, setIsAddingModule] = useState(false)

  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null)
  const [lessonForm, setLessonForm] = useState({
    id: '',
    title: '',
    description: '',
    videoUrl: '',
    duration: 1800,
  })

  const [videoSourceType, setVideoSourceType] = useState<'upload' | 'url'>('upload')
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false)
  const [isEditingLesson, setIsEditingLesson] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchModules = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/modules')
      if (res.ok) {
        const data = await res.json()
        setModules(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModules()
  }, [])

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newModuleTitle.trim()) return

    try {
      const res = await fetch('/api/admin/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newModuleTitle,
          description: newModuleDesc,
        }),
      })

      if (res.ok) {
        setNewModuleTitle('')
        setNewModuleDesc('')
        setIsAddingModule(false)
        fetchModules()
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteModule = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este módulo y todas sus lecciones asociadas?')) return
    try {
      const res = await fetch(`/api/admin/modules?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchModules()
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenAddLesson = (moduleId: string) => {
    setSelectedModuleId(moduleId)
    setIsEditingLesson(false)
    setUploadedFileName(null)
    setUploadError(null)
    setVideoSourceType('upload')
    setLessonForm({
      id: '',
      title: '',
      description: '',
      videoUrl: '',
      duration: 1800,
    })
    setIsLessonModalOpen(true)
  }

  const handleOpenEditLesson = (moduleId: string, lesson: Lesson) => {
    setSelectedModuleId(moduleId)
    setIsEditingLesson(true)
    setUploadedFileName(null)
    setUploadError(null)
    setVideoSourceType(lesson.videoUrl.startsWith('/uploads/') ? 'upload' : 'url')
    setLessonForm({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description || '',
      videoUrl: lesson.videoUrl,
      duration: lesson.duration || 1800,
    })
    setIsLessonModalOpen(true)
  }

  // Handle local video file upload from computer
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingVideo(true)
    setUploadError(null)

    try {
      // Intentar calcular duración del video antes de subir
      const tempVideo = document.createElement('video')
      tempVideo.preload = 'metadata'
      tempVideo.onloadedmetadata = () => {
        window.URL.revokeObjectURL(tempVideo.src)
        const durationSecs = Math.round(tempVideo.duration)
        if (durationSecs > 0) {
          setLessonForm(prev => ({ ...prev, duration: durationSecs }))
        }
      }
      tempVideo.src = URL.createObjectURL(file)

      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (res.ok && data.url) {
        setLessonForm(prev => ({ ...prev, videoUrl: data.url }))
        setUploadedFileName(file.name)
      } else {
        setUploadError(data.error || 'Error al subir el archivo de video.')
      }
    } catch (err) {
      setUploadError('Error de red al subir el video.')
    } finally {
      setUploadingVideo(false)
    }
  }

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedModuleId || !lessonForm.title || !lessonForm.videoUrl) return

    try {
      if (isEditingLesson) {
        const res = await fetch('/api/admin/lessons', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: lessonForm.id,
            title: lessonForm.title,
            description: lessonForm.description,
            videoUrl: lessonForm.videoUrl,
            duration: lessonForm.duration,
          }),
        })
        if (res.ok) {
          setIsLessonModalOpen(false)
          fetchModules()
        }
      } else {
        const res = await fetch('/api/admin/lessons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            moduleId: selectedModuleId,
            title: lessonForm.title,
            description: lessonForm.description,
            videoUrl: lessonForm.videoUrl,
            duration: lessonForm.duration,
          }),
        })
        if (res.ok) {
          setIsLessonModalOpen(false)
          fetchModules()
        }
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteLesson = async (id: string) => {
    if (!confirm('¿Eliminar esta lección de video?')) return
    try {
      const res = await fetch(`/api/admin/lessons?id=${id}`, { method: 'DELETE' })
      if (res.ok) fetchModules()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6 md:p-10 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[11px] font-bold text-[#e25822] tracking-wider uppercase block">
            PLAN DE ESTUDIOS
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2.5 mt-0.5">
            <BookOpen size={22} className="text-[#e25822]" />
            Gestor de Módulos y Clases de Video
          </h1>
          <p className="text-[#86868b] text-[13px] mt-1">
            Sube videos directamente desde tu ordenador o vincula enlaces externos con protección anti-descarga y anti-grabación activa.
          </p>
        </div>

        <button
          onClick={() => setIsAddingModule(true)}
          className="px-4 py-2 rounded-xl bg-[#e25822] hover:bg-[#d04c18] active:scale-95 text-white text-[13px] font-semibold transition-all shadow-[0_2px_8px_rgba(226,88,34,0.3)] flex items-center gap-2 cursor-pointer"
        >
          <Plus size={16} />
          Nuevo Módulo
        </button>
      </div>

      {/* Security Banner Notice */}
      <div className="bg-[#fffaf8] border border-[#fcd5c3] p-4 rounded-2xl flex items-center gap-3 text-[13px] text-[#6e6e73]">
        <ShieldAlert size={20} className="text-[#e25822] shrink-0" />
        <div>
          <strong className="text-[#1d1d1f] font-semibold">Protección DRM y Pantalla Oscura Activada:</strong>{' '}
          Todas las lecciones cuentan con bloqueo de clic derecho, bloqueo de descargas nativas, marca de agua forense del alumno y oscurecimiento automático de pantalla ante grabadores y capturas.
        </div>
      </div>

      {/* Add Module Modal Inline */}
      {isAddingModule && (
        <form onSubmit={handleCreateModule} className="bg-white rounded-2xl p-6 border border-[#fcd5c3] shadow-sm space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-[#1d1d1f] text-sm">Crear Nuevo Módulo</h3>
            <button
              type="button"
              onClick={() => setIsAddingModule(false)}
              className="text-[#999] hover:text-[#111]"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">Título del Módulo</label>
              <input
                type="text"
                placeholder="Ej. Estrategias de Order Blocks y Liquidez"
                value={newModuleTitle}
                onChange={e => setNewModuleTitle(e.target.value)}
                className="w-full bg-white border border-[#e5e5ea] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#e25822]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">Descripción Breve</label>
              <input
                type="text"
                placeholder="Ej. Análisis de imbalance y volumen institucional"
                value={newModuleDesc}
                onChange={e => setNewModuleDesc(e.target.value)}
                className="w-full bg-white border border-[#e5e5ea] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#e25822]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingModule(false)}
              className="px-4 py-2 rounded-xl text-xs text-[#6e6e73] hover:text-[#111]"
            >
              Cancelar
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-[#e25822] text-white text-xs font-semibold shadow-sm hover:bg-[#d04c18]">
              Guardar Módulo
            </button>
          </div>
        </form>
      )}

      {/* Modules List */}
      {loading ? (
        <div className="p-12 text-center text-[#86868b]">
          <div className="w-6 h-6 border-2 border-[#e25822] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Cargando contenido...
        </div>
      ) : modules.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 border border-[#ededf0] text-center text-[#86868b] shadow-sm">
          No hay módulos creados aún. Haz clic en &ldquo;Nuevo Módulo&rdquo; para empezar.
        </div>
      ) : (
        <div className="space-y-4">
          {modules.map((mod, idx) => (
            <div key={mod.id} className="bg-white rounded-2xl border border-[#ededf0] overflow-hidden shadow-sm">
              {/* Module Header */}
              <div className="p-5 bg-[#fbfbfd] border-b border-[#ededf0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-[#fff4ef] border border-[#fcd5c3] flex items-center justify-center font-bold text-[#e25822] text-xs shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h2 className="text-[14px] font-bold text-[#1d1d1f] uppercase tracking-tight">{mod.title}</h2>
                    {mod.description && (
                      <p className="text-[#86868b] text-[12px] mt-0.5">{mod.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenAddLesson(mod.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#fcd5c3] text-[#e25822] hover:bg-[#fff4ef] text-xs font-semibold cursor-pointer transition-all shadow-sm"
                  >
                    <Plus size={14} />
                    Agregar Clase
                  </button>
                  <button
                    onClick={() => handleDeleteModule(mod.id)}
                    className="p-1.5 rounded-lg text-[#999] hover:text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                    title="Eliminar Módulo"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Module Lessons Grid */}
              <div className="p-5">
                {mod.lessons.length === 0 ? (
                  <p className="text-xs text-[#999] italic py-2">
                    Este módulo no tiene lecciones aún. Añade una clase subiendo su video o pegando un enlace.
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {mod.lessons.map(lesson => (
                      <div
                        key={lesson.id}
                        className="p-4 rounded-xl border border-[#ededf0] bg-white hover:border-[#fcd5c3] transition-all space-y-2.5 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-[10px] font-semibold text-[#e25822] bg-[#fff4ef] px-2 py-0.5 rounded-md">
                              Lección {lesson.order}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEditLesson(mod.id, lesson)}
                                className="p-1 text-[#999] hover:text-[#111]"
                                title="Editar"
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteLesson(lesson.id)}
                                className="p-1 text-[#999] hover:text-red-500"
                                title="Eliminar"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          <h4 className="font-bold text-[#1d1d1f] text-[13px] mt-2 line-clamp-1">
                            {lesson.title}
                          </h4>
                          {lesson.description && (
                            <p className="text-[12px] text-[#86868b] line-clamp-2 mt-0.5">
                              {lesson.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-[#f4f4f7] flex items-center justify-between text-[11px] text-[#86868b]">
                          <span className="flex items-center gap-1 text-[#e25822] font-mono truncate max-w-[140px]" title={lesson.videoUrl}>
                            <Video size={12} className="shrink-0" />
                            {lesson.videoUrl.startsWith('/uploads/') ? 'Video Local' : lesson.videoUrl}
                          </span>
                          <span className="flex items-center gap-1 shrink-0">
                            <Clock size={12} />
                            {Math.round((lesson.duration || 1800) / 60)}m
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lesson Modal (Add / Edit) with Computer Upload */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveLesson}
            className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-[#e5e5ea] shadow-xl animate-slide-up"
          >
            <div className="flex items-center justify-between border-b border-[#f0f0f4] pb-3">
              <div>
                <h3 className="font-bold text-[#1d1d1f] text-sm">
                  {isEditingLesson ? 'Editar Clase de Video' : 'Nueva Clase de Video'}
                </h3>
                <p className="text-[11px] text-[#86868b]">
                  Sube el archivo desde tu PC o pega una URL externa.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsLessonModalOpen(false)}
                className="text-[#999] hover:text-[#111]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">
                Título de la Lección
              </label>
              <input
                type="text"
                placeholder="Ej. Patrones de Entrada Institucional y Confirmación"
                value={lessonForm.title}
                onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
                className="w-full bg-white border border-[#e5e5ea] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#e25822]"
                required
              />
            </div>

            {/* Video Source Tabs */}
            <div className="space-y-2">
              <label className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider block">
                Origen del Video
              </label>
              <div className="flex items-center gap-2 p-1 bg-[#f8f8fa] border border-[#e5e5ea] rounded-xl text-[12px]">
                <button
                  type="button"
                  onClick={() => setVideoSourceType('upload')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    videoSourceType === 'upload'
                      ? 'bg-white text-[#e25822] shadow-sm border border-[#ededf0]'
                      : 'text-[#666] hover:text-[#111]'
                  }`}
                >
                  <UploadCloud size={14} />
                  <span>Subir desde el Ordenador</span>
                </button>
                <button
                  type="button"
                  onClick={() => setVideoSourceType('url')}
                  className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    videoSourceType === 'url'
                      ? 'bg-white text-[#e25822] shadow-sm border border-[#ededf0]'
                      : 'text-[#666] hover:text-[#111]'
                  }`}
                >
                  <LinkIcon size={14} />
                  <span>Enlace Externo (URL)</span>
                </button>
              </div>

              {/* Upload from Computer Box */}
              {videoSourceType === 'upload' ? (
                <div className="space-y-2">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                      lessonForm.videoUrl.startsWith('/uploads/')
                        ? 'border-[#24a148] bg-[#f0faf4]'
                        : 'border-[#fcd5c3] bg-[#fffaf8] hover:bg-[#fff4ef]'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    {uploadingVideo ? (
                      <div className="space-y-2">
                        <div className="w-7 h-7 border-2 border-[#e25822] border-t-transparent rounded-full animate-spin mx-auto" />
                        <p className="text-[12px] font-semibold text-[#1d1d1f]">
                          Subiendo y procesando video desde tu ordenador...
                        </p>
                        <p className="text-[11px] text-[#86868b]">
                          Por favor espera mientras se transfiere el archivo.
                        </p>
                      </div>
                    ) : lessonForm.videoUrl.startsWith('/uploads/') ? (
                      <div className="space-y-1">
                        <CheckCircle size={26} className="text-[#24a148] mx-auto" />
                        <p className="text-[12px] font-bold text-[#1d1d1f]">
                          {uploadedFileName || 'Video cargado correctamente'}
                        </p>
                        <p className="text-[11px] text-[#2e7d44] font-mono break-all">
                          {lessonForm.videoUrl}
                        </p>
                        <span className="text-[11px] text-[#e25822] hover:underline block pt-1 font-semibold">
                          Haz clic para cambiar el archivo
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <FileVideo size={28} className="text-[#e25822] mx-auto" />
                        <p className="text-[12px] font-bold text-[#1d1d1f]">
                          Selecciona un video de tu ordenador
                        </p>
                        <p className="text-[11px] text-[#86868b]">
                          Formatos admitidos: MP4, WebM, MOV, MKV.
                        </p>
                        <span className="inline-block px-3 py-1 bg-white border border-[#fcd5c3] text-[#e25822] text-[11px] font-semibold rounded-lg shadow-sm">
                          Explorar Archivos
                        </span>
                      </div>
                    )}
                  </div>

                  {uploadError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[12px] flex items-center gap-2">
                      <AlertCircle size={15} />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>
              ) : (
                /* External URL Input */
                <div className="space-y-1">
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/embed/... o https://midominio.com/video.mp4"
                    value={lessonForm.videoUrl}
                    onChange={e => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    className="w-full bg-white border border-[#e5e5ea] rounded-xl px-4 py-2.5 text-[13px] font-mono focus:outline-none focus:border-[#e25822]"
                    required={videoSourceType === 'url'}
                  />
                  <p className="text-[11px] text-[#86868b]">
                    Admite enlaces de YouTube, Vimeo, Bunny Stream o URLs directas .mp4 con protección activa.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">Duración (segundos)</label>
                <input
                  type="number"
                  value={lessonForm.duration}
                  onChange={e => setLessonForm({ ...lessonForm, duration: parseInt(e.target.value) || 0 })}
                  className="w-full bg-white border border-[#e5e5ea] rounded-xl px-4 py-2 text-[13px] focus:outline-none focus:border-[#e25822]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">Duración Estimada</label>
                <div className="text-[13px] font-semibold text-[#e25822] py-2 flex items-center gap-1">
                  <Clock size={14} />
                  <span>{Math.round(lessonForm.duration / 60)} minutos</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-[#86868b] font-semibold uppercase tracking-wider">Descripción o Puntos Clave</label>
              <textarea
                rows={3}
                placeholder="Puntos clave explicados en la clase..."
                value={lessonForm.description}
                onChange={e => setLessonForm({ ...lessonForm, description: e.target.value })}
                className="w-full bg-white border border-[#e5e5ea] rounded-xl p-3 text-[13px] focus:outline-none focus:border-[#e25822] resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#f0f0f4]">
              <button
                type="button"
                onClick={() => setIsLessonModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-[#6e6e73] hover:text-[#111]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!lessonForm.videoUrl || uploadingVideo}
                className="px-5 py-2 rounded-xl bg-[#e25822] text-white text-xs font-semibold shadow-sm hover:bg-[#d04c18] disabled:opacity-50 transition-all cursor-pointer"
              >
                {isEditingLesson ? 'Actualizar Lección' : 'Guardar Lección'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
