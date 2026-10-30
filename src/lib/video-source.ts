// Reconoce enlaces de video de casi cualquier plataforma y los convierte a algo que el reproductor puede mostrar.

export type ResolvedVideo =
  | { type: 'youtube'; id: string }
  | { type: 'hls'; url: string }
  | { type: 'file'; url: string }
  | { type: 'embed'; src: string }

// Acepta un enlace normal o un código <iframe ...> pegado completo. Devuelve el enlace limpio o '' si no es válido.
export function cleanVideoInput(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  let s = raw.trim()
  if (!s) return ''
  if (/<iframe/i.test(s)) {
    const m = /src\s*=\s*["']([^"']+)["']/i.exec(s)
    if (!m) return ''
    s = m[1].trim().replace(/&amp;/g, '&')
  }
  if (s.startsWith('//')) s = 'https:' + s
  return /^https?:\/\//i.test(s) ? s : ''
}

function host(u: URL) {
  return u.hostname.toLowerCase().replace(/^www\./, '')
}

export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url)
    const h = host(u)
    if (h === 'youtu.be') return u.pathname.split('/').filter(Boolean)[0] || null
    if (h === 'youtube.com' || h === 'm.youtube.com' || h === 'youtube-nocookie.com') {
      if (u.pathname === '/watch') return u.searchParams.get('v')
      const parts = u.pathname.split('/')
      if (['embed', 'shorts', 'live'].includes(parts[1])) return parts[2] || null
    }
  } catch {}
  return null
}

const FILE_EXT = /\.(mp4|webm|mov|m4v|ogv|ogg)$/i

export function resolveVideo(url: string): ResolvedVideo {
  const yt = youtubeId(url)
  if (yt) return { type: 'youtube', id: yt }

  let u: URL
  try {
    u = new URL(url)
  } catch {
    return { type: 'embed', src: url }
  }
  const h = host(u)
  const parts = u.pathname.split('/').filter(Boolean)

  // Vimeo (incluye videos no listados con código: vimeo.com/123456/abcdef)
  if (h === 'vimeo.com' || h === 'player.vimeo.com') {
    let i = -1
    if (h === 'player.vimeo.com') {
      const v = parts.indexOf('video')
      i = v >= 0 ? v + 1 : -1
    } else {
      i = parts.findIndex((p) => /^\d+$/.test(p))
    }
    const id = i >= 0 ? parts[i] || '' : ''
    if (/^\d+$/.test(id)) {
      const next = parts[i + 1] || ''
      const hash = u.searchParams.get('h') || (h === 'vimeo.com' && /^[a-f0-9]{8,}$/i.test(next) ? next : '')
      return { type: 'embed', src: `https://player.vimeo.com/video/${id}?${hash ? `h=${hash}&` : ''}title=0&byline=0&portrait=0` }
    }
  }

  // Loom
  if (h === 'loom.com' && (parts[0] === 'share' || parts[0] === 'embed') && parts[1]) {
    return { type: 'embed', src: `https://www.loom.com/embed/${parts[1]}` }
  }

  // Wistia
  if (h === 'fast.wistia.net' || h.endsWith('.wistia.com') || h.endsWith('.wistia.net')) {
    const i = parts.findIndex((p) => p === 'medias' || p === 'iframe')
    if (i >= 0 && parts[i + 1]) return { type: 'embed', src: `https://fast.wistia.net/embed/iframe/${parts[i + 1]}` }
  }

  // Bunny Stream
  if (h === 'iframe.mediadelivery.net' && parts.length >= 3 && (parts[0] === 'play' || parts[0] === 'embed')) {
    return { type: 'embed', src: `https://iframe.mediadelivery.net/embed/${parts[1]}/${parts[2]}` }
  }

  // Google Drive
  if (h === 'drive.google.com') {
    const i = parts.indexOf('d')
    if (i >= 0 && parts[i + 1]) return { type: 'embed', src: `https://drive.google.com/file/d/${parts[i + 1]}/preview` }
  }

  // Dailymotion
  if (h === 'dailymotion.com' && parts[0] === 'video' && parts[1]) {
    return { type: 'embed', src: `https://www.dailymotion.com/embed/video/${parts[1]}` }
  }

  // Streamable
  if (h === 'streamable.com' && parts[0] && parts[0] !== 'e') return { type: 'embed', src: `https://streamable.com/e/${parts[0]}` }

  // Archivos directos
  const path = u.pathname.toLowerCase()
  if (path.endsWith('.m3u8')) return { type: 'hls', url }
  if (FILE_EXT.test(path)) return { type: 'file', url }

  // Cualquier otra dirección: se incrusta tal cual
  return { type: 'embed', src: url }
}