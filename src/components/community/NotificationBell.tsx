'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Bell, AtSign } from 'lucide-react'
import RoleBadge from './RoleBadge'
import { profileHref } from '@/lib/community-shared'

interface Notif {
  id: string
  type: string
  actorId: string
  actorName: string | null
  actorRole: string | null
  postId: string | null
  commentId: string | null
  chatMessageId: string | null
  snippet: string | null
  read: boolean
  createdAt: string
}

function when(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 60000) return 'ahora'
  if (diff < 3600000) return Math.floor(diff / 60000) + ' min'
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' h'
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

function targetHref(n: Notif) {
  if (n.chatMessageId) return '/dashboard/chat'
  if (n.postId) return '/dashboard/chat'
  return '/dashboard/chat'
}

export default function NotificationBell({ meId }: { meId: string }) {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const boxRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/student/notifications', { cache: 'no-store' })
      const d = await r.json()
      if (r.ok) {
        setItems(d.notifications || [])
        setUnread(d.unreadCount || 0)
      }
    } catch {}
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(load, 20000)
    return () => clearInterval(t)
  }, [load])

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  async function markAllRead() {
    setUnread(0)
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
    await fetch('/api/student/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ all: true }) }).catch(() => {})
  }

  async function markOneRead(n: Notif) {
    if (n.read) return
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))
    setUnread((u) => Math.max(0, u - 1))
    await fetch('/api/student/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: n.id }) }).catch(() => {})
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificaciones"
        className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white/60 dark:hover:bg-white/10"
      >
        <Bell size={18} />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-[20px] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 max-w-[90vw] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#111826]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 dark:border-white/10">
            <span className="text-sm font-bold text-slate-800 dark:text-white/85">Notificaciones</span>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs font-semibold text-[#0284c7] hover:underline">
                Marcar todas como leídas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && <p className="px-4 py-8 text-center text-sm text-slate-400 dark:text-white/40">Sin notificaciones todavía.</p>}
            {items.map((n) => (
              <Link
                key={n.id}
                href={targetHref(n)}
                onClick={() => markOneRead(n)}
                className={`flex items-start gap-2.5 border-b border-slate-50 px-4 py-3 text-left transition last:border-0 hover:bg-slate-50 dark:border-white/5 dark:hover:bg-white/5 ${
                  n.read ? '' : 'bg-sky-50/60 dark:bg-sky-400/[0.06]'
                }`}
              >
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-sky-100 text-[#0284c7] dark:bg-sky-400/15">
                  <AtSign size={14} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-1.5 text-[13px] text-slate-700 dark:text-white/80">
                    <span className="font-bold">{n.actorName || 'Alguien'}</span>
                    {n.actorRole && <RoleBadge role={n.actorRole} size="sm" />}
                    <span>te mencionó</span>
                  </p>
                  {n.snippet && <p className="mt-0.5 truncate text-xs text-slate-400 dark:text-white/40">{n.snippet}</p>}
                  <p className="mt-0.5 text-[10.5px] text-slate-300 dark:text-white/30">{when(n.createdAt)}</p>
                </div>
                {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0284c7]" />}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
