'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Send, Pin, Trash2, Ban, VolumeX, Users, X, Smile, Image as ImageIcon, Loader2 } from 'lucide-react'
import ChatAvatar from '@/components/chat/ChatAvatar'
import EmojiPicker from '@/components/chat/EmojiPicker'
import ProfileHeader from '@/components/community/ProfileHeader'
import PostCard, { type FeedPost } from '@/components/community/PostCard'
import { MAX_POST_LEN, NO_LINKS_MESSAGE, profileHref } from '@/lib/community-shared'

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
interface MyProfile {
  name: string
  role: string
  avatarUrl: string | null
  coverUrl: string | null
}

const MAX = 500
const API = '/api/student/community'

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

function resizeToDataUrl(file: File, maxDim: number, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.onload = () => {
      img.onerror = () => reject(new Error('Archivo de imagen no válido'))
      img.onload = () => {
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('No se pudo procesar la imagen'))
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

// ---------------- Perfil + Feed de la comunidad ----------------

function CommunityFeed({ me }: { me: Me }) {
  const [profile, setProfile] = useState<MyProfile | null>(null)
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [avatars, setAvatars] = useState<Set<string>>(new Set())
  const [text, setText] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const imgInput = useRef<HTMLInputElement>(null)

  const loadFeed = useCallback(async () => {
    try {
      const r = await fetch(`${API}/posts`, { cache: 'no-store' })
      const d = await r.json()
      if (r.ok) {
        setPosts(d.posts || [])
        setAvatars(new Set<string>(d.avatars || []))
      }
    } catch {}
    setLoading(false)
  }, [])

  const loadProfile = useCallback(async () => {
    try {
      const r = await fetch('/api/student/profile', { cache: 'no-store' })
      const d = await r.json()
      if (r.ok) setProfile(d.user)
    } catch {}
  }, [])

  useEffect(() => {
    loadFeed()
    loadProfile()
  }, [loadFeed, loadProfile])

  async function pickImage(file: File | undefined) {
    if (!file) return
    try {
      setImage(await resizeToDataUrl(file, 1400))
    } catch {}
  }

  async function publish() {
    const content = text.trim()
    if (!content || posting) return
    setPosting(true)
    setErr('')
    try {
      const r = await fetch(`${API}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageUrl: image || undefined }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || 'No se pudo publicar.')
      setPosts((p) => [d.post, ...p])
      setText('')
      setImage(null)
    } catch (e: any) {
      setErr(e?.message || 'No se pudo publicar.')
    } finally {
      setPosting(false)
    }
  }

  function removePost(id: string) {
    setPosts((p) => p.filter((x) => x.id !== id))
  }

  function prependShared(p: FeedPost) {
    setPosts((prev) => [p, ...prev])
  }

  return (
    <div className="space-y-4">
      {profile && (
        <Link href="/dashboard/perfil" className="block">
          <ProfileHeader
            name={profile.name || me.name}
            role={profile.role || me.role}
            avatarUrl={profile.avatarUrl}
            coverUrl={profile.coverUrl}
            postsCount={posts.filter((p) => p.authorId === me.id).length}
            editable={false}
          />
        </Link>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_POST_LEN}
          placeholder={`¿Qué estás operando hoy, ${(profile?.name || me.name).split(' ')[0]}?`}
          rows={3}
          className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 dark:border-white/10 dark:bg-white/[0.06] dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
        />
        {image && (
          <div className="relative mt-2 inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" className="max-h-56 rounded-xl object-cover" />
            <button onClick={() => setImage(null)} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-slate-800 text-white shadow">
              <X size={13} />
            </button>
          </div>
        )}
        {err && <p className="mt-2 text-xs font-semibold text-red-500">{err}</p>}
        <p className="mt-2 text-[11px] text-slate-400 dark:text-white/40">{NO_LINKS_MESSAGE}</p>
        <div className="mt-2.5 flex items-center justify-between">
          <input ref={imgInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pickImage(e.target.files?.[0])} />
          <button onClick={() => imgInput.current?.click()} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:text-white/50 dark:hover:bg-white/5">
            <ImageIcon size={16} /> Foto
          </button>
          <button onClick={publish} disabled={!text.trim() || posting} className="flex items-center gap-1.5 rounded-xl bg-[#0284c7] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">
            {posting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Publicar
          </button>
        </div>
      </div>

      {loading && <p className="py-6 text-center text-sm text-slate-400">Cargando el feed…</p>}
      {!loading && posts.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center dark:border-white/10 dark:bg-white/[0.04]">
          <p className="font-semibold text-slate-600 dark:text-white/70">Aún no hay publicaciones</p>
          <p className="text-sm text-slate-400 dark:text-white/40">Sé el primero en compartir algo con la comunidad.</p>
        </div>
      )}
      {posts.map((p) => (
        <PostCard key={p.id} post={p} avatars={avatars} meId={me.id} canModerate={false} apiBase={API} onDeleted={removePost} onShared={prependShared} />
      ))}
    </div>
  )
}

// ---------------- Chat global (idéntico al existente, solo reubicado + nombres clicables) ----------------

function GlobalChat({ me }: { me: Me | null }) {
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [pinned, setPinned] = useState<Msg[]>([])
  const [avatars, setAvatars] = useState<Set<string>>(new Set())
  const [text, setText] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [fatal, setFatal] = useState('')
  const [emoji, setEmoji] = useState(false)
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
      setPinned(d.pinned || [])
      setAvatars(new Set<string>(d.avatars || []))
      setMsgs((prev) => {
        const pend = prev.filter((m) => m.pending)
        return [...d.messages, ...pend.filter((p) => !d.messages.some((m: Msg) => m.userId === p.userId && m.content === p.content))]
      })
      setFatal('')
    } catch {
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

  function autosize() {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 120) + 'px'
  }

  function insertEmoji(e: string) {
    const el = taRef.current
    const start = el?.selectionStart ?? text.length
    const end = el?.selectionEnd ?? text.length
    const next = (text.slice(0, start) + e + text.slice(end)).slice(0, MAX)
    setText(next)
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      const pos = Math.min(start + e.length, next.length)
      el.setSelectionRange(pos, pos)
      autosize()
    })
  }

  async function send() {
    const content = text.trim()
    if (!content || sending || !me) return
    setErr('')
    setSending(true)
    setEmoji(false)
    const tmp: Msg = { id: 'tmp-' + Date.now(), userId: me.id, userName: me.name, userRole: me.role, content, pinned: false, createdAt: new Date().toISOString(), pending: true }
    stick.current = true
    setMsgs((m) => [...m, tmp])
    setText('')
    requestAnimationFrame(autosize)
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

  const isAdmin = me?.role === 'ADMIN' || me?.role === 'EDITOR'
  const blocked = !!me?.sanction

  return (
    <div className="flex h-[70vh] min-h-[420px] flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-[0_10px_40px_-12px_rgba(14,165,233,.25)] dark:border-white/10 dark:bg-white/[0.04] lg:h-[calc(100dvh-6rem)]">
      <header className="flex items-center gap-3 border-b border-sky-100 bg-gradient-to-r from-sky-500 to-sky-700 px-4 py-3 text-white dark:border-white/10">
        <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/20">
          <Users size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-[15px] font-bold leading-tight">Chat global</h1>
          <p className="flex items-center gap-1.5 text-xs text-sky-100">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" /> Mensajes públicos de toda la comunidad
          </p>
        </div>
      </header>

      {pinned.length > 0 && (
        <div className="max-h-40 space-y-px overflow-y-auto border-b border-sky-200 bg-sky-200">
          {pinned.map((p) => (
            <div key={p.id} className="flex items-start gap-2.5 bg-sky-50 px-4 py-2.5 text-sm text-sky-900">
              <Pin size={15} className="mt-0.5 shrink-0 text-sky-600" />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-600">Mensaje fijado</p>
                <p className="whitespace-pre-wrap break-words">{p.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div ref={box} onScroll={onScroll} className="flex-1 space-y-1 overflow-y-auto bg-gradient-to-b from-sky-50/60 to-white px-3 py-4 dark:from-transparent dark:to-transparent sm:px-4">
        {loading && <p className="py-10 text-center text-sm text-slate-400">Cargando conversación…</p>}
        {fatal && <p className="rounded-xl bg-red-50 p-3 text-center text-sm text-red-600">{fatal}</p>}
        {!loading && !fatal && msgs.length === 0 && (
          <div className="py-14 text-center">
            <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-sky-100 text-sky-600"><Users size={26} /></div>
            <p className="font-semibold text-slate-700 dark:text-white/70">Aún no hay mensajes</p>
            <p className="text-sm text-slate-400 dark:text-white/40">Sé el primero en saludar a la comunidad. 👋</p>
          </div>
        )}
        {msgs.map((m, i) => {
          const prev = msgs[i - 1]
          const newDay = !prev || new Date(prev.createdAt).toDateString() !== new Date(m.createdAt).toDateString()
          const mine = m.userId === me?.id
          const staff = m.userRole === 'ADMIN' || m.userRole === 'EDITOR'
          const grouped = !newDay && prev && prev.userId === m.userId && new Date(m.createdAt).getTime() - new Date(prev.createdAt).getTime() < 120000
          const href = me ? profileHref(m.userId, me.id) : '/dashboard/perfil'
          return (
            <div key={m.id}>
              {newDay && (
                <div className="my-3 flex justify-center">
                  <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium capitalize text-slate-400 shadow-sm ring-1 ring-slate-100 dark:bg-white/10 dark:text-white/50 dark:ring-white/10">{dayLabel(m.createdAt)}</span>
                </div>
              )}
              <div className={`group flex items-end gap-2 ${mine ? 'flex-row-reverse' : ''} ${grouped ? 'mt-0.5' : 'mt-3'}`}>
                <div className="w-9 shrink-0">
                  {!grouped && (
                    <Link href={href}>
                      <ChatAvatar userId={m.userId} name={m.userName} hasPhoto={avatars.has(m.userId)} staff={staff} size={36} />
                    </Link>
                  )}
                </div>
                <div className={`flex max-w-[82%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  {!grouped && (
                    <span className="mb-0.5 flex items-center gap-1.5 px-1 text-xs font-semibold text-slate-600 dark:text-white/60">
                      <Link href={href} className="hover:underline">{m.userName}</Link>
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
                          ? 'rounded-bl-md border border-sky-200 bg-sky-50 text-slate-800 dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-white/85'
                          : 'rounded-bl-md border border-slate-100 bg-white text-slate-800 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/85'
                      } ${m.pending ? 'opacity-60' : ''}`}
                    >
                      {m.content}
                    </div>
                  </div>
                  <span className="mt-0.5 px-1 text-[10px] text-slate-400 dark:text-white/30">{m.pending ? 'Enviando…' : hm(m.createdAt)}</span>
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
        <div className="relative border-t border-slate-100 bg-white p-3 dark:border-white/10 dark:bg-transparent">
          {err && (
            <div className="mb-2 flex items-center justify-between gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">
              <span>{err}</span>
              <button onClick={() => setErr('')}><X size={14} /></button>
            </div>
          )}
          {emoji && (
            <div className="relative">
              <EmojiPicker onPick={insertEmoji} onClose={() => setEmoji(false)} />
            </div>
          )}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setEmoji((v) => !v)}
              aria-label="Emojis"
              title="Emojis"
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition ${emoji ? 'border-sky-300 bg-sky-50 text-sky-600' : 'border-slate-200 text-slate-400 hover:bg-sky-50 hover:text-sky-600 dark:border-white/10 dark:text-white/40'}`}
            >
              <Smile size={20} />
            </button>
            <textarea
              ref={taRef}
              value={text}
              rows={1}
              maxLength={MAX}
              placeholder={isAdmin ? 'Escribe como equipo…' : 'Escribe un mensaje…'}
              onChange={(e) => {
                setText(e.target.value)
                autosize()
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send()
                }
              }}
              className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-base outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100 dark:border-white/10 dark:bg-white/[0.06] dark:text-white sm:text-sm [color-scheme:light] dark:[color-scheme:dark]"
            />
            <button onClick={send} disabled={!text.trim() || sending} aria-label="Enviar" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-sky-600 text-white shadow transition hover:bg-sky-700 disabled:opacity-40">
              <Send size={18} />
            </button>
          </div>
          <p className="mt-1.5 flex justify-between px-1 text-[10.5px] text-slate-400 dark:text-white/30">
            <span>Solo mensajes públicos — sin chats privados.</span>
            <span className={text.length > MAX - 50 ? 'text-amber-500' : ''}>{text.length}/{MAX}</span>
          </p>
        </div>
      )}
    </div>
  )
}

// ---------------- Página: Comunidad (perfil + feed + chat global) ----------------

export default function ChatPage() {
  const [me, setMe] = useState<Me | null>(null)

  useEffect(() => {
    fetch('/api/student/chat', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => d?.me && setMe(d.me))
      .catch(() => {})
  }, [])

  return (
    <div className="mx-auto max-w-[1320px]">
      <div className="flex flex-wrap gap-5 lg:flex-nowrap">
        <div className="min-w-0 flex-1">{me ? <CommunityFeed me={me} /> : <p className="py-10 text-center text-sm text-slate-400">Cargando…</p>}</div>
        <div className="w-full shrink-0 lg:w-[360px]">
          <GlobalChat me={me} />
        </div>
      </div>
    </div>
  )
}
