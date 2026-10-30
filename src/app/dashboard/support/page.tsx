'use client'

import { useState } from 'react'
import {
  Headphones,
  Mail,
  MessageCircle,
  Send,
  CheckCircle,
  Clock,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'

export default function SupportPage() {
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject || !message) return
    setSent(true)
    setTimeout(() => {
      setSubject('')
      setMessage('')
      setSent(false)
    }, 4000)
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <span className="text-[11px] font-bold text-[#0284c7] tracking-wider uppercase block">
          ATENCIÓN AL ALUMNO
        </span>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#1d1d1f] flex items-center gap-2.5 mt-0.5">
          <Headphones size={22} className="text-[#0284c7]" />
          Soporte y Asistencia
        </h1>
        <p className="text-[#86868b] text-[13px] mt-1">
          ¿Tienes dudas sobre las clases, tu cuenta o tu operativa? Estamos aquí para ayudarte.
        </p>
      </div>

      {/* Quick Channels */}
      <div className="grid sm:grid-cols-2 gap-4">
        {/* WhatsApp Direct */}
        <div className="bg-white rounded-2xl p-6 border border-[#ededf0] shadow-sm hover:border-[#fcd5c3] transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#eefaf2] text-[#24a148] flex items-center justify-center">
            <MessageCircle size={20} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#1d1d1f]">Soporte Directo por WhatsApp</h3>
            <p className="text-[12px] text-[#6e6e73] mt-1 leading-relaxed">
              Comunícate directamente con el equipo de mentoría para resolver dudas operativas urgentes o consultas de acceso.
            </p>
          </div>
          <div className="pt-1">
            <a
              href="https://wa.me/5491112345678"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#24a148] hover:bg-[#1e8e3e] text-white text-[12px] font-semibold transition-all shadow-sm"
            >
              <span>Abrir WhatsApp</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        {/* Email Support */}
        <div className="bg-white rounded-2xl p-6 border border-[#ededf0] shadow-sm hover:border-[#fcd5c3] transition-all space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[#f0f9ff] text-[#0284c7] flex items-center justify-center">
            <Mail size={20} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-[#1d1d1f]">Correo Institucional</h3>
            <p className="text-[12px] text-[#6e6e73] mt-1 leading-relaxed">
              Escríbenos para temas administrativos, revisión de análisis detallados o consultas sobre el contenido del aula.
            </p>
          </div>
          <div className="pt-1">
            <a
              href="mailto:soporte@invictusmaster.com"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#e5e5ea] hover:bg-[#f8f8fa] text-[#1d1d1f] text-[12px] font-semibold transition-all"
            >
              <span>soporte@invictusmaster.com</span>
              <Mail size={13} className="text-[#888]" />
            </a>
          </div>
        </div>
      </div>

      {/* Ticket / Query Form */}
      <div className="bg-white rounded-2xl p-6 border border-[#ededf0] shadow-sm space-y-5">
        <div>
          <h2 className="text-[15px] font-bold text-[#1d1d1f] flex items-center gap-2">
            <Send size={16} className="text-[#0284c7]" />
            Enviar Mensaje al Equipo de Mentoría
          </h2>
          <p className="text-[12px] text-[#86868b] mt-0.5">
            Te responderemos dentro del horario de atención habitual (Lunes a Viernes de 09:00 a 19:00 hs).
          </p>
        </div>

        {sent ? (
          <div className="p-5 rounded-2xl bg-[#f0faf4] border border-[#b9e6cc] text-[#24a148] flex items-center gap-3 text-[13px]">
            <CheckCircle size={18} />
            <div>
              <p className="font-bold">¡Mensaje enviado con éxito!</p>
              <p className="text-[12px] text-[#2e7d44]">
                El equipo de Invictus Master responderá a tu correo registrado a la brevedad.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                Asunto de la consulta
              </label>
              <input
                type="text"
                placeholder="Ej: Duda sobre el Módulo 2 o ejercicio práctico"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full bg-white border border-[#e5e5ea] rounded-xl px-4 py-2.5 text-[13px] focus:outline-none focus:border-[#0284c7]"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#86868b] uppercase tracking-wider">
                Detalle del mensaje
              </label>
              <textarea
                rows={4}
                placeholder="Describe tu consulta con el mayor detalle posible..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="w-full bg-white border border-[#e5e5ea] rounded-xl p-4 text-[13px] focus:outline-none focus:border-[#0284c7] resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5 text-[11px] text-[#86868b]">
                <Clock size={13} className="text-[#0284c7]" />
                <span>Tiempo estimado de respuesta: menos de 24 hs</span>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0284c7] hover:bg-[#cf4c17] active:scale-95 text-white text-[13px] font-semibold flex items-center gap-1.5 transition-all shadow-sm"
              >
                <Send size={14} />
                <span>Enviar Consulta</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
