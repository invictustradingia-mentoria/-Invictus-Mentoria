'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Loader2, AlertCircle, ShieldAlert } from 'lucide-react'

declare global {
  interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void; Hls?: any }
}

type Source =
  | { type: 'youtube'; id: string; watermark: string }
  | { type: 'file'; url: string; watermark: string }
  | { type: 'hls'; url: string; watermark: string }
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

let hlsPromise: Promise<any> | null = null
function loadHls(): Promise<any> {
  if (typeof window === 'undefined') return Promise.reject()
  if (window.Hls) return Promise.resolve(window.Hls)
  if (!hlsPromise) {
    hlsPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js'
      s.onload = () => resolve(window.Hls)
      s.onerror = () => { hlsPromise = null; reject(new Error('hls')) }
      document.head.appendChild(s)
    })
  }
  return hlsPromise
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
  const hlsRef = useRef<any>(null)
  const tick = useRef<any>(null)
  const srcRef = useRef<Source | null>(null)
  const lockedRef = useRef(false)
  const lastSig = useRef<Record<string, number>>({})

  const [src, setSrc] = useState<Source | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [locked, setLocked] = useState<{ reason: string } | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [ready, setReady] = useState(false)
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [cur, setCur] = useState(0)
  const [dur, setDur] = useState(0)
  const [muted, setMuted] = useState(false)
  const [rate, setRate] = useState(1)
  const [full, setFull] = useState(false)
  const [wm, setWm] = useState({ top: 12, left: 12 })

  srcRef.current = src
  lockedRef.current = !!locked

  // 1. Pedir el video al servidor (valida sesión, nivel y bloqueo de seguridad)
  useEffect(() => {
    let alive = true
    setSrc(null); setError(null); setReady(false); setStarted(false); setPlaying(false); setCur(0); setDur(0)
    fetch(`/api/student/video?lessonId=${encodeURIComponent(lessonId)}`, { cache: 'no-store' })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}))
        if (!alive) return
        if (d.locked) setLocked({ reason: d.reason || '' })
        else if (!r.ok) setError(d.error || `No se pudo cargar el video (HTTP ${r.status})`)
        else { setLocked(null); setSrc(d) }
      })
      .catch(() => alive && setError('No se pudo conectar con el servidor.'))
    return () => { alive = false }
  }, [lessonId, reloadKey])

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

  // 3. Streaming HLS (.m3u8): Safari lo reproduce directo; el resto usa hls.js
  useEffect(() => {
    if (!src || src.type !== 'hls') return
    let destroyed = false
    const v = videoRef.current
    if (!v) return
    if (v.canPlayType('application/vnd.apple.mpegurl')) {
      v.src = src.url
    } else {
      loadHls().then((Hls) => {
        if (destroyed || !Hls?.isSupported?.()) {
          if (!destroyed) setError('Tu navegador no puede reproducir este tipo de video.')
          return
        }
        const h = new Hls()
        hlsRef.current = h
        h.on(Hls.Events.ERROR, (_: any, d: any) => {
          if (d?.fatal) setError('No se pudo cargar el video (el servidor del video no permite reproducirlo aquí o el enlace venció).')
        })
        h.loadSource(src.url)
        h.attachMedia(v)
      }).catch(() => setError('No se pudo cargar el reproductor de video.'))
    }
    return () => {
      destroyed = true
      try { hlsRef.current?.destroy() } catch {}
      hlsRef.current = null
    }
  }, [src])

  // Marca de agua: cambia de lugar
  useEffect(() => {
    const t = setInterval(() => setWm({ top: 8 + Math.random() * 72, left: 4 + Math.random() * 58 }), 7000)
    return () => clearInterval(t)
  }, [])

  const pauseNow = useCallback(() => {
    const s = srcRef.current
    if (s?.type === 'youtube') ytPlayer.current?.pauseVideo?.()
    else videoRef.current?.pause()
  }, [])

  // Pausar al cambiar de pestaña
  useEffect(() => {
    const onHide = () => { if (document.hidden) pauseNow() }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [pauseNow])

  useEffect(() => {
    const onFs = () => setFull(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  // ---- Seguridad: señales sospechosas -> el servidor decide si bloquea ----
  const reportSignal = useCallback((signal: string, strong: boolean) => {
    if (!srcRef.current || lockedRef.current) return
    if (strong) pauseNow()
    const now = Date.now()
    if (now - (lastSig.current[signal] || 0) < 3000) return
    lastSig.current[signal] = now
    fetch('/api/student/security', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ signal, lessonId }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.locked) {
          pauseNow()
          if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
          setSrc(null)
          setPlaying(false)
          setLocked({ reason: d.reason || '' })
        }
      })
      .catch(() => {})
  }, [lessonId, pauseNow])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key
      const code = e.code
      // Captura de pantalla: Impr Pant, Win+Shift+S, Cmd+Shift+3/4/5
      if (k === 'PrintScreen' || code === 'PrintScreen' ||
          (e.metaKey && e.shiftKey && (code === 'KeyS' || code === 'Digit3' || code === 'Digit4' || code === 'Digit5'))) {
        try { navigator.clipboard.writeText('') } catch {}
        reportSignal('screenshot_key', true)
        return
      }
      // Imprimir
      if ((e.ctrlKey || e.metaKey) && code === 'KeyP') { reportSignal('print', true); return }
      // Herramientas de desarrollador / ver código fuente
      if (k === 'F12' ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && (code === 'KeyI' || code === 'KeyJ' || code === 'KeyC')) ||
          (e.metaKey && e.altKey && code === 'KeyI') ||
          ((e.ctrlKey || e.metaKey) && code === 'KeyU')) {
        reportSignal('devtools_key', false)
      }
    }
    const onPrint = () => reportSignal('print', true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('keyup', onKey)
    window.addEventListener('beforeprint', onPrint)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('keyup', onKey)
      window.removeEventListener('beforeprint', onPrint)
    }
  }, [reportSignal])

  // Mientras está bloqueado: preguntar cada 15 s si un administrador ya lo habilitó
  useEffect(() => {
    if (!locked) return
    const t = setInterval(async () => {
      try {
        const r = await fetch('/api/student/security', { cache: 'no-store' })
        const d = await r.json()
        if (r.ok && d.locked === false) { setLocked(null); setReloadKey((k) => k + 1) }
      } catch {}
    }, 15000)
    return () => clearInterval(t)
  }, [locked])

  const play = useCallback(() => {
    if (src?.type === 'youtube') ytPlayer.current?.playVideo?.()
    else videoRef.current?.play()
  }, [src])

  function pause() { pauseNow() }

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
      {locked ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-900 to-slate-800 p-6 text-center text-white">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
            <ShieldAlert size={34} />
          </span>
          <p className="text-lg font-black">Video detenido por seguridad</p>
          <p className="max-w-md text-sm text-white/80">
            Detectamos actividad no permitida mientras veías el contenido. Tu acceso a los videos quedó suspendido hasta que el equipo realice una revisión manual.
          </p>
          {locked.reason && <p className="max-w-md rounded-lg bg-white/10 px-3 py-1.5 text-[11px] text-white/70">Motivo: {locked.reason}</p>}
          <p className="text-[11px] text-white/50">Si crees que fue un error, escríbenos por soporte. Esta pantalla se actualizará sola cuando te habiliten.</p>
        </div>
      ) : error ? (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-white">
          <AlertCircle size={30} className="text-rose-400" />
          <p className="text-sm font-bold">{error}</p>
        </div>
      ) : !src ? (
        <div className="flex h-full items-center justify-center text-white/70"><Loader2 className="animate-spin" /></div>
      ) : src.type === 'embed' ? (
        <>
          <iframe
            src={src.src}
            title={title}
            className="h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
          <div
            className="pointer-events-none absolute z-30 whitespace-nowrap text-[11px] font-bold text-white/30 transition-all duration-[2000ms]"
            style={{ top: `${wm.top}%`, left: `${wm.left}%`, textShadow: '0 0 4px rgba(0,0,0,.6)' }}
          >
            {watermark}
          </div>
        </>
      ) : (
        <>
          {src.type === 'youtube' ? (
            <div ref={ytHost} className="absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full" />
          ) : (
            <video
              ref={videoRef}
              src={src.type === 'file' ? src.url : undefined}
              className="absolute inset-0 h-full w-full"
              controlsList="nodownload noplaybackrate noremoteplayback"
              disablePictureInPicture
              disableRemotePlayback
              playsInline
              preload="metadata"
              onLoadedMetadata={(e) => { setDur(e.currentTarget.duration); setReady(true) }}
              onCanPlay={() => setReady(true)}
              onTimeUpdate={(e) => setCur(e.currentTarget.currentTime)}
              onPlay={() => { setPlaying(true); setStarted(true) }}
              onPause={() => setPlaying(false)}
              onError={() => { if (src.type === 'file') setError('No se pudo cargar el video. Es posible que el enlace haya vencido: recarga la página.') }}
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