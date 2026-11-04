'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  LineChart, Plus, Trash2, Image as ImageIcon, X, TrendingUp, TrendingDown, Minus,
  Smile, Frown, Meh, MessageSquare, Loader2,
} from 'lucide-react'

type AccountStatus = 'ACTIVE' | 'PASSED' | 'FAILED' | 'FUNDED'
type DayTag = 'GOOD' | 'BAD' | 'NEUTRAL'

interface Account {
  id: string
  name: string
  propFirm: string | null
  accountSize: number | null
  status: AccountStatus
  totalEntries: number
  totalResultMoney: number
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

const input = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs focus:border-[#0284c7] focus:outline-none'
const label = 'mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500'

function fmtMoney(n: number) {
  const s = n.toFixed(2)
  return n > 0 ? `+$${s}` : `-$${Math.abs(n).toFixed(2)}`
}

async function safeJson(res: Response): Promise<any> {
  const text = await res.text()
  if (!text) return {}
  try { return JSON.parse(text) } catch { return { error: `Respuesta no vÃ¡lida (HTTP ${res.status})` } }
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
      if (!selectedId && d.items?.length) setSelectedId(d.items[0].id)
    }
  }, [selectedId])

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
    if (!accName.trim()) return notify('PonÃ©le un nombre a la cuenta', false)
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
      notify('Error de conexiÃ³n', false)
    } finally {
      setAccBusy(false)
    }
  }

  const deleteAccount = async (id: string) => {
    if (!confirm('Â¿Eliminar esta cuenta y todas sus operaciones? Esta acciÃ³n no se puede deshacer.')) return
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
      notify(`Formato .${ext} no admitido. UsÃ¡ PNG, JPG o WEBP.`, false)
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      notify(`La imagen pesa ${(f.size / 1024 / 1024).toFixed(0)} MB y el mÃ¡ximo es ${MAX_MB} MB.`, false)
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
      notify(sign.error || `El servidor rechazÃ³ la subida (HTTP ${signRes.status})`, false)
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
    if (!selectedId) return notify('CreÃ¡ primero una cuenta', false)
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
        notify('OperaciÃ³n guardada', true)
        setEPair(''); setEMoney(''); setEPercent(''); setERR(''); setENote(''); setEFile(null); setEDayTag('NEUTRAL')
        setEDate(new Date().toISOString().slice(0, 10))
        if (fileRef.current) fileRef.current.value = ''
        loadEntries(selectedId)
        loadAccounts()
      } else {
        notify(data.error || `No se pudo guardar la operaciÃ³n (HTTP ${res.status})`, false)
      }
    } catch {
      notify('Error de conexiÃ³n', false)
    } finally {
      setEBusy(false)
      setEStatus('')
    }
  }

  const deleteEntry = async (id: string) => {
    if (!confirm('Â¿Eliminar esta operaciÃ³n?')) return
    const res = await fetch(`/api/student/journal/entries?id=${id}`, { method: 'DELETE' })
    if (res.ok) {
      notify('OperaciÃ³n eliminada', true)
      if (selectedId) loadEntries(selectedId)
      loadAccounts()
    } else {
      notify('No se pudo eliminar la operaciÃ³n', false)
    }
  }

  const selected = accounts.find((a) => a.id === selectedId) || null
  const trades = entries.length
  const wins = entries.filter((e) => (e.resultMoney ?? 0) > 0).length
  const winRate = trades > 0 ? Math.round((wins / trades) * 100) : 0

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      <div>
        <span className="text-[11px] font-bold text-[#0284c7] tracking-wider uppercase block">Seguimiento personal</span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2.5 mt-0.5">
          <LineChart size={22} className="text-[#0284c7]" /> Mi Trading Journal
        </h1>
        <p className="text-[#86868b] text-[13px] mt-1">
          RegistrÃ¡ el rendimiento de tus evals y cuentas: cuÃ¡nto llevÃ¡s, tus dÃ­as buenos y malos, y tus capturas. Tu mentor puede ver tu progreso y dejarte comentarios para ayudarte.
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${msg.ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
          {msg.t}
        </div>
      )}

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
                <label className={label}>Nombre de la cuenta</label>
                <input className={input} value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="Ej. Eval 1 - FTMO 100k" required />
              </div>
              <div>
                <label className={label}>Prop firm (opcional)</label>
                <input className={input} value={accPropFirm} onChange={(e) => setAccPropFirm(e.target.value)} placeholder="Ej. FTMO" />
              </div>
              <div>
                <label className={label}>TamaÃ±o de cuenta (opcional)</label>
                <input className={input} type="number" value={accSize} onChange={(e) => setAccSize(e.target.value)} placeholder="100000" />
              </div>
            </div>
            <button type="submit" disabled={accBusy}
              className="w-full py-2.5 rounded-2xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#0284c7] disabled:opacity-50 transition-all cursor-pointer">
              {accBusy ? 'Creando...' : 'Crear cuenta'}
            </button>
          </form>
        )}

        {accounts.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 text-xs text-gray-400">
            TodavÃ­a no creaste ninguna cuenta. CreÃ¡ la primera para empezar a registrar tus operaciones.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {accounts.map((a) => {
              const st = STATUS_LABEL[a.status] || STATUS_LABEL.ACTIVE
              const active = a.id === selectedId
              return (
                <button key={a.id} type="button" onClick={() => setSelectedId(a.id)}
                  className={`text-left rounded-2xl border-2 p-4 transition-all cursor-pointer ${active ? 'border-[#0284c7] bg-[#f0f9ff]' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-bold text-[#1d1d1f] truncate">{a.name}</p>
                    <span className={`shrink-0 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${st.cls}`}>{st.label}</span>
                  </div>
                  {a.propFirm && <p className="text-[11px] text-gray-500 mt-0.5">{a.propFirm}{a.accountSize ? ` Â· $${a.accountSize.toLocaleString('es-AR')}` : ''}</p>}
                  <p className={`mt-2 text-sm font-black ${a.totalResultMoney > 0 ? 'text-emerald-600' : a.totalResultMoney < 0 ? 'text-rose-600' : 'text-gray-500'}`}>
                    {fmtMoney(a.totalResultMoney)}
                  </p>
                  <p className="text-[10px] text-gray-400">{a.totalEntries} operaciÃ³n{a.totalEntries === 1 ? '' : 'es'}</p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selected && (
        <>
          {/* Resumen de la cuenta seleccionada */}
          <div className="bg-white rounded-3xl p-5 border border-[#ededf0] shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">Viendo</p>
              <p className="text-sm font-bold text-[#1d1d1f]">{selected.name}</p>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Resultado total</p>
                <p className={`text-base font-black ${selected.totalResultMoney > 0 ? 'text-emerald-600' : selected.totalResultMoney < 0 ? 'text-rose-600' : 'text-gray-600'}`}>{fmtMoney(selected.totalResultMoney)}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">Operaciones</p>
                <p className="text-base font-black text-[#1d1d1f]">{trades}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400">% ganadas</p>
                <p className="text-base font-black text-[#1d1d1f]">{winRate}%</p>
              </div>
              <button type="button" onClick={() => deleteAccount(selected.id)} title="Eliminar esta cuenta"
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-all cursor-pointer">
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Nueva operaciÃ³n */}
          <form onSubmit={createEntry} className="bg-white rounded-3xl p-5 border border-[#ededf0] shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#1d1d1f]">Registrar operaciÃ³n / dÃ­a</h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className={label}>Fecha</label>
                <input className={input} type="date" value={eDate} onChange={(e) => setEDate(e.target.value)} />
              </div>
              <div>
                <label className={label}>Par / instrumento</label>
                <input className={input} value={ePair} onChange={(e) => setEPair(e.target.value)} placeholder="Ej. EURUSD" />
              </div>
              <div>
                <label className={label}>Resultado ($)</label>
                <input className={input} type="number" step="0.01" value={eMoney} onChange={(e) => setEMoney(e.target.value)} placeholder="150" />
              </div>
              <div>
                <label className={label}>Resultado (%)</label>
                <input className={input} type="number" step="0.01" value={ePercent} onChange={(e) => setEPercent(e.target.value)} placeholder="1.5" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className={label}>R:R</label>
                <input className={input} type="number" step="0.01" value={eRR} onChange={(e) => setERR(e.target.value)} placeholder="2" />
              </div>
              <div className="sm:col-span-3">
                <label className={label}>Â¿CÃ³mo fue el dÃ­a?</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(DAY_TAG_LABEL) as DayTag[]).map((k) => {
                    const d = DAY_TAG_LABEL[k]
                    const Icon = d.icon
                    const active = eDayTag === k
                    return (
                      <button key={k} type="button" onClick={() => setEDayTag(k)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 text-[11px] font-bold transition-all cursor-pointer ${active ? d.cls : 'border-gray-200 bg-white text-gray-500'}`}>
                        <Icon size={14} /> {d.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
            <div>
              <label className={label}>Nota (quÃ© pasÃ³, quÃ© aprendiste, cÃ³mo te sentiste)</label>
              <textarea className={input} rows={3} value={eNote} onChange={(e) => setENote(e.target.value)} placeholder="Escribe tu reflexiÃ³n del dÃ­a..." />
            </div>
            <div>
              <label className={label}>Captura del trade (opcional)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center bg-gray-50/50">
                <input
                  ref={fileRef}
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp"
                  onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                  className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1d1d1f] file:text-white hover:file:bg-[#0284c7] cursor-pointer"
                />
                <p className="text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1"><ImageIcon size={12} /> PNG, JPG o WEBP. MÃ¡ximo {MAX_MB} MB.</p>
              </div>
            </div>
            {eStatus && <p className="text-[11px] text-gray-500">{eStatus}</p>}
            <button type="submit" disabled={eBusy}
              className="w-full py-3 rounded-2xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#0284c7] disabled:opacity-50 transition-all shadow-sm cursor-pointer">
              {eBusy ? 'Guardando...' : 'Guardar operaciÃ³n'}
            </button>
          </form>

          {/* Historial */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-[#1d1d1f]">Historial</h3>
            {loadingEntries ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 text-xs text-gray-400 flex items-center justify-center gap-2">
                <Loader2 size={14} className="animate-spin" /> Cargando...
              </div>
            ) : entries.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 text-xs text-gray-400">
                TodavÃ­a no registraste ninguna operaciÃ³n en esta cuenta.
              </div>
            ) : (
              entries.map((en) => {
                const d = DAY_TAG_LABEL[en.dayTag] || DAY_TAG_LABEL.NEUTRAL
                const DIcon = d.icon
                const MoneyIcon = (en.resultMoney ?? 0) > 0 ? TrendingUp : (en.resultMoney ?? 0) < 0 ? TrendingDown : Minus
                return (
                  <div key={en.id} className="bg-white rounded-2xl p-4 border border-[#ededf0] shadow-sm space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold text-gray-500">{new Date(en.date).toLocaleDateString('es-AR')}</span>
                        {en.pair && <span className="text-[11px] font-bold text-[#0284c7] bg-[#f0f9ff] px-2 py-0.5 rounded-full border border-[#bae6fd]">{en.pair}</span>}
                        <span className={`flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${d.cls}`}><DIcon size={11} /> {d.label}</span>
                      </div>
                      <button type="button" onClick={() => deleteEntry(en.id)} className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-50 transition-all cursor-pointer" title="Eliminar">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap text-[12px] font-bold">
                      {en.resultMoney !== null && (
                        <span className={`flex items-center gap-1 ${en.resultMoney > 0 ? 'text-emerald-600' : en.resultMoney < 0 ? 'text-rose-600' : 'text-gray-500'}`}>
                          <MoneyIcon size={13} /> {fmtMoney(en.resultMoney)}
                        </span>
                      )}
                      {en.resultPercent !== null && <span className="text-gray-500">{en.resultPercent > 0 ? '+' : ''}{en.resultPercent}%</span>}
                      {en.resultRR !== null && <span className="text-gray-500">R:R {en.resultRR}</span>}
                    </div>

                    {en.note && <p className="text-[12px] text-gray-600 leading-relaxed whitespace-pre-wrap">{en.note}</p>}

                    {en.screenshotUrl && (
                      <a href={en.screenshotUrl} target="_blank" rel="noreferrer" className="block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={en.screenshotUrl} alt="Captura del trade" className="max-h-56 rounded-xl border border-gray-200 object-cover" />
                      </a>
                    )}

                    {en.comments.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        {en.comments.map((c) => (
                          <div key={c.id} className="bg-[#f0f9ff] border border-[#bae6fd] rounded-xl p-3">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-[#0284c7]">
                              <MessageSquare size={11} /> {c.authorName || 'Mentor'} Â· {new Date(c.createdAt).toLocaleDateString('es-AR')}
                            </div>
                            <p className="text-[12px] text-[#1d1d1f] mt-1">{c.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
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
