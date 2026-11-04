'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Camera, Trash2, Save, Lock, CheckCircle2, AlertCircle, Crown, Star, ShieldCheck, Pencil, Image as ImageIcon, Loader2 } from 'lucide-react'
import { Avatar } from '@/components/dashboard/DashboardShell'
import { getMembership } from '@/lib/membership'
import ProfileHeader from '@/components/community/ProfileHeader'
import PostCard, { type FeedPost } from '@/components/community/PostCard'
import { MAX_POST_LEN, NO_LINKS_MESSAGE } from '@/lib/community-shared'

// Recorta al centro y reduce a 256x256 para que pese poco
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const size = 256
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Tu navegador no puede procesar la imagen'))
      const s = Math.min(img.width, img.height)
      ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/jpeg', 0.85))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen. Usa JPG, PNG o WebP.')) }
    img.src = url
  })
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

const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-800 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100'
const labelCls = 'mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500'

export default function ProfilePage() {
  const router = useRouter()
  const { data: session } = useSession()
  const meId = (session?.user as any)?.id as string | undefined
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('CLUB')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [cover, setCover] = useState<string | null>(null)
  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null)
  const [tab, setTab] = useState<'posts' | 'settings'>('posts')

  // Feed de publicaciones propias + contadores de seguidores
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [postAvatars, setPostAvatars] = useState<Set<string>>(new Set())
  const [followers, setFollowers] = useState<number | undefined>(undefined)
  const [following, setFollowing] = useState<number | undefined>(undefined)
  const [postText, setPostText] = useState('')
  const [postImage, setPostImage] = useState<string | null>(null)
  const [posting, setPosting] = useState(false)
  const [postErr, setPostErr] = useState('')
  const postImgInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/student/profile', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setEmail(d.user.email); setRole(d.user.role); setName(d.user.name ?? ''); setUsername(d.user.username ?? '')
          setPhone(d.user.phone ?? ''); setAvatar(d.user.avatarUrl ?? null); setCover(d.user.coverUrl ?? null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const loadMyPosts = useCallback(async () => {
    if (!meId) return
    try {
      const [pr, ur] = await Promise.all([
        fetch(`/api/student/community/users/${meId}/posts`, { cache: 'no-store' }),
        fetch(`/api/student/community/users/${meId}`, { cache: 'no-store' }),
      ])
      const pd = await pr.json()
      const ud = await ur.json()
      if (pr.ok) {
        setPosts(pd.posts || [])
        setPostAvatars(new Set<string>(pd.avatars || []))
      }
      if (ur.ok) {
        setFollowers(ud.followersCount)
        setFollowing(ud.followingCount)
      }
    } catch {}
  }, [meId])

  useEffect(() => {
    loadMyPosts()
  }, [loadMyPosts])

  const notify = (text: string, type: 'ok' | 'err') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 6000) }

  const patch = async (body: Record<string, any>, okText: string) => {
    setSaving(true)
    try {
      const res = await fetch('/api/student/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.success) { notify(okText, 'ok'); router.refresh(); return true }
      notify(data.error || `No se pudo guardar (HTTP ${res.status})`, 'err')
      return false
    } catch {
      notify('Error de conexión', 'err')
      return false
    } finally {
      setSaving(false)
    }
  }

  const onPhoto = async (file: File | null) => {
    if (!file) return
    if (!file.type.startsWith('image/')) return notify('El archivo debe ser una imagen (JPG, PNG o WebP).', 'err')
    if (file.size > 8 * 1024 * 1024) return notify('La imagen pesa más de 8 MB. Elige una más liviana.', 'err')
    try {
      const dataUrl = await resizeImage(file)
      if (await patch({ avatarUrl: dataUrl }, 'Foto de perfil actualizada')) setAvatar(dataUrl)
    } catch (e: any) {
      notify(e?.message || 'No se pudo procesar la imagen', 'err')
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const removePhoto = async () => { if (await patch({ avatarUrl: null }, 'Foto eliminada')) setAvatar(null) }

  const saveData = (e: React.FormEvent) => { e.preventDefault(); patch({ name, phone, ...(username ? { username } : {}) }, 'Datos guardados') }

  const savePass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (await patch({ currentPassword: curPass, newPassword: newPass }, 'Contraseña actualizada')) { setCurPass(''); setNewPass('') }
  }

  async function saveProfileImages(p: { avatarUrl?: string | null; coverUrl?: string | null }) {
    const r = await fetch('/api/student/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) })
    const d = await r.json()
    if (!r.ok) throw new Error(d.error || 'No se pudo guardar.')
    if ('avatarUrl' in p) setAvatar(p.avatarUrl ?? null)
    if ('coverUrl' in p) setCover(p.coverUrl ?? null)
  }

  async function pickPostImage(file: File | undefined) {
    if (!file) return
    try {
      setPostImage(await resizeToDataUrl(file, 1400))
    } catch {}
  }

  async function publishPost() {
    const content = postText.trim()
    if (!content || posting) return
    setPosting(true)
    setPostErr('')
    try {
      const r = await fetch('/api/student/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, imageUrl: postImage || undefined }),
      })
      const d = await r.json()
      if (r.ok) {
        setPosts((p) => [d.post, ...p])
        setPostText('')
        setPostImage(null)
      } else {
        setPostErr(d?.error || 'No se pudo publicar.')
      }
    } catch {}
    setPosting(false)
  }

  function removePost(id: string) {
    setPosts((p) => p.filter((x) => x.id !== id))
  }

  function prependShared(p: FeedPost) {
    setPosts((prev) => [p, ...prev])
  }

  const m = getMembership(role)
  const MIcon = m.key === 'MENTORIA' ? Crown : m.key === 'ADMIN' ? ShieldCheck : m.key === 'EDITOR' ? Pencil : Star

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-xs font-bold text-slate-400">Cargando perfil...</div>

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-5 md:p-8">
      <h1 className="text-2xl font-black tracking-tight text-slate-900">Mi perfil</h1>

      {msg && (
        <div className={`flex items-center gap-2 rounded-2xl border p-3.5 text-xs font-bold ${msg.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {msg.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {msg.text}
        </div>
      )}

      {/* Perfil estilo Facebook: portada + foto + badge de rol */}
      <ProfileHeader name={name || 'Alumno'} role={role} avatarUrl={avatar} coverUrl={cover} followers={followers} following={following} postsCount={posts.length} onSave={saveProfileImages} />

      {/* Tabs */}
      <div className="inline-flex rounded-xl bg-slate-100 p-1">
        <button onClick={() => setTab('posts')} className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${tab === 'posts' ? 'bg-white text-[#0284c7] shadow-sm' : 'text-slate-500'}`}>Publicaciones</button>
        <button onClick={() => setTab('settings')} className={`rounded-lg px-4 py-1.5 text-xs font-bold transition ${tab === 'settings' ? 'bg-white text-[#0284c7] shadow-sm' : 'text-slate-500'}`}>Configuración</button>
      </div>

      {tab === 'posts' && (
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
            <textarea
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              maxLength={MAX_POST_LEN}
              placeholder={`¿Qué estás operando hoy, ${(name || 'Alumno').split(' ')[0]}?`}
              rows={3}
              className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-[14px] outline-none transition focus:border-sky-400 focus:bg-white focus:ring-2 focus:ring-sky-100"
            />
            {postImage && (
              <div className="relative mt-2 inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={postImage} alt="" className="max-h-56 rounded-xl object-cover" />
                <button onClick={() => setPostImage(null)} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-slate-800 text-white shadow">✕</button>
              </div>
            )}
            {postErr && <p className="mt-2 text-xs font-semibold text-red-500">{postErr}</p>}
            <p className="mt-2 text-[11px] text-slate-400">{NO_LINKS_MESSAGE}</p>
            <div className="mt-2.5 flex items-center justify-between">
              <input ref={postImgInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pickPostImage(e.target.files?.[0])} />
              <button onClick={() => postImgInput.current?.click()} className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-500 hover:bg-slate-50">
                <ImageIcon size={16} /> Foto
              </button>
              <button onClick={publishPost} disabled={!postText.trim() || posting} className="flex items-center gap-1.5 rounded-xl bg-[#0284c7] px-4 py-2 text-sm font-bold text-white disabled:opacity-40">
                {posting ? <Loader2 size={15} className="animate-spin" /> : null} Publicar
              </button>
            </div>
          </div>

          {posts.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center">
              <p className="font-semibold text-slate-600">Todavía no publicaste nada</p>
              <p className="text-sm text-slate-400">Lo que compartas en Comunidad va a aparecer acá.</p>
            </div>
          )}
          {meId && posts.map((p) => (
            <PostCard key={p.id} post={p} avatars={postAvatars} meId={meId} canModerate={false} apiBase="/api/student/community" onDeleted={removePost} onShared={prependShared} />
          ))}
        </div>
      )}

      {tab === 'settings' && (
        <div className="space-y-6">
          {/* Tarjeta con foto y membresía (configuración clásica, sin cambios) */}
          <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${m.gradient} p-6 text-white shadow-xl ${m.glow}`}>
            <MIcon size={140} className="absolute -right-6 -top-6 opacity-15" />
            <div className="relative flex flex-col items-center gap-5 sm:flex-row">
              <div className="relative">
                <Avatar name={name} email={email} avatarUrl={avatar} size={96} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={saving} aria-label="Cambiar foto"
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-sky-600 shadow-lg hover:scale-110 transition-transform cursor-pointer">
                  <Camera size={17} />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0] || null)} />
              </div>
              <div className="text-center sm:text-left">
                <p className="text-xl font-black">{name || 'Alumno'}</p>
                {username && <p className="text-xs font-bold text-white/90">@{username}</p>}
                <p className="text-xs text-white/80">{email}</p>
                <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-[11px] font-black uppercase tracking-widest backdrop-blur">
                  <MIcon size={13} /> {m.title}
                </span>
              </div>
              {avatar && (
                <button type="button" onClick={removePhoto} disabled={saving}
                  className="flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-[11px] font-bold hover:bg-white/25 sm:ml-auto cursor-pointer">
                  <Trash2 size={13} /> Quitar foto
                </button>
              )}
            </div>
          </div>

          {/* Datos */}
          <form onSubmit={saveData} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-black text-slate-900">Datos personales</h2>
            <div><label className={labelCls}>Nombre</label><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required /></div>
            <div><label className={labelCls}>Nombre de usuario (único)</label><input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} className={inputCls} placeholder="ej: trader_nyc" maxLength={20} autoCapitalize="none" /></div>
            <div><label className={labelCls}>Correo</label><input value={email} disabled className={`${inputCls} cursor-not-allowed opacity-60`} /></div>
            <div><label className={labelCls}>Teléfono</label><input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+54 9 351 000 0000" /></div>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 text-xs font-bold text-white hover:bg-sky-700 disabled:opacity-50 cursor-pointer">
              <Save size={15} /> Guardar cambios
            </button>
          </form>

          {/* Contraseña */}
          <form onSubmit={savePass} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="flex items-center gap-2 text-sm font-black text-slate-900"><Lock size={15} /> Cambiar contraseña</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className={labelCls}>Contraseña actual</label><input type="password" value={curPass} onChange={(e) => setCurPass(e.target.value)} className={inputCls} autoComplete="current-password" /></div>
              <div><label className={labelCls}>Nueva (mín. 8)</label><input type="password" minLength={8} value={newPass} onChange={(e) => setNewPass(e.target.value)} className={inputCls} autoComplete="new-password" /></div>
            </div>
            <button type="submit" disabled={saving || !curPass || newPass.length < 8} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-40 cursor-pointer">
              <Lock size={15} /> Actualizar contraseña
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
