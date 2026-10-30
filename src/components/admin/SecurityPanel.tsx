'use client'

import { useEffect, useRef, useState } from 'react'
import { ShieldAlert, ShieldCheck, Lock, Unlock, ChevronDown, ChevronUp, Siren } from 'lucide-react'

interface LockRow { userId: string; userName: string | null; userEmail: string | null; reason: string | null; lessonTitle: string | null; lockedAt: string }
interface Incident { id: string; userId: string; userName: string | null; userEmail: string | null; lessonTitle: string | null; label: string; score: number; ip: string | null; createdAt: string }
interface Data { locks: LockRow[]; incidents: Incident[] }

const ago = (iso: string) => {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return `hace ${s}s`
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`
  return `hace ${Math.floor(s / 86400)} d`
}

function beep() {
  try {
    const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext
    const ctx = new Ctx()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'sine'
    o.frequency.value = 880
    g.gain.value = 0.08
    o.connect(g)
    g.connect(ctx.destination)
    o.start()
    setTimeout(() => { o.stop(); ctx.close() }, 350)
  } catch {}
}

// Panel de seguridad de video para Live Activity: alertas en vivo y habilitación de alumnos bloqueados.
export default function SecurityPanel() {
  const [data, setData] = useState<Data | null>(null)
  const [err, setErr] = useState('')
  const [open, setOpen] = useState(true)
  const [confirm, setConfirm] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [flash, setFlash] = useState<Incident | null>(null)
  const lastId = useRef<string | null>(null)
  const first = useRef(true)

  async function load() {
    try {
      const r = await fetch('/api/admin/security', { cache: 'no-store' })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`)
      setData(d)
      setErr('')
      const top: Incident | undefined = d.incidents?.[0]
      if (top) {
        if (!first.current && top.id !== lastId.current) {
          setFlash(top)
          beep()
          setTimeout(() => setFlash((f) => (f && f.id === top.id ? null : f)), 12000)
        }
        lastId.current = top.id
      }
      first.current = false
    } catch (e: any) {
      setErr(e.message || 'No se pudo cargar')
    }
  }

  useEffect(() => {
    load()
    const t = setInterval(load, 4000)
    return () => clearInterval(t)
  }, [])

  async function unlock(userId: string) {
    setBusy(userId)
    try {
      const r = await fetch('/api/admin/security', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, action: 'unlock' }) })
      if (!r.ok) setErr((await r.json().catch(() => ({}))).error || 'No se pudo habilitar')
    } finally {
      setBusy(null)
      setConfirm(null)
      load()
    }
  }

  const locks = data?.locks ?? []
  const incidents = data?.incidents ?? []
  const nm = (x: { userName: string | null; userEmail: string | null }) => x.userName || x.userEmail || 'Alumno'

  return (
    <section className={`overflow-hidden rounded-3xl border bg-white shadow-sm ${locks.length > 0 ? 'border-rose-300' : 'border-gray-200'}`}>
      {flash && (
        <div className="flex items-center gap-3 bg-rose-600 px-4 py-2.5 text-xs font-bold text-white">
          <Siren size={16} className="shrink-0 animate-pulse" />
          <span className="min-w-0 flex-1 truncate">
            Nueva alerta: {nm(flash)} · {flash.label}{flash.lessonTitle ? ` · ${flash.lessonTitle}` : ''}
          </span>
          <button type="button" onClick={() => setFlash(null)} className="cursor-pointer rounded-md bg-white/20 px-2 py-0.5">Cerrar</button>
        </div>
      )}

      <button type="button" onClick={() => setOpen((v) => !v)} className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left">
        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${locks.length > 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
          {locks.length > 0 ? <ShieldAlert size={19} /> : <ShieldCheck size={19} />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-black text-[#1d1d1f]">Seguridad de videos</span>
          <span className="block text-[11px] text-gray-500">
            {locks.length > 0 ? `${locks.length} alumno${locks.length > 1 ? 's' : ''} bloqueado${locks.length > 1 ? 's' : ''} esperando revisión` : 'Sin alumnos bloqueados'}
            {' · '}alertas en vivo
          </span>
        </span>
        {locks.length > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-black text-white">{locks.length}</span>}
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>

      {open && (
        <div className="space-y-4 border-t border-gray-100 p-4">
          {err && <p className="rounded-xl bg-rose-50 p-2.5 text-xs font-bold text-rose-700">{err}</p>}

          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-gray-500"><Lock size={12} /> Bloqueados por seguridad</h3>
            {locks.length === 0 ? (
              <p className="rounded-xl bg-gray-50 p-3 text-center text-xs text-gray-400">Nadie está bloqueado.</p>
            ) : (
              <ul className="space-y-2">
                {locks.map((l) => (
                  <li key={l.userId} className="flex flex-wrap items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/60 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#1d1d1f]">{nm(l)}</p>
                      <p className="truncate text-[11px] text-gray-500">{l.userEmail}</p>
                      <p className="mt-1 text-[11px] text-rose-700">{l.reason}{l.lessonTitle ? ` · Viendo: ${l.lessonTitle}` : ''} · {ago(l.lockedAt)}</p>
                    </div>
                    {confirm === l.userId ? (
                      <div className="flex gap-1.5">
                        <button type="button" disabled={busy === l.userId} onClick={() => unlock(l.userId)} className="flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50">
                          <Unlock size={13} /> Sí, habilitar
                        </button>
                        <button type="button" onClick={() => setConfirm(null)} className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-bold text-gray-500 hover:bg-white">Cancelar</button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => setConfirm(l.userId)} className="flex cursor-pointer items-center gap-1 rounded-lg border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50">
                        <Unlock size={13} /> Habilitar de nuevo
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wide text-gray-500"><Siren size={12} /> Últimas alertas</h3>
            {incidents.length === 0 ? (
              <p className="rounded-xl bg-gray-50 p-3 text-center text-xs text-gray-400">Todavía no hay alertas.</p>
            ) : (
              <ul className="max-h-64 space-y-1.5 overflow-y-auto pr-1">
                {incidents.map((i) => (
                  <li key={i.id} className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-100 bg-white px-3 py-2 text-xs">
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-black text-white ${i.score >= 3 ? 'bg-rose-500' : 'bg-amber-500'}`}>{i.score >= 3 ? 'Alta' : 'Media'}</span>
                    <span className="min-w-0 flex-1">
                      <b className="text-[#1d1d1f]">{nm(i)}</b> · <span className="text-gray-600">{i.label}</span>
                      {i.lessonTitle && <span className="text-gray-400"> · {i.lessonTitle}</span>}
                    </span>
                    <span className="text-[10px] text-gray-400">{ago(i.createdAt)}{i.ip ? ` · ${i.ip}` : ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  )
}