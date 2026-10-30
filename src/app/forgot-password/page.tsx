'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [wait, setWait] = useState(0)

  useEffect(() => {
    if (wait <= 0) return
    const t = setTimeout(() => setWait((w) => w - 1), 1000)
    return () => clearTimeout(t)
  }, [wait])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (loading || wait > 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || 'No se pudo enviar la solicitud. Inténtalo de nuevo.')
      } else {
        setSent(true)
        setWait(60)
      }
    } catch {
      setError('Error de conexión con el servidor')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#fdfdfd] text-[#1d1d1f] flex flex-col justify-center items-center px-6 py-12 selection:bg-[#0284c7] selection:text-white">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl border border-[#ededf0] shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex w-12 h-12 rounded-2xl bg-[#1d1d1f] text-white items-center justify-center font-black tracking-wider text-base shadow-md shadow-black/5 mx-auto">
            IT
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#1d1d1f]">INVICTUS CAMPUS</h1>
          <p className="text-xs text-gray-500">Recuperar contraseña</p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-bold flex items-start gap-2">
              <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-[#0284c7]" />
              <span>
                Si el correo está registrado y tu cuenta fue aprobada, te enviamos un enlace para crear una contraseña nueva.
                Revisa tu bandeja de entrada y también la carpeta de spam. El enlace dura 1 hora.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSent(false)}
              disabled={wait > 0}
              className="w-full py-3 rounded-xl text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              {wait > 0 ? `Volver a enviar en ${wait}s` : 'Volver a enviar'}
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-[#1d1d1f]">¿Olvidaste tu contraseña?</h2>
              <p className="text-xs text-gray-400">Escribe el correo con el que te registraste y te enviaremos un enlace para crear una nueva.</p>
            </div>

            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={submit} className="space-y-4">
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
              <button
                type="submit"
                disabled={loading || wait > 0}
                className="w-full py-3 rounded-xl text-xs font-bold bg-[#0284c7] text-white hover:bg-[#0369a1] transition-all shadow-md shadow-sky-500/10 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Enviando...' : 'Enviarme el enlace'}
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