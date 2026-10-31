'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Trash2, Video, Type, Image as ImageIcon } from 'lucide-react'

interface Item { id: string; kind: string; name: string | null; caption: string | null; videoUrl: string | null; order: number; isPublished: boolean; hasImage: boolean; updatedAt: string }

// Reduce la captura a 900 px de ancho para que cargue rápido
function resize(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const scale = Math.min(1, 900 / img.width)
      const c = document.createElement('canvas')
      c.width = Math.round(img.width * scale); c.height = Math.round(img.height * scale)
      const ctx = c.getContext('2d')
      if (!ctx) return reject(new Error('No se pudo procesar la imagen'))
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height)
      ctx.drawImage(img, 0, 0, c.width, c.height)
      URL.revokeObjectURL(url)
      resolve(c.toDataURL('image/jpeg', 0.82))
    }
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('No se pudo leer la imagen')) }
    img.src = url
  })
}

const input = 'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:border-[#0284c7] focus:outline-none'

export default function TestimoniosAdmin() {
  const fileRef = useRef<HTMLInputElement>(null)
  const swapRef = useRef<HTMLInputElement>(null)
  const swapId = useRef<string>('')
  const [items, setItems] = useState<Item[]>([])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ t: string; ok: boolean } | null>(null)
  const [mode, setMode] = useState<'IMAGE' | 'TEXT' | 'VIDEO'>('IMAGE')
  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [videoUrl, setVideoUrl] = useState('')

  const load = useCallback(async () => {
    const r = await fetch('/api/admin/testimonials', { cache: 'no-store' })
    const d = await r.json().catch(() => ({}))
    if (r.ok) setItems(d.items || [])
  }, [])
  useEffect(() => { load() }, [load])

  const notify = (t: string, ok: boolean) => { setMsg({ t, ok }); setTimeout(() => setMsg(null), 5000) }

  const post = async (body: any) => {
    const r = await fetch('/api/admin/testimonials', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const d = await r.json().catch(() => ({}))
    if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`)
  }

  const uploadPhotos = async (files: FileList | null) => {
    if (!files || !files.length) return
    setBusy(true)
    let n = 0
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/')) continue
      try {
        const image = await resize(f)
        await post({ image, name: files.length === 1 ? name : '', caption: files.length === 1 ? text : '' })
        n++
      } catch (e: any) { notify(e?.message || 'Error al subir', false) }
    }
    if (n) { notify(n === 1 ? 'Testimonio publicado' : `${n} testimonios publicados`, true); setName(''); setText('') }
    if (fileRef.current) fileRef.current.value = ''
    setBusy(false); load()
  }

  const publishNonPhoto = async () => {
    setBusy(true)
    try {
      await post(mode === 'VIDEO' ? { videoUrl, name, caption: text } : { name, caption: text })
      notify('Testimonio publicado', true); setName(''); setText(''); setVideoUrl('')
    } catch (e: any) { notify(e?.message || 'Error', false) }
    setBusy(false); load()
  }

  const call = async (method: string, body?: any, qs = '') => {
    const r = await fetch('/api/admin/testimonials' + qs, { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined })
    if (!r.ok) { const d = await r.json().catch(() => ({})); notify(d.error || 'No se pudo completar', false) }
    load()
  }

  const swapPhoto = async (file: File | null) => {
    if (!file || !swapId.current) return
    try { await call('PATCH', { id: swapId.current, image: await resize(file) }); notify('Foto actualizada', true) }
    catch (e: any) { notify(e?.message || 'Error', false) }
    if (swapRef.current) swapRef.current.value = ''
  }

  const tab = (k: 'IMAGE' | 'TEXT' | 'VIDEO', label: string, Icon: any) => (
    <button type="button" onClick={() => setMode(k)}
      className={`inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold cursor-pointer ${mode === k ? 'border-[#0284c7] bg-[#f0f9ff] text-[#0284c7]' : 'border-gray-200 text-gray-500'}`}>
      <Icon size={14} /> {label}
    </button>
  )

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-5 md:p-8">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[#1d1d1f]">Testimonios de alumnos</h1>
        <p className="mt-1 text-xs text-gray-500">Lo que publiques aparece en la página principal, en columna vertical, debajo del video. El más nuevo queda arriba. Puedes usar fotos, textos o videos.</p>
      </div>

      {msg && <div className={`rounded-2xl border p-3 text-xs font-bold ${msg.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700'}`}>{msg.t}</div>}

      <div className="space-y-3 rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">{tab('IMAGE', 'Foto', ImageIcon)}{tab('TEXT', 'Texto', Type)}{tab('VIDEO', 'Video', Video)}</div>
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={80} placeholder="Nombre del alumno (opcional)" className={input} />
        {mode === 'VIDEO' && <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="Enlace del video: YouTube, Vimeo o archivo .mp4" className={input} />}
        <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={1500} rows={mode === 'TEXT' ? 5 : 2}
          placeholder={mode === 'TEXT' ? 'Escribe el testimonio...' : 'Texto debajo (opcional)'} className={input} />
        {mode === 'IMAGE' ? (
          <>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => uploadPhotos(e.target.files)} />
            <button type="button" disabled={busy} onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0284c7] px-5 py-3 text-xs font-bold text-white hover:bg-[#0369a1] disabled:opacity-50 cursor-pointer">
              <ImagePlus size={16} /> {busy ? 'Subiendo...' : 'Elegir fotos y publicar'}
            </button>
            <p className="text-[11px] text-gray-400">Si eliges varias fotos a la vez, se publican sin nombre ni texto.</p>
          </>
        ) : (
          <button type="button" disabled={busy || (mode === 'TEXT' ? !text.trim() : !videoUrl.trim())} onClick={publishNonPhoto}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0284c7] px-5 py-3 text-xs font-bold text-white hover:bg-[#0369a1] disabled:opacity-50 cursor-pointer">
            {busy ? 'Publicando...' : 'Publicar'}
          </button>
        )}
      </div>

      <input ref={swapRef} type="file" accept="image/*" className="hidden" onChange={(e) => swapPhoto(e.target.files?.[0] || null)} />

      {items.length === 0 ? (
        <p className="py-10 text-center text-xs font-bold text-gray-400">Todavía no hay testimonios. La sección no se muestra en la página hasta que publiques el primero.</p>
      ) : (
        <div className="space-y-3">
          {items.map((it, i) => (
            <div key={it.id} className={`flex flex-col gap-4 rounded-3xl border bg-white p-4 shadow-sm sm:flex-row ${it.isPublished ? 'border-gray-200' : 'border-amber-200 opacity-70'}`}>
              <div className="sm:w-56 sm:shrink-0">
                {it.hasImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={`/api/public/testimonials/${it.id}?v=${new Date(it.updatedAt).getTime()}`} alt="Testimonio" className="h-40 w-full rounded-2xl border border-gray-100 bg-gray-50 object-contain" />
                ) : (
                  <div className="flex h-40 w-full items-center justify-center rounded-2xl border border-gray-100 bg-gray-50 text-gray-400">
                    {it.kind === 'VIDEO' ? <Video size={34} /> : <Type size={34} />}
                  </div>
                )}
                <p className="mt-1 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">{it.kind === 'VIDEO' ? 'Video' : it.hasImage ? 'Foto' : 'Texto'}</p>
              </div>
              <div className="flex-1 space-y-2">
                <input defaultValue={it.name ?? ''} maxLength={80} placeholder="Nombre del alumno"
                  onBlur={(e) => { if (e.target.value !== (it.name ?? '')) call('PATCH', { id: it.id, name: e.target.value }) }} className={input} />
                <textarea defaultValue={it.caption ?? ''} maxLength={1500} rows={3} placeholder="Texto"
                  onBlur={(e) => { if (e.target.value !== (it.caption ?? '')) call('PATCH', { id: it.id, caption: e.target.value }) }} className={input} />
                <input defaultValue={it.videoUrl ?? ''} placeholder="Enlace de video (YouTube, Vimeo o .mp4)"
                  onBlur={(e) => { if (e.target.value !== (it.videoUrl ?? '')) call('PATCH', { id: it.id, videoUrl: e.target.value }) }} className={input} />
                <div className="flex flex-wrap gap-2">
                  <button type="button" disabled={i === 0} onClick={() => call('PATCH', { id: it.id, move: 'up' })} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-600 disabled:opacity-40 cursor-pointer"><ArrowUp size={13} /> Subir</button>
                  <button type="button" disabled={i === items.length - 1} onClick={() => call('PATCH', { id: it.id, move: 'down' })} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-600 disabled:opacity-40 cursor-pointer"><ArrowDown size={13} /> Bajar</button>
                  <button type="button" onClick={() => { swapId.current = it.id; swapRef.current?.click() }} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-600 cursor-pointer"><ImagePlus size={13} /> {it.hasImage ? 'Cambiar foto' : 'Agregar foto'}</button>
                  {it.hasImage && <button type="button" onClick={() => call('PATCH', { id: it.id, image: null })} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-600 cursor-pointer">Quitar foto</button>}
                  <button type="button" onClick={() => call('PATCH', { id: it.id, isPublished: !it.isPublished })} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-1.5 text-[11px] font-bold text-gray-600 cursor-pointer">
                    {it.isPublished ? <><EyeOff size={13} /> Ocultar</> : <><Eye size={13} /> Mostrar</>}
                  </button>
                  <button type="button" onClick={() => { if (window.confirm('¿Eliminar este testimonio?')) call('DELETE', undefined, `?id=${it.id}`) }} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-3 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-50 cursor-pointer"><Trash2 size={13} /> Eliminar</button>
                </div>
                {!it.isPublished && <p className="text-[11px] font-bold text-amber-600">Oculto: no se ve en la página.</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
