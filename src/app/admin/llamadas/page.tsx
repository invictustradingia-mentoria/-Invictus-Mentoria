'use client'

import { useCallback, useEffect, useState } from 'react'
import { ACCESS_LEVELS } from '@/lib/access'
import { Video, Plus, Pencil, Trash2, Eye, EyeOff, X, CalendarDays, Clock } from 'lucide-react'

interface Call {
  id: string
  title: string
  description: string | null
  startsAt: string
  durationMin: number
  joinUrl: string
  meetingId: string | null
  passcode: string | null
  allowedRole: string
  recordingUrl: string | null
  isPublished: boolean
}

const LEVELS = Array.from(new Set(['ALL', ...(ACCESS_LEVELS as readonly string[])])).map((v) => ({
  v,
  label: v === 'ALL' ? 'Todos los alumnos' : v.charAt(0) + v.slice(1).toLowerCase().replace(/_/g, ' '),
}))

const EMPTY = { title: '', description: '', date: '', time: '', durationMin: 60, joinUrl: '', meetingId: '', passcode: '', allowedRole: 'ALL', recordingUrl: '', isPublished: true }

function toLocalParts(iso: string) {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return { date: `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`, time: `${p(d.getHours())}:${p(d.getMinutes())}` }
}

export default function AdminLlamadasPage() {
  const [calls, setCalls] = useState<Call[]>([])
  const [form, setForm] = useState<typeof EMPTY | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/calls', { cache: 'no-store' })
    const d = await r.json().catch(() => ({}))
    if (r.ok) setCalls(d.calls || [])
    else setErr(d.error || 'Error al cargar')
  }, [])
  useEffect(() => { load() }, [load])

  function openNew() { setEditId(null); setForm({ ...EMPTY }); setErr('') }
  function openEdit(c: Call) {
    const p = toLocalParts(c.startsAt)
    setEditId(c.id)
    setForm({ title: c.title, description: c.description || '', date: p.date, time: p.time, durationMin: c.durationMin, joinUrl: c.joinUrl, meetingId: c.meetingId || '', passcode: c.passcode || '', allowedRole: c.allowedRole, recordingUrl: c.recordingUrl || '', isPublished: c.isPublished })
    setErr('')
  }

  async function save() {
    if (!form) return
    if (!form.title.trim() || !form.date || !form.time || !form.joinUrl.trim()) return setErr('Completa título, fecha, hora y enlace de Zoom.')
    setBusy(true)
    setErr('')
    const body = { ...form, startsAt: new Date(`${form.date}T${form.time}`).toISOString(), durationMin: Number(form.durationMin) }
    const r = await fetch(editId ? `/api/admin/calls/${editId}` : '/api/admin/calls', { method: editId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await r.json().catch(() => ({}))
    setBusy(false)
    if (!r.ok) return setErr(d.error || 'No se pudo guardar')
    setForm(null)
    load()
  }

  async function toggle(c: Call) {
    await fetch(`/api/admin/calls/${c.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPublished: !c.isPublished }) })
    load()
  }
  async function del(c: Call) {
    if (!confirm(`¿Eliminar "${c.title}"?`)) return
    await fetch(`/api/admin/calls/${c.id}`, { method: 'DELETE' })
    load()
  }

  const set = (k: keyof typeof EMPTY, v: any) => setForm((f) => (f ? { ...f, [k]: v } : f))
  const inp = 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-base outline-none transition focus:border-[#e25822] focus:ring-2 focus:ring-orange-100 sm:text-sm'

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900"><Video className="text-[#e25822]" size={24} /> Llamadas de Zoom</h1>
          <p className="text-sm text-slate-500">Programa encuentros. Los alumnos ven el enlace 30 minutos antes de empezar.</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 rounded-xl bg-[#e25822] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition hover:bg-[#c94a18]"><Plus size={17} /> Nueva llamada</button>
      </div>

      {err && !form && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{err}</p>}

      <div className="space-y-3">
        {calls.length === 0 && <div className="rounded-2xl border border-dashed border-orange-200 bg-[#fff4ef]/50 p-10 text-center text-sm text-slate-400">Aún no creaste ninguna llamada.</div>}
        {calls.map((c) => {
          const end = new Date(c.startsAt).getTime() + c.durationMin * 60000
          const done = Date.now() > end
          return (
            <div key={c.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900">{c.title}</h3>
                  {!c.isPublished && <span className="rounded bg-slate-200 px-1.5 py-px text-[10px] font-bold uppercase text-slate-600">Oculta</span>}
                  {done && <span className="rounded bg-slate-100 px-1.5 py-px text-[10px] font-bold uppercase text-slate-500">Finalizada</span>}
                  <span className="rounded bg-[#fff4ef] px-1.5 py-px text-[10px] font-bold uppercase text-[#e25822]">{LEVELS.find((l) => l.v === c.allowedRole)?.label || c.allowedRole}</span>
                </div>
                <p className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><CalendarDays size={13} /> {new Date(c.startsAt).toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  <span className="flex items-center gap-1"><Clock size={13} /> {new Date(c.startsAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} · {c.durationMin} min</span>
                </p>
              </div>
              <div className="flex gap-1.5">
                <IconBtn title={c.isPublished ? 'Ocultar' : 'Publicar'} onClick={() => toggle(c)}>{c.isPublished ? <Eye size={16} /> : <EyeOff size={16} />}</IconBtn>
                <IconBtn title="Editar" onClick={() => openEdit(c)}><Pencil size={16} /></IconBtn>
                <IconBtn title="Eliminar" danger onClick={() => del(c)}><Trash2 size={16} /></IconBtn>
              </div>
            </div>
          )
        })}
      </div>

      {form && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setForm(null)}>
          <div className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{editId ? 'Editar llamada' : 'Nueva llamada'}</h3>
              <button onClick={() => setForm(null)}><X size={20} className="text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <Field label="Título *"><input className={inp} value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={120} placeholder="Ej: Revisión semanal de mercado" /></Field>
              <Field label="Descripción"><textarea className={inp} rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} maxLength={1000} placeholder="Temas, material previo, qué traer…" /></Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Fecha *"><input type="date" className={inp} value={form.date} onChange={(e) => set('date', e.target.value)} /></Field>
                <Field label="Hora *"><input type="time" className={inp} value={form.time} onChange={(e) => set('time', e.target.value)} /></Field>
                <Field label="Duración (min)"><input type="number" min={5} max={600} className={inp} value={form.durationMin} onChange={(e) => set('durationMin', e.target.value)} /></Field>
              </div>
              <Field label="Enlace de Zoom * (https://)"><input className={inp} value={form.joinUrl} onChange={(e) => set('joinUrl', e.target.value)} placeholder="https://zoom.us/j/..." /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="ID de reunión"><input className={inp} value={form.meetingId} onChange={(e) => set('meetingId', e.target.value)} /></Field>
                <Field label="Código de acceso"><input className={inp} value={form.passcode} onChange={(e) => set('passcode', e.target.value)} /></Field>
              </div>
              <Field label="¿Quién puede verla?">
                <select className={inp} value={form.allowedRole} onChange={(e) => set('allowedRole', e.target.value)}>
                  {LEVELS.map((l) => <option key={l.v} value={l.v}>{l.label}</option>)}
                </select>
              </Field>
              <Field label="Enlace de la grabación (se muestra al terminar)"><input className={inp} value={form.recordingUrl} onChange={(e) => set('recordingUrl', e.target.value)} placeholder="https://..." /></Field>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={form.isPublished} onChange={(e) => set('isPublished', e.target.checked)} className="accent-[#e25822]" /> Publicada (visible para los alumnos)</label>
            </div>
            {err && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{err}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setForm(null)} className="rounded-xl px-4 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50">Cancelar</button>
              <button onClick={save} disabled={busy} className="rounded-xl bg-[#e25822] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#c94a18] disabled:opacity-50">{busy ? 'Guardando…' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs font-semibold text-slate-500">{label}</span>{children}</label>
}
function IconBtn({ children, onClick, title, danger }: { children: React.ReactNode; onClick: () => void; title: string; danger?: boolean }) {
  return <button title={title} onClick={onClick} className={`grid h-9 w-9 place-items-center rounded-xl border transition ${danger ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{children}</button>
}