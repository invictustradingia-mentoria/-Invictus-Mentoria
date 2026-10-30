'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function ResetPasswordPage() {
  const [token, setToken] = useState('')
  const [valid, setValid] = useState<boolean | null>(null)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get('token') || ''
    setToken(t)
    if (!t) {
      setValid(false)
      return
    }
    fetch('/api/auth/reset-password?token=' + encodeURIComponent(t), { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => setValid(!!d.valid))
      .catch(() => setValid(false))
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.')
    if (password !== confirm) return setError('Las contraseñas no coinciden.')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'No se pudo guardar la contraseña.')
        setLoading(false)
        return
      }
      setDone(true)
      setTimeout(() => { window.location.href = '/login?reset=1' }, 2500)
    } catch {
      setError('Error de conexión con el servidor')
      setLoading(false)
    }
  }

  const input = 'w-full pl-10 pr-10 py-2.5 rounded-xl text-xs border border-gray-200 bg-gray-50 focus:outline-none focus:border-[#0284c7] font-medium text-[#1d1d1f]'

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1d1d1f] flex flex-col justify-center items-center px-6 py-12 selection:bg-[#0284c7] selection:text-white">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#ededf0] shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#1d1d1f] text-white items-center justify-center font-black tracking-wider text-base shadow-md shadow-black/5 mx-auto">
            IT
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#1d1d1f]">INVICTUS CAMPUS</h1>
          <p className="text-xs text-gray-500">Crear nueva contraseña</p>
        </div>

        {valid === null ? (
          <p className="text-center text-xs text-gray-400">Verificando enlace...</p>
        ) : !valid ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>Este enlace venció o ya fue usado. Pide uno nuevo desde “¿Olvidaste tu contraseña?”.</span>
            </div>
            <a href="/forgot-password" className="block w-full text-center py-3 rounded-xl text-xs font-bold bg-[#0284c7] text-white hover:bg-[#0369a1]">
              Pedir un enlace nuevo
            </a>
          </div>
        ) : done ? (
          <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold flex items-start gap-2">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-[#0284c7]" />
            <span>¡Contraseña actualizada! Te llevamos al inicio de sesión...</span>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#1d1d1f]">Elige tu nueva contraseña</h2>
              <p className="text-xs text-gray-400">Mínimo 8 caracteres.</p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Nueva contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-gray-400" size={16} />
                  <input type={show ? 'text' : 'password'} required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" placeholder="Mínimo 8 caracteres" className={input} />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600 cursor-pointer" aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Repite la contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-gray-400" size={16} />
                  <input type={show ? 'text' : 'password'} required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" placeholder="Escríbela otra vez" className={input} />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-xs font-bold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-all shadow-md shadow-sky-500/10 cursor-pointer disabled:opacity-50">
                {loading ? 'Guardando...' : 'Guardar contraseña'}
              </button>
            </form>
          </>
        )}

        <div className="text-center pt-2">
          <a href="/login" className="inline-flex items-center gap-1 text-xs font-bold text-[#0284c7] hover:underline">
            <ArrowLeft size={14} /> Volver a iniciar sesión
          </a>
        </div>
      </div>
    </div>
  )
}