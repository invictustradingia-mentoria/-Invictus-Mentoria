'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  FolderOpen, Upload, Link as LinkIcon, Trash2, FileText, Globe, Users, GraduationCap,
} from 'lucide-react'

interface Item {
  id: string
  title: string
  description: string | null
  fileUrl: string
  fileName: string | null
  fileSize: number | null
  allowedRole: string
  createdAt: string
}

type Access = 'ALL' | 'CLUB' | 'MENTORIA'

const BUCKET = 'resources'
const MAX_MB = 25
const ALLOWED_EXT = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'zip', 'png', 'jpg', 'jpeg']

const ACCESS: Record<Access, { label: string; icon: any; card: string }> = {
  ALL: { label: 'Para todos', icon: Globe, card: 'border-emerald-400 bg-emerald-50 text-emerald-700' },
  CLUB: { label: 'Solo Club', icon: Users, card: 'border-sky-400 bg-sky-50 text-sky-700' },
  MENTORIA: { label: 'Solo Mentoría', icon: GraduationCap, card: 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7]' },
}

const input = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs focus:border-[#0284c7] focus:outline-none'
const label = 'mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-gray-500'

function fmtSize(bytes: number | null) {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

async function safeJson(res: Response): Promise<any> {
  const text = await res.text()
  if (!text) return {}
  try { return JSON.parse(text) } catch { return { error: `Respuesta no válida (HTTP ${res.status})` } }
}

export default function RecursosAdmin() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [items, setItems] = useState<Item[]>([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null)

  const [title, setTitle] = useState('')
  const [desc, setDesc] = useState('')
  const [access, setAccess] = useState<Access>('ALL')
  const [source, setSource] = useState<'file' | 'link'>('file')
  const [linkUrl, setLinkUrl] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState('')

  const notify = (t: string, ok: boolean) => { setMsg({ t, ok }); setTimeout(() => setMsg(null), 6000) }

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/resources', { cache: 'no-store' })
    const d = await safeJson(r)
    if (r.ok) setItems(d.items || [])
  }, [])
  useEffect(() => { load() }, [load])

  const onPickFile = (f: File | null) => {
    if (!f) return setFile(null)
    const ext = f.name.split('.').pop()?.toLowerCase() || ''
    if (!ALLOWED_EXT.includes(ext)) {
      notify(`Formato .${ext} no admitido. Usa PDF, Word, Excel, PowerPoint, CSV, ZIP o imágenes.`, false)
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      notify(`El archivo pesa ${(f.size / 1024 / 1024).toFixed(0)} MB y el máximo es ${MAX_MB} MB.`, false)
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    setFile(f)
  }

  const uploadFile = async (f: File): Promise<{ url: string } | null> => {
    setStatus('Preparando la subida...')
    const signRes = await fetch('/api/admin/resources/upload', {
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

    setStatus(`Subiendo ${(f.size / 1024 / 1024).toFixed(1)} MB... no cierres esta página`)
    try {
      const supabase = createClient(supabaseUrl, anon)
      const { error } = await supabase.storage
        .from(BUCKET)
        .uploadToSignedUrl(sign.path, sign.token, f, { contentType: f.type || 'application/octet-stream' })
      if (error) {
        notify(error.message || 'No se pudo subir el archivo', false)
        return null
      }
    } catch (err: any) {
      notify(err?.message || 'No se pudo subir el archivo', false)
      return null
    }
    return { url: sign.url as string }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return notify('Escribe un título para el recurso', false)

    setBusy(true)
    setStatus('')
    try {
      let fileUrl = ''
      let fileName = ''
      let fileSize: number | null = null

      if (source === 'file') {
        if (!file) { notify('Selecciona un archivo para subir', false); setBusy(false); return }
        const up = await uploadFile(file)
        if (!up) { setBusy(false); return }
        fileUrl = up.url
        fileName = file.name
        fileSize = file.size
      } else {
        if (!linkUrl.trim()) { notify('Pega el enlace del recurso', false); setBusy(false); return }
        fileUrl = linkUrl.trim()
        fileName = ''
        fileSize = null
      }

      const res = await fetch('/api/admin/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), description: desc.trim(), fileUrl, fileName, fileSize, allowedRole: access }),
      })
      const data = await safeJson(res)
      if (res.ok && !data.error) {
        notify('Recurso publicado correctamente', true)
        setTitle(''); setDesc(''); setLinkUrl(''); setFile(null)
        if (fileRef.current) fileRef.current.value = ''
        load()
      } else {
        notify(data.error || `No se pudo publicar el recurso (HTTP ${res.status})`, false)
      }
    } catch {
      notify('Error de conexión al publicar el recurso', false)
    } finally {
      setBusy(false)
      setStatus('')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este recurso? Los alumnos dejarán de verlo.')) return
    const res = await fetch(`/api/admin/resources?id=${id}`, { method: 'DELETE' })
    if (res.ok) { notify('Recurso eliminado', true); load() }
    else notify('No se pudo eliminar el recurso', false)
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8">
      <div>
        <span className="text-[11px] font-bold text-[#0284c7] tracking-wider uppercase block">Panel de gestión</span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2.5 mt-0.5">
          <FolderOpen size={22} className="text-[#0284c7]" /> Recursos descargables
        </h1>
        <p className="text-[#86868b] text-[13px] mt-1">
          Subí PDFs, plantillas, hojas de cálculo o enlaces que verán los alumnos en &quot;Recursos&quot;.
        </p>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-xs font-bold ${msg.ok ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
          {msg.t}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 border border-[#ededf0] shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Título</label>
            <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Calculadora de gestión de riesgo" required />
          </div>
          <div>
            <label className={label}>Descripción breve</label>
            <input className={input} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="De qué trata este recurso" />
          </div>
        </div>

        <div>
          <label className={label}>Acceso</label>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {(Object.keys(ACCESS) as Access[]).map((k) => {
              const a = ACCESS[k]
              const active = access === k
              const Icon = a.icon
              return (
                <button key={k} type="button" onClick={() => setAccess(k)}
                  className={`flex items-center gap-2.5 rounded-xl border-2 px-3 py-2.5 text-left transition-all cursor-pointer ${active ? a.card : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                  <Icon size={18} className="shrink-0" />
                  <span className="text-xs font-bold">{a.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className={label}>Origen del archivo</label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button type="button" onClick={() => setSource('file')}
              className={`flex items-center justify-center gap-2 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${source === 'file' ? 'bg-[#f0f9ff] border-[#0284c7] text-[#0284c7]' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
              <Upload size={14} /> Subir archivo
            </button>
            <button type="button" onClick={() => setSource('link')}
              className={`flex items-center justify-center gap-2 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${source === 'link' ? 'bg-[#f0f9ff] border-[#0284c7] text-[#0284c7]' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
              <LinkIcon size={14} /> Enlace externo
            </button>
          </div>

          {source === 'file' ? (
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-4 text-center bg-gray-50/50">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.csv,.zip,.png,.jpg,.jpeg"
                onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#1d1d1f] file:text-white hover:file:bg-[#0284c7] cursor-pointer"
              />
              <p className="text-[10px] text-gray-400 mt-2">PDF, Word, Excel, PowerPoint, CSV, ZIP o imágenes. Máximo {MAX_MB} MB.</p>
            </div>
          ) : (
            <input className={input} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://..." />
          )}
        </div>

        {status && <p className="text-[11px] text-gray-500">{status}</p>}

        <button type="submit" disabled={busy}
          className="w-full py-3 rounded-2xl text-xs font-bold bg-[#1d1d1f] text-white hover:bg-[#0284c7] disabled:opacity-50 transition-all shadow-sm cursor-pointer">
          {busy ? 'Publicando...' : 'Publicar recurso'}
        </button>
      </form>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[#1d1d1f] flex items-center gap-2">
          <FileText size={16} className="text-[#0284c7]" /> Recursos publicados
        </h3>
        {items.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 text-xs text-gray-400">
            Todavía no publicaste ningún recurso.
          </div>
        ) : (
          items.map((it) => {
            const a = ACCESS[(it.allowedRole as Access) in ACCESS ? (it.allowedRole as Access) : 'ALL']
            return (
              <div key={it.id} className="bg-white rounded-2xl p-4 border border-[#ededf0] shadow-sm flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] text-[#0284c7] flex items-center justify-center shrink-0">
                    <FileText size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[13px] font-bold text-[#1d1d1f]">{it.title}</p>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${a.card}`}>{a.label}</span>
                    </div>
                    {it.description && <p className="text-[11px] text-gray-500 mt-0.5">{it.description}</p>}
                    <p className="text-[10px] text-gray-400 mt-1">
                      {it.fileName || 'Enlace externo'}{it.fileSize ? ` · ${fmtSize(it.fileSize)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={it.fileUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200">
                    Ver
                  </a>
                  <button onClick={() => handleDelete(it.id)} className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 transition-all cursor-pointer" title="Eliminar">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
