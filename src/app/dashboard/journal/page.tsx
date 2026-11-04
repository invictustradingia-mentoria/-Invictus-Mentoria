'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  LineChart, Plus, Trash2, Image as ImageIcon, TrendingUp, TrendingDown, Minus,
  Smile, Frown, Meh, MessageSquare, Loader2, Target, Percent, DollarSign, Flame,
  Wallet, Activity, Trophy,
} from 'lucide-react'

type AccountStatus = 'ACTIVE' | 'PASSED' | 'FAILED' | 'FUNDED'
type DayTag = 'GOOD' | 'BAD' | 'NEUTRAL'

interface SeriesPoint {
  date: string
  resultMoney: number | null
}

interface Account {
  id: string
  name: string
  propFirm: string | null
  accountSize: number | null
  status: AccountStatus
  totalEntries: number
  totalResultMoney: number
  winRate: number
  series: SeriesPoint[]
  createdAt: string
}

interface Comment {
  id: string
  authorName: string | null
  authorRole: string | null
  content: string
  createdAt: string
}

interface Entry {
  id: string
  accountId: string
  date: string
  pair: string | null
  resultMoney: number | null
  resultPercent: number | null
  resultRR: number | null
  dayTag: DayTag
  note: string | null
  screenshotUrl: string | null
  comments: Comment[]
}

const BUCKET = 'journal'
const MAX_MB = 8
const ALLOWED_EXT = ['png', 'jpg', 'jpeg', 'webp']

const STATUS_LABEL: Record<AccountStatus, { label: string; cls: string }> = {
  ACTIVE: { label: 'Activa', cls: 'bg-sky-500/15 text-sky-600 border-sky-400/30' },
  PASSED: { label: 'Aprobada', cls: 'bg-emerald-500/15 text-emerald-600 border-emerald-400/30' },
  FAILED: { label: 'Fallida', cls: 'bg-rose-500/15 text-rose-600 border-rose-400/30' },
  FUNDED: { label: 'Fondeada', cls: 'bg-indigo-500/15 text-indigo-600 border-indigo-400/30' },
}

