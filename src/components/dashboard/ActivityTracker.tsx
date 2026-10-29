'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export default function ActivityTracker() {
  const pathname = usePathname()
  const sid = useRef('')
  const lastLesson = useRef<string | null>(null)

  const send = (event?: string) => {
    if (!sid.current) return
    let lessonId: string | null = null
    try { lessonId = sessionStorage.getItem('invictus:viewing') } catch {}
    fetch('/api/student/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sid: sid.current, page: window.location.pathname, lessonId, event }),
      keepalive: true,
    }).catch(() => {})
  }

  useEffect(() => {
    try {
      let s = sessionStorage.getItem('invictus:sid')
      if (!s) { s = crypto.randomUUID(); sessionStorage.setItem('invictus:sid', s) }
      sid.current = s
    } catch { sid.current = Math.random().toString(36).slice(2) }

    const beat = setInterval(() => { if (document.visibilityState === 'visible') send() }, 25000)
    const watch = setInterval(() => {
      let cur: string | null = null
      try { cur = sessionStorage.getItem('invictus:viewing') } catch {}
      if (cur !== lastLesson.current) { lastLesson.current = cur; if (cur) send('LESSON_VIEW'); else send() }
    }, 3000)
    return () => { clearInterval(beat); clearInterval(watch) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (sid.current) send('PAGE_VIEW')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  return null
}