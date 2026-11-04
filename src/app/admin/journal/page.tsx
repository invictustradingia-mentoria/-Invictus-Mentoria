'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  LineChart, ArrowLeft, Search, TrendingUp, TrendingDown, Minus, Smile, Frown, Meh,
  MessageSquare, Send, Trash2, Loader2,
} from 'lucide-react'

type DayTag = 'GOOD' | 'BAD' | 'NEUTRAL'
type AccountStatus = 'ACTIVE' | 'PASSED' | 'FAILED' | 'FUNDED'

interface StudentRow {
  id: string
  name: string | null
  email: string
  role: string
  totalAccounts: number
  totalEntries: number
  totalResultMoney: number
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
  ACTIVE: { label: 'Activa', cls: 'bg-sky-100 text-sky-700 border-sky-200' },
  PASSED: { label: 'Aprobada', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  FAILED: { label: 'Fallida', cls: 'bg-rose-100 text-rose-700 border-rose-200' },
  FUNDED: { label: 'Fondeada', cls: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
}

const DAY_TAG_LABEL: Record<DayTag, { label: string; cls: string; icon: any }> = {
  GOOD: { label: 'Buen dÃ­a', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Smile },
  BAD: { label: 'Mal dÃ­a', cls: 'bg-rose-50 text-rose-700 border-rose-200', icon: Frown },
  NEUTRAL: { label: 'Neutral', cls: 'bg-gray-100 text-gray-600 border-gray-200', icon: Meh },
}

function fmtMoney(n: number) {
  const s = n.toFixed(2)
  return n > 0 ? `+$${s}` : `-$${Math.abs(n).toFixed(2)}`
}

async function safeJson(res: Response): Promise<any> {
  const text = await res.text()
  if (!text) return {}
  try { return JSON.parse(text) } catch { return { error: `Respuesta no vÃ¡lida (HTTP ${res.status})` } }
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
  const MoneyIcon = (entry.resultMoney ?? 0) > 0 ? TrendingUp : (entry.resultMoney ?? 0) < 0 ? TrendingDown : Minus

  const send = async () => {
    if (!draft.trim()) return
    setSending(true)
    await onComment(entry.id, draft.trim())
    setDraft('')
    setSending(false)
  }

  return (
    <div className="bg-white rounded-2xl p-4 border border-[#ededf0] shadow-sm space-y-3">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-[11px] font-bold text-gray-500">{new Date(entry.date).toLocaleDateString('es-AR')}</span>
        {entry.pair && <span className="text-[11px] font-bold text-[#0284c7] bg-[#f0f9ff] px-2 py-0.5 rounded-full border border-[#bae6fd]">{entry.pair}</span>}
        <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${d.cls}`}><DIcon size={11} /> {d.label}</span>
      </div>

      <div className="flex items-center gap-4 flex-wrap text-[12px] font-bold">
        {entry.resultMoney !== null && (
          <span className={`flex items-center gap-1 ${entry.resultMoney > 0 ? 'text-emerald-600' : entry.resultMoney < 0 ? 'text-rose-600' : 'text-gray-500'}`}>
            <MoneyIcon size={13} /> {fmtMoney(entry.resultMoney)}
          </span>
        )}
        {entry.resultPercent !== null && <span className="text-gray-500">{entry.resultPercent > 0 ? '+' : ''}{entry.resultPercent}%</span>}
        {entry.resultRR !== null && <span className="text-gray-500">R:R {entry.resultRR}</span>}
      </div>

      {entry.note && <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-wrap">{entry.note}</p>}

      {entry.screenshotUrl && (
        <a href={entry.screenshotUrl} target="_blank" rel="noreferrer" className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={entry.screenshotUrl} alt="Captura del trade" className="max-h-56 rounded-xl border border-gray-200 object-cover" />
        </a>
      )}

      {entry.comments.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-gray-100">
          {entry.comments.map((c) => (
            <div key={c.id} className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3 flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-[#0284c7]">
                  <MessageSquare size={11} /> {c.authorName || 'Equipo'} Â· {new Date(c.createdAt).toLocaleDateString('es-AR')}
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
      notify('Error de conexiÃ³n', false)
    } finally {
      setBusyId(null)
    }
  }

  const deleteComment = async (id: string) => {
    if (!confirm('Â¿Eliminar este comentario?')) return
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
  })

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
            <div>
              <h1 className="text-xl font-bold text-[#1d1d1f]">{detail.student.name || detail.student.email}</h1>
              <p className="text-[12px] text-gray-500">{detail.student.email} Â· {detail.student.role}</p>
            </div>

            {detail.accounts.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 text-xs text-gray-400">
                Este alumno todavÃ­a no creÃ³ ninguna cuenta en su journal.
              </div>
            ) : (
              detail.accounts.map((acc) => {
                const st = STATUS_LABEL[acc.status] || STATUS_LABEL.ACTIVE
                const total = acc.entries.reduce((sum, e) => sum + (e.resultMoney || 0), 0)
                return (
                  <div key={acc.id} className="space-y-3">
                    <div className="bg-white rounded-2xl p-4 border border-[#ededf0] shadow-sm flex items-center justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-[#1d1d1f]">{acc.name}</p>
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                        </div>
                        {acc.propFirm && <p className="text-[11px] text-gray-500 mt-0.5">{acc.propFirm}{acc.accountSize ? ` Â· $${acc.accountSize.toLocaleString('es-AR')}` : ''}</p>}
                      </div>
                      <p className={`text-base font-black ${total > 0 ? 'text-emerald-600' : total < 0 ? 'text-rose-600' : 'text-gray-500'}`}>{fmtMoney(total)}</p>
                    </div>

                    {acc.entries.length === 0 ? (
                      <p className="text-[11px] text-gray-400 px-2">Sin operaciones registradas todavÃ­a en esta cuenta.</p>
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
        <span className="text-[11px] font-bold text-[#0284c7] tracking-wider uppercase block">Panel de gestiÃ³n</span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2.5 mt-0.5">
          <LineChart size={22} className="text-[#0284c7]" /> Trading Journal de los alumnos
        </h1>
        <p className="text-[#86868b] text-[13px] mt-1">
          MirÃ¡ el progreso de cada alumno (sus cuentas, operaciones y capturas) y dejÃ¡les comentarios para guiarlos.
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${msg.ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
          {msg.t}
        </div>
      )}

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
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 text-xs text-gray-400">
          TodavÃ­a ningÃºn alumno registrÃ³ operaciones en su journal.
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s) => (
            <button key={s.id} type="button" onClick={() => setSelectedUserId(s.id)}
              className="w-full flex items-center justify-between gap-4 rounded-2xl bg-white p-4 border border-[#ededf0] hover:border-[#bae6fd] shadow-sm transition-all cursor-pointer text-left">
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-[#1d1d1f] truncate">{s.name || s.email}</p>
                <p className="text-[11px] text-gray-400">{s.email} Â· {s.totalAccounts} cuenta{s.totalAccounts === 1 ? '' : 's'} Â· {s.totalEntries} operaciÃ³n{s.totalEntries === 1 ? '' : 'es'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={`text-sm font-black ${s.totalResultMoney > 0 ? 'text-emerald-600' : s.totalResultMoney < 0 ? 'text-rose-600' : 'text-gray-500'}`}>{fmtMoney(s.totalResultMoney)}</p>
                {s.lastEntryAt && <p className="text-[10px] text-gray-400">Ãšltima: {new Date(s.lastEntryAt).toLocaleDateString('es-AR')}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