const DAY_TAG_LABEL: Record<DayTag, { label: string; cls: string; active: string; icon: any }> = {
  GOOD: { label: 'Buen día', cls: 'border-emerald-200 text-emerald-600', active: 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30', icon: Smile },
  BAD: { label: 'Mal día', cls: 'border-rose-200 text-rose-600', active: 'bg-rose-500 border-rose-500 text-white shadow-md shadow-rose-500/30', icon: Frown },
  NEUTRAL: { label: 'Neutral', cls: 'border-gray-200 text-gray-500', active: 'bg-gray-600 border-gray-600 text-white shadow-md shadow-gray-500/30', icon: Meh },
}

const inputCls = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs font-medium focus:border-[#0284c7] focus:bg-white focus:outline-none transition-colors'
const labelCls = 'mb-1.5 block text-[10px] font-black uppercase tracking-wider text-gray-400'

function fmtMoney(n: number) {
  const s = Math.abs(n).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return n >= 0 ? `+$${s}` : `-$${s}`
}

function moneyColor(n: number) {
  return n > 0 ? 'text-emerald-600' : n < 0 ? 'text-rose-600' : 'text-gray-500'
}

async function safeJson(res: Response): Promise<any> {
  const text = await res.text()
  if (!text) return {}
  try { return JSON.parse(text) } catch { return { error: `Respuesta no válida (HTTP ${res.status})` } }
}

// Mini curva de rendimiento acumulado, dibujada como SVG liviano (sin librerías).
function EquityCurve({ series, height = 56 }: { series: SeriesPoint[]; height?: number }) {
  if (series.length === 0) {
    return <div className="flex h-full items-center justify-center text-[10px] font-bold text-gray-300">Sin datos todavía</div>
  }
  let running = 0
  const points = series.map((s) => { running += s.resultMoney || 0; return running })
  const allPoints = [0, ...points]
  const w = 100
  const max = Math.max(...allPoints)
  const min = Math.min(...allPoints)
  const range = max - min || 1
  const step = allPoints.length > 1 ? w / (allPoints.length - 1) : 0
  const coords = allPoints.map((v, i) => [i * step, height - ((v - min) / range) * height] as const)
  const path = coords.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`).join(' ')
  const last = allPoints[allPoints.length - 1]
  const positive = last >= 0
  const areaPath = `${path} L ${w} ${height} L 0 ${height} Z`
  const color = positive ? '#059669' : '#e11d48'
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`grad-${positive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#grad-${positive ? 'up' : 'down'})`} stroke="none" />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Kpi({ icon: Icon, label: lbl, value, valueCls }: { icon: any; label: string; value: string; valueCls?: string }) {
  return (
    <div className="rounded-2xl border border-[#ededf0] bg-white p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-gray-400">
        <Icon size={12} /> {lbl}
      </div>
      <p className={`mt-1.5 text-xl font-black ${valueCls || 'text-[#1d1d1f]'}`}>{value}</p>
    </div>
  )
}

export default function JournalPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [accounts, setAccounts] = useState<Account[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null)

  const [showNewAccount, setShowNewAccount] = useState(false)
  const [accName, setAccName] = useState('')
  const [accPropFirm, setAccPropFirm] = useState('')
  const [accSize, setAccSize] = useState('')
  const [accBusy, setAccBusy] = useState(false)

  const [eDate, setEDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [ePair, setEPair] = useState('')
  const [eMoney, setEMoney] = useState('')
  const [ePercent, setEPercent] = useState('')
  const [eRR, setERR] = useState('')
  const [eDayTag, setEDayTag] = useState<DayTag>('NEUTRAL')
  const [eNote, setENote] = useState('')
  const [eFile, setEFile] = useState<File | null>(null)
  const [eBusy, setEBusy] = useState(false)
  const [eStatus, setEStatus] = useState('')

  const notify = (t: string, ok: boolean) => { setMsg({ t, ok }); setTimeout(() => setMsg(null), 6000) }

  const loadAccounts = useCallback(async () => {
    const r = await fetch('/api/student/journal/accounts', { cache: 'no-store' })
    const d = await safeJson(r)
    if (r.ok) {
      setAccounts(d.items || [])
      setSelectedId((prev) => prev || (d.items?.[0]?.id ?? null))
    }
  }, [])

  useEffect(() => { loadAccounts() }, [loadAccounts])

  const loadEntries = useCallback(async (accountId: string) => {
    setLoadingEntries(true)
    try {
      const r = await fetch(`/api/student/journal/entries?accountId=${accountId}`, { cache: 'no-store' })
      const d = await safeJson(r)
      if (r.ok) setEntries(d.items || [])
    } finally {
      setLoadingEntries(false)
    }
  }, [])

  useEffect(() => {
    if (selectedId) loadEntries(selectedId)
    else setEntries([])
  }, [selectedId, loadEntries])

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!accName.trim()) return notify('Poné un nombre a la cuenta', false)
    setAccBusy(true)
    try {
      const res = await fetch('/api/student/journal/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accName.trim(),
          propFirm: accPropFirm.trim() || undefined,
          accountSize: accSize ? Number(accSize) : undefined,
        }),
      })
      const data = await safeJson(res)
      if (res.ok && data.item) {
        notify('Cuenta creada', true)
        setAccName(''); setAccPropFirm(''); setAccSize(''); setShowNewAccount(false)
        await loadAccounts()
        setSelectedId(data.item.id)
      } else {
        notify(data.error || `No se pudo crear la cuenta (HTTP ${res.status})`, false)
      }
    } catch {
      notify('Error de conexión', false)
    } finally {
      setAccBusy(false)
    }
  }

  const deleteAccount = async (id: string) => {
    if (!confirm('¿Eliminar esta cuenta y todas sus operaciones? Esta acción no se puede deshacer.')) return
    const res = await fetch(`/api/student/journal/accounts?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      notify('Cuenta eliminada', true)
      if (selectedId === id) setSelectedId(null)
      loadAccounts()
    } else {
      notify('No se pudo eliminar la cuenta', false)
    }
  }

  const onPickFile = (f: File | null) => {
    if (!f) return setEFile(null)
    const ext = f.name.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED_EXT.includes(ext)) {
      notify(`Formato .${ext} no admitido. Usá PNG, JPG o WEBP.`, false)
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      notify(`La imagen pesa ${(f.size / 1024 / 1024).toFixed(0)} MB y el máximo es ${MAX_MB} MB.`, false)
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setEFile(f)
  }

  const uploadScreenshot = async (f: File): Promise<string | null> => {
    setEStatus('Preparando la subida...')
    const signRes = await fetch('/api/student/journal/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: f.name, fileSize: f.size }),
    })
    const sign = await safeJson(signRes)
    if (!signRes.ok || !sign.token || !sign.path) {
      notify(sign.error || `El servidor rechazó la subida (HTTP ${signRes.status})`, false)
      return null
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !anon) {
      notify('Falta configurar Supabase en el navegador (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).', false)
      return null
    }

    setEStatus('Subiendo captura...')
    try {
      const supabase = createClient(supabaseUrl, anon)
      const { error } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(sign.path, sign.token, f, { contentType: f.type || 'image/png' })
      if (error) {
        notify(error.message || 'No se pudo subir la captura', false)
        return null
      }
    } catch (err: any) {
      notify(err?.message || 'No se pudo subir la captura', false)
      return null
    }
    return sign.url as string
  }

  const createEntry = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return notify('Creá primero una cuenta', false)
    setEBusy(true)
    setEStatus('')
    try {
      let screenshotUrl: string | undefined
      if (eFile) {
        const url = await uploadScreenshot(eFile)
        if (!url) { setEBusy(false); setEStatus(''); return }
        screenshotUrl = url
      }

      const res = await fetch('/api/student/journal/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: selectedId,
          date: eDate,
          pair: ePair.trim() || undefined,
          resultMoney: eMoney !== '' ? Number(eMoney) : undefined,
          resultPercent: ePercent !== '' ? Number(ePercent) : undefined,
          resultRR: eRR !== '' ? Number(eRR) : undefined,
          dayTag: eDayTag,
          note: eNote.trim() || undefined,
          screenshotUrl,
        }),
      })
      const data = await safeJson(res)
      if (res.ok && data.item) {
        notify('Operación guardada', true)
        setEPair(''); setEMoney(''); setEPercent(''); setERR(''); setENote(''); setEFile(null); setEDayTag('NEUTRAL')
        setEDate(new Date().toISOString().slice(0, 10))
        if (fileRef.current) fileRef.current.value = ''
        loadEntries(selectedId)
        loadAccounts()
      } else {
        notify(data.error || `No se pudo guardar la operación (HTTP ${res.status})`, false)
      }
    } catch {
      notify('Error de conexión', false)
    } finally {
      setEBusy(false)
      setEStatus('')
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('¿Eliminar esta operación?')) return
    const res = await fetch(`/api/student/journal/entries?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      notify('Operación eliminada', true)
      if (selectedId) loadEntries(selectedId)
      loadAccounts()
    } else {
      notify('No se pudo eliminar la operación', false)
    }
  }

  const selected = accounts.find((a) => a.id === selectedId) || null

  const globalPnl = accounts.reduce((sum, a) => sum + a.totalResultMoney, 0)
  const globalTrades = accounts.reduce((sum, a) => sum + a.totalEntries, 0)
  const globalWins = Math.round(accounts.reduce((sum, a) => sum + (a.winRate / 100) * a.totalEntries, 0))
  const globalWinRate = globalTrades > 0 ? Math.round((globalWins / globalTrades) * 100) : 0
  const bestEntry = entries.reduce<Entry | null>((best, e) => (e.resultMoney !== null && (!best || (e.resultMoney > (best.resultMoney ?? -Infinity))) ? e : best), null)

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      <div>
        <span className="text-[11px] font-bold text-[#0284c7] tracking-wider uppercase block">Seguimiento personal</span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2.5 mt-0.5">
          <LineChart size={22} className="text-[#0284c7]" /> Mi Trading Journal
        </h1>
        <p className="text-[#86868b] text-[13px] mt-1">
          Registrá el rendimiento de tus evals y cuentas: cuánto llevás, tus días buenos y malos, y tus capturas. Tu mentor puede ver tu progreso y dejarte comentarios para ayudarte.
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${msg.ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
          {msg.t}
        </div>
      )}

      {/* KPIs globales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi icon={Wallet} label="Resultado global" value={fmtMoney(globalPnl)} valueCls={moneyColor(globalPnl)} />
        <Kpi icon={Activity} label="Operaciones" value={String(globalTrades)} />
        <Kpi icon={Trophy} label="% ganadas" value={`${globalWinRate}%`} />
        <Kpi icon={Flame} label="Cuentas activas" value={String(accounts.filter((a) => a.status === 'ACTIVE').length)} />
      </div>

      {/* Cuentas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#1d1d1f]">Mis cuentas / evals</h3>
          <button type="button" onClick={() => setShowNewAccount((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl bg-[#1d1d1f] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#0284c7] transition-all cursor-pointer">
            <Plus size={14} /> Nueva cuenta
          </button>
        </div>

        {showNewAccount && (
          <form onSubmit={createAccount} className="bg-white rounded-3xl p-5 border border-[#ededf0] shadow-sm space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className={labelCls}>Nombre de la cuenta</label>
                <input className={inputCls} value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="Ej. Eval 1 - FTMO 100k" required />
              </div>
              <div>
                <label className={labelCls}>Prop firm (opcional)</label>
                <input className={inputCls} value={accPropFirm} onChange={(e) => setAccPropFirm(e.target.value)} placeholder="Ej. FTMO" />
              </div>
              <div>
                <label className={labelCls}>Tamaño de cuenta (opcional)</label>
                <input className={inputCls} type="number" value={accSize} onChange={(e) => setAccSize(e.target.value)} placeholder="100000" />
              </div>
            </div>
            <button type="submit" disabled={accBusy}
              className="w-full py-2.5 rounded-2xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#0284c7] disabled:opacity-50 transition-all cursor-pointer">
              {accBusy ? 'Creando...' : 'Crear cuenta'}
            </button>
          </form>
        )}

        {accounts.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-200 text-xs text-gray-400">
            Todavía no creaste ninguna cuenta. Creá la primera para empezar a registrar tus operaciones.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accounts.map((a) => {
              const st = STATUS_LABEL[a.status] || STATUS_LABEL.ACTIVE
              const active = a.id === selectedId
              const positive = a.totalResultMoney >= 0
              return (
                <button key={a.id} type="button" onClick={() => setSelectedId(a.id)}
                  className={`relative overflow-hidden text-left rounded-2xl border-2 bg-white transition-all cursor-pointer ${active ? 'border-[#0284c7] ring-2 ring-[#0284c7]/15' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className={`absolute inset-x-0 top-0 h-1 ${positive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <div className="p-4 pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[13px] font-bold text-[#1d1d1f] truncate">{a.name}</p>
                      <span className={`shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                    </div>
                    {a.propFirm && <p className="text-[11px] text-gray-400 mt-0.5">{a.propFirm}{a.accountSize ? ` · $${a.accountSize.toLocaleString('es-AR')}` : ''}</p>}
                    <div className="flex items-end justify-between mt-2.5">
                      <p className={`text-lg font-black ${moneyColor(a.totalResultMoney)}`}>{fmtMoney(a.totalResultMoney)}</p>
                      <p className="text-[10px] font-bold text-gray-400">{a.totalEntries} op. · {a.winRate}% ganadas</p>
                    </div>
                  </div>
                  <div className="h-10 px-1">
                    <EquityCurve series={a.series} height={40} />
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selected && (
        <>
          {/* Resumen de la cuenta seleccionada con curva de rendimiento */}
          <div className="bg-[#0b1220] rounded-3xl p-6 shadow-sm overflow-hidden relative">
            <div className="flex flex-wrap items-start justify-between gap-6 relative z-10">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-sky-300/70">Viendo ahora</p>
                <p className="text-lg font-black text-white mt-0.5">{selected.name}</p>
                {selected.propFirm && <p className="text-[11px] text-slate-400">{selected.propFirm}{selected.accountSize ? ` · $${selected.accountSize.toLocaleString('es-AR')}` : ''}</p>}
              </div>
              <div className="flex items-center gap-7">
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Resultado</p>
                  <p className={`text-xl font-black ${selected.totalResultMoney >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{fmtMoney(selected.totalResultMoney)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">Operaciones</p>
                  <p className="text-xl font-black text-white">{selected.totalEntries}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400">% ganadas</p>
                  <p className="text-xl font-black text-white">{selected.winRate}%</p>
                </div>
                <button type="button" onClick={() => deleteAccount(selected.id)} title="Eliminar esta cuenta"
                  className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <div className="mt-5 h-24">
              <EquityCurve series={selected.series} height={96} />
            </div>
          </div>

          {/* Nueva operación */}
          <form onSubmit={createEntry} className="bg-white rounded-3xl p-5 border border-[#ededf0] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#1d1d1f]">Registrar operación / día</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className={labelCls}>Fecha</label>
                <input className={inputCls} type="date" value={eDate} onChange={(e) => setEDate(e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Par / instrumento</label>
                <input className={inputCls} value={ePair} onChange={(e) => setEPair(e.target.value)} placeholder="Ej. EURUSD" />
              </div>
              <div>
                <label className={`${labelCls} flex items-center gap-1`}><DollarSign size={10} /> Resultado ($)</label>
                <input className={inputCls} type="number" step="0.01" value={eMoney} onChange={(e) => setEMoney(e.target.value)} placeholder="150" />
              </div>
              <div>
                <label className={`${labelCls} flex items-center gap-1`}><Percent size={10} /> Resultado (%)</label>
                <input className={inputCls} type="number" step="0.01" value={ePercent} onChange={(e) => setEPercent(e.target.value)} placeholder="1.5" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className={`${labelCls} flex items-center gap-1`}><Target size={10} /> R:R</label>
                <input className={inputCls} type="number" step="0.01" value={eRR} onChange={(e) => setERR(e.target.value)} placeholder="2" />
              </div>
              <div className="sm:col-span-3">
                <label className={labelCls}>¿Cómo fue el día?</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(DAY_TAG_LABEL) as DayTag[]).map((k) => {
                    const d = DAY_TAG_LABEL[k]
                    const Icon = d.icon
                    const active = eDayTag === k
                    return (
                      <button key={k} type="button" onClick={() => setEDayTag(k)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 text-[11px] font-bold transition-all cursor-pointer ${active ? d.active : `bg-white ${d.cls}`}`}>
                        <Icon size={14} /> {d.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div>
              <label className={labelCls}>Nota (qué pasó, qué aprendiste, cómo te sentiste)</label>
              <textarea className={inputCls} rows={3} value={eNote} onChange={(e) => setENote(e.target.value)} placeholder="Escribe tu reflexión del día..." />
            </div>
            <div>
              <label className={labelCls}>Captura del trade (opcional)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center bg-gray-50/50">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1d1d1f] file:text-white hover:file:bg-[#0284c7] cursor-pointer"
                />
                <p className="text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1"><ImageIcon size={12} /> PNG, JPG o WEBP. Máximo {MAX_MB} MB.</p>
              </div>
            </div>
            {eStatus && <p className="text-[11px] text-gray-500">{eStatus}</p>}
            <button type="submit" disabled={eBusy}
              className="w-full py-3 rounded-2xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#0284c7] disabled:opacity-50 transition-all shadow-sm cursor-pointer">
              {eBusy ? 'Guardando...' : 'Guardar operación'}
            </button>
          </form>

          {/* Historial */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1d1d1f]">Historial de operaciones</h3>
              {bestEntry && bestEntry.resultMoney !== null && bestEntry.resultMoney > 0 && (
                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <Trophy size={11} /> Mejor: {fmtMoney(bestEntry.resultMoney)}
                </span>
              )}
            </div>
            {loadingEntries ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 text-xs text-gray-400 flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Cargando...
              </div>
            ) : entries.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-200 text-xs text-gray-400">
                Todavía no registraste ninguna operación en esta cuenta.
              </div>
            ) : (
              entries.map((en) => {
                const d = DAY_TAG_LABEL[en.dayTag] || DAY_TAG_LABEL.NEUTRAL
                const DIcon = d.icon
                const money = en.resultMoney ?? 0
                const MoneyIcon = money > 0 ? TrendingUp : money < 0 ? TrendingDown : Minus
                const barColor = money > 0 ? 'bg-emerald-500' : money < 0 ? 'bg-rose-500' : 'bg-gray-300'
                return (
                  <div key={en.id} className="relative overflow-hidden bg-white rounded-2xl border border-[#ededf0] shadow-sm">
                    <div className={`absolute inset-y-0 left-0 w-1.5 ${barColor}`} />
                    <div className="p-4 pl-5 space-y-3">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-gray-500">{new Date(en.date).toLocaleDateString('es-AR')}</span>
                          {en.pair && <span className="text-[11px] font-bold text-[#0284c7] bg-[#f0f9ff] px-2 py-0.5 rounded-full border border-[#bae6fd]">{en.pair}</span>}
                          <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${d.cls} bg-white`}><DIcon size={11} /> {d.label}</span>
                        </div>
                        <button type="button" onClick={() => deleteEntry(en.id)} className="p-1.5 rounded-lg text-gray-300 hover:bg-rose-50 hover:text-rose-500 transition-all cursor-pointer" title="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-5 flex-wrap">
                        {en.resultMoney !== null && (
                          <span className={`flex items-center gap-1 text-base font-black ${moneyColor(en.resultMoney)}`}>
                            <MoneyIcon size={15} /> {fmtMoney(en.resultMoney)}
                          </span>
                        )}
                        {en.resultPercent !== null && <span className="text-[12px] font-bold text-gray-500">{en.resultPercent > 0 ? '+' : ''}{en.resultPercent}%</span>}
                        {en.resultRR !== null && <span className="text-[12px] font-bold text-gray-500 flex items-center gap-1"><Target size={11} /> {en.resultRR} R</span>}
                      </div>

                      {en.note && <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-wrap">{en.note}</p>}

                      {en.screenshotUrl && (
                        <a href={en.screenshotUrl} target="_blank" rel="noreferrer" className="block w-fit">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={en.screenshotUrl} alt="Captura del trade" className="max-h-48 rounded-xl border border-gray-200 object-cover" />
                        </a>
                      )}

                      {en.comments.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-gray-100">
                          {en.comments.map((c) => (
                            <div key={c.id} className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3">
                              <div className="flex items-center gap-1.5 text-[10px] font-black text-[#0284c7]">
                                <MessageSquare size={11} /> {c.authorName || 'Mentor'} · {new Date(c.createdAt).toLocaleDateString('es-AR')}
                              </div>
                              <p className="text-[12px] text-[#1d1d1f] mt-1">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </>
      )}
    </div>
  )
}
