'use client'

import { useCallback, useEffect, useState } from 'react'
import { Video, CalendarDays, Clock, Copy, Check, ExternalLink, PlayCircle, CalendarPlus, Radio, Lock } from 'lucide-react'

interface Call {
  id: string
  title: string
  description: string | null
  startsAt: string
  durationMin: number
  status: 'LIVE' | 'SOON' | 'UPCOMING' | 'PAST'
  unlockAt: string
  joinUrl: string | null
  meetingId: string | null
  passcode: string | null
  recordingUrl: string | null
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}
function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}
function countdown(ms: number) {
  if (ms <= 0) return 'Ahora'
  const m = Math.floor(ms / 60000)
  const d = Math.floor(m / 1440)
  const h = Math.floor((m % 1440) / 60)
  if (d > 0) return `en ${d} d ${h} h`
  if (h > 0) return `en ${h} h ${m % 60} min`
  return `en ${m} min`
}
function ics(c: Call) {
  const z = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
  const s = new Date(c.startsAt)
  const e = new Date(s.getTime() + c.durationMin * 60000)
  const esc = (t: string) => t.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')
  const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Invictus//Campus//ES', 'BEGIN:VEVENT', `UID:${c.id}@invictus`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(s)}`, `DTEND:${z(e)}`, `SUMMARY:${esc(c.title)}`, `DESCRIPTION:${esc((c.description || '') + '\nEl enlace se habilita en el campus 30 min antes.')}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n')
  const a = document.createElement('a')
  a.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar' }))
  a.download = 'invictus-llamada.ics'
  a.click()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

function Copyable({ label, value }: { label: string; value: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button
      onClick={() => navigator.clipboard?.writeText(value).then(() => { setOk(true); setTimeout(() => setOk(false), 1500) })}
      className="flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-3 py-1.5 text-xs text-sky-800 transition hover:bg-sky-100"
    >
      <span className="text-sky-500">{label}</span> <b className="font-mono">{value}</b> {ok ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
    </button>
  )
}

function Card({ c, now }: { c: Call; now: number }) {
  const live = c.status === 'LIVE'
  const soon = c.status === 'SOON'
  const past = c.status === 'PAST'
  return (
    <article className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${live ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-sky-100'}`}>
      <div className="flex gap-4 p-4 sm:p-5">
        <div className={`hidden h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl text-white sm:flex ${past ? 'bg-slate-400' : 'bg-gradient-to-br from-sky-500 to-sky-700'}`}>
          <span className="text-[10px] font-semibold uppercase">{new Date(c.startsAt).toLocaleDateString('es-AR', { month: 'short' })}</span>
          <span className="text-2xl font-bold leading-none">{new Date(c.startsAt).getDate()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {live && <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2.5 py-0.5 text-[11px] font-bold uppercase text-white"><Radio size={12} className="animate-pulse" /> En vivo</span>}
            {soon && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase text-amber-700">Por comenzar</span>}
            {!live && !soon && !past && <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-[11px] font-bold uppercase text-sky-700">{countdown(new Date(c.startsAt).getTime() - now)}</span>}
            {past && <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold uppercase text-slate-500">Finalizada</span>}
          </div>
          <h3 className="mt-1.5 text-lg font-bold leading-snug text-slate-900">{c.title}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="flex items-center gap-1.5 capitalize"><CalendarDays size={14} /> {fmtDate(c.startsAt)}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {fmtTime(c.startsAt)} · {c.durationMin} min</span>
          </p>
          {c.description && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{c.description}</p>}

          {!past && (
            <div className="mt-4 space-y-3">
              {c.joinUrl ? (
                <>
                  <a href={c.joinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:brightness-110">
                    <Video size={17} /> Unirme a la llamada <ExternalLink size={14} />
                  </a>
                  {(c.meetingId || c.passcode) && (
                    <div className="flex flex-wrap gap-2">
                      {c.meetingId && <Copyable label="ID" value={c.meetingId} />}
                      {c.passcode && <Copyable label="Código" value={c.passcode} />}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                  <Lock size={15} /> El enlace se habilita 30 minutos antes ({fmtTime(c.unlockAt)}).
                </div>
              )}
              <button onClick={() => ics(c)} className="flex items-center gap-1.5 text-xs font-medium text-sky-600 hover:underline"><CalendarPlus size={14} /> Añadir a mi calendario</button>
            </div>
          )}

          {past && c.recordingUrl && (
            <a href={c.recordingUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-100">
              <PlayCircle size={17} /> Ver grabación
            </a>
          )}
        </div>
      </div>
    </article>
  )
}

export default function LlamadasPage() {
  const [up, setUp] = useState<Call[]>([])
  const [past, setPast] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState('')
  const [now, setNow] = useState(Date.now())

  const load = useCallback(async () => {
    try {
      const r = await fetch('/api/student/calls', { cache: 'no-store' })
      const d = await r.json()
      if (!r.ok) throw new Error(d.error)
      setUp(d.upcoming)
      setPast(d.past)
      setErr('')
    } catch (e: any) {
      setErr(e.message || 'No se pudieron cargar las llamadas')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const a = setInterval(() => !document.hidden && load(), 30000)
    const b = setInterval(() => setNow(Date.now()), 30000)
    return () => { clearInterval(a); clearInterval(b) }
  }, [load])

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><Video className="text-sky-600" size={26} /> Llamadas en vivo</h1>
        <p className="text-sm text-slate-500">Encuentros por Zoom con el equipo. El enlace aparece aquí 30 minutos antes de empezar.</p>
      </header>

      {err && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{err}</p>}
      {loading && <p className="py-10 text-center text-sm text-slate-400">Cargando…</p>}

      {!loading && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Próximas</h2>
          {up.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/50 p-10 text-center">
              <Video className="mx-auto mb-2 text-sky-300" size={34} />
              <p className="font-semibold text-slate-700">No hay llamadas programadas</p>
              <p className="text-sm text-slate-400">Cuando el equipo agende una, la verás aquí.</p>
            </div>
          ) : up.map((c) => <Card key={c.id} c={c} now={now} />)}
        </section>
      )}

      {!loading && past.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">Anteriores</h2>
          {past.map((c) => <Card key={c.id} c={c} now={now} />)}
        </section>
      )}
    </div>
  )
}