'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Send, Pin, Trash2, ShieldCheck, Ban, VolumeX, Users, X } from 'lucide-react'

interface Msg {
  id: string
  userId: string
  userName: string
  userRole: string
  content: string
  pinned: boolean
  createdAt: string
  pending?: boolean
}
interface Me {
  id: string
  name: string
  role: string
  sanction: { kind: 'MUTE' | 'BAN'; until: string | null; reason: string | null } | null
}

const MAX = 500
const COLORS = ['#0ea5e9', '#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#22c55e', '#ef4444']

function hue(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}
function initials(n: string) {
  const p = n.trim().split(/\s+/)
  return ((p[0]?.[0] || '?') + (p[1]?.[0] || '')).toUpperCase()
}
function hm(d: string) {
  return new Date(d).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}
function dayLabel(d: string) {
  const x = new Date(d)
  const t = new Date()
  const y = new Date(Date.now() - 86400000)
  if (x.toDateString() === t.toDateString()) return 'Hoy'
  if (x.toDateString() === y.toDateString()) return 'Ayer'
  return x.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}
function untilText(s: Me['sanction']) {
  if (!s) return ''
  if (s.kind === 'BAN') return 'de forma permanente'
  if (!s.until) return ''
  return 'hasta el ' + new Date(s.until).toLocaleString('es-AR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function ChatPage() {
  const [me, setMe] = useState<Me | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [pinned, setPinned] = useState<Msg[]>([])
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [fatal, setFatal] = useState('')
  const box = useRef<HTMLDivElement>(null)
  const stick = useRef(true)
  const taRef = useRef<HTMLTextAreaElement>(null)

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/student/chat', { cache: 'no-store' })
      if (r.status === 401) {
        setFatal('Tu sesión no está activa o tu cuenta no está habilitada.')
        return
      }
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setMe(d.me)
      setPinned(d.pinned || [])
      setMsgs((prev) => {
        const pend = prev.filter((m) => m.pending)
        return [...d.messages, ...pend.filter((p) => !d.messages.some((m: Msg) => m.userId === p.userId && m.content === p.content))]
      })
      setFatal('')
    } catch (e: any) {
      setFatal((f) => f || '')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    let t: ReturnType<typeof setTimeout>
    const tick = () => {
      load().finally(() => {
        t = setTimeout(tick, document.hidden ? 15000 : 3000)
      })
    }
    t = setTimeout(tick, 3000)
    const vis = () => !document.hidden && load()
    document.addEventListener('visibilitychange', vis)
    return () => {
      clearTimeout(t)
      document.removeEventListener('visibilitychange', vis)
    }
  }, [load])

  useEffect(() => {
    const el = box.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [msgs])

  function onScroll() {
    const el = box.current
    if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  async function send() {
    const content = text.trim()
    if (!content || sending || !me) return
    setErr('')
    setSending(true)
    const tmp: Msg = { id: 'tmp-' + Date.now(), userId: me.id, userName: me.name, userRole: me.role, content, pinned: false, createdAt: new Date().toISOString(), pending: true }
    stick.current = true
    setMsgs((m) => [...m, tmp])
    setText('')
    try {
      const r = await fetch('/api/student/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content }) })
      const d = await r.json()
      if (!r.ok) {
        setMsgs((m) => m.filter((x) => x.id !== tmp.id))
        setText(content)
        setErr(d.error || 'No se pudo enviar.')
      } else {
        setMsgs((m) => m.map((x) => (x.id === tmp.id ? { ...d.message, createdAt: d.message.createdAt } : x)))
      }
    } catch {
      setMsgs((m) => m.filter((x) => x.id !== tmp.id))
      setText(content)
      setErr('Sin conexión. Inténtalo de nuevo.')
    } finally {
      setSending(false)
      taRef.current?.focus()
    }
  }

  async function remove(id: string) {
    setMsgs((m) => m.filter((x) => x.id !== id))
    await fetch('/api/student/chat?id=' + encodeURIComponent(id), { method: 'DELETE' }).catch(() => {})
    load()
  }

  const isAdmin = me?.role === 'ADMIN'
  const blocked = !!me?.sanction

  return (
    <div className="mx-auto flex h-[calc(100dvh-7.5rem)] min-h-[420px] max-w-3xl flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_10px_40px_-12px_rgba(14,165,233,.25)] md:h-[calc(100dvh-6rem)]">
      <header className="flex items-center gap-3 border-b border-sky-100 bg-gradient-to-r from-sky-500 to-sky-700 px-4 py-3 text-white">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
          <Users size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-[15px] font-bold leading-tight">Comunidad Invictus</h1>
          <p className="flex items-center gap-1.5 text-xs text-sky-100">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" /> Chat en vivo · moderado por el equipo
          </p>
        </div>
      </header>

      {pinned.length > 0 && (
        <div className="max-h-40 space-y-px overflow-y-auto border-b border-amber-200 bg-amber-200">
          {pinned.map((p) => (
            <div key={p.id} className="flex items-start gap-2.5 bg-amber-50 px-4 py-2.5 text-sm text-amber-900">
              <Pin size={15} className="mt-0.5 shrink-0 text-amber-600" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">Mensaje fijado</p>
                <p className="whitespace-pre-wrap break-words">{p.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div ref={box} onScroll={onScroll} className="flex-1 space-y-1 overflow-y-auto bg-gradient-to-b from-sky-50/60 to-white px-3 py-4 sm:px-5">
        {loading && <p className="py-10 text-center text-sm text-slate-400">Cargando conversación…</p>}
        {fatal && <p className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">{fatal}</p>}
        {!loading && !fatal && msgs.length === 0 && (
          <div className="py-14 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-sky-100 text-sky-600"><Users size={26} /></div>
            <p className="font-semibold text-slate-700">Aún no hay mensajes</p>
            <p className="text-sm text-slate-400">Sé el primero en saludar a la comunidad.</p>
          </div>
        )}
        {msgs.map((m, i) => {
          const prev = msgs[i - 1]
          const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString()
          const mine = m.userId === me?.id
          const staff = m.userRole === 'ADMIN'
          const grouped = !newDay && prev && prev.userId === m.userId && new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 120000
          return (
            <div key={m.id}>
              {newDay && (
                <div className="my-3 flex justify-center">
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium capitalize text-slate-400 shadow-sm ring-1 ring-slate-100">{dayLabel(m.createdAt)}</span>
                </div>
              )}
              <div className={`group flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''} ${grouped ? 'mt-0.5' : 'mt-3'}`}>
                <div className="w-8 shrink-0">
                  {!grouped && (
                    <div className="grid h-8 w-8 place-items-center rounded-full text-[11px] font-bold text-white" style={{ background: staff ? 'linear-gradient(135deg,#0ea5e9,#0369a1)' : hue(m.userId) }}>
                      {staff ? <ShieldCheck size={15} /> : initials(m.userName)}
                    </div>
                  )}
                </div>
                <div className={`flex max-w-[82%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  {!grouped && !mine && (
                    <span className="mb-0.5 flex items-center gap-1.5 px-1 text-xs font-semibold text-slate-600">
                      {m.userName}
                      {staff && <span className="rounded bg-sky-600 px-1.5 py-px text-[9px] font-bold uppercase tracking-wide text-white">Equipo</span>}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5">
                    {mine && !m.pending && (
                      <button onClick={() => remove(m.id)} title="Eliminar" className="rounded-md p-1 text-slate-300 opacity-0 transition hover:bg-red-50 hover:text-red-500 group-hover:opacity-100 focus:opacity-100 max-sm:opacity-60">
                        <Trash2 size={13} />
                      </button>
                    )}
                    <div
                      className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed shadow-sm ${
                        mine
                          ? 'rounded-br-md bg-gradient-to-br from-sky-500 to-sky-600 text-white'
                          : staff
                          ? 'rounded-bl-md border border-sky-200 bg-sky-50 text-slate-800'
                          : 'rounded-bl-md border border-slate-100 bg-white text-slate-800'
                      } ${m.pending ? 'opacity-60' : ''}`}
                    >
                      {m.content}
                    </div>
                  </div>
                  <span className="mt-0.5 px-1 text-[10px] text-slate-400">{m.pending ? 'Enviando…' : hm(m.createdAt)}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {blocked ? (
        <div className="flex items-center gap-3 border-t border-red-100 bg-red-50 px-4 py-3.5 text-sm text-red-700">
          {me!.sanction!.kind === 'BAN' ? <Ban size={18} className="shrink-0" /> : <VolumeX size={18} className="shrink-0" />}
          <p>
            <b>{me!.sanction!.kind === 'BAN' ? 'Has sido bloqueado del chat' : 'Estás silenciado en el chat'}</b> {untilText(me!.sanction)}.
            {me!.sanction!.reason ? ` Motivo: ${me!.sanction!.reason}` : ''}
          </p>
        </div>
      ) : (
        <div className="border-t border-slate-100 bg-white p-3">
          {err && (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              <span>{err}</span>
              <button onClick={() => setErr('')}><X size={14} /></button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={taRef}
              value={text}
              rows={1}
              maxLength={MAX}
              placeholder={isAdmin ? 'Escribe como equipo…' : 'Escribe un mensaje…'}
              onChange={(e) => {
                setText(e.target.value)
                e.target.style.height = 'auto'
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 sm:text-sm"
            />
            <button onClick={send} disabled={!text.trim() || sending} aria-label="Enviar" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-600 text-white shadow transition hover:bg-sky-700 disabled:opacity-40">
              <Send size={18} />
            </button>
          </div>
          <p className="mt-1.5 flex justify-between px-1 text-[10.5px] text-slate-400">
            <span>Respeto ante todo. Los enlaces solo los comparte el equipo.</span>
            <span className={text.length > MAX - 50 ? 'text-amber-500' : ''}>{text.length}/{MAX}</span>
          </p>
        </div>
      )}
    </div>
  )
}