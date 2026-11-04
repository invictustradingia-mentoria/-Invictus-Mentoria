'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  LineChart, ArrowLeft, Search, TrendingUp, TrendingDown, Minus, Smile, Frown, Meh,
  MessageSquare, Send, Trash2, Loader2, Target, Trophy, Wallet, Activity, Users2,
} from 'lucide-react'

type DayTag = 'GOOD' | 'BAD' | 'NEUTRAL'
type AccountStatus = 'ACTIVE' | 'PASSED' | 'FAILED' | 'FUNDED'

interface SeriesPoint {
  date: string
  resultMoney: number | null
}

interface StudentRow {
  id: string
  name: string | null
  email: string
  role: string
  totalAccounts: number
  totalEntries: number
  totalResultMoney: number
  winRate: number
  series: SeriesPoint[]
  lastEntryAt: string | null
}

interface Comment {
  id: string
  authorId: string
  authorName: string | null
  authorRole: string | null
  content: string
  createdAt: string
}

interface Entry {
  id: string
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

interface Account {
  id: string
  name: string
  propFirm: string | null
  accountSize: number | null
  status: AccountStatus
  entries: Entry[]
}

interface StudentDetail {
  student: { id: string; name: string | null; email: string; role: string }
  accounts: Account[]
}

const STATUS_LABEL: Record<AccountStatus, { label: string; cls: string }> = {
  ACTIVE: { label: 'Activa', cls: 'bg-sky-500/15 text-sky-600 border-sky-400/30' },
  PASSED: { label: 'Aprobada', cls: 'bg-emerald-500/15 text-emerald-600 border-emerald-400/30' },
  FAILED: { label: 'Fallida', cls: 'bg-rose-500/15 text-rose-600 border-rose-400/30' },
  FUNDED: { label: 'Fondeada', cls: 'bg-indigo-500/15 text-indigo-600 border-indigo-400/30' },
}

const DAY_TAG_LABEL: Record<DayTag, { label: string; cls: string; icon: any }> = {
  GOOD: { label: 'Buen día', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Smile },
  BAD: { label: 'Mal día', cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: Frown },
  NEUTRAL: { label: 'Neutral', cls: 'bg-gray-100 text-gray-600 border-gray-200', icon: Meh },
}

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

function EquityCurve({ series, height = 40 }: { series: SeriesPoint[]; height?: number }) {
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
        <linearGradient id={`agrad-${positive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#agrad-${positive ? 'up' : 'down'})`} stroke="none" />
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

function EntryCard({ entry, onComment, onDeleteComment, busyId }: {
  entry: Entry
  onComment: (entryId: string, content: string) => Promise<void>
  onDeleteComment: (id: string) => void
  busyId: string | null
}) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const d = DAY_TAG_LABEL[entry.dayTag] || DAY_TAG_LABEL.NEUTRAL
  const DIcon = d.icon
  const money = entry.resultMoney ?? 0
  const MoneyIcon = money > 0 ? TrendingUp : money < 0 ? TrendingDown : Minus
  const barColor = money > 0 ? 'bg-emerald-500' : money < 0 ? 'bg-rose-500' : 'bg-gray-300'

  const send = async () => {
    if (!draft.trim()) return
    setSending(true)
    await onComment(entry.id, draft.trim())
    setDraft('')
    setSending(false)
  }

  return (
    <div className="relative overflow-hidden bg-white rounded-2xl border border-[#ededf0] shadow-sm">
      <div className={`absolute inset-y-0 left-0 w-1.5 ${barColor}`} />
      <div className="p-4 pl-5 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-bold text-gray-500">{new Date(entry.date).toLocaleDateString('es-AR')}</span>
          {entry.pair && <span className="text-[11px] font-bold text-[#0284c7] bg-[#f0f9ff] px-2 py-0.5 rounded-full border border-[#bae6fd]">{entry.pair}</span>}
          <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${d.cls}`}><DIcon size={11} /> {d.label}</span>
        </div>

        <div className="flex items-center gap-5 flex-wrap">
          {entry.resultMoney !== null && (
            <span className={`flex items-center gap-1 text-base font-black ${moneyColor(entry.resultMoney)}`}>
              <MoneyIcon size={15} /> {fmtMoney(entry.resultMoney)}
            </span>
          )}
          {entry.resultPercent !== null && <span className="text-[12px] font-bold text-gray-500">{entry.resultPercent > 0 ? '+' : ''}{entry.resultPercent}%</span>}
          {entry.resultRR !== null && <span className="text-[12px] font-bold text-gray-500 flex items-center gap-1"><Target size={11} /> {entry.resultRR} R</span>}
        </div>

        {entry.note && <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-wrap">{entry.note}</p>}

        {entry.screenshotUrl && (
          <a href={entry.screenshotUrl} target="_blank" rel="noreferrer" className="block w-fit">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={entry.screenshotUrl} alt="Captura del trade" className="max-h-48 rounded-xl border border-gray-200 object-cover" />
          </a>
        )}

        {entry.comments.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            {entry.comments.map((c) => (
              <div key={c.id} className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-[#0284c7]">
                    <MessageSquare size={11} /> {c.authorName || 'Equipo'} · {new Date(c.createdAt).toLocaleDateString('es-AR')}
                  </div>
                  <p className="text-[12px] text-[#1d1d1f] mt-1">{c.content}</p>
                </div>
                <button type="button" onClick={() => onDeleteComment(c.id)} className="p-1 rounded-lg text-rose-400 hover:bg-rose-50 transition-all cursor-pointer shrink-0" title="Eliminar comentario">
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 pt-1">
          <input
            className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-[#0284c7] focus:outline-none"
            placeholder="Escribe un comentario para guiar al alumno..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') send() }}
          />
          <button type="button" onClick={send} disabled={sending || busyId === entry.id}
            className="flex items-center gap-1 rounded-xl bg-[#1d1d1f] px-3 py-2 text-[11px] font-bold text-white hover:bg-[#0284c7] disabled:opacity-50 transition-all cursor-pointer">
            {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AdminJournalPage() {
  const [students, setStudents] = useState<StudentRow[] | null>(null)
  const [q, setQ] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [detail, setDetail] = useState<StudentDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  const notify = (t: string, ok: boolean) => { setMsg({ t, ok }); setTimeout(() => setMsg(null), 6000) }

  const loadStudents = useCallback(async () => {
    const r = await fetch('/api/admin/journal', { cache: 'no-store' })
    const d = await safeJson(r)
    if (r.ok) setStudents(d.items || [])
    else notify(d.error || 'No se pudo cargar el listado', false)
  }, [])

  useEffect(() => { loadStudents() }, [loadStudents])

  const loadDetail = useCallback(async (userId: string) => {
    setLoadingDetail(true)
    try {
      const r = await fetch(`/api/admin/journal?userId=${userId}`, { cache: 'no-store' })
      const d = await safeJson(r)
      if (r.ok) setDetail(d)
      else { notify(d.error || 'No se pudo cargar el journal del alumno', false); setSelectedUserId(null) }
    } finally {
      setLoadingDetail(false)
    }
  }, [])

  useEffect(() => {
    if (selectedUserId) loadDetail(selectedUserId)
    else setDetail(null)
  }, [selectedUserId, loadDetail])

  const addComment = async (entryId: string, content: string) => {
    setBusyId(entryId)
    try {
      const res = await fetch('/api/admin/journal/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, content }),
      })
      const data = await safeJson(res)
      if (res.ok && data.item && selectedUserId) {
        notify('Comentario enviado', true)
        loadDetail(selectedUserId)
      } else {
        notify(data.error || 'No se pudo enviar el comentario', false)
      }
    } catch {
      notify('Error de conexión', false)
    } finally {
      setBusyId(null)
    }
  }

  const deleteComment = async (id: string) => {
    if (!confirm('¿Eliminar este comentario?')) return
    const res = await fetch(`/api/admin/journal/comments?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      notify('Comentario eliminado', true)
      if (selectedUserId) loadDetail(selectedUserId)
    } else {
      notify('No se pudo eliminar el comentario', false)
    }
  }

