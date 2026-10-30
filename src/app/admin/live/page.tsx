'use client'

import { useEffect, useMemo, useState } from 'react'
import { Radio, Globe2, Monitor, Smartphone, Tablet, Activity, ShieldAlert, Users, AlertCircle, MapPin, PlayCircle, LogIn, CheckCircle2, Eye } from 'lucide-react'
import WorldMap from '@/components/admin/WorldMap'

interface Sess {
  id: string; online: boolean; lastSeen: string; page: string | null; lesson: string | null
  browser: string; os: string; device: string
  country: string | null; countryCode: string | null; city: string | null; lat: number | null; lon: number | null
  user: { id: string; name: string | null; email: string; role: string; avatarUrl: string | null }
}
interface Ev { id: string; action: string; page: string | null; createdAt: string; user: { name: string | null; email: string; role: string }; lesson: string | null }
interface Sec { id: string; action: string; email: string | null; details: string | null; ip: string | null; createdAt: string }
interface Count { name: string; value: number }
interface Data {
  stats: { onlineUsers: number; uniqueUsers24: number; events: number; alerts: number }
  sessions: Sess[]; events: Ev[]; security: Sec[]
  browsers: Count[]; systems: Count[]; devices: Count[]; countries: Count[]
}

const pageLabel = (p: string | null) => {
  if (!p) return 'Sin datos'
  if (p.startsWith('/dashboard/clases')) return 'Clases'
  if (p.startsWith('/dashboard/perfil')) return 'Su perfil'
  if (p.startsWith('/dashboard')) return 'Panel del alumno'
  if (p.startsWith('/admin')) return 'Administración'
  return p
}

const ACTIONS: Record<string, { label: string; icon: any; color: string }> = {
  LOGIN: { label: 'Inició sesión', icon: LogIn, color: 'bg-violet-100 text-violet-700' },
  PAGE_VIEW: { label: 'Visitó', icon: Eye, color: 'bg-sky-100 text-sky-700' },
  LESSON_VIEW: { label: 'Abrió clase', icon: PlayCircle, color: 'bg-amber-100 text-amber-700' },
  LESSON_COMPLETE: { label: 'Completó clase', icon: CheckCircle2, color: 'bg-emerald-100 text-emerald-700' },
}

