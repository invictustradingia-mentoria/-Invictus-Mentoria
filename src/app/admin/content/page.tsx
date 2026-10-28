'use client'

import { useState, useEffect } from 'react'
import { Plus, Video, FolderPlus, Trash2, Edit3, Shield, BookOpen } from 'lucide-react'

interface Lesson {
  id: string
  title: string
  description: string | null
  videoUrl: string
  duration: number | null
  order: number
  allowedRole: string
  isPublished: boolean
}

interface Module {
  id: string
  title: string
  description: string | null
  order: number
  isPublished: boolean
  lessons: Lesson[]
}

export default function AdminContentPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'lessons' | 'resources'>('lessons')

  // Estado para formulario de lección
  const [selectedModuleId, setSelectedModuleId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [duration, setDuration] = useState('')
  const [allowedRole, setAllowedRole] = useState('CLUB')

  // Estado para recursos
  const [resources, setResources] = useState<any[]>([])
  const [resTitle, setResTitle] = useState('')
  const [resUrl, setResUrl] = useState('')
  const [resDesc, setResDesc] = useState('')
  const [resRole, setResRole] = useState('CLUB')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const res = await fetch('/api/admin/content') // O tu ruta correspondiente de módulos/lecciones
      const data = await res.json()
      if (data.modules) setModules(data.modules)
      
      const resRes = await fetch('/api/admin/resources')
      const resData = await resRes.json()
      if (resData.resources) setResources(resData.resources)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedModuleId || !title || !videoUrl) return

    try {
      const res = await fetch('/api/admin/lessons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleId: selectedModuleId,
          title,
          description,
          videoUrl,
          duration: duration ? parseInt(duration) : null,
          allowedRole,
        }),
      })

      if (res.ok) {
        setTitle('')
        setDescription('')
        setVideoUrl('')
        setDuration('')
        alert('Lección creada exitosamente')
        fetchData()
      } else {
        alert('Error al crear la lección')
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resTitle || !resUrl) return

    try {
      const res = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: resTitle,
          fileUrl: resUrl,
          description: resDesc,
          allowedRole: resRole,
        }),
      })

      if (res.ok) {
        setResTitle('')
        setResUrl('')
        setResDesc('')
        alert('Recurso compartido exitosamente')
        fetchData()
      } else {
        alert('Error al crear el recurso')
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1d1d1f]">Gestor de Contenido Institucional</h1>
          <p className="text-sm text-[#86868b]">Administra módulos, lecciones con restricción de rol y recursos descargables.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-[#ededf0] shadow-sm">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'lessons' ? 'bg-[#1d1d1f] text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            Lecciones y Módulos
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'resources' ? 'bg-[#1d1d1f] text-white' : 'text-gray-600 hover:text-black'
            }`}
          >
            Gestión de Recursos
          </button>
        </div>
      </div>

      {activeTab === 'lessons' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario de creación de lección */}
          <div className="bg-white rounded-2xl p-6 border border-[#ededf0] shadow-sm h-fit">
            <h2 className="text-sm font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
              <Video size={16} className="text-[#e25822]" />
              Agregar Nueva Lección
            </h2>
            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Seleccionar Módulo</label>
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

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Título de la Lección</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej. Análisis de Liquidez en Nasdaq"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">URL del Video (YouTube, Vimeo o MP4)</label>
                <input
                  type="text"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rol Requerido</label>
                  <select
                    value={allowedRole}
                    onChange={(e) => setAllowedRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                  >
                    <option value="CLUB">CLUB</option>
                    <option value="MENTORIA">MENTORIA</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Duración (seg)</label>
                  <input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="1200"
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Puntos clave explicados..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#e25822] transition-all cursor-pointer"
              >
                Guardar Lección
              </button>
            </form>
          </div>

          {/* Listado de módulos y lecciones actuales */}
          <div className="lg:col-span-2 space-y-4">
            {modules.map((mod) => (
              <div key={mod.id} className="bg-white rounded-2xl p-5 border border-[#ededf0] shadow-sm">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                  <h3 className="text-sm font-bold text-[#1d1d1f]">{mod.title}</h3>
                  <span className="text-[11px] text-gray-400">{mod.lessons.length} clases</span>
                </div>
                <div className="space-y-2">
                  {mod.lessons.map((lesson) => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-gray-400">#{lesson.order}</span>
                        <div>
                          <p className="font-semibold text-gray-800">{lesson.title}</p>
                          <span className="inline-block mt-0.5 text-[9px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700">
                            Rol: {lesson.allowedRole}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Pestaña de Gestión de Recursos */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-[#ededf0] shadow-sm h-fit">
            <h2 className="text-sm font-bold text-[#1d1d1f] mb-4 flex items-center gap-2">
              <FolderPlus size={16} className="text-[#e25822]" />
              Subir Recurso Institucional
            </h2>
            <form onSubmit={handleCreateResource} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Título del Recurso</label>
                <input
                  type="text"
                  value={resTitle}
                  onChange={(e) => setResTitle(e.target.value)}
                  placeholder="Ej. Plantilla Trading Plan v2"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Enlace del Archivo (URL)</label>
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
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                >
                  <option value="CLUB">CLUB</option>
                  <option value="MENTORIA">MENTORIA</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={resDesc}
                  onChange={(e) => setResDesc(e.target.value)}
                  rows={3}
                  placeholder="Detalles del material..."
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#e25822]"
                />
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
            {resources.map((res) => (
              <div key={res.id} className="bg-white rounded-2xl p-4 border border-[#ededf0] shadow-sm flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700 uppercase">
                      {res.allowedRole}
                    </span>
                    <h3 className="text-xs font-bold text-[#1d1d1f]">{res.title}</h3>
                  </div>
                  <p className="text-[11px] text-gray-500">{res.description || 'Sin descripción'}</p>
                </div>
                <a
                  href={res.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-black hover:bg-[#e25822] hover:text-white transition-all"
                >
                  Ver Archivo
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}