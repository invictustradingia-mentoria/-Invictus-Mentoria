'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  TrendingUp,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
} from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (form.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          password: form.password,
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error al enviar tu solicitud.')
        setLoading(false)
        return
      }

      setLoading(false)
      setSuccess(true)
    } catch {
      setError('Error al conectar con el servidor. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center px-4 py-12 relative overflow-hidden text-[#2d2d2d] font-sans">
      <div className="relative w-full max-w-md">
        {/* Brand Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-[#fff4ef] border border-[#fcd5c3] rounded-xl flex items-center justify-center shadow-sm">
              <TrendingUp size={22} className="text-[#e25822]" />
            </div>
            <span className="text-[#1d1d1f] font-black text-2xl tracking-tight">
              INVICTUS <span className="text-[#e25822]">MENTORIA</span>
            </span>
          </Link>
          <p className="text-[12px] text-[#86868b] uppercase tracking-wider font-semibold mt-1">
            Solicitud de Registro de Alumno
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-8 border border-[#ededf0] shadow-sm">
          {success ? (
            <div className="text-center space-y-4 py-4 animate-fade-in">
              <div className="w-14 h-14 bg-[#fffaf0] border border-[#fed7aa] rounded-2xl flex items-center justify-center mx-auto text-[#ea580c] shadow-sm">
                <Clock size={28} />
              </div>
              <h2 className="text-xl font-bold text-[#1d1d1f]">
                ¡Solicitud Registrada con Éxito!
              </h2>
              <div className="bg-[#fbfbfd] border border-[#ededf0] rounded-xl p-4 text-[13px] text-[#6e6e73] leading-relaxed text-left space-y-2">
                <p>
                  Hola <strong className="text-[#1d1d1f]">{form.name}</strong>, tu cuenta ha sido creada y se encuentra en estado:
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fffaf0] text-[#c2410c] border border-[#fed7aa]">
                  <Clock size={12} />
                  PENDIENTE DE APROBACIÓN POR EL ADMINISTRADOR
                </div>
                <p className="text-[12px] pt-1">
                  Por seguridad y exclusividad de la mentoría, el Administrador debe validar tu registro y asignarte el rol correspondiente en la plataforma.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/login"
                  className="w-full py-3 rounded-xl bg-[#e25822] hover:bg-[#d04c18] active:scale-95 text-white text-[13px] font-semibold transition-all shadow-[0_2px_8px_rgba(226,88,34,0.3)] flex items-center justify-center gap-2"
                >
                  <span>Ir al Inicio de Sesión</span>
                  <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-[#1d1d1f] mb-1">
                Solicitud de Acceso
              </h1>
              <p className="text-[#86868b] text-[13px] mb-5">
                Ingresa tus datos. Tu cuenta será revisada y activada por el Administrador.
              </p>

              {/* Notice sobre aprobación */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#fffaf0] border border-[#fed7aa] text-[#c2410c] text-[12px] mb-5 leading-relaxed">
                <Shield size={16} className="shrink-0 text-[#ea580c] mt-0.5" />
                <span>
                  <strong>Nota de acceso:</strong> Tu registro quedará pendiente hasta que el Administrador apruebe tu perfil y te asigne rol en el sistema.
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl text-[13px] bg-red-50 border border-red-200 text-red-600 animate-fade-in">
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[#86868b] text-[11px] font-semibold tracking-wider uppercase">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                    <input
                      type="text"
                      placeholder="Ej. Mateo Rossi"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-white border border-[#e5e5ea] rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#e25822]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#86868b] text-[11px] font-semibold tracking-wider uppercase">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                    <input
                      type="email"
                      placeholder="alumno@invictus.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-white border border-[#e5e5ea] rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#e25822]"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#86868b] text-[11px] font-semibold tracking-wider uppercase">
                    Teléfono / WhatsApp (Opcional)
                  </label>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                    <input
                      type="tel"
                      placeholder="+54 9 11 1234-5678"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-white border border-[#e5e5ea] rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#e25822]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#86868b] text-[11px] font-semibold tracking-wider uppercase">
                    Contraseña
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                      className="w-full bg-white border border-[#e5e5ea] rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#e25822]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#111]"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#86868b] text-[11px] font-semibold tracking-wider uppercase">
                    Confirmar Contraseña
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                    <input
                      type="password"
                      placeholder="Repite la contraseña"
                      value={form.confirm}
                      onChange={e => setForm({ ...form, confirm: e.target.value })}
                      className="w-full bg-white border border-[#e5e5ea] rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-[#1d1d1f] focus:outline-none focus:border-[#e25822]"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-[#e25822] hover:bg-[#d04c18] active:scale-95 text-white text-[13px] font-semibold transition-all shadow-[0_2px_8px_rgba(226,88,34,0.3)] disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Enviando solicitud...
                    </span>
                  ) : (
                    'Enviar Solicitud de Registro'
                  )}
                </button>
              </form>

              <p className="text-center text-[#86868b] text-[13px] mt-6">
                ¿Ya tienes cuenta aprobada?{' '}
                <Link href="/login" className="text-[#e25822] hover:underline font-semibold">
                  Iniciar Sesión
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