  const filtered = (students || []).filter((s) => {
    const t = q.trim().toLowerCase()
    if (!t) return true
    return (s.name || '').toLowerCase().includes(t) || s.email.toLowerCase().includes(t)
  }).sort((a, b) => b.totalResultMoney - a.totalResultMoney)

  const combinedPnl = (students || []).reduce((sum, s) => sum + s.totalResultMoney, 0)
  const combinedTrades = (students || []).reduce((sum, s) => sum + s.totalEntries, 0)
  const avgWinRate = students && students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.winRate, 0) / students.length) : 0

  if (selectedUserId) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        <button type="button" onClick={() => setSelectedUserId(null)}
          className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500 hover:text-[#0284c7] cursor-pointer">
          <ArrowLeft size={14} /> Volver al listado
        </button>

        {msg && (
          <div className={`p-4 rounded-2xl text-xs font-bold ${msg.ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
            {msg.t}
          </div>
        )}

        {loadingDetail || !detail ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 text-xs text-gray-400 flex items-center justify-center gap-2">
            <Loader2 size={14} className="animate-spin" /> Cargando journal...
          </div>
        ) : (
          <>
            <div className="bg-[#0b1220] rounded-3xl p-6">
              <p className="text-[10px] font-black uppercase tracking-wider text-sky-300/70">Alumno</p>
              <h1 className="text-lg font-black text-white mt-0.5">{detail.student.name || detail.student.email}</h1>
              <p className="text-[12px] text-slate-400">{detail.student.email} · {detail.student.role}</p>
            </div>

            {detail.accounts.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-200 text-xs text-gray-400">
                Este alumno todavía no creó ninguna cuenta en su journal.
              </div>
            ) : (
              detail.accounts.map((acc) => {
                const st = STATUS_LABEL[acc.status] || STATUS_LABEL.ACTIVE
                const total = acc.entries.reduce((sum, e) => sum + (e.resultMoney || 0), 0)
                const trades = acc.entries.length
                const wins = acc.entries.filter((e) => (e.resultMoney || 0) > 0).length
                const winRate = trades > 0 ? Math.round((wins / trades) * 100) : 0
                const series = [...acc.entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((e) => ({ date: e.date, resultMoney: e.resultMoney }))
                return (
                  <div key={acc.id} className="space-y-3">
                    <div className="relative overflow-hidden bg-white rounded-2xl border border-[#ededf0] shadow-sm">
                      <div className={`absolute inset-x-0 top-0 h-1 ${total >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div className="p-4 flex items-center justify-between flex-wrap gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-[#1d1d1f]">{acc.name}</p>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                          </div>
                          {acc.propFirm && <p className="text-[11px] text-gray-500 mt-0.5">{acc.propFirm}{acc.accountSize ? ` · $${acc.accountSize.toLocaleString('es-AR')}` : ''}</p>}
                          <p className="text-[10px] text-gray-400 mt-1">{trades} operación{trades === 1 ? '' : 'es'} · {winRate}% ganadas</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className={`text-lg font-black ${moneyColor(total)}`}>{fmtMoney(total)}</p>
                          <div className="w-24 h-10 hidden sm:block"><EquityCurve series={series} height={40} /></div>
                        </div>
                      </div>
                    </div>

                    {acc.entries.length === 0 ? (
                      <p className="text-[11px] text-gray-400 px-2">Sin operaciones registradas todavía en esta cuenta.</p>
                    ) : (
                      <div className="space-y-3">
                        {acc.entries.map((en) => (
                          <EntryCard key={en.id} entry={en} onComment={addComment} onDeleteComment={deleteComment} busyId={busyId} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <span className="text-[11px] font-bold text-[#0284c7] tracking-wider uppercase block">Panel de gestión</span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2.5 mt-0.5">
          <LineChart size={22} className="text-[#0284c7]" /> Trading Journal de los alumnos
        </h1>
        <p className="text-[#86868b] text-[13px] mt-1">
          Mirá el progreso de cada alumno (sus cuentas, operaciones y capturas) y dejales comentarios para guiarlos.
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${msg.ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
          {msg.t}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Kpi icon={Wallet} label="Resultado combinado" value={fmtMoney(combinedPnl)} valueCls={moneyColor(combinedPnl)} />
        <Kpi icon={Activity} label="Operaciones totales" value={String(combinedTrades)} />
        <Kpi icon={Trophy} label="% ganadas promedio" value={`${avgWinRate}%`} />
        <Kpi icon={Users2} label="Alumnos con journal" value={String(students?.length ?? 0)} />
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full rounded-xl border border-gray-200 bg-white pl-10 pr-3 py-2.5 text-xs focus:border-[#0284c7] focus:outline-none"
          placeholder="Buscar alumno por nombre o correo..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      {students === null ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 text-xs text-gray-400">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-200 text-xs text-gray-400">
          Todavía ningún alumno registró operaciones en su journal.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <button key={s.id} type="button" onClick={() => setSelectedUserId(s.id)}
              className="w-full flex items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-[#ededf0] hover:border-[#bae6fd] shadow-sm transition-all cursor-pointer text-left">
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-[#1d1d1f] truncate">{s.name || s.email}</p>
                <p className="text-[11px] text-gray-400">{s.email} · {s.totalAccounts} cuenta{s.totalAccounts === 1 ? '' : 's'} · {s.totalEntries} operación{s.totalEntries === 1 ? '' : 'es'} · {s.winRate}% ganadas</p>
              </div>
              <div className="w-24 h-10 hidden sm:block shrink-0"><EquityCurve series={s.series} height={40} /></div>
              <div className="text-right shrink-0 w-28">
                <p className={`text-sm font-black ${moneyColor(s.totalResultMoney)}`}>{fmtMoney(s.totalResultMoney)}</p>
                {s.lastEntryAt && <p className="text-[10px] text-gray-400">Última: {new Date(s.lastEntryAt).toLocaleDateString('es-AR')}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
