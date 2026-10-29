'use client'

import { useEffect, useRef } from 'react'
import { LANDING_CSS } from './landing-css'
import { LANDING_HTML } from './landing-html'
import { LANDING_JS } from './landing-js'

// 'youtube' -> usa tu video de YouTube (recomendado)
// 'file'    -> usa el archivo /public/landing/video.mp4 y /public/landing/poster.jpg
const VIDEO_MODE = 'youtube' as 'youtube' | 'file'

const POSTER =
  VIDEO_MODE === 'file'
    ? '/landing/poster.jpg'
    : 'https://i.ytimg.com/vi/H-t8Sk2FhA0/maxresdefault.jpg'

const HTML = LANDING_HTML.split('__POSTER__').join(POSTER)

export default function Landing() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const root = document.documentElement
    const prevScroll = root.style.scrollBehavior
    root.style.scrollBehavior = 'smooth'

    const init = new Function('R', 'MODE', LANDING_JS) as (
      R: HTMLElement,
      MODE: string
    ) => () => void
    const cleanup = init(el, VIDEO_MODE)

    return () => {
      if (typeof cleanup === 'function') cleanup()
      root.style.scrollBehavior = prevScroll
    }
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />
      <div
        id="invl-root"
        ref={ref}
        className="invl"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: HTML }}
      />
    </>
  )
}