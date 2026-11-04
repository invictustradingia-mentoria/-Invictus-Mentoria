'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Send, Pin, PinOff, Trash2, RotateCcw, VolumeX, Ban, ShieldCheck, ShieldOff, X, MessageSquare, Smile, Search, Image as ImageIcon, Loader2 } from 'lucide-react'
import ChatAvatar from '@/components/chat/ChatAvatar'
import EmojiPicker from '@/components/chat/EmojiPicker'
import ProfileHeader from '@/components/community/ProfileHeader'
import PostCard, { type FeedPost } from '@/components/community/PostCard'
import { MAX_POST_LEN, NO_LINKS_MESSAGE } from '@/lib/community-shared'

interface AMsg {
  id: string
  userId: string
  userName: string
  userRole: string
  userEmail: string | null
  content: string
  pinned: boolean
  deletedAt: string | null
  createdAt: string
  sanction: 'MUTE' | 'BAN' | null
}
interface Sanc {
  id: string
  userId: string
  kind: 'MUTE' | 'BAN'
  reason: string | null
  until: string | null
  userName: string | null
  userEmail: string | null
}

interface Member {
  id: string
  name: string | null
  email: string | null
  role: string
  sanction: 'MUTE' | 'BAN' | null
}
interface Target {
  userId: string
  userName: string | null
  userEmail: string | null
}
interface MyProfile {
  name: string
  role: string
  avatarUrl: string | null
  coverUrl: string | null
}

const DURATIONS = [
  { label: '10 min', v: 10 },
  { label: '1 hora', v: 60 },
  { label: '24 horas', v: 1440 },
  { label: '7 días', v: 10080 },
]

const ADMIN_API = '/api/admin/community'

function when(d: string) {
  return new Date(d).toLocaleString('es-AR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
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

// ---------------- Perfil + Feed de la comunidad (vista del equipo, con moderación) ----------------

function AdminCommunityFeed() {
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
      const r = await fetch(`${ADMIN_API}/posts`, { cache: 'no-store' })
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

  async function saveProfile(patch: { avatarUrl?: string | null; coverUrl?: string | null }) {
    const r = await fetch(`${ADMIN_API}/profile`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'No se pudo guardar.')
    setProfile((p) => (p ? { ...p, ...patch } : p))
  }

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
      const r = await fetch(`${ADMIN_API}/posts`, {
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
        <div>
          <ProfileHeader
            name={profile.name}
            role={profile.role}
            avatarUrl={profile.avatarUrl}
            coverUrl={profile.coverUrl}
            postsCount={posts.filter((p) => p.authorRole === profile.role && p.authorName === profile.name).length}
            onSave={saveProfile}
          />
          <Link href="/dashboard/perfil" className="mt-2 inline-block text-xs font-bold text-[#0284c7] hover:underline">
            Ver mi perfil completo →
          </Link>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04]">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_POST_LEN}
          placeholder="Publicar como equipo en la comunidad…"
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
          <p className="text-sm text-slate-400 dark:text-white/40">Cuando algún alumno publique, va a aparecer acá.</p>
        </div>
      )}
      {posts.map((p) => (
        <PostCard key={p.id} post={p} avatars={avatars} meId="" canModerate apiBase={ADMIN_API} onDeleted={removePost} onShared={prependShared} />
      ))}
    </div>
  )
}

// ---------------- Panel de moderación del chat (idéntico al existente, + nombres clicables) ----------------

