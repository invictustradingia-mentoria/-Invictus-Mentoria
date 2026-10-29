'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { User, Mail, Lock, Phone, Eye, EyeOff, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
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
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          password,
        }),
      })

      let data: any = {}
      try {
        data = await res.json()
      } catch {
        data = {}
      }

      if (!res.ok) {
        setError(data.error || `Ocurrió un error al registrar la cuenta (HTTP ${res.status})`)
        setLoading(false)
        return
      }

      // Sin signIn automático: la cuenta queda pendiente hasta que el admin la apruebe
      setSuccess(true)
      setLoading(false)

      setTimeout(() => {
        window.location.href = '/login?registered=1'
      }, 3500)
    } catch (err) {
      setError('Error de conexión con el servidor')
      setLoading(false)
    }
  }

  // ---------- Pantalla de éxito ----------
  if (success) {
    return (
      <div className="min-h-screen bg-[#fdfdfd] text-[#1d1d1f] flex flex-col justify-center items-center px-6 py-12">
        <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#ededf0] shadow-sm text-center space-y-4">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-sky-50 text-[#0284c7] items-center justify-center mx-auto">
            <Clock size={28} />
          </div>
          <h1 className="text-xl font-black tracking-tight">¡Solicitud enviada!</h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Tu cuenta fue creada y está <span className="font-bold text-[#0284c7]">pendiente de aprobación</span>.
            El equipo la revisará y podrás iniciar sesión cuando sea activada.
          </p>
          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200 text-[#0369a1] text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-[#0284c7]" />
            <span>Te llevamos al inicio de sesión...</span>
          </div>
          <a href="/login?registered=1" className="inline-block text-xs font-bold text-[#0284c7] hover:underline">
            Ir ahora al inicio de sesión
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1d1d1f] flex flex-col justify-center items-center px-6 py-12 selection:bg-[#0284c7] selection:text-white">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#ededf0] shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#1d1d1f] text-white items-center justify-center font-black tracking-wider text-base shadow-md shadow-black/5 mx-auto">
            IT
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#1d1d1f]">INVICTUS CAMPUS</h1>
          <p className="text-xs text-gray-500">Solicitud de Registro de Alumno</p>
        </div>

        <div className="space-y-1">
          <h2 className="text-sm font-bold text-[#1d1d1f]">Crear Cuenta</h2>
          <p className="text-xs text-gray-400">
            Ingresa tus datos. Tu acceso será activado una vez que el equipo apruebe tu solicitud.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
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
                autoComplete="name"
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
                autoComplete="email"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-xs border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#0284c7] font-medium text-[#1d1d1f]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-600">Teléfono <span className="font-normal text-gray-400">(opcional)</span></label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 text-gray-400" size={16} />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+54 9 351 000 0000"
                autoComplete="tel"
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
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
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