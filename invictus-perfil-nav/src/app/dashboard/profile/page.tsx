'use client'

import { useState, useEffect, useRef } from 'react'
import { User, Mail, Phone, Lock, Camera, CheckCircle, AlertCircle, Loader2, Shield } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface UserProfile {
  id: string
  name: string
  email: string
  phone: string | null
  avatarUrl: string | null
  role: string
  status: string
  createdAt: string
  registeredIp: string | null
  _count: {
    progress: number
    activityLogs: number
  }
}

export default function ProfilePage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    name: '',
    phone: '',
    avatarUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'security'>('info')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data: UserProfile = await res.json()
        setProfile(data)
        setForm((prev) => ({
          ...prev,
          name: data.name || '',
          phone: data.phone || '',
          avatarUrl: data.avatarUrl || '',
        }))
        if (data.avatarUrl) setAvatarPreview(data.avatarUrl)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setErrorMsg(null)
    setTimeout(() => setSuccessMsg(null), 4000)
  }

  const showError = (msg: string) => {
    setErrorMsg(msg)
    setSuccessMsg(null)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showError('Solo se permiten imágenes (JPG, PNG, WebP).')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      showError('La imagen no debe superar 3 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setAvatarPreview(base64)
      setForm((prev) => ({ ...prev, avatarUrl: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      showError('El nombre no puede estar vacío.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          avatarUrl: form.avatarUrl,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        showSuccess('Perfil actualizado correctamente.')
        fetchProfile()
      } else {
        showError(data.error || 'Error al actualizar el perfil.')
      }
    } catch {
      showError('Error de red al guardar los cambios.')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      showError('Completa todos los campos de contraseña.')
      return
    }
    if (form.newPassword !== form.confirmPassword) {
      showError('La nueva contraseña y su confirmación no coinciden.')
      return
    }
    if (form.newPassword.length < 6) {
      showError('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        showSuccess('Contraseña cambiada exitosamente.')
        setForm((prev) => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }))
      } else {
        showError(data.error || 'Error al cambiar la contraseña.')
      }
    } catch {
      showError('Error de red al cambiar la contraseña.')
    } finally {
      setSaving(false)
    }
  }

  const roleBadge = (role: string) => {
    const styles: Record<string, string> = {
      ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
      VIP: 'bg-amber-50 text-amber-700 border-amber-200',
      STUDENT: 'bg-[#f0f9ff] text-[#0284c7] border-[#fcd5c3]',
    }
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${styles[role] || styles.STUDENT}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-[#0284c7]" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-[#0284c7] tracking-wider uppercase block">MI CUENTA</span>
        <h1 className="text-xl sm:text-2xl font-bold text-[#1d1d1f] mt-0.5 flex items-center gap-2">
          <User size={22} className="text-[#0284c7]" />
          Mi Perfil
        </h1>
        <p className="text-[#86868b] text-[13px] mt-1">
          Edita tu información personal, foto de perfil y contraseña de acceso.
        </p>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 text-green-700 rounded-xl text-sm">
          <CheckCircle size={16} />
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          <AlertCircle size={16} />
          {errorMsg}
        </div>
      )}

      {/* Profile card with avatar */}
      <div className="bg-white rounded-2xl border border-[#ededf0] shadow-sm p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Avatar */}
        <div className="relative">
          <div
            className="w-20 h-20 rounded-2xl bg-[#f0f9ff] border-2 border-[#fcd5c3] flex items-center justify-center overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => fileInputRef.current?.click()}
          >
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl font-bold text-[#0284c7]">
                {profile?.name?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#0284c7] text-white flex items-center justify-center shadow-sm hover:bg-[#d04c18] transition-colors cursor-pointer"
            title="Cambiar foto"
          >
            <Camera size={13} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleAvatarChange}
            className="hidden"
          />
        </div>

        {/* User meta */}
        <div className="text-center sm:text-left">
          <h2 className="text-lg font-bold text-[#1d1d1f]">{profile?.name}</h2>
          <p className="text-sm text-[#86868b] font-mono">{profile?.email}</p>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
            <span className={roleBadge(profile?.role || 'STUDENT')}>{profile?.role}</span>
            <span className="text-[11px] text-[#86868b]">
              Miembro desde{' '}
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('es-ES', {
                    month: 'long',
                    year: 'numeric',
                  })
                : '–'}
            </span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-[12px] text-[#86868b]">
            <span>{profile?._count?.progress || 0} clases completadas</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex p-1 bg-[#f0f0f4] rounded-xl">
        <button
          onClick={() => setActiveTab('info')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'info' ? 'bg-white text-[#0284c7] shadow-sm' : 'text-[#6e6e73] hover:text-[#111]'
          }`}
        >
          Información Personal
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            activeTab === 'security' ? 'bg-white text-[#0284c7] shadow-sm' : 'text-[#6e6e73] hover:text-[#111]'
          }`}
        >
          <Lock size={12} />
          Seguridad y Contraseña
        </button>
      </div>

      {/* Info Tab */}
      {activeTab === 'info' && (
        <form onSubmit={handleSaveInfo} className="bg-white rounded-2xl border border-[#ededf0] shadow-sm p-6 space-y-4">
          <h3 className="font-bold text-[#1d1d1f] text-sm border-b border-[#f0f0f4] pb-3">
            Datos Personales
          </h3>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider flex items-center gap-1.5">
              <User size={11} />
              Nombre Completo
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Tu nombre completo"
              className="w-full bg-white border border-[#e5e5ea] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#0284c7] transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider flex items-center gap-1.5">
              <Mail size={11} />
              Correo Electrónico
            </label>
            <input
              type="email"
              value={profile?.email || ''}
              disabled
              className="w-full bg-[#f8f8fa] border border-[#e5e5ea] rounded-xl px-4 py-2.5 text-[13px] text-[#86868b] cursor-not-allowed"
            />
            <p className="text-[11px] text-[#999]">El correo no puede modificarse. Contacta con el administrador si necesitas cambiarlo.</p>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider flex items-center gap-1.5">
              <Phone size={11} />
              Teléfono (opcional)
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+34 600 000 000"
              className="w-full bg-white border border-[#e5e5ea] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#0284c7] transition-colors"
            />
          </div>

          <div className="flex justify-end pt-2 border-t border-[#f0f0f4]">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#d04c18] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <form onSubmit={handleChangePassword} className="bg-white rounded-2xl border border-[#ededf0] shadow-sm p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#f0f0f4] pb-3">
            <Shield size={16} className="text-[#0284c7]" />
            <h3 className="font-bold text-[#1d1d1f] text-sm">Cambiar Contraseña</h3>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
              Contraseña Actual
            </label>
            <input
              type="password"
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
              placeholder="Tu contraseña actual"
              className="w-full bg-white border border-[#e5e5ea] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#0284c7]"
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
              Nueva Contraseña
            </label>
            <input
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-white border border-[#e5e5ea] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#0284c7]"
              autoComplete="new-password"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              placeholder="Repite la nueva contraseña"
              className="w-full bg-white border border-[#e5e5ea] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#0284c7]"
              autoComplete="new-password"
            />
            {form.newPassword && form.confirmPassword && form.newPassword !== form.confirmPassword && (
              <p className="text-[11px] text-red-500">Las contraseñas no coinciden.</p>
            )}
          </div>

          <div className="flex justify-end pt-2 border-t border-[#f0f0f4]">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#d04c18] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-60 cursor-pointer"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
              {saving ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
