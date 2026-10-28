'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Play,
  Check,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ShieldAlert,
  Lock,
  BookOpen,
} from 'lucide-react'

interface Lesson {
  id: string
  title: string
  description: string | null
  videoUrl: string
  duration: number | null
  order: number
  progress: {
    completed: boolean
    watchedSecs: number
  }[]
}

interface Module {
  id: string
  title: string
  description: string | null
  order: number
  lessons: Lesson[]
}

interface StudentPlayerProps {
  modules: Module[]
  userId: string
  studentName?: string
  studentEmail?: string
  studentIp?: string
}

function formatDuration(secs: number | null): string {
  if (!secs) return '–'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function StudentPlayer({
  modules,
  studentEmail = '',
  studentIp = '127.0.0.1',
}: StudentPlayerProps) {
  const allLessons = modules.flatMap((m) => m.lessons)
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(allLessons[0] || null)

  const activeModule = modules.find((m) => m.lessons.some((l) => l.id === activeLesson?.id)) || modules[0]

  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    modules.forEach((m, idx) => {
      map[m.id] = idx === 0
    })
    return map
  })

  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    modules.forEach((m) => {
      m.lessons.forEach((l) => {
        if (l.progress[0]?.completed) {
          map[l.id] = true
        }
      })
    })
    return map
  })

  // Estado de seguridad (Únicamente ante grabación real de pantalla)
  const [isBlackout, setIsBlackout] = useState(false)
  const [blackoutReason, setBlackoutReason] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)

  // Marca de agua dinámica flotante
  const [watermarkPos, setWatermarkPos] = useState({ top: 15, left: 15 })

  useEffect(() => {
    const interval = setInterval(() => {
      setWatermarkPos({
        top: Math.floor(Math.random() * 65) + 10,
        left: Math.floor(Math.random() * 60) + 10,
      })
    }, 7000)
    return () => clearInterval(interval)
  }, [])

  // Protección anti-grabación estricta y sin falsos positivos
  useEffect(() => {
    const triggerBlackout = (reason: string) => {
      setIsBlackout(true)
      setBlackoutReason(reason)
      if (videoRef.current) videoRef.current.pause()
      
      // Enviar reporte oficial de seguridad a la base de datos para la administración
      fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SECURITY_BLACKOUT',
          page: `/dashboard?lesson=${activeLesson?.id}`,
          lessonId: activeLesson?.id,
          lessonTitle: activeLesson?.title,
          metadata: { reason, email: studentEmail, ip: studentIp },
        }),
      }).catch(() => {})
    }

    // Interceptar getDisplayMedia (Software de captura de pantalla tipo OBS, Discord, etc.)
    if (typeof window !== 'undefined' && navigator?.mediaDevices?.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia = async function () {
        triggerBlackout('Se detectó un software externo intentando grabar o transmitir la clase.')
        throw new Error('Screen capture blocked by security policy')
      }
    }
  }, [activeLesson, studentEmail, studentIp])

  const toggleModule = (modId: string) => {
    setOpenModules((prev) => ({ ...prev, [modId]: !prev[modId] }))
  }

  const handleToggleComplete = async () => {
    if (!activeLesson) return
    const nextState = !completedMap[activeLesson.id]
    setCompletedMap((prev) => ({ ...prev, [activeLesson.id]: nextState }))
    try {
      await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonId: activeLesson.id,
          completed: nextState,
          watchedSecs: nextState ? (activeLesson.duration || 1200) : 0,
        }),
      })
    } catch (err) {
      console.error(err)
    }
  }

  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson?.id)
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < allLessons.length - 1

  const totalLessons = allLessons.length
  const completedCount = Object.values(completedMap).filter(Boolean).length
  const progressPct = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  // Renderizador universal adaptado para YouTube, Vimeo, archivos locales o URLs directas
  const renderVideoContent = (url: string) => {
    if (!url) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm p-4 text-center">
          Esta lección no tiene un video configurado.
        </div>
      )
    }

    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = ''
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]
      } else if (url.includes('embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0]?.split('&')[0]
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0]
      }

      const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=0&controls=1&rel=0&modestbranding=1&playsinline=1`

      return (
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ pointerEvents: isBlackout ? 'none' : 'auto' }}
        />
      )
    }

    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0]
      return (
        <iframe
          src={`https://player.vimeo.com/video/${videoId}`}
          className="w-full h-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          style={{ pointerEvents: isBlackout ? 'none' : 'auto' }}
        />
      )
    }

    return (
      <video
        ref={videoRef}
        key={url}
        src={url}
        controls
        controlsList="nodownload noremoteplayback"
        playsInline
        className="w-full h-full object-contain"
        onContextMenu={(e) => e.preventDefault()}
      />
    )
  }

  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BookOpen size={48} className="text-[#fcd5c3] mb-4" />
        <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">No hay clases disponibles para tu nivel</h2>
        <p className="text-[#86868b] text-sm max-w-sm">
          Es posible que el contenido esté asignado a otro rol institucional o los módulos estén vacíos.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[70vh]">
      {isBlackout && (
        <div
          className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center cursor-pointer"
          onClick={() => {
            setIsBlackout(false)
            setBlackoutReason('')
          }}
        >
          <ShieldAlert size={56} className="text-[#e25822] mb-4" />
          <p className="text-white font-bold text-lg text-center max-w-md px-6">
            {blackoutReason || 'Contenido protegido'}
          </p>
          <p className="text-[#999] text-sm mt-2">Haz clic para continuar viendo</p>
        </div>
      )}

      <div className="flex-1 flex flex-col gap-4">
        {activeLesson ? (
          <>
            <div>
              <span className="text-[11px] font-bold text-[#e25822] uppercase tracking-wider">
                {activeModule?.title}
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#1d1d1f] mt-0.5 leading-tight">
                {activeLesson.title}
              </h2>
              {activeLesson.description && (
                <p className="text-sm text-[#86868b] mt-1">{activeLesson.description}</p>
              )}
            </div>

            <div
              className="relative rounded-2xl overflow-hidden bg-black shadow-xl border border-[#ededf0]"
              style={{ aspectRatio: '16/9' }}
              onContextMenu={(e) => e.preventDefault()}
            >
              {renderVideoContent(activeLesson.videoUrl)}

              <div
                className="absolute pointer-events-none select-none z-10"
                style={{
                  top: `${watermarkPos.top}%`,
                  left: `${watermarkPos.left}%`,
                  transition: 'top 2s ease, left 2s ease',
                }}
              >
                <span className="text-white/20 text-xs font-mono font-bold whitespace-nowrap">
                  {studentEmail} · {studentIp}
                </span>
              </div>

              <div className="absolute top-3 right-3 pointer-events-none z-10">
                <Lock size={16} className="text-white/40" />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => hasPrev && setActiveLesson(allLessons[currentIndex - 1])}
                  disabled={!hasPrev}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#e5e5ea] text-[#1d1d1f] hover:border-[#e25822] hover:text-[#e25822] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => hasNext && setActiveLesson(allLessons[currentIndex + 1])}
                  disabled={!hasNext}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-[#e5e5ea] text-[#1d1d1f] hover:border-[#e25822] hover:text-[#e25822] disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
                >
                  Siguiente →
                </button>
              </div>

              <button
                onClick={handleToggleComplete}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                  completedMap[activeLesson.id]
                    ? 'bg-[#f0faf4] border border-[#b9e6cc] text-[#24a148]'
                    : 'bg-white border border-[#e5e5ea] text-[#6e6e73] hover:border-[#24a148] hover:text-[#24a148]'
                }`}
              >
                <CheckCircle size={14} />
                {completedMap[activeLesson.id] ? 'Completada ✓' : 'Marcar como completada'}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#ededf0] shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#1d1d1f]">Progreso del curso</span>
                <span className="text-xs font-bold text-[#e25822]">
                  {completedCount} / {totalLessons} clases · {progressPct}%
                </span>
              </div>
              <div className="w-full bg-[#f0f0f4] rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-[#e25822] to-[#f5a623] h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-64 bg-[#f9f9fb] rounded-2xl border border-[#ededf0]">
            <p className="text-[#86868b] text-sm">No hay clases disponibles para tu rol actual.</p>
          </div>
        )}
      </div>

      <div className="w-full lg:w-80 xl:w-96 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1d1d1f]">Módulos del Curso</h3>
          <span className="text-[11px] text-[#86868b]">{totalLessons} clases</span>
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[75vh] pr-1">
          {modules.map((mod) => {
            const modCompleted = mod.lessons.filter((l) => completedMap[l.id]).length
            const isOpen = openModules[mod.id]

            return (
              <div
                key={mod.id}
                className="bg-white rounded-2xl border border-[#ededf0] overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[#fafafc] transition-colors cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-[#1d1d1f] truncate">{mod.title}</p>
                    <p className="text-[11px] text-[#86868b] mt-0.5">
                      {modCompleted}/{mod.lessons.length} completadas
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronUp size={16} className="text-[#999] shrink-0 ml-2" />
                  ) : (
                    <ChevronDown size={16} className="text-[#999] shrink-0 ml-2" />
                  )}
                </button>

                {isOpen && (
                  <div className="border-t border-[#f4f4f7] divide-y divide-[#f4f4f7]">
                    {mod.lessons.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-[#999] italic">Sin clases para tu rol</p>
                    ) : (
                      mod.lessons.map((lesson) => {
                        const isActive = lesson.id === activeLesson?.id
                        const isDone = completedMap[lesson.id]

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                              isActive ? 'bg-[#fff4ef]' : 'hover:bg-[#fafafc]'
                            }`}
                          >
                            <div className="shrink-0 mt-0.5">
                              {isDone ? (
                                <Check size={14} className="text-[#24a148]" />
                              ) : isActive ? (
                                <Play size={14} className="text-[#e25822]" fill="#e25822" />
                              ) : (
                                <div className="w-3.5 h-3.5 rounded-full border-2 border-[#ccc]" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-[12px] font-semibold truncate ${
                                  isActive ? 'text-[#e25822]' : 'text-[#1d1d1f]'
                                }`}
                              >
                                {lesson.order}. {lesson.title}
                              </p>
                              <p className="text-[10px] text-[#999] mt-0.5">
                                {formatDuration(lesson.duration)}
                              </p>
                            </div>
                          </button>
                        )
                      })
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="bg-[#fffaf8] border border-[#fcd5c3] rounded-2xl p-3 flex items-start gap-2 mt-1">
          <ShieldAlert size={14} className="text-[#e25822] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#86868b] leading-relaxed">
            Contenido protegido. Prohibida la grabación y retransmisión no autorizada.
          </p>
        </div>
      </div>
    </div>
  )
}