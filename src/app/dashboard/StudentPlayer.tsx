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

  // ── Security state ──────────────────────────────────────────────────────────
  const [isBlackout, setIsBlackout] = useState(false)
  const [blackoutReason, setBlackoutReason] = useState<string>('')
  const videoRef = useRef<HTMLVideoElement>(null)

  // ── Watermark drift ─────────────────────────────────────────────────────────
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

  // ── Anti‑recording protection ────────────────────────────────────────────────
  useEffect(() => {
    const triggerBlackout = (reason: string, track = true) => {
      setIsBlackout(true)
      setBlackoutReason(reason)
      if (videoRef.current) videoRef.current.pause()
      if (track && activeLesson) {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'SECURITY_BLACKOUT',
            page: `/dashboard?lesson=${activeLesson.id}`,
            lessonId: activeLesson.id,
            lessonTitle: activeLesson.title,
            metadata: { reason },
          }),
        }).catch(() => {})
      }
    }

    const handleBlur = () =>
      triggerBlackout('Grabación o captura de pantalla detectada. La visualización se oscurece automáticamente.')

    const handleFocus = () => {
      setIsBlackout(false)
      setBlackoutReason('')
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerBlackout('Pestaña en segundo plano. Contenido protegido.')
      } else {
        setIsBlackout(false)
        setBlackoutReason('')
      }
    }

    // Block getDisplayMedia
    if (typeof window !== 'undefined' && navigator?.mediaDevices?.getDisplayMedia) {
      navigator.mediaDevices.getDisplayMedia = async function () {
        triggerBlackout('La grabación y transmisión de pantalla de las clases está terminantemente prohibida.')
        throw new Error('Screen capture blocked by security policy')
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        triggerBlackout('Captura de pantalla bloqueada.')
        try { navigator.clipboard?.writeText('') } catch (_) {}
        setTimeout(() => setIsBlackout(false), 3000)
        return
      }
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'C', 'c', 'J', 'j'].includes(e.key)) ||
        (e.ctrlKey && ['u', 'U', 's', 'S', 'p', 'P'].includes(e.key))
      ) {
        e.preventDefault()
        e.stopPropagation()
        triggerBlackout('Acceso a código fuente y herramientas de descarga bloqueado.', false)
        setTimeout(() => setIsBlackout(false), 2000)
      }
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [activeLesson])

  // ── Track video play on lesson change ───────────────────────────────────────
  useEffect(() => {
    if (!activeLesson) return
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'VIDEO_PLAY',
        page: `/dashboard?lesson=${activeLesson.id}`,
        lessonId: activeLesson.id,
        lessonTitle: activeLesson.title,
      }),
    }).catch(() => {})
  }, [activeLesson?.id])

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
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: nextState ? 'VIDEO_COMPLETE' : 'VIDEO_UNCOMPLETE',
          page: '/dashboard',
          lessonId: activeLesson.id,
          lessonTitle: activeLesson.title,
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

  // Determine if URL is an embed (iframe) or direct video
  const isEmbedUrl = (url: string) =>
    url.includes('youtube.com/embed') ||
    url.includes('vimeo.com') ||
    url.includes('bunnycdn') ||
    url.includes('iframe') ||
    url.includes('player.') ||
    (!url.endsWith('.mp4') && !url.endsWith('.webm') && !url.endsWith('.ogg') && !url.startsWith('/uploads/'))

  if (modules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <BookOpen size={48} className="text-[#fcd5c3] mb-4" />
        <h2 className="text-xl font-bold text-[#1d1d1f] mb-2">Todavía no hay clases disponibles</h2>
        <p className="text-[#86868b] text-sm max-w-sm">
          El contenido estará disponible pronto. El equipo de Invictus está preparando tus módulos.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[70vh]">
      {/* ── Blackout overlay ─────────────────────────────────────────────────── */}
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

      {/* ── Left: Video player ───────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Video area */}
        {activeLesson ? (
          <>
            {/* Module / lesson breadcrumb */}
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

            {/* Video container – no download, no right-click */}
            <div
              className="relative rounded-2xl overflow-hidden bg-black shadow-xl border border-[#ededf0]"
              style={{ aspectRatio: '16/9' }}
              onContextMenu={(e) => e.preventDefault()}
            >
              {isEmbedUrl(activeLesson.videoUrl) ? (
                <iframe
                  src={activeLesson.videoUrl}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media"
                  allowFullScreen={false}
                  style={{ pointerEvents: isBlackout ? 'none' : 'auto' }}
                />
              ) : (
                <video
                  ref={videoRef}
                  key={activeLesson.id}
                  src={activeLesson.videoUrl}
                  controls
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  playsInline
                  className="w-full h-full object-contain"
                  onContextMenu={(e) => e.preventDefault()}
                />
              )}

              {/* Floating watermark */}
              <div
                className="absolute pointer-events-none select-none"
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

              {/* No-download icon */}
              <div className="absolute top-3 right-3 pointer-events-none">
                <Lock size={16} className="text-white/40" />
              </div>
            </div>

            {/* Controls row */}
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

            {/* Progress bar */}
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
            <p className="text-[#86868b] text-sm">Selecciona una clase para empezar</p>
          </div>
        )}
      </div>

      {/* ── Right: Modules / lessons sidebar ─────────────────────────────────── */}
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
                {/* Module header */}
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

                {/* Lessons list */}
                {isOpen && (
                  <div className="border-t border-[#f4f4f7] divide-y divide-[#f4f4f7]">
                    {mod.lessons.length === 0 ? (
                      <p className="px-4 py-3 text-xs text-[#999] italic">Sin clases en este módulo</p>
                    ) : (
                      mod.lessons.map((lesson) => {
                        const isActive = lesson.id === activeLesson?.id
                        const isDone = completedMap[lesson.id]

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => setActiveLesson(lesson)}
                            className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors cursor-pointer ${
                              isActive
                                ? 'bg-[#fff4ef]'
                                : 'hover:bg-[#fafafc]'
                            }`}
                          >
                            {/* Status icon */}
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

        {/* Security notice */}
        <div className="bg-[#fffaf8] border border-[#fcd5c3] rounded-2xl p-3 flex items-start gap-2 mt-1">
          <ShieldAlert size={14} className="text-[#e25822] shrink-0 mt-0.5" />
          <p className="text-[11px] text-[#86868b] leading-relaxed">
            Contenido protegido. Prohibida la grabación, captura y descarga.
          </p>
        </div>
      </div>
    </div>
  )
}
