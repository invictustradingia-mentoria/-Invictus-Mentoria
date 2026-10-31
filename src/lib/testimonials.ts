// Convierte un enlace de video en algo que se pueda mostrar en la página.
export function parseVideo(raw: string): { embed: string; direct: boolean } | null {
  const url = (raw || '').trim()
  if (!/^https?:\/\//i.test(url)) return null
  let u: URL
  try { u = new URL(url) } catch { return null }
  const host = u.hostname.replace(/^www\./, '')
  let id = ''
  if (host === 'youtu.be') id = u.pathname.slice(1).split('/')[0]
  else if (host.endsWith('youtube.com')) {
    if (u.pathname === '/watch') id = u.searchParams.get('v') || ''
    else { const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/); if (m) id = m[1] }
  }
  if (id && /^[\w-]{6,}$/.test(id)) return { embed: `https://www.youtube.com/embed/${id}?rel=0`, direct: false }
  if (host === 'vimeo.com' || host === 'player.vimeo.com') {
    const m = u.pathname.match(/(\d{5,})/)
    if (m) return { embed: `https://player.vimeo.com/video/${m[1]}`, direct: false }
  }
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(u.pathname + u.search)) return { embed: url, direct: true }
  return null
}
