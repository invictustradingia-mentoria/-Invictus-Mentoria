'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { signIn } from 'next-auth/react'
import { Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

const ERROR_MESSAGES: Record<string, string> = {
  PENDING: 'Tu cuenta está pendiente de aprobación. Te avisaremos cuando sea activada.',
  REJECTED: 'Tu solicitud fue rechazada. Contacta con el equipo.',
  BANNED: 'Tu cuenta está suspendida. Contacta con el equipo.',
  INVALID: 'Correo o contraseña incorrectos.',
  CredentialsSignin: 'Correo o contraseña incorrectos.',
}

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Aviso cuando llega desde el registro (?registered=1)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('registered')) {
      setInfo('Cuenta creada. Tu solicitud quedó pendiente de aprobación; podrás ingresar cuando el equipo la active.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setInfo(null)

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      })

      if (result?.error) {
        setError(ERROR_MESSAGES[result.error] ?? 'No se pudo iniciar sesión. Inténtalo de nuevo.')
        setLoading(false)
        return
      }

      const sessionRes = await fetch('/api/auth/session', { cache: 'no-store' })
      const session = await sessionRes.json()
      const userRole = session?.user?.role

      // Sesión vacía: el usuario está bloqueado
      if (!session?.user) {
        setError('Tu cuenta no tiene acceso activo. Contacta con el equipo.')
        setLoading(false)
        return
      }

      window.location.href = userRole === 'ADMIN' ? '/admin' : '/dashboard'
    } catch (err) {
      setError('Error de conexión con el servidor')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1d1d1f] flex flex-col justify-center items-center px-6 py-12 selection:bg-[#0284c7] selection:text-white">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#ededf0] shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#1d1d1f] text-white items-center justify-center font-black tracking-wider text-base shadow-md shadow-black/5 mx-auto">
            IT
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#1d1d1f]">INVICTUS CAMPUS</h1>
          <p className="text-xs text-gray-500">Plataforma Institucional de Trading</p>
        </div>

        <div className="space-y-1">
          <h2 className="text-sm font-bold text-[#1d1d1f]">Iniciar Sesión</h2>
          <p className="text-xs text-gray-400">Accede a tu cuenta de alumno o administración</p>
        </div>

        {info && (
          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 text-xs font-bold flex items-start gap-2">
            <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-gray-400" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@invictus.com"
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#0284c7] font-medium text-[#1d1d1f]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-gray-400" size={16} />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#0284c7] font-medium text-[#1d1d1f]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-all shadow-md shadow-sky-500/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="font-bold text-[#0284c7] hover:underline">
              Solicitar Registro
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}