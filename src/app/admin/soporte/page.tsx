'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { LifeBuoy, Send, ArrowLeft, CheckCircle2, RotateCcw, Trash2, Pin, Plus, Eye, EyeOff, Mail, X } from 'lucide-react'

interface Thread {
  id: string
  name: string
  email: string | null
  status: 'OPEN' | 'CLOSED'
  unreadAdmin: number
  lastMessageAt: string
  last: { from: string; content: string } | null
}
interface TMsg {
  id: string
  from: 'VISITOR' | 'STAFF'
  content: string
  createdAt: string
}
interface Notice {
  id: string
  content: string
  isActive: boolean
}

function ago(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
  if (m < 1) return 'ahora'
  if (m < 60) return `${m} min`
  if (m < 1440) return `${Math.floor(m / 60)} h`
  return `${Math.floor(m / 1440)} d`
}
function hm(d: string) {
  return new Date(d).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function SoportePage() {
  const [tab, setTab] = useState<'chats' | 'avisos'>('chats')
  const [threads, setThreads] = useState<Thread[]>([])
  const [filter, setFilter] = useState<'OPEN' | 'CLOSED'>('OPEN')
  const [sel, setSel] = useState<string | null>(null)
  const [conv, setConv] = useState<{ thread: any; messages: TMsg[] } | null>(null)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [notices, setNotices] = useState<Notice[]>([])
  const [newNotice, setNewNotice] = useState('')
  const box = useRef<HTMLDivElement>(null)
  const stick = useRef(true)

  const loadThreads = useCallback(async () => {
    const r = await fetch('/api/admin/support', { cache: 'no-store' })
    const d = await r.json().catch(() => ({}))
    if (r.ok) setThreads(d.threads)
    else setErr(d.error || 'Error al cargar')
  }, [])

  const loadConv = useCallback(async (id: string) => {
    const r = await fetch('/api/admin/support/' + id, { cache: 'no-store' })
    if (!r.ok) return
    setConv(await r.json())
  }, [])

  const loadNotices = useCallback(async () => {
    const r = await fetch('/api/admin/bot-notices', { cache: 'no-store' })
    const d = await r.json().catch(() => ({}))
    if (r.ok) setNotices(d.notices)
  }, [])

  useEffect(() => {
    loadThreads()
    loadNotices()
    const t = setInterval(() => !document.hidden && loadThreads(), 4000)
    return () => clearInterval(t)
  }, [loadThreads, loadNotices])

  useEffect(() => {
    if (!sel) {
      setConv(null)
      return
    }
    stick.current = true
    loadConv(sel)
    const t = setInterval(() => !document.hidden && loadConv(sel), 3000)
    return () => clearInterval(t)
  }, [sel, loadConv])

  useEffect(() => {
    const el = box.current
    if (el && stick.current) el.scrollTop = el.scrollHeight
  }, [conv])

  const unreadOpen = threads.filter((t) => t.status === 'OPEN' && t.unreadAdmin > 0).length
  const list = threads.filter((t) => t.status === filter)

  async function reply() {
    if (!sel || !text.trim() || busy) return
    setBusy(true)
    setErr('')
    const r = await fetch('/api/admin/support/' + sel, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: text.trim() }) })
    const d = await r.json().catch(() => ({}))
    setBusy(false)
    if (!r.ok) return setErr(d.error || 'No se pudo enviar')
    setText('')
    stick.current = true
    loadConv(sel)
    loadThreads()
  }

  async function setStatus(status: 'OPEN' | 'CLOSED') {
    if (!sel) return
    await fetch('/api/admin/support/' + sel, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) })
    loadConv(sel)
    loadThreads()
  }

  async function removeThread() {
    if (!sel || !confirm('¿Eliminar esta conversación definitivamente?')) return
    await fetch('/api/admin/support/' + sel, { method: 'DELETE' })
    setSel(null)
    loadThreads()
  }

  async function addNotice() {
    if (!newNotice.trim()) return
    setErr('')
    const r = await fetch('/api/admin/bot-notices', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: newNotice.trim() }) })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) return setErr(d.error || 'No se pudo publicar')
    setNewNotice('')
    loadNotices()
  }
  async function toggleNotice(n: Notice) {
    setErr('')
    const r = await fetch('/api/admin/bot-notices', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: n.id, isActive: !n.isActive }) })
    if (!r.ok) setErr((await r.json().catch(() => ({}))).error || 'Error')
    loadNotices()
  }
  async function delNotice(n: Notice) {
    if (!confirm('¿Eliminar este aviso?')) return
    await fetch('/api/admin/bot-notices?id=' + n.id, { method: 'DELETE' })
    loadNotices()
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
          <LifeBuoy className="text-[#0284c7]" size={24} /> Soporte
          {unreadOpen > 0 && <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white">{unreadOpen} nuevo{unreadOpen > 1 ? 's' : ''}</span>}
        </h1>
        <p className="text-sm text-slate-500">Responde a quienes piden hablar con soporte desde la página principal y administra los avisos fijos del asistente.</p>
      </div>

      <div className="flex gap-2">
        {([['chats', 'Conversaciones'], ['avisos', 'Avisos fijos del asistente']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${tab === k ? 'bg-[#0284c7] text-white shadow' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-50'}`}>{l}</button>
        ))}
      </div>

      {err && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {err}
          <button onClick={() => setErr('')}><X size={16} /></button>
        </div>
      )}

      {tab === 'chats' && (
        <div className="grid h-[72vh] min-h-[480px] overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-sm lg:grid-cols-[320px_1fr]">
          {/* Lista */}
          <aside className={`flex min-h-0 flex-col border-r border-sky-100 ${sel ? 'hidden lg:flex' : 'flex'}`}>
            <div className="flex gap-1 border-b border-sky-100 bg-[#f0f9ff] p-2">
              {(['OPEN', 'CLOSED'] as const).map((s) => (
                <button key={s} onClick={() => setFilter(s)} className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${filter === s ? 'bg-white text-[#0284c7] shadow-sm' : 'text-slate-500'}`}>
                  {s === 'OPEN' ? 'Abiertas' : 'Cerradas'}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              {list.length === 0 && <p className="p-8 text-center text-sm text-slate-400">No hay conversaciones.</p>}
              {list.map((t) => (
                <button key={t.id} onClick={() => setSel(t.id)} className={`block w-full border-b border-slate-50 px-4 py-3 text-left transition hover:bg-[#f8fcff] ${sel === t.id ? 'bg-[#f0f9ff]' : ''}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className={`truncate text-sm ${t.unreadAdmin > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{t.name}</span>
                    <span className="shrink-0 text-[11px] text-slate-400">{ago(t.lastMessageAt)}</span>
                  </div>
                  <div className="mt-0.5 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-slate-500">{t.last ? (t.last.from === 'STAFF' ? 'Tú: ' : '') + t.last.content : ''}</span>
                    {t.unreadAdmin > 0 && <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">{t.unreadAdmin}</span>}
                  </div>
                </button>
              ))}
            </div>
          </aside>

          {/* Conversación */}
          <section className={`min-h-0 flex-col ${sel ? 'flex' : 'hidden lg:flex'}`}>
            {!sel || !conv ? (
              <div className="grid flex-1 place-items-center p-8 text-center text-sm text-slate-400">
                <div>
                  <LifeBuoy size={36} className="mx-auto mb-2 text-sky-200" />
                  {sel ? 'Cargando…' : 'Elige una conversación para responder.'}
                </div>
              </div>
            ) : (
              <>
                <header className="flex items-center gap-3 border-b border-sky-100 px-4 py-3">
                  <button onClick={() => setSel(null)} className="lg:hidden"><ArrowLeft size={20} className="text-slate-500" /></button>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-bold text-slate-900">{conv.thread.name}</h2>
                    {conv.thread.email && <a href={'mailto:' + conv.thread.email} className="flex items-center gap-1 truncate text-xs text-sky-600 hover:underline"><Mail size={12} /> {conv.thread.email}</a>}
                  </div>
                  {conv.thread.status === 'OPEN' ? (
                    <button onClick={() => setStatus('CLOSED')} className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"><CheckCircle2 size={14} /> Cerrar</button>
                  ) : (
                    <button onClick={() => setStatus('OPEN')} className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200"><RotateCcw size={14} /> Reabrir</button>
                  )}
                  <button onClick={removeThread} title="Eliminar" className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={16} /></button>
                </header>

                <div ref={box} onScroll={() => { const el = box.current; if (el) stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80 }} className="flex-1 space-y-2 overflow-y-auto bg-[#f8fcff] p-4">
                  {conv.messages.map((m) => (
                    <div key={m.id} className={`flex ${m.from === 'STAFF' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-sm shadow-sm ${m.from === 'STAFF' ? 'rounded-br-md bg-[#0284c7] text-white' : 'rounded-bl-md border border-slate-100 bg-white text-slate-800'}`}>
                        {m.content}
                        <div className={`mt-0.5 text-right text-[10px] ${m.from === 'STAFF' ? 'text-sky-100' : 'text-slate-400'}`}>{hm(m.createdAt)}</div>
                      </div>
                    </div>
                  ))}
                  {conv.thread.status === 'CLOSED' && <p className="py-2 text-center text-xs text-slate-400">Conversación cerrada. Si respondes, se reabre.</p>}
                </div>

                <div className="flex items-end gap-2 border-t border-sky-100 p-3">
                  <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={2000} placeholder="Escribe tu respuesta…"
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); reply() } }}
                    className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2 text-base outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 sm:text-sm" />
                  <button onClick={reply} disabled={!text.trim() || busy} aria-label="Enviar" className="grid h-11 w-11 place-items-center rounded-xl bg-[#0284c7] text-white shadow hover:bg-[#0369a1] disabled:opacity-40"><Send size={18} /></button>
                </div>
              </>
            )}
          </section>
        </div>
      )}

      {tab === 'avisos' && (
        <section className="rounded-2xl border border-sky-100 bg-white p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-bold text-slate-900"><Pin size={18} className="text-[#0284c7]" /> Avisos fijos del asistente</h2>
          <p className="mb-4 mt-1 text-sm text-slate-500">Se muestran arriba del asistente de la página principal (máximo 5 activos, 300 caracteres cada uno). Ideal para promociones, horarios o novedades.</p>
          <div className="mb-5 flex gap-2">
            <input value={newNotice} onChange={(e) => setNewNotice(e.target.value)} maxLength={300} placeholder="Ej: Esta semana abrimos nuevas plazas de la Mentoría."
              onKeyDown={(e) => e.key === 'Enter' && addNotice()}
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-base outline-none focus:border-[#0284c7] focus:ring-2 focus:ring-sky-100 sm:text-sm" />
            <button onClick={addNotice} disabled={!newNotice.trim()} className="flex items-center gap-1.5 rounded-xl bg-[#0284c7] px-4 text-sm font-semibold text-white hover:bg-[#0369a1] disabled:opacity-40"><Plus size={16} /> Publicar</button>
          </div>
          <ul className="space-y-2">
            {notices.length === 0 && <li className="rounded-xl bg-slate-50 p-6 text-center text-sm text-slate-400">Aún no hay avisos.</li>}
            {notices.map((n) => (
              <li key={n.id} className={`flex items-start gap-3 rounded-xl border p-3 ${n.isActive ? 'border-amber-200 bg-amber-50' : 'border-slate-100 bg-slate-50 opacity-70'}`}>
                <Pin size={15} className={`mt-0.5 shrink-0 ${n.isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                <p className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm text-slate-700">{n.content}</p>
                <button onClick={() => toggleNotice(n)} title={n.isActive ? 'Ocultar' : 'Activar'} className="rounded-lg p-1.5 text-slate-500 hover:bg-white">{n.isActive ? <Eye size={16} /> : <EyeOff size={16} />}</button>
                <button onClick={() => delNotice(n)} title="Eliminar" className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-red-500"><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}