const ago = (iso: string) => {
  const s = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000))
  if (s < 60) return `hace ${s}s`
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`
  return `hace ${Math.floor(s / 86400)} d`
}

const flag = (cc: string | null) =>
  cc && cc.length === 2 ? String.fromCodePoint(...cc.toUpperCase().split('').map((c) => 127397 + c.charCodeAt(0))) : '🌐'

const DeviceIcon = ({ d }: { d: string }) => (d === 'Celular' ? <Smartphone size={14} /> : d === 'Tablet' ? <Tablet size={14} /> : <Monitor size={14} />)

function Bars({ title, items, color }: { title: string; items: Count[]; color: string }) {
  const max = Math.max(1, ...items.map((i) => i.value))
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-xs font-black uppercase tracking-wide text-gray-500">{title}</h3>
      {items.length === 0 ? <p className="text-xs text-gray-400">Sin datos aún</p> : (
        <div className="space-y-2">
          {items.slice(0, 6).map((i) => (
            <div key={i.name}>
              <div className="flex justify-between text-[11px] font-bold text-gray-700"><span className="truncate">{i.name}</span><span>{i.value}</span></div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-100"><div className={`h-full rounded-full ${color}`} style={{ width: `${(i.value / max) * 100}%` }} /></div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function LivePage() {
  const [data, setData] = useState<Data | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState<'live' | 'alerts'>('live')
  const [, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    const load = async () => {
      try {
        const r = await fetch('/api/admin/live-data', { cache: 'no-store' })
        const d = await r.json()
        if (!alive) return
        if (!r.ok) setError(d.error || `HTTP ${r.status}`)
        else { setData(d); setError(null) }
      } catch { if (alive) setError('No se pudo conectar con el servidor') }
    }
    load()
    const t = setInterval(load, 5000)
    const c = setInterval(() => setTick((x) => x + 1), 15000)
    return () => { alive = false; clearInterval(t); clearInterval(c) }
  }, [])

  const online = useMemo(() => data?.sessions.filter((s) => s.online) ?? [], [data])
  const points = useMemo(
    () => (data?.sessions ?? []).filter((s) => s.lat != null && s.lon != null).map((s) => ({
      lat: s.lat as number, lon: s.lon as number, online: s.online,
      label: `${s.user.name || s.user.email} · ${s.city ? s.city + ', ' : ''}${s.country ?? ''}`,
    })),
    [data]
  )

  const name = (u: { name: string | null; email: string }) => u.name || u.email

  return (
    <div className="mx-auto max-w-7xl space-y-5 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#0284c7]"><Radio size={13} /> Telemetría en directo</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-[#1d1d1f]">Live Activity Monitor</h1>
          <p className="mt-1 text-xs text-gray-500">Quién está conectado, desde dónde y qué está haciendo.</p>
        </div>
        <span className="flex items-center gap-2 rounded-full border border-[#0284c7]/30 bg-[#f0f9ff] px-3 py-1.5 text-[11px] font-bold text-[#0284c7]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#0284c7]" /> En vivo · se actualiza cada 5 s
        </span>
      </div>

      {error && <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700"><AlertCircle size={16} /> {error}</div>}

      <div className="inline-flex rounded-2xl bg-gray-100 p-1">
        <button type="button" onClick={() => setTab('live')} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer ${tab === 'live' ? 'bg-white text-[#0284c7] shadow-sm' : 'text-gray-500'}`}><Activity size={14} /> Actividad en vivo</button>
        <button type="button" onClick={() => setTab('alerts')} className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold cursor-pointer ${tab === 'alerts' ? 'bg-white text-[#0284c7] shadow-sm' : 'text-gray-500'}`}>
          <ShieldAlert size={14} /> Alertas {data && data.security.length > 0 && <span className="rounded-full bg-rose-500 px-1.5 text-[10px] text-white">{data.security.length}</span>}
        </button>
      </div>

      {!data ? (
        <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-xs text-gray-400">Cargando telemetría...</div>
      ) : tab === 'alerts' ? (
        <div className="space-y-2">
          {data.security.length === 0 ? <div className="rounded-3xl border border-gray-100 bg-white p-10 text-center text-xs text-gray-400">No hay alertas de seguridad.</div> :
            data.security.map((a) => (
              <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 text-xs shadow-sm">
                <ShieldAlert size={18} className="shrink-0 text-rose-500" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[#1d1d1f]">{a.action}{a.email ? ` · ${a.email}` : ''}</p>
                  {a.details && <p className="break-words text-gray-500">{a.details}</p>}
                </div>
                <div className="text-right text-[11px] text-gray-400"><p>{ago(a.createdAt)}</p>{a.ip && <p className="font-mono">{a.ip}</p>}</div>
              </div>
            ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              { l: 'Conectados ahora', v: data.stats.onlineUsers, i: Users, c: 'bg-emerald-50 text-emerald-600' },
              { l: 'Usuarios 24 h', v: data.stats.uniqueUsers24, i: Globe2, c: 'bg-sky-50 text-sky-600' },
              { l: 'Países', v: data.countries.filter((c) => c.name !== 'Desconocido').length, i: MapPin, c: 'bg-amber-50 text-amber-600' },
              { l: 'Alertas', v: data.stats.alerts, i: ShieldAlert, c: 'bg-rose-50 text-rose-600' },
            ].map((s) => (
              <div key={s.l} className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3.5 shadow-sm">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${s.c}`}><s.i size={19} /></span>
                <div><p className="text-xl font-black leading-none">{s.v}</p><p className="mt-1 text-[11px] font-bold text-gray-500">{s.l}</p></div>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm lg:col-span-2">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-sm font-black"><Globe2 size={16} className="text-[#0284c7]" /> Mapa de conexiones</h2>
                <div className="flex gap-3 text-[11px] font-bold text-gray-500">
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Ahora</span>
                  <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-sky-500" /> Últimas 24 h</span>
                </div>
              </div>
              <WorldMap points={points} />
              {points.length === 0 && <p className="mt-1 text-center text-[11px] text-gray-400">Aún no hay conexiones con ubicación. Aparecerán cuando un alumno navegue.</p>}
            </div>
            <div className="space-y-4">
              <Bars title="Países" items={data.countries} color="bg-[#0284c7]" />
              <Bars title="Navegadores" items={data.browsers} color="bg-sky-500" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Bars title="Sistemas operativos" items={data.systems} color="bg-violet-500" />
            <Bars title="Dispositivos" items={data.devices} color="bg-emerald-500" />
          </div>

          <div className="grid gap-4 xl:grid-cols-5">
            <div className="space-y-3 xl:col-span-3">
              <h2 className="flex items-center gap-2 text-sm font-black"><Users size={16} className="text-[#0284c7]" /> Alumnos conectados ({online.length})</h2>
              {online.length === 0 ? (
                <div className="rounded-3xl border border-gray-100 bg-white p-8 text-center text-xs text-gray-400">No hay alumnos activos ahora.</div>
              ) : online.map((s) => (
                <div key={s.id} className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-cyan-400 text-xs font-black text-white">
                      {(name(s.user)[0] || '?').toUpperCase()}
                      <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-[#1d1d1f]">{name(s.user)} <span className="ml-1 rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-black text-gray-500">{s.user.role}</span></p>
                      <p className="flex items-center gap-1 text-[11px] text-gray-500"><span>{flag(s.countryCode)}</span> {s.city ? `${s.city}, ` : ''}{s.country ?? 'Ubicación desconocida'}</p>
                    </div>
                    <span className="shrink-0 text-[10px] text-gray-400">{ago(s.lastSeen)}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-bold">
                    <span className="flex items-center gap-1 rounded-lg bg-gray-100 px-2 py-1 text-gray-600"><DeviceIcon d={s.device} /> {s.device}</span>
                    <span className="rounded-lg bg-sky-50 px-2 py-1 text-sky-700">{s.browser}</span>
                    <span className="rounded-lg bg-violet-50 px-2 py-1 text-violet-700">{s.os}</span>
                    <span className="rounded-lg bg-[#f0f9ff] px-2 py-1 text-[#0284c7]">{pageLabel(s.page)}</span>
                    {s.lesson && <span className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-amber-700"><PlayCircle size={12} /> {s.lesson}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="xl:col-span-2">
              <h2 className="mb-3 flex items-center gap-2 text-sm font-black"><Activity size={16} className="text-[#0284c7]" /> Feed de eventos</h2>
              <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
                {data.events.length === 0 ? <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center text-xs text-gray-400">Sin eventos todavía.</div> :
                  data.events.map((e) => {
                    const a = ACTIONS[e.action] ?? { label: e.action, icon: Activity, color: 'bg-gray-100 text-gray-600' }
                    const Icon = a.icon
                    return (
                      <div key={e.id} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-bold text-[#1d1d1f]">{name(e.user)}</p>
                          <span className="shrink-0 text-[10px] text-gray-400">{ago(e.createdAt)}</span>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-bold ${a.color}`}><Icon size={11} /> {a.label}</span>
                          {e.lesson ? <span className="truncate text-gray-600">{e.lesson}</span> : e.page ? <span className="truncate text-gray-500">{pageLabel(e.page)}</span> : null}
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}