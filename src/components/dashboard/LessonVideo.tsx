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

  if (embed) {
    return (
      <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
        <iframe
          src={embed}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <video src={url} controls controlsList="nodownload" className="h-full w-full" preload="metadata">
        Tu navegador no puede reproducir este video.
      </video>
    </div>
  )
}