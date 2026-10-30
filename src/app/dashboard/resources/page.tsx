'use client'

import {
  FolderOpen,
  Download,
  FileText,
  FileSpreadsheet,
  TrendingUp,
  Bookmark,
  ExternalLink,
  CheckCircle,
} from 'lucide-react'

const resources = [
  {
    category: 'Plantillas y Hojas de Cálculo',
    items: [
      {
        title: 'Calculadora de Gestión de Riesgo y Posición (Excel / Sheets)',
        desc: 'Calcula automáticamente el lotaje exacto según tu porcentaje de riesgo por operación (1% o 2%).',
        format: 'XLSX / Google Sheets',
        size: '1.4 MB',
        icon: FileSpreadsheet,
        tag: 'Esencial',
      },
      {
        title: 'Bitácora & Diario de Trading Profesional',
        desc: 'Registro completo de entradas, salidas, capturas de pantalla, ratio riesgo/beneficio y métricas de rendimiento.',
        format: 'XLSX',
        size: '2.8 MB',
        icon: FileSpreadsheet,
        tag: 'Recomendado',
      },
    ],
  },
  {
    category: 'Guías y Manuales en PDF',
    items: [
      {
        title: 'Manual de Trading Institucional - Smart Money Concepts',
        desc: 'Estructuras de mercado, Order Blocks, Liquidez y Fair Value Gaps explicados paso a paso.',
        format: 'PDF HD',
        size: '14.2 MB',
        icon: FileText,
        tag: 'PDF',
      },
      {
        title: 'Checklist de Confirmación Antes de Cada Entrada',
        desc: 'Protocolo de 5 pasos antes de presionar comprar o vender para eliminar la impulsividad.',
        format: 'PDF',
        size: '850 KB',
        icon: Bookmark,
        tag: 'PDF',
      },
      {
        title: 'Plan de Trading y Rutina Diaria del Operador',
        desc: 'Horarios de sesiones (London & New York Killzones), preparación pre-mercado y reglas de desconexión.',
        format: 'PDF',
        size: '2.1 MB',
        icon: FileText,
        tag: 'PDF',
      },
    ],
  },
  {
    category: 'Herramientas de Análisis',
    items: [
      {
        title: 'Configuración Recomendada de Gráficos (TradingView)',
        desc: 'Esquema de colores institucionales sin distracciones, indicadores de sesiones y zonas horarias.',
        format: 'Enlace / Script',
        size: 'Web',
        icon: TrendingUp,
        tag: 'TradingView',
      },
    ],
  },
]

function ResourceDownloadCard({ item }: { item: any }) {
  const Icon = item.icon

  const handleDownload = () => {
    alert(`Descargando recurso: ${item.title}`)
  }

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#ededf0] hover:border-[#fcd5c3] shadow-sm transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-[#fffaf8] border border-[#fcd5c3] text-[#0284c7] flex items-center justify-center shrink-0 mt-0.5">
          <Icon size={18} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-bold text-[#1d1d1f] leading-snug">
              {item.title}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f8f8fa] text-[#666] border border-[#e5e5ea]">
              {item.tag}
            </span>
          </div>
          <p className="text-[12px] text-[#6e6e73] leading-relaxed max-w-2xl">
            {item.desc}
          </p>
          <div className="flex items-center gap-3 text-[11px] text-[#999] pt-1">
            <span>Formato: {item.format}</span>
            <span>&bull;</span>
            <span>Tamaño: {item.size}</span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDownload}
        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#fffaf8] hover:bg-[#fff0e8] border border-[#fcd5c3] text-[#0284c7] text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-all shrink-0 active:scale-95"
      >
        <Download size={14} />
        <span>Descargar</span>
      </button>
    </div>
  )
}

export default function ResourcesPage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
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

      {/* Sections */}
      <div className="space-y-6">
        {resources.map((sec, idx) => (
          <div key={idx} className="space-y-3">
            <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#86868b]">
              {sec.category}
            </h2>
            <div className="space-y-3">
              {sec.items.map((item, i) => (
                <ResourceDownloadCard key={i} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
