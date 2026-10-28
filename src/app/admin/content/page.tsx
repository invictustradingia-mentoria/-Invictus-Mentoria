'use client'

import { useState, useEffect } from 'react'
import { Plus, Video, FolderPlus, Trash2, Layers, Upload, Link as LinkIcon, Shield } from 'lucide-react'

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
  lessons: Lesson[]
}

export default function AdminContentPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [activeTab, setActiveTab] = useState<'courses' | 'resources'>('courses')

  // Formulario Módulo
  const [modTitle, setModTitle] = useState('')
  const [modDesc, setModDesc] = useState('')

  // Formulario Lección
  const [selectedModuleId, setSelectedModuleId] = useState('')
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDesc, setLessonDesc] = useState('')
  const [videoSourceType, setVideoSourceType] = useState<'upload' | 'url'>('upload')
  const [lessonUrl, setLessonUrl] = useState('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [lessonRole, setLessonRole] = useState('CLUB')
  const [duration, setDuration] = useState('')
  const [uploading, setUploading] = useState(false)

  // Recursos
  const [resources, setResources] = useState<any[]>([])
  const [resTitle, setResTitle] = useState('')
  const [resUrl, setResUrl] = useState('')
  const [resRole, setResRole] = useState('CLUB')
  const [resDesc, setResDesc] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const res = await fetch('/api/admin/content')
      const data = await res.json()
      if (data.modules) setModules(data.modules)

      const resRes = await fetch('/api/admin/resources')
      const resData = await resRes.json()
      if (resData.resources) setResources(resData.resources)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!modTitle) return
    const res = await fetch('/api/admin/modules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: modTitle, description: modDesc }),
    })
    if (res.ok) {
      setModTitle('')
      setModDesc('')
      loadData()
      alert('Módulo creado con éxito')
    }
  }

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedModuleId || !lessonTitle) return

    setUploading(true)
    let finalVideoUrl = lessonUrl

    try {
      // Si eligió subir desde el ordenador, procesamos el archivo
      if (videoSourceType === 'upload' && videoFile) {
        const formData = new FormData()
        formData.append('file', videoFile)

        const uploadRes = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })
        const uploadData = await uploadRes.json()
        if (uploadData.url) {
          finalVideoUrl = uploadData.url
        } else {
          alert('Error al subir el archivo de video')
          setUploading(false)
          return
        }
      }

      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModuleId,
          title: lessonTitle,
          description: lessonDesc,
          videoUrl: finalVideoUrl,
          duration: duration ? parseInt(duration) : null,
          allowedRole: lessonRole,
        }),
      })

      if (res.ok) {
        setLessonTitle('')
        setLessonDesc('')
        setLessonUrl('')
        setVideoFile(null)
        setDuration('')
        loadData()
        alert('Clase publicada correctamente')
      } else {
        alert('Error al guardar la lección')
      }
    } catch (err) {
      console.error(err)
      alert('Error de red al publicar la clase')
    } finally {
      setUploading(false)
    }
  }

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resTitle || !resUrl) return
    const res = await fetch('/api/admin/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: resTitle,
        fileUrl: resUrl,
        allowedRole: resRole,
        description: resDesc,
      }),
    })
    if (res.ok) {
      setResTitle('')
      setResUrl('')
      setResDesc('')
      loadData()
      alert('Recurso compartido con éxito')
    }
  }

  const handleDelete = async (type: 'module' | 'lesson' | 'resource', id: string) => {
    if (!confirm('¿Estás seguro de eliminar este elemento?')) return
    const res = await fetch(`/api/admin/delete?type=${type}&id=${id}`, {
      method: 'DELETE',
    })
    if (res.ok) {
      loadData()
    } else {
      alert('Error al eliminar')
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Centro de Control de Contenido</h1>
          <p className="text-sm text-[#86868b]">Control absoluto sobre módulos, clases y permisos institucionales por rol.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#ededf0] shadow-sm">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'courses' ? 'bg-[#1d1d1f] text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            Cursos y Clases
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'resources' ? 'bg-[#1d1d1f] text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            Recursos y Archivos
          </button>
        </div>
      </div>

      {activeTab === 'courses' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Crear Módulo */}
            <div className="bg-white rounded-2xl p-6 border border-[#ededf0] shadow-sm h-fit">
              <h2 className="text-sm font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
                <Layers size={16} className="text-[#e25822]" />
                1. Crear Módulo del Curso
              </h2>
              <form onSubmit={handleCreateModule} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Título del Módulo</label>
                  <input
                    type="text"
                    value={modTitle}
                    onChange={(e) => setModTitle(e.target.value)}
                    placeholder="Ej. Módulo 1: Fundamentos de Trading"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción</label>
                  <input
                    type="text"
                    value={modDesc}
                    onChange={(e) => setModDesc(e.target.value)}
                    placeholder="Breve resumen..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#e25822] transition-all cursor-pointer"
                >
                  Crear Módulo
                </button>
              </form>
            </div>

            {/* 2. Agregar Clase / Lección */}
            <div className="bg-white rounded-2xl p-6 border border-[#ededf0] shadow-sm">
              <h2 className="text-sm font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
                <Video size={16} className="text-[#e25822]" />
                2. Agregar Clase a un Módulo
              </h2>
              <form onSubmit={handleCreateLesson} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Seleccionar Módulo Destino</label>
                  <select
                    value={selectedModuleId}
                    onChange={(e) => setSelectedModuleId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                    required
                  >
                    <option value="">-- Elige un módulo --</option>
                    {modules.map((m) => (
                      <option key={m.id} value={m.id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Título de la Clase</label>
                    <input
                      type="text"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      placeholder="Ej. Patrones de Entrada"
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Rol Requerido (Acceso)</label>
                    <select
                      value={lessonRole}
                      onChange={(e) => setLessonRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#e25822] focus:outline-none focus:border-[#e25822]"
                    >
                      <option value="CLUB">CLUB (Solo Club)</option>
                      <option value="MENTORIA">MENTORIA (Mentoria + Club)</option>
                    </select>
                  </div>
                </div>

                {/* Selector de origen del video: Ordenador o URL Externa */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Origen del Video</label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setVideoSourceType('upload')}
                      className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        videoSourceType === 'upload' ? 'bg-[#fff4ef] border-[#e25822] text-[#e25822]' : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      <Upload size={14} />
                      Subir del Ordenador
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoSourceType('url')}
                      className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        videoSourceType === 'url' ? 'bg-[#fff4ef] border-[#e25822] text-[#e25822]' : 'bg-white border-gray-200 text-gray-600'
                      }`}
                    >
                      <LinkIcon size={14} />
                      Enlace Externo (URL)
                    </button>
                  </div>

                  {videoSourceType === 'upload' ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center bg-gray-50">
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/mkv"
                        onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1d1d1f] file:text-white hover:file:bg-[#e25822] file:cursor-pointer cursor-pointer"
                      />
                      <p className="text-[10px] text-gray-400 mt-2">Formatos admitidos: MP4, WebM, MKV.</p>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={lessonUrl}
                      onChange={(e) => setLessonUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Duración (Segundos)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="1200"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#e25822] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {uploading ? 'Subiendo video...' : 'Publicar Clase'}
                </button>
              </form>
            </div>
          </div>

          {/* Listado de control absoluto */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#1d1d1f]">Módulos y Clases Existentes (Control Absoluto)</h3>
            {modules.map((mod) => (
              <div key={mod.id} className="bg-white rounded-2xl p-5 border border-[#ededf0] shadow-sm flex flex-col gap-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h4 className="text-sm font-bold text-[#1d1d1f]">{mod.title}</h4>
                    <p className="text-[11px] text-gray-400">{mod.description || 'Sin descripción'}</p>
                  </div>
                  <button
                    onClick={() => handleDelete('module', mod.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-600 hover:bg-red-100 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                    Eliminar Módulo
                  </button>
                </div>

                <div className="space-y-2 pl-4">
                  {mod.lessons.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No hay clases en este módulo.</p>
                  ) : (
                    mod.lessons.map((lesson) => (
                      <div key={lesson.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-gray-400">#{lesson.order}</span>
                          <div>
                            <p className="font-semibold text-gray-800">{lesson.title}</p>
                            <span className="inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700 uppercase">
                              Rol Requerido: {lesson.allowedRole}
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete('lesson', lesson.id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          title="Eliminar clase"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Pestaña de Recursos */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#ededf0] shadow-sm h-fit">
            <h2 className="text-sm font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
              <FolderPlus size={16} className="text-[#e25822]" />
              Subir Recurso Institucional
            </h2>
            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Título</label>
                <input
                  type="text"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="Ej. Guía PDF"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL del Archivo</label>
                <input
                  type="text"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rol Requerido</label>
                <select
                  value={resRole}
                  onChange={(e) => setResRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-bold text-[#e25822]"
                >
                  <option value="CLUB">CLUB</option>
                  <option value="MENTORIA">MENTORIA</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#e25822] transition-all cursor-pointer"
              >
                Publicar Recurso
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-sm font-bold text-[#1d1d1f]">Recursos Publicados</h3>
            {resources.map((res) => (
              <div key={res.id} className="bg-white rounded-2xl p-4 border border-[#ededf0] shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700 uppercase">
                      {res.allowedRole}
                    </span>
                    <h4 className="text-xs font-bold text-[#1d1d1f]">{res.title}</h4>
                  </div>
                  <p className="text-[11px] text-gray-400">{res.description || 'Sin descripción'}</p>
                </div>
                <button
                  onClick={() => handleDelete('resource', res.id)}
                  className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                  title="Eliminar recurso"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}