import { ExternalLink } from 'lucide-react'

function getEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = u.pathname.split('/').filter(Boolean)[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      let id: string | null = null
      if (u.pathname === '/watch') id = u.searchParams.get('v')
      else if (u.pathname.startsWith('/embed/')) id = u.pathname.split('/')[2]
      else if (u.pathname.startsWith('/shorts/')) id = u.pathname.split('/')[2]
      else if (u.pathname.startsWith('/live/')) id = u.pathname.split('/')[2]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean)[0]
      return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null
    }
  } catch {
    return null
  }
  return null
}

export default function LessonVideo({ url, title }: { url: string; title: string }) {
  const embed = getEmbedUrl(url)

  return (
    <div className="space-y-2">
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        {embed ? (
          <iframe
            src={embed}
            title={title}
            className="h-full w-full"
            referrerPolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <video src={url} controls controlsList="nodownload" className="h-full w-full" preload="metadata">
            Tu navegador no puede reproducir este video.
          </video>
        )}
      </div>

      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-[#e25822]"
      >
        <ExternalLink size={13} />
        ¿No carga? Abrir video en una pestaña nueva
      </a>
    </div>
  )
}