export default function AdminChatPage() {
  const [msgs, setMsgs] = useState<AMsg[]>([])
  const [sancs, setSancs] = useState<Sanc[]>([])
  const [text, setText] = useState('')
  const [pinNew, setPinNew] = useState(false)
  const [showDeleted, setShowDeleted] = useState(false)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [target, setTarget] = useState<Target | null>(null)
  const [avatars, setAvatars] = useState<Set<string>>(new Set())
  const [emoji, setEmoji] = useState(false)
  const [q, setQ] = useState('')
  const [found, setFound] = useState<Member[]>([])
  const [searching, setSearching] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const [kind, setKind] = useState<'MUTE' | 'BAN'>('MUTE')
  const [minutes, setMinutes] = useState(60)
  const [reason, setReason] = useState('')
  const [purge, setPurge] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const stick = useRef(true)

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/admin/chat', { cache: 'no-store' })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setMsgs(d.messages)
      setSancs(d.sanctions)
      setAvatars((prev) => new Set<string>([...Array.from(prev), ...(d.avatars || [])]))
    } catch (e: any) {
      setErr(e.message || 'Error al cargar')
    }
  }, [])

  useEffect(() => {
    load()
    const t = setInterval(() => !document.hidden && load(), 3000)
    return () => clearInterval(t)
  }, [load])

  useEffect(() => {
    const el = box.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [msgs, showDeleted])

  useEffect(() => {
    const term = q.trim()
    if (term.length < 2) {
      setFound([])
      return
    }
    setSearching(true)
    const t = setTimeout(async () => {
      try {
        const r = await fetch('/api/admin/chat/members?q=' + encodeURIComponent(term), { cache: 'no-store' })
        const d = await r.json()
        if (r.ok) {
          setFound(d.members || [])
          setAvatars((prev) => new Set<string>([...Array.from(prev), ...(d.avatars || [])]))
        }
      } catch {}
      setSearching(false)
    }, 350)
    return () => clearTimeout(t)
  }, [q, sancs])

  function insertEmoji(e: string) {
    const el = taRef.current
    const start = el?.selectionStart ?? text.length
    const end = el?.selectionEnd ?? text.length
    const next = (text.slice(0, start) + e + text.slice(end)).slice(0, 500)
    setText(next)
    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      const pos = Math.min(start + e.length, next.length)
      el.setSelectionRange(pos, pos)
    })
  }

  async function send() {
    if (!text.trim() || busy) return
    setBusy(true)
    setErr('')
    const r = await fetch('/api/admin/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text.trim(), pinned: pinNew }) })
    const d = await r.json().catch(() => ({}))
    setBusy(false)
    if (!r.ok) return setErr(d.error || 'No se pudo enviar')
    setText('')
    setEmoji(false)
    setPinNew(false)
    stick.current = true
    load()
  }

  async function act(id: string, action: 'delete' | 'restore' | 'pin' | 'unpin') {
    const r = await fetch('/api/admin/chat', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, action }) })
    if (!r.ok) setErr((await r.json().catch(() => ({}))).error || 'Error')
    load()
  }

  function openSanction(m: Target, k: 'MUTE' | 'BAN' = 'MUTE') {
    setTarget(m)
    setKind(k)
    setMinutes(60)
    setReason('')
    setPurge(false)
  }

  async function applySanction() {
    if (!target) return
    setBusy(true)
    const r = await fetch('/api/admin/chat/sanctions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: target.userId, kind, minutes: kind === 'MUTE' ? minutes : undefined, reason: reason.trim() || undefined, purge }),
    })
    const d = await r.json().catch(() => ({}))
    setBusy(false)
    if (!r.ok) return setErr(d.error || 'No se pudo aplicar')
    setTarget(null)
    load()
  }

  async function lift(userId: string) {
    await fetch('/api/admin/chat/sanctions?userId=' + encodeURIComponent(userId), { method: 'DELETE' })
    load()
  }

  const visible = showDeleted ? msgs : msgs.filter((m) => !m.deletedAt)

  return (
    <div className="mx-auto max-w-[1320px] space-y-6">
      <AdminCommunityFeed />

      <div className="space-y-5">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <MessageSquare className="text-[#0284c7]" size={24} /> Moderación del chat
          </h1>
          <p className="text-sm text-slate-500 dark:text-white/50">Supervisa la comunidad en tiempo real, fija avisos y sanciona cuando sea necesario.</p>
        </div>

        {err && (
          <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
            {err}
            <button onClick={() => setErr('')}><X size={16} /></button>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-[1fr_330px]">
          <section className="flex h-[70vh] min-h-[460px] flex-col overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-center justify-between border-b border-sky-100 bg-[#f0f9ff] px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-white/70">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> En vivo · {msgs.filter((m) => !m.deletedAt).length} mensajes
              </span>
              <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-500 dark:text-white/50">
                <input type="checkbox" checked={showDeleted} onChange={(e) => setShowDeleted(e.target.checked)} className="accent-[#0284c7]" /> Ver eliminados
              </label>
            </div>

            <div ref={box} onScroll={() => { const el = box.current; if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80 }} className="flex-1 space-y-1 overflow-y-auto p-3">
              {visible.length === 0 && <p className="py-12 text-center text-sm text-slate-400">No hay mensajes.</p>}
              {visible.map((m) => {
                const staff = m.userRole === 'ADMIN' || m.userRole === 'EDITOR'
                return (
                  <div key={m.id} className={`group rounded-xl border px-3 py-2 transition ${m.deletedAt ? 'border-dashed border-slate-200 bg-slate-50 opacity-70 dark:border-white/10 dark:bg-white/5' : m.pinned ? 'border-amber-200 bg-amber-50 dark:border-amber-400/30 dark:bg-amber-400/10' : 'border-transparent hover:border-sky-100 hover:bg-[#f8fcff] dark:hover:border-white/10 dark:hover:bg-white/5'}`}>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                      <Link href={`/dashboard/perfil/${m.userId}`} className="flex items-center gap-2">
                        <ChatAvatar userId={m.userId} name={m.userName} hasPhoto={avatars.has(m.userId)} staff={staff} size={28} />
                        <b className="text-sm text-slate-800 hover:underline dark:text-white/85">{m.userName}</b>
                      </Link>
                      {staff && <span className="rounded bg-[#0284c7] px-1.5 py-px text-[9px] font-bold uppercase text-white">Equipo</span>}
                      {m.sanction && <span className={`rounded px-1.5 py-px text-[9px] font-bold uppercase ${m.sanction === 'BAN' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'}`}>{m.sanction === 'BAN' ? 'Baneado' : 'Silenciado'}</span>}
                      {m.pinned && !m.deletedAt && <Pin size={12} className="text-amber-600" />}
                      <span className="text-slate-400 dark:text-white/30">{m.userEmail}</span>
                      <span className="ml-auto text-slate-400 dark:text-white/30">{when(m.createdAt)}</span>
                    </div>
                    <p className={`mt-1 whitespace-pre-wrap break-words text-sm ${m.deletedAt ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-white/80'}`}>{m.content}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {m.deletedAt ? (
                        <Btn onClick={() => act(m.id, 'restore')} icon={<RotateCcw size={12} />} label="Restaurar" />
                      ) : (
                        <>
                          <Btn onClick={() => act(m.id, m.pinned ? 'unpin' : 'pin')} icon={m.pinned ? <PinOff size={12} /> : <Pin size={12} />} label={m.pinned ? 'Quitar fijado' : 'Fijar'} />
                          <Btn onClick={() => act(m.id, 'delete')} icon={<Trash2 size={12} />} label="Eliminar" />
                        </>
                      )}
                      {!staff && (
                        <>
                          <Btn warn onClick={() => openSanction(m, 'MUTE')} icon={<VolumeX size={12} />} label="Silenciar" />
                          <Btn danger onClick={() => openSanction(m, 'BAN')} icon={<Ban size={12} />} label="Banear" />
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="relative border-t border-sky-100 p-3 dark:border-white/10">
              {emoji && (
                <div className="relative">
                  <EmojiPicker onPick={insertEmoji} onClose={() => setEmoji(false)} />
                </div>
              )}
              <div className="flex items-end gap-2">
                <button type="button" onClick={() => setEmoji((v) => !v)} aria-label="Emojis" title="Emojis" className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border transition ${emoji ? 'border-sky-300 bg-sky-50 text-[#0284c7]' : 'border-slate-200 text-slate-400 hover:bg-sky-50 hover:text-[#0284c7] dark:border-white/10 dark:text-white/40'}`}>
                  <Smile size={20} />
                </button>
                <textarea ref={taRef} value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={500} placeholder="Publicar como equipo (puedes incluir enlaces)…"
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
                  className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-base outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 dark:border-white/10 dark:bg-white/[0.06] dark:text-white sm:text-sm [color-scheme:light] dark:[color-scheme:dark]" />
                <button onClick={send} disabled={!text.trim() || busy} className="grid h-11 w-11 place-items-center rounded-xl bg-[#0284c7] text-white shadow transition hover:bg-[#0369a1] disabled:opacity-40" aria-label="Enviar">
                  <Send size={18} />
                </button>
              </div>
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-xs text-slate-500 dark:text-white/50">
                <input type="checkbox" checked={pinNew} onChange={(e) => setPinNew(e.target.checked)} className="accent-[#0284c7]" /> Fijar este mensaje arriba del chat
              </label>
            </div>
          </section>

          <aside className="h-fit space-y-5">
            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
              <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-white/85"><Search size={18} className="text-[#0284c7]" /> Buscar alumno</h2>
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nombre o email (mín. 2 letras)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 dark:border-white/10 dark:bg-white/[0.06] dark:text-white sm:text-sm [color-scheme:light] dark:[color-scheme:dark]" />
              {searching && <p className="mt-2 text-xs text-slate-400">Buscando…</p>}
              {!searching && q.trim().length >= 2 && found.length === 0 && <p className="mt-2 text-xs text-slate-400">Sin resultados.</p>}
              <ul className="mt-2 space-y-2">
                {found.map((u) => (
                  <li key={u.id} className="rounded-xl border border-slate-100 p-2.5 dark:border-white/10">
                    <div className="flex items-center gap-2.5">
                      <Link href={`/dashboard/perfil/${u.id}`} className="flex min-w-0 flex-1 items-center gap-2.5">
                        <ChatAvatar userId={u.id} name={u.name || u.email || '?'} hasPhoto={avatars.has(u.id)} size={34} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-800 hover:underline dark:text-white/85">{u.name || u.email}</p>
                          <p className="truncate text-xs text-slate-400 dark:text-white/40">{u.email}</p>
                        </div>
                      </Link>
                      {u.sanction && <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white ${u.sanction === 'BAN' ? 'bg-red-600' : 'bg-amber-500'}`}>{u.sanction === 'BAN' ? 'Ban' : 'Mute'}</span>}
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      <Btn warn onClick={() => openSanction({ userId: u.id, userName: u.name, userEmail: u.email }, 'MUTE')} icon={<VolumeX size={12} />} label="Silenciar" />
                      <Btn danger onClick={() => openSanction({ userId: u.id, userName: u.name, userEmail: u.email }, 'BAN')} icon={<Ban size={12} />} label="Banear" />
                      {u.sanction && <Btn onClick={() => lift(u.id)} icon={<ShieldOff size={12} />} label="Levantar" />}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/[0.04]">
            <h2 className="mb-3 flex items-center gap-2 font-semibold text-slate-800 dark:text-white/85"><ShieldCheck size={18} className="text-[#0284c7]" /> Sanciones vigentes ({sancs.length})</h2>
            {sancs.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-400 dark:bg-white/5">Nadie está sancionado.</p>}
            <ul className="space-y-2">
              {sancs.map((s) => (
                <li key={s.id} className="rounded-xl border border-slate-100 p-3 dark:border-white/10">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-white/85">{s.userName || s.userEmail}</p>
                      <p className="truncate text-xs text-slate-400 dark:text-white/40">{s.userEmail}</p>
                    </div>
                    <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase text-white ${s.kind === 'BAN' ? 'bg-red-600' : 'bg-amber-500'}`}>{s.kind === 'BAN' ? 'Ban' : 'Mute'}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-white/50">{s.kind === 'BAN' ? 'Permanente' : s.until ? 'Hasta ' + when(s.until) : ''}{s.reason ? ' · ' + s.reason : ''}</p>
                  <button onClick={() => lift(s.userId)} className="mt-2 flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100"><ShieldOff size={12} /> Levantar sanción</button>
                </li>
              ))}
            </ul>
            </div>
          </aside>
        </div>
      </div>

      {target && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={() => setTarget(null)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#111826]" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Sancionar a {target.userName}</h3>
                <p className="text-xs text-slate-400">{target.userEmail}</p>
              </div>
              <button onClick={() => setTarget(null)}><X size={18} className="text-slate-400" /></button>
            </div>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {(['MUTE', 'BAN'] as const).map((k) => (
                <button key={k} onClick={() => setKind(k)} className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition ${kind === k ? (k === 'BAN' ? 'border-red-500 bg-red-50 text-red-700' : 'border-amber-500 bg-amber-50 text-amber-700') : 'border-slate-200 text-slate-500'}`}>
                  {k === 'MUTE' ? <VolumeX size={16} /> : <Ban size={16} />} {k === 'MUTE' ? 'Silenciar' : 'Banear del chat'}
                </button>
              ))}
            </div>
            {kind === 'MUTE' && (
              <div className="mb-4 flex flex-wrap gap-2">
                {DURATIONS.map((d) => (
                  <button key={d.v} onClick={() => setMinutes(d.v)} className={`rounded-full border px-3 py-1.5 text-xs font-medium ${minutes === d.v ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7]' : 'border-slate-200 text-slate-500'}`}>{d.label}</button>
                ))}
              </div>
            )}
            <input value={reason} onChange={(e) => setReason(e.target.value)} maxLength={140} placeholder="Motivo (el alumno lo verá)" className="mb-3 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base outline-none focus:border-[#0284c7] sm:text-sm" />
            <label className="mb-5 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input type="checkbox" checked={purge} onChange={(e) => setPurge(e.target.checked)} className="accent-[#0284c7]" /> Eliminar también todos sus mensajes
            </label>
            <div className="flex justify-end gap-2">
              <button onClick={() => setTarget(null)} className="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50">Cancelar</button>
              <button onClick={applySanction} disabled={busy} className={`rounded-xl px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 ${kind === 'BAN' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
                {kind === 'BAN' ? 'Banear' : 'Silenciar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Btn({ onClick, icon, label, danger, warn }: { onClick: () => void; icon: React.ReactNode; label: string; danger?: boolean; warn?: boolean }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-medium transition ${danger ? 'border-red-200 text-red-600 hover:bg-red-50' : warn ? 'border-amber-200 text-amber-600 hover:bg-amber-50' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
      {icon} {label}
    </button>
  )
}
