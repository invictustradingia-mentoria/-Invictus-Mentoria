'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

const KEY = 'inv-cookie-consent'

type Consent = {
  necessary: true
  analytics: boolean
  marketing: boolean
  ts: number
}

function save(c: Consent) {
  try {
    localStorage.setItem(KEY, JSON.stringify(c))
  } catch {}
}

export default function CookieBar() {
  const [visible, setVisible] = useState(false)
  const [custom, setCustom] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(true)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (!raw) setVisible(true)
    } catch {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  function acceptAll() {
    save({ necessary: true, analytics: true, marketing: true, ts: Date.now() })
    setVisible(false)
  }
  function rejectNonEssential() {
    save({ necessary: true, analytics: false, marketing: false, ts: Date.now() })
    setVisible(false)
  }
  function savePrefs() {
    save({ necessary: true, analytics, marketing, ts: Date.now() })
    setVisible(false)
  }

  return (
    <div
      role="dialog"
      aria-label="Preferencias de cookies"
      className="fixed inset-x-0 bottom-0 z-[9996] px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_-10px_rgba(15,23,42,.35)] p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="hidden sm:flex h-9 w-9 flex-none items-center justify-center rounded-full bg-sky-100 text-lg">
            🍪
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-900 mb-1">Usamos cookies</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Usamos cookies necesarias para que la Plataforma funcione, y cookies analíticas y de
              marketing opcionales para mejorar tu experiencia. Podés leer más en nuestra{' '}
              <Link href="/legal/cookies" className="font-semibold text-sky-600 hover:underline">
                Política de Cookies
              </Link>
              .
            </p>

            {custom && (
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">Necesarias (siempre activas)</span>
                  <input type="checkbox" checked disabled className="h-4 w-4 accent-slate-400" />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">Analíticas</span>
                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(e) => setAnalytics(e.target.checked)}
                    className="h-4 w-4 accent-sky-600"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-700">Marketing</span>
                  <input
                    type="checkbox"
                    checked={marketing}
                    onChange={(e) => setMarketing(e.target.checked)}
                    className="h-4 w-4 accent-sky-600"
                  />
                </label>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={acceptAll}
                className="rounded-full bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-700"
              >
                Aceptar todas
              </button>
              <button
                onClick={rejectNonEssential}
                className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Rechazar no esenciales
              </button>
              {!custom ? (
                <button
                  onClick={() => setCustom(true)}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-sky-600 hover:underline"
                >
                  Personalizar
                </button>
              ) : (
                <button
                  onClick={savePrefs}
                  className="rounded-full px-4 py-2 text-sm font-semibold text-sky-600 hover:underline"
                >
                  Guardar preferencias
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
