'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ocurrió un error al registrar la cuenta')
        setLoading(false)
        return
      }

      setSuccess(true)

      const signInResult = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (signInResult?.error) {
        window.location.href = '/login'
      } else {
        window.location.href = '/dashboard'
      }
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
          <h1 className="text-xl font-black tracking-tight text-[#1d1d1f]">INVICTUS TRADING</h1>
          <p className="text-xs text-gray-500">Solicitud de Registro de Alumno</p>
        </div>

        <div className="space-y-1">
          <h2 className="text-sm font-bold text-[#1d1d1f]">Crear Cuenta</h2>
          <p className="text-xs text-gray-400">Ingresa tus datos para registrarte en el club</p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-[#0369a1] text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-[#0284c7]" />
            <span>Cuenta creada con éxito. Redirigiendo...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600">Nombre Completo</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 text-gray-400" size={16} />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre y apellido"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#0284c7] font-medium text-[#1d1d1f]"
              />
            </div>
          </div>

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
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl text-xs border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#0284c7] font-medium text-[#1d1d1f]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 rounded-xl text-xs font-bold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-all shadow-md shadow-sky-500/10 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Procesando registro...' : 'Solicitar Acceso'}
          </button>
        </form>

        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            ¿Ya tienes una cuenta?{' '}
            <a href="/login" className="font-bold text-[#0284c7] hover:underline">
              Iniciar Sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}