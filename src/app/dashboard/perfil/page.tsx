'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, Trash2, Save, Lock, CheckCircle2, AlertCircle, Crown, Star, ShieldCheck } from 'lucide-react'
import { Avatar } from '@/components/dashboard/DashboardShell'
import { getMembership } from '@/lib/membership'

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

const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-800 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100'
const labelCls = 'mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-500'

export default function ProfilePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('CLUB')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [avatar, setAvatar] = useState<string | null>(null)
  const [curPass, setCurPass] = useState('')
  const [newPass, setNewPass] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ text: string; type: 'ok' | 'err' } | null>(null)

  useEffect(() => {
    fetch('/api/student/profile', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setEmail(d.user.email); setRole(d.user.role); setName(d.user.name ?? '')
          setPhone(d.user.phone ?? ''); setAvatar(d.user.avatarUrl ?? null)
        }
      })
      .finally(() => setLoading(false))
  }, [])

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

  const saveData = (e: React.FormEvent) => { e.preventDefault(); patch({ name, phone }, 'Datos guardados') }

  const savePass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (await patch({ currentPassword: curPass, newPassword: newPass }, 'Contraseña actualizada')) { setCurPass(''); setNewPass('') }
  }

  const m = getMembership(role)
  const MIcon = m.key === 'MENTORIA' ? Crown : m.key === 'ADMIN' ? ShieldCheck : Star

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-xs font-bold text-slate-400">Cargando perfil...</div>

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-5 md:p-8">
      <h1 className="text-2xl font-black tracking-tight text-slate-900">Mi perfil</h1>

      {msg && (
        <div className={`flex items-center gap-2 rounded-2xl border p-3.5 text-xs font-bold ${msg.type === 'ok' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>
          {msg.type === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {msg.text}
        </div>
      )}

      {/* Tarjeta con foto y membresía */}
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
  )
}