'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  LineChart, ArrowLeft, Search, Smile, Frown, Meh,
  MessageSquare, Send, Trash2, Loader2, Target, Trophy, Wallet, Activity, Users2,
  DollarSign, Percent, Maximize2, X, Quote, Clock,
} from 'lucide-react'

type DayTag = 'GOOD' | 'BAD' | 'NEUTRAL'
type AccountStatus = 'ACTIVE' | 'PASSED' | 'FAILED' | 'FUNDED'
type Session = 'ASIA' | 'LONDRES' | 'NUEVA_YORK' | 'LONDRES_NY'

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
  mostSession: Session | null
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
  session: Session | null
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

const SESSION_LABEL: Record<Session, string> = {
  ASIA: 'Sesión Asia',
  LONDRES: 'Sesión Londres',
  NUEVA_YORK: 'Sesión Nueva York',
  LONDRES_NY: 'Londres / Nueva York',
}

function mostTradedSession(entries: { session: Session | null }[]): Session | null {
  const counts: Record<string, number> = {}
  for (const e of entries) {
    if (!e.session) continue
    counts[e.session] = (counts[e.session] || 0) + 1
  }
  let best: Session | null = null
  let bestCount = 0
  for (const [sess, count] of Object.entries(counts)) {
    if (count > bestCount) { best = sess as Session; bestCount = count }
  }
  return best
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

function StatBox({ icon: Icon, label: lbl, value, cls }: { icon?: any; label: string; value: string; cls?: string }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
      <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wide text-gray-400">
        {Icon && <Icon size={10} />} {lbl}
      </div>
      <p className={`mt-0.5 text-[13px] font-black ${cls || 'text-[#1d1d1f]'}`}>{value}</p>
    </div>
  )
}

function ScreenshotThumb({ url, onOpen }: { url: string; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen}
      className="group relative block h-32 w-full sm:w-44 shrink-0 overflow-hidden rounded-xl border border-gray-200 cursor-pointer">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Captura del trade" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
        <span className="flex items-center gap-1 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Maximize2 size={11} /> Ver captura
        </span>
      </div>
    </button>
  )
}

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-6" onClick={onClose}>
      <button type="button" onClick={onClose} aria-label="Cerrar"
        className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 cursor-pointer">
        <X size={20} />
      </button>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="Captura del trade ampliada" className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
    </div>
  )
}

function EntryCard({ entry, onComment, onDeleteComment, busyId, onOpenImage }: {
  entry: Entry
  onComment: (entryId: string, content: string) => Promise<void>
  onDeleteComment: (id: string) => void
  busyId: string | null
  onOpenImage: (url: string) => void
}) {
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const d = DAY_TAG_LABEL[entry.dayTag] || DAY_TAG_LABEL.NEUTRAL
  const DIcon = d.icon
  const money = entry.resultMoney ?? 0
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
          {entry.session && <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200"><Clock size={10} /> {SESSION_LABEL[entry.session]}</span>}
          <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${d.cls}`}><DIcon size={11} /> {d.label}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 min-w-0 space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <StatBox icon={DollarSign} label="Resultado" value={entry.resultMoney !== null ? fmtMoney(entry.resultMoney) : '—'} cls={entry.resultMoney !== null ? moneyColor(entry.resultMoney) : undefined} />
              <StatBox icon={Percent} label="Porcentaje" value={entry.resultPercent !== null ? `${entry.resultPercent > 0 ? '+' : ''}${entry.resultPercent}%` : '—'} />
              <StatBox icon={Target} label="R:R" value={entry.resultRR !== null ? `${entry.resultRR} R` : '—'} />
            </div>
            {entry.note && (
              <blockquote className="flex gap-2 rounded-xl bg-gray-50 border-l-2 border-[#0284c7] pl-3 pr-3 py-2.5 text-[12px] text-gray-600 leading-relaxed">
                <Quote size={13} className="mt-0.5 shrink-0 text-[#0284c7]/50" />
                <span className="whitespace-pre-wrap">{entry.note}</span>
              </blockquote>
            )}
          </div>
          {entry.screenshotUrl && (
            <ScreenshotThumb url={entry.screenshotUrl} onOpen={() => onOpenImage(entry.screenshotUrl!)} />
          )}
        </div>

        {entry.comments.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-gray-100">
            <p className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gray-400"><MessageSquare size={11} /> Comentarios</p>
            {entry.comments.map((c) => (
              <div key={c.id} className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-[#0284c7]">
                    {c.authorName || 'Equipo'} · {new Date(c.createdAt).toLocaleDateString('es-AR')}
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
  const [lightbox, setLightbox] = useState<string | null>(null)

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
    const totalPnl = detail ? detail.accounts.reduce((sum, a) => sum + a.entries.reduce((s2, e) => s2 + (e.resultMoney || 0), 0), 0) : 0
    const totalTrades = detail ? detail.accounts.reduce((sum, a) => sum + a.entries.length, 0) : 0
    const totalWins = detail ? detail.accounts.reduce((sum, a) => sum + a.entries.filter((e) => (e.resultMoney || 0) > 0).length, 0) : 0
    const totalWinRate = totalTrades > 0 ? Math.round((totalWins / totalTrades) * 100) : 0

    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
        {lightbox && <Lightbox src={lightbox} onClose={() => setLightbox(null)} />}

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

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Kpi icon={Wallet} label="Resultado total" value={fmtMoney(totalPnl)} valueCls={moneyColor(totalPnl)} />
              <Kpi icon={Activity} label="Operaciones" value={String(totalTrades)} />
              <Kpi icon={Trophy} label="% ganadas" value={`${totalWinRate}%`} />
              <Kpi icon={Users2} label="Cuentas" value={String(detail.accounts.length)} />
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
                const topSession = mostTradedSession(acc.entries)
                return (
                  <div key={acc.id} className="space-y-3">
                    <div className="bg-[#0b1220] rounded-3xl p-6 shadow-sm">
                      <div className="flex flex-wrap items-start justify-between gap-6">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-[10px] font-black uppercase tracking-wider text-sky-300/70">Cuenta</p>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                          </div>
                          <p className="text-base font-black text-white mt-0.5">{acc.name}</p>
                          {acc.propFirm && <p className="text-[11px] text-slate-400">{acc.propFirm}{acc.accountSize ? ` · $${acc.accountSize.toLocaleString('es-AR')}` : ''}</p>}
                          {topSession && (
                            <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-sky-300 bg-sky-400/10 px-2 py-0.5 rounded-full border border-sky-400/30">
                              <Clock size={10} /> Opera más en: {SESSION_LABEL[topSession]}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-7">
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Resultado</p>
                            <p className={`text-xl font-black ${total >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{fmtMoney(total)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Operaciones</p>
                            <p className="text-xl font-black text-white">{trades}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">% ganadas</p>
                            <p className="text-xl font-black text-white">{winRate}%</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-5 h-20">
                        <EquityCurve series={series} height={80} />
                      </div>
                    </div>

                    {acc.entries.length === 0 ? (
                      <p className="text-[11px] text-gray-400 px-2">Sin operaciones registradas todavía en esta cuenta.</p>
                    ) : (
                      <div className="space-y-3">
                        {acc.entries.map((en) => (
                          <EntryCard key={en.id} entry={en} onComment={addComment} onDeleteComment={deleteComment} busyId={busyId} onOpenImage={setLightbox} />
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
                {s.mostSession && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                    <Clock size={10} /> Opera más en: {SESSION_LABEL[s.mostSession]}
                  </span>
                )}
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
