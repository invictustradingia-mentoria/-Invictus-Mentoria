'use client'

import { forwardRef, useEffect, useRef, useState } from 'react'
import ChatAvatar from '@/components/chat/ChatAvatar'

interface MentionUser {
  id: string
  name: string
  username: string
  role: string
  avatarUrl: string | null
}

interface Props {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
  maxLength?: number
  className?: string
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

// Textarea con autocompletar de @menciones. Se usa como reemplazo directo de un <textarea>
// controlado en los composers de posts, comentarios y (más adelante) el chat.
const MentionTextarea = forwardRef<HTMLTextAreaElement, Props>(function MentionTextarea(
  { value, onChange, placeholder, rows = 3, maxLength, className, onKeyDown },
  forwardedRef
) {
  const localRef = useRef<HTMLTextAreaElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MentionUser[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  const mentionStart = useRef<number | null>(null)

  function setRef(el: HTMLTextAreaElement | null) {
    ;(localRef as any).current = el
    if (typeof forwardedRef === 'function') forwardedRef(el)
    else if (forwardedRef) (forwardedRef as any).current = el
  }

  function detect(v: string, caret: number) {
    const uptoCaret = v.slice(0, caret)
    const m = uptoCaret.match(/(?:^|\s)@([a-zA-Z0-9_]{0,20})$/)
    if (m) {
      mentionStart.current = caret - m[1].length - 1
      setQuery(m[1])
      setOpen(true)
    } else {
      setOpen(false)
      mentionStart.current = null
    }
  }

  useEffect(() => {
    if (!open) return
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/student/community/mentions?q=${encodeURIComponent(query)}`, { cache: 'no-store' })
        const d = await r.json()
        if (r.ok) {
          setResults(d.users || [])
          setActiveIdx(0)
        }
      } catch {}
    }, 150)
    return () => clearTimeout(t)
  }, [query, open])

  function pick(u: MentionUser) {
    const el = localRef.current
    if (!el || mentionStart.current === null) return
    const caret = el.selectionStart
    const before = value.slice(0, mentionStart.current)
    const after = value.slice(caret)
    const next = `${before}@${u.username} ${after}`
    onChange(next)
    setOpen(false)
    requestAnimationFrame(() => {
      const pos = before.length + u.username.length + 2
      el.focus()
      el.setSelectionRange(pos, pos)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (open && results.length) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIdx((i) => Math.min(i + 1, results.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIdx((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        pick(results[activeIdx])
        return
      }
      if (e.key === 'Escape') {
        setOpen(false)
        return
      }
    }
    onKeyDown?.(e)
  }

  return (
    <div className="relative">
      <textarea
        ref={setRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          detect(e.target.value, e.target.selectionStart)
        }}
        onKeyDown={handleKeyDown}
        onClick={(e) => detect(value, (e.target as HTMLTextAreaElement).selectionStart)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={className}
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg dark:border-white/10 dark:bg-[#111826]">
          {results.map((u, i) => (
            <button
              key={u.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault()
                pick(u)
              }}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] ${i === activeIdx ? 'bg-sky-50 dark:bg-white/10' : ''}`}
            >
              <ChatAvatar userId={u.id} name={u.name} hasPhoto={!!u.avatarUrl} staff={u.role === 'ADMIN' || u.role === 'EDITOR'} size={26} />
              <span className="font-semibold text-slate-700 dark:text-white/80">{u.name}</span>
              <span className="text-slate-400 dark:text-white/40">@{u.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

export default MentionTextarea
