'use client'

import { useEffect, useState } from 'react'
import {
  FolderOpen,
  Download,
  FileText,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  ExternalLink,
  Globe,
  Users,
  GraduationCap,
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

const ACCESS_BADGE: Record<string, { label: string; cls: string; icon: any }> = {
  ALL: { label: 'Para todos', cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: Globe },
  CLUB: { label: 'Club', cls: 'bg-sky-100 text-sky-700 border-sky-200', icon: Users },
  MENTORIA: { label: 'Mentoría', cls: 'bg-[#f0f9ff] text-[#0284c7] border-sky-200', icon: GraduationCap },
}

const KNOWN_EXT = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'csv', 'zip', 'rar', 'png', 'jpg', 'jpeg', 'webp']

function extOf(name: string | null, url: string) {
  const src = (name || url || '').split('?')[0]
  const ext = (src.includes('.') ? src.split('.').pop() || '' : '').toLowerCase()
  return KNOWN_EXT.includes(ext) ? ext : ''
}

function iconFor(ext: string) {
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet
  if (['zip', 'rar'].includes(ext)) return FileArchive
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return FileImage
  return FileText
}

function fmtSize(bytes: number | null) {
  if (!bytes) return null
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function ResourceCard({ item }: { item: Item }) {
  const ext = extOf(item.fileName, item.fileUrl)
  const Icon = iconFor(ext)
  const badge = ACCESS_BADGE[item.allowedRole] || ACCESS_BADGE.ALL
  const size = fmtSize(item.fileSize)
  const isLink = !item.fileName

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#ededf0] hover:border-[#bae6fd] shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-[#f0f9ff] border border-[#bae6fd] text-[#0284c7] flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={18} />
        </div>
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[14px] font-bold text-[#1d1d1f] leading-snug">{item.title}</h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.cls}`}>
              {badge.label}
            </span>
          </div>
          {item.description && (
            <p className="text-[12px] text-[#6e6e73] leading-relaxed max-w-2xl">{item.description}</p>
          )}
          {(ext || size) && (
            <div className="flex items-center gap-3 text-[11px] text-[#999] pt-1">
              {ext && <span>Formato: {ext.toUpperCase()}</span>}
              {ext && size && <span>&bull;</span>}
              {size && <span>Tamaño: {size}</span>}
            </div>
          )}
        </div>
      </div>

      <a
        href={item.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#f0f9ff] hover:bg-[#e0f2fe] border border-[#bae6fd] text-[#0284c7] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95"
      >
        {isLink ? <ExternalLink size={14} /> : <Download size={14} />}
        <span>{isLink ? 'Abrir' : 'Descargar'}</span>
      </a>
    </div>
  )
}

export default function ResourcesPage() {
  const [items, setItems] = useState<Item[] | null>(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch('/api/student/resources', { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.items)) setItems(d.items)
        else setErr(d.error || 'No se pudieron cargar los recursos')
      })
      .catch(() => setErr('No se pudo conectar con el servidor'))
  }, [])

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-[11px] font-bold text-[#0284c7] tracking-wider uppercase block">
          MATERIAL EXCLUSIVO
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2.5 mt-0.5">
          <FolderOpen size={22} className="text-[#0284c7]" />
          Recursos y Herramientas de Estudio
        </h1>
        <p className="text-[#86868b] text-[13px] mt-1">
          Descarga plantillas, bitácoras, guías de estudio y hojas de cálculo para complementar tu formación.
        </p>
      </div>

      {err && (
        <div className="p-4 rounded-2xl text-xs font-bold bg-rose-50 border border-rose-200 text-rose-700">{err}</div>
      )}

      {items === null && !err && (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-xs text-gray-400">
          Cargando recursos...
        </div>
      )}

      {items !== null && items.length === 0 && (
        <div className="bg-white rounded-2xl p-8 text-center border border-gray-100 text-xs text-gray-400">
          Todavía no hay recursos disponibles para tu nivel. Vuelve a revisar más adelante.
        </div>
      )}

      {items && items.length > 0 && (
        <div className="space-y-3">
          {items.map((it) => (
            <ResourceCard key={it.id} item={it} />
          ))}
        </div>
      )}
    </div>
  )
}
