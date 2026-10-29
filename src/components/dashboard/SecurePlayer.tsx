'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, AlertCircle } from 'lucide-react'

declare global {
  interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void }
}

type Source =
  | { type: 'youtube'; id: string; watermark: string }
  | { type: 'file'; url: string; watermark: string }
  | { type: 'embed'; src: string; watermark: string }

let ytPromise: Promise<any> | null = null
function loadYT(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject()
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (!ytPromise) {
    ytPromise = new Promise((resolve) => {
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(window.YT) }
      const s = document.createElement('script')
      s.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(s)
    })
  }
  return ytPromise
}

const fmt = (s: number) => {
  if (!isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

const RATES = [0.75, 1, 1.25, 1.5, 2]

export default function SecurePlayer({ lessonId, title }: { lessonId: string; title: string }) {
  const boxRef = useRef<HTMLDivElement>(null)
  const ytHost = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const ytPlayer = useRef<any>(null)
  const tick = useRef<any>(null)

  const [src, setSrc] = useState<Source | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)
  const [muted, setMuted] = useState(false)
  const [rate, setRate] = useState(1)
  const [full, setFull] = useState(false)
  const [wm, setWm] = useState({ top: 12, left: 12 })

  // 1. Pedir el video al servidor (valida sesión y nivel)
  useEffect(() => {
    let alive = true
    setSrc(null); setError(null); setReady(false); setStarted(false); setPlaying(false); setCur(0); setDur(0)
    fetch(`/api/student/video?lessonId=${encodeURIComponent(lessonId)}`, { cache: 'no-store' })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}))
        if (!alive) return
        if (!r.ok) setError(d.error || `No se pudo cargar el video (HTTP ${r.status})`)
        else setSrc(d)
      })
      .catch(() => alive && setError('No se pudo conectar con el servidor.'))
    return () => { alive = false }
  }, [lessonId])

  // 2. YouTube con controles propios
  useEffect(() => {
    if (!src || src.type !== 'youtube') return
    let destroyed = false
    loadYT().then((YT) => {
      if (destroyed || !ytHost.current) return
      const mount = document.createElement('div')
      ytHost.current.innerHTML = ''
      ytHost.current.appendChild(mount)
      ytPlayer.current = new YT.Player(mount, {
        videoId: src.id,
        host: 'https://www.youtube-nocookie.com',
        width: '100%',
        height: '100%',
        playerVars: {
          controls: 0, disablekb: 1, fs: 0, modestbranding: 1, rel: 0, iv_load_policy: 3,
          playsinline: 1, cc_load_policy: 0, origin: window.location.origin,
        },
        events: {
          onReady: (e: any) => { setDur(e.target.getDuration()); setReady(true) },
          onStateChange: (e: any) => {
            setPlaying(e.data === 1)
            if (e.data === 1) setStarted(true)
            if (e.data === 1 || e.data === 2) setDur(e.target.getDuration())
          },
          onError: (e: any) => {
            const map: Record<number, string> = {
              2: 'El enlace del video no es válido.',
              5: 'Error de reproducción en tu navegador.',
              100: 'El video fue eliminado o está privado en su origen.',
              101: 'El dueño del video no permite reproducirlo en otras páginas.',
              150: 'El dueño del video no permite reproducirlo en otras páginas.',
              153: 'El video no permite reproducirse aquí (configuración de inserción).',
            }
            setError(map[e.data] || 'No se pudo reproducir el video.')
          },
        },
      })
      tick.current = setInterval(() => {
        const p = ytPlayer.current
        if (p?.getCurrentTime) setCur(p.getCurrentTime())
      }, 400)
    }).catch(() => setError('No se pudo cargar el reproductor.'))

    return () => {
      destroyed = true
      clearInterval(tick.current)
      try { ytPlayer.current?.destroy() } catch {}
      ytPlayer.current = null
    }
  }, [src])

  // Marca de agua: cambia de lugar
  useEffect(() => {
    const t = setInterval(() => setWm({ top: 8 + Math.random() * 72, left: 4 + Math.random() * 58 }), 7000)
    return () => clearInterval(t)
  }, [])

  // Pausar al cambiar de pestaña
  useEffect(() => {
    const onHide = () => { if (document.hidden) pause() }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  })

  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  // Intento de bloquear capturas por teclado (disuasivo)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        pause()
        try { navigator.clipboard.writeText('') } catch {}
      }
    }
    window.addEventListener('keyup', onKey)
    return () => window.removeEventListener('keyup', onKey)
  })

  const play = useCallback(() => {
    if (src?.type === 'youtube') ytPlayer.current?.playVideo?.()
    else videoRef.current?.play()
  }, [src])

  function pause() {
    if (src?.type === 'youtube') ytPlayer.current?.pauseVideo?.()
    else videoRef.current?.pause()
  }

  const toggle = () => (playing ? pause() : play())

  const seek = (t: number) => {
    setCur(t)
    if (src?.type === 'youtube') ytPlayer.current?.seekTo?.(t, true)
    else if (videoRef.current) videoRef.current.currentTime = t
  }

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    if (src?.type === 'youtube') next ? ytPlayer.current?.mute?.() : ytPlayer.current?.unMute?.()
    else if (videoRef.current) videoRef.current.muted = next
  }

  const cycleRate = () => {
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length]
    setRate(next)
    if (src?.type === 'youtube') ytPlayer.current?.setPlaybackRate?.(next)
    else if (videoRef.current) videoRef.current.playbackRate = next
  }

  const toggleFull = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else boxRef.current?.requestFullscreen?.()
  }

  const watermark = src?.watermark || ''

  return (
    <div
      ref={boxRef}
      onContextMenu={(e) => e.preventDefault()}
      className="relative aspect-video w-full select-none overflow-hidden rounded-2xl bg-black"
    >
      {error ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-white">
          <AlertCircle size={30} className="text-rose-400" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      ) : !src ? (
        <div className="flex h-full items-center justify-center text-white/70"><Loader2 className="animate-spin" /></div>
      ) : src.type === 'embed' ? (
        <iframe src={src.src} title={title} className="h-full w-full" allow="autoplay; fullscreen; picture-in-picture" allowFullScreen />
      ) : (
        <>
          {src.type === 'youtube' ? (
            <div ref={ytHost} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />
          ) : (
            <video
              ref={videoRef}
              src={src.url}
              className="absolute inset-0 h-full w-full"
              controlsList="nodownload noplaybackrate noremoteplayback"
              disablePictureInPicture
              disableRemotePlayback
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => { setDur(e.currentTarget.duration); setReady(true) }}
              onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
              onPlay={() => { setPlaying(true); setStarted(true) }}
              onPause={() => setPlaying(false)}
              onError={() => setError('No se pudo cargar el video. Es posible que el enlace haya vencido: recarga la página.')}
            />
          )}

          {/* Capa que bloquea cualquier clic sobre el reproductor original */}
          <div className="absolute inset-0 z-10" onClick={toggle} onDoubleClick={toggleFull} />

          {/* Portada: tapa el título y las sugerencias de YouTube mientras no se reproduce */}
          {!playing && (
            <div className="absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700 text-white" onClick={toggle}>
              {!ready ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sky-500 shadow-xl shadow-sky-500/40 transition-transform hover:scale-110">
                    <Play size={34} fill="white" className="ml-1" />
                  </span>
                  <p className="mt-4 max-w-md px-6 text-center text-sm font-bold">{started ? 'En pausa' : title}</p>
                </>
              )}
            </div>
          )}

          {/* Marca de agua con el correo del alumno */}
          <div
            className="pointer-events-none absolute z-30 whitespace-nowrap text-[11px] font-bold text-white/30 transition-all duration-[2000ms]"
            style={{ top: `${wm.top}%`, left: `${wm.left}%`, textShadow: '0 0 4px rgba(0,0,0,.6)' }}
          >
            {watermark}
          </div>

          {/* Controles propios */}
          <div className="absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2 pt-8" onClick={(e) => e.stopPropagation()}>
            <input
              type="range" min={0} max={dur || 0} step={0.5} value={Math.min(cur, dur || 0)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label="Progreso"
              className="h-1 w-full cursor-pointer accent-sky-400"
            />
            <div className="mt-1.5 flex items-center gap-3 text-white">
              <button type="button" onClick={toggle} aria-label={playing ? 'Pausar' : 'Reproducir'} className="cursor-pointer">
                {playing ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
              </button>
              <span className="text-[11px] font-bold tabular-nums">{fmt(cur)} / {fmt(dur)}</span>
              <div className="ml-auto flex items-center gap-3">
                <button type="button" onClick={cycleRate} className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-black cursor-pointer">{rate}x</button>
                <button type="button" onClick={toggleMute} aria-label="Sonido" className="cursor-pointer">
                  {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
                </button>
                <button type="button" onClick={toggleFull} aria-label="Pantalla completa" className="cursor-pointer">
                  {full ? <Minimize size={19} /> : <Maximize size={19} />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}