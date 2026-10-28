'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

interface TrackerProps {
  currentLessonId?: string
  currentLessonTitle?: string
}

export function ActivityTracker({ currentLessonId, currentLessonTitle }: TrackerProps) {
  const pathname = usePathname()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Report function
  const sendHeartbeat = async (action = 'PAGE_VIEW') => {
    try {
      await fetch('/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          page: pathname,
          lessonId: currentLessonId || null,
          lessonTitle: currentLessonTitle || null,
        }),
      })
    } catch {
      // Silent error for seamless user experience
    }
  }

  useEffect(() => {
    // Send immediate ping on load or route change
    sendHeartbeat('PAGE_VIEW')

    // Set heartbeat every 20 seconds
    intervalRef.current = setInterval(() => {
      sendHeartbeat('HEARTBEAT')
    }, 20000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [pathname, currentLessonId, currentLessonTitle])

  return null
}
