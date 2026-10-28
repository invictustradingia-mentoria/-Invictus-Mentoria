'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import {
  TrendingUp,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  Clock,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<{ type: 'error' | 'pending'; text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const cleanEmail = email.trim().toLowerCase()

      const result = await signIn('credentials', {
        email: cleanEmail,
        password,
        ip: '',
        userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        redirect: false,
      })

      if (result?.error) {
        setLoading(false)

        if (result.error === 'PENDING_APPROVAL') {
          setError({
            type: 'pending',
            text: 'Tu registro ha sido recibido correctamente pero aún está PENDIENTE DE APROBACIÓN por el Administrador. Te notificaremos cuando tu acceso sea habilitado.',
          })
        } else if (result.error === 'REJECTED') {
          setError({
            type: 'error',
            text: 'Tu solicitud de acceso ha sido rechazada por el Administrador. Contacta a soporte para más detalles.',
          })
        } else if (result.error === 'BANNED') {
          setError({
            type: 'error',
            text: 'Tu cuenta ha sido suspendida temporalmente por la administración.',
          })
        } else {
          setError({
            type: 'error',
            text: 'Correo o contraseña incorrectos. Por favor verifica tus credenciales.',
          })
        }
        return
      }

      if (result?.ok) {
        // Consultar la sesión actualizada para redirigir con precisión
        const sessionRes = await fetch('/api/auth/session')
        const session = await sessionRes.json()
        const role = session?.user?.role

        if (role === 'ADMIN') {
          window.location.href = '/admin'
        } else {
          window.location.href = '/dashboard'
        }
      }
    } catch {
      setLoading(false)
      setError({
        type: 'error',
        text: 'Error de conexión con el servidor. Intenta de nuevo.',
      })
    }
  }

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail)
    setPassword(userPass)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex items-center justify-center px-4 relative overflow-hidden py-12 text-[#2d2d2d] font-sans">
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
            Plataforma Institucional de Trading
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-white rounded-2xl p-8 border border-[#ededf0] shadow-sm">
          <h1 className="text-xl font-bold text-[#1d1d1f] mb-1">Iniciar Sesión</h1>
          <p className="text-[#86868b] text-[13px] mb-6">
            Accede a tu cuenta de alumno o administración
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className={`flex items-start gap-2.5 p-3.5 rounded-xl text-[13px] border animate-fade-in ${
                  error.type === 'pending'
                    ? 'bg-[#fffaf0] border-[#fed7aa] text-[#c2410c]'
                    : 'bg-red-50 border-red-200 text-red-600'
                }`}
              >
                {error.type === 'pending' ? (
                  <Clock size={18} className="shrink-0 text-[#ea580c] mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="shrink-0 text-red-500 mt-0.5" />
                )}
                <span className="leading-relaxed">{error.text}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[#86868b] text-[11px] font-semibold tracking-wider uppercase">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                <input
                  type="email"
                  placeholder="ejemplo@invictus.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-white border border-[#e5e5ea] rounded-xl pl-10 pr-4 py-2.5 text-[13px] text-[#1d1d1f] placeholder:text-[#999] focus:outline-none focus:border-[#e25822] focus:ring-2 focus:ring-[#e25822]/10 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[#86868b] text-[11px] font-semibold tracking-wider uppercase">
                Contraseña
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#999]" />
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white border border-[#e5e5ea] rounded-xl pl-10 pr-10 py-2.5 text-[13px] text-[#1d1d1f] placeholder:text-[#999] focus:outline-none focus:border-[#e25822] focus:ring-2 focus:ring-[#e25822]/10 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#999] hover:text-[#111]"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
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
                  Verificando...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Atajos de acceso directo para prueba */}
          <div className="mt-6 pt-5 border-t border-[#f4f4f7] space-y-2">
            <span className="text-[11px] text-[#86868b] uppercase tracking-wider block font-semibold text-center">
              Acceso Rápido (Entorno de Pruebas)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@invictus-mentoria.com', 'Invictus2024!')}
                className="px-3 py-2 rounded-xl bg-[#f8f4fe] hover:bg-[#f3eafd] text-[#8a38ec] border border-[#ecdcfd] text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck size={13} />
                Admin
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('alumno@invictus.com', 'student123')}
                className="px-3 py-2 rounded-xl bg-[#fff4ef] hover:bg-[#ffede4] text-[#e25822] border border-[#fcd5c3] text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserCheck size={13} />
                Alumno Demo
              </button>
            </div>
          </div>

          <p className="text-center text-[#86868b] text-[13px] mt-6">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="text-[#e25822] hover:underline font-semibold">
              Solicitar Registro
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
