'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import {
  ArrowRight, Video, BookOpen, TrendingUp, Radio, ShieldCheck, Target, Layers,
  Menu, X, Check, ChevronDown, Sparkles, UserPlus, BadgeCheck, PlayCircle,
} from 'lucide-react'

const LOGIN_HREF = '/login'
const REGISTER_HREF = '/register'

/* ---------- Aparición al hacer scroll ---------- */
function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShow(true)
          io.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div ref={ref} className={`reveal ${show ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ---------- Tarjeta con resplandor que sigue al cursor ---------- */
function SpotCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
    e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
  }
  return (
    <div onMouseMove={onMove} className={`spot ${className}`}>
      {children}
    </div>
  )
}

const features = [
  { icon: Video, title: 'Clases y grabaciones', text: 'Biblioteca de clases organizada por módulos. Míralas cuando quieras y retoma donde lo dejaste.' },
  { icon: Radio, title: 'Sesiones en vivo', text: 'Sala de trading abierta para seguir la operativa de Nueva York en tiempo real.' },
  { icon: BookOpen, title: 'Material educativo', text: 'PDFs, guías y recursos complementarios para estudiar y repasar la metodología.' },
  { icon: TrendingUp, title: 'Bitácora operativa', text: 'Registra y revisa tu operativa para medir tu progreso con datos, no con intuición.' },
  { icon: Target, title: 'Foco en MNQ', text: 'Todo el contenido se centra en el Micro Nasdaq bajo la metodología ICT.' },
  { icon: ShieldCheck, title: 'Comunidad con acceso controlado', text: 'Cada alumno es aprobado manualmente: un entorno cuidado y enfocado en trabajar.' },
]

const steps = [
  { icon: UserPlus, title: 'Crea tu cuenta', text: 'Regístrate con tu correo en un minuto.' },
  { icon: BadgeCheck, title: 'Aprobación', text: 'El equipo revisa tu solicitud y activa tu acceso.' },
  { icon: PlayCircle, title: 'Empieza a aprender', text: 'Entra a las clases, el material y las sesiones de tu nivel.' },
]

const faqs = [
  { q: '¿Cómo obtengo acceso?', a: 'Crea tu cuenta y espera la aprobación del equipo. Cuando tu solicitud sea aprobada podrás iniciar sesión y ver el contenido de tu nivel.' },
  { q: '¿Qué diferencia hay entre CLUB y MENTORÍA?', a: 'CLUB da acceso al contenido del club. MENTORÍA incluye todo lo de CLUB y suma el contenido exclusivo del programa de mentoría.' },
  { q: '¿Las clases quedan grabadas?', a: 'Sí. Las clases y grabaciones están disponibles en la plataforma para verlas cuando quieras.' },
  { q: '¿En qué activo se enfoca el contenido?', a: 'En el Micro Nasdaq (MNQ), operado con la metodología ICT y ejecución institucional.' },
]

const ticker = ['MNQ · NASDAQ', 'ORDER BLOCKS', 'LIQUIDEZ', 'FAIR VALUE GAPS', 'KILL ZONES', 'ESTRUCTURA DE MERCADO', 'SESIÓN DE NUEVA YORK', 'GESTIÓN DE RIESGO']

const words = ['Disciplina', 'Precisión', 'Estructura', 'Ejecución']

// Velas decorativas del hero: [alto, desplazamiento, alcista]
const candles: [number, number, boolean][] = [
  [36, 70, true], [52, 58, false], [44, 50, true], [64, 38, true], [40, 44, false],
  [70, 28, true], [48, 34, true], [58, 22, false], [76, 14, true], [50, 18, true],
]

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)
  const [menu, setMenu] = useState(false)
  const [wordIdx, setWordIdx] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setWordIdx((i) => (i + 1) % words.length), 2400)
    return () => clearInterval(t)
  }, [])

  const nav = [
    { href: '#metodo', label: 'Metodología' },
    { href: '#plataforma', label: 'Plataforma' },
    { href: '#planes', label: 'Planes' },
    { href: '#faq', label: 'Preguntas' },
  ]

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-white text-slate-800 antialiased">
      <style>{`
        @keyframes floaty { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-14px) } }
        @keyframes orb { 0%,100% { transform: translate(0,0) scale(1) } 50% { transform: translate(40px,-30px) scale(1.15) } }
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        @keyframes draw { to { stroke-dashoffset: 0 } }
        @keyframes rise { from { transform: scaleY(0) } to { transform: scaleY(1) } }
        @keyframes shine { from { transform: translateX(-120%) skewX(-20deg) } to { transform: translateX(220%) skewX(-20deg) } }
        @keyframes pulseRing { 0% { box-shadow: 0 0 0 0 rgba(14,165,233,.5) } 100% { box-shadow: 0 0 0 14px rgba(14,165,233,0) } }
        @keyframes wordIn { from { opacity: 0; transform: translateY(16px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes gridMove { to { background-position: 0 56px } }
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1) }
        .reveal.in { opacity: 1; transform: none }
        .grid-bg { background-image: linear-gradient(rgba(14,165,233,.10) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,.10) 1px, transparent 1px); background-size: 56px 56px; animation: gridMove 6s linear infinite; mask-image: radial-gradient(ellipse at 50% 30%, #000 30%, transparent 75%); -webkit-mask-image: radial-gradient(ellipse at 50% 30%, #000 30%, transparent 75%) }
        .text-grad { background: linear-gradient(100deg, #0ea5e9, #38bdf8 50%, #0ea5e9); -webkit-background-clip: text; background-clip: text; color: transparent }
        .btn-blue { background: linear-gradient(135deg, #0ea5e9, #0284c7) }
        .btn-shine { position: relative; overflow: hidden }
        .btn-shine::after { content: ''; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.55), transparent); animation: shine 3.2s ease-in-out infinite }
        .spot { position: relative; overflow: hidden; border-radius: 1.5rem; border: 1px solid #e0f2fe; background: #ffffff; box-shadow: 0 4px 24px -8px rgba(14,165,233,.15); transition: transform .35s, border-color .35s, box-shadow .35s }
        .spot::before { content: ''; position: absolute; inset: 0; opacity: 0; transition: opacity .3s; background: radial-gradient(380px circle at var(--mx,50%) var(--my,50%), rgba(56,189,248,.22), transparent 60%) }
        .spot:hover { transform: translateY(-6px); border-color: #7dd3fc; box-shadow: 0 18px 40px -12px rgba(14,165,233,.35) }
        .spot:hover::before { opacity: 1 }
        .spot > * { position: relative }
        @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important } .reveal { opacity: 1; transform: none } }
      `}</style>

      {/* ================= NAVBAR ================= */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? 'border-b border-sky-100 bg-white/80 shadow-sm backdrop-blur-xl' : ''}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="btn-blue flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-white shadow-lg shadow-sky-400/40">IC</span>
            <span className="text-sm font-black tracking-tight text-slate-900">INVICTUS <span className="text-sky-500">CAMPUS</span></span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((n) => (
              <a key={n.href} href={n.href} className="text-xs font-bold text-slate-600 transition-colors hover:text-sky-500">{n.label}</a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link href={LOGIN_HREF} className="rounded-full px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:text-sky-500">Iniciar sesión</Link>
            <Link href={REGISTER_HREF} className="btn-blue btn-shine rounded-full px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-sky-400/40 transition-transform hover:scale-105">
              Crear cuenta
            </Link>
          </div>

          <button type="button" onClick={() => setMenu(!menu)} className="rounded-xl p-2 text-slate-800 md:hidden" aria-label="Menú">
            {menu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {menu && (
          <div className="border-t border-sky-100 bg-white/95 px-5 pb-5 pt-3 backdrop-blur-xl md:hidden">
            {nav.map((n) => (
              <a key={n.href} href={n.href} onClick={() => setMenu(false)} className="block py-3 text-sm font-bold text-slate-700">{n.label}</a>
            ))}
            <div className="mt-3 flex gap-2">
              <Link href={LOGIN_HREF} className="flex-1 rounded-full border border-sky-200 py-3 text-center text-xs font-bold text-sky-600">Iniciar sesión</Link>
              <Link href={REGISTER_HREF} className="btn-blue flex-1 rounded-full py-3 text-center text-xs font-bold text-white">Crear cuenta</Link>
            </div>
          </div>
        )}
      </header>

      {/* ================= HERO ================= */}
      <section className="relative isolate flex min-h-screen items-center overflow-hidden bg-gradient-to-b from-sky-50/70 via-white to-white px-5 pb-20 pt-32 md:px-8">
        <div className="grid-bg absolute inset-0 -z-10" />
        <div className="absolute -left-32 top-10 -z-10 h-[420px] w-[420px] rounded-full bg-sky-300/40 blur-[120px]" style={{ animation: 'orb 14s ease-in-out infinite' }} />
        <div className="absolute -right-32 top-1/3 -z-10 h-[460px] w-[460px] rounded-full bg-cyan-200/50 blur-[130px]" style={{ animation: 'orb 18s ease-in-out infinite reverse' }} />

        <div className="mx-auto grid w-full max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white/80 px-4 py-1.5 text-[11px] font-bold text-sky-700 shadow-sm backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-sky-500" style={{ animation: 'pulseRing 1.8s infinite' }} />
                Metodología ICT · Micro Nasdaq (MNQ)
              </span>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="mt-6 text-4xl font-black leading-[1.05] tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Opera con{' '}
                <span key={wordIdx} className="text-grad inline-block" style={{ animation: 'wordIn .6s ease both' }}>
                  {words[wordIdx]}
                </span>
                <br />
                como un institucional.
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600">
                Invictus Campus es la plataforma donde estudias, practicas y operas el Nasdaq con estructura: clases grabadas,
                sesiones en vivo, material y seguimiento de tu operativa en un solo lugar.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href={REGISTER_HREF} className="btn-blue btn-shine group inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-sm font-bold text-white shadow-xl shadow-sky-400/40 transition-transform hover:scale-105">
                  Empezar ahora
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href={LOGIN_HREF} className="inline-flex items-center justify-center rounded-full border border-sky-200 bg-white px-8 py-4 text-sm font-bold text-sky-700 transition-colors hover:border-sky-400 hover:bg-sky-50">
                  Ya tengo cuenta
                </Link>
              </div>
            </Reveal>

            <Reveal delay={400}>
              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-slate-500">
                {['Clases grabadas', 'Sesiones en vivo', 'Acceso por niveles'].map((t) => (
                  <span key={t} className="flex items-center gap-1.5"><Check size={14} className="text-sky-500" />{t}</span>
                ))}
              </div>
            </Reveal>
          </div>

          {/* Gráfico animado */}
          <Reveal delay={250} className="relative">
            <div className="relative rounded-[2rem] border border-sky-100 bg-white p-6 shadow-2xl shadow-sky-200/60" style={{ animation: 'floaty 7s ease-in-out infinite' }}>
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-500"><TrendingUp size={16} /></span>
                  <div>
                    <p className="text-xs font-black text-slate-900">MNQ · Nasdaq</p>
                    <p className="text-[10px] text-slate-400">Sesión de Nueva York</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" style={{ animation: 'pulseRing 1.8s infinite' }} /> En vivo
                </span>
              </div>

              <svg viewBox="0 0 400 220" className="h-auto w-full">
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity=".4" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[40, 90, 140, 190].map((y) => (
                  <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="#e0f2fe" />
                ))}
                {candles.map(([h, y, up], i) => (
                  <g key={i} style={{ transformOrigin: `${28 + i * 38}px 200px`, animation: `rise .7s ${0.1 * i}s both cubic-bezier(.2,.7,.2,1)` }}>
                    <line x1={28 + i * 38} x2={28 + i * 38} y1={y * 2 - 8} y2={y * 2 + h + 10} stroke={up ? '#10b981' : '#f43f5e'} strokeWidth="1.5" />
                    <rect x={21 + i * 38} y={y * 2} width="14" height={h} rx="3" fill={up ? '#10b981' : '#f43f5e'} opacity=".9" />
                  </g>
                ))}
                <path d="M0 190 C40 170 70 175 100 150 S160 120 190 110 S250 90 280 70 S340 40 400 20 L400 220 L0 220Z" fill="url(#area)" />
                <path
                  d="M0 190 C40 170 70 175 100 150 S160 120 190 110 S250 90 280 70 S340 40 400 20"
                  fill="none" stroke="#0ea5e9" strokeWidth="3" strokeLinecap="round"
                  strokeDasharray="700" strokeDashoffset="700" style={{ animation: 'draw 2.6s .4s ease-out forwards' }}
                />
              </svg>

              <div className="mt-4 grid grid-cols-3 gap-3 text-center">
                {[['Estructura', 'Alcista'], ['Liquidez', 'Barrida'], ['Zona', 'Order Block']].map(([k, v]) => (
                  <div key={k} className="rounded-2xl bg-sky-50 px-2 py-3">
                    <p className="text-[10px] text-slate-400">{k}</p>
                    <p className="text-xs font-bold text-slate-800">{v}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -bottom-5 -left-4 hidden items-center gap-2 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-xl shadow-sky-200/50 sm:flex" style={{ animation: 'floaty 6s 1s ease-in-out infinite' }}>
              <Sparkles size={16} className="text-sky-500" />
              <span className="text-xs font-bold text-slate-800">Clases nuevas cada semana</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= CINTA ================= */}
      <div className="overflow-hidden border-y border-sky-100 bg-sky-50 py-4">
        <div className="flex w-max gap-12 whitespace-nowrap" style={{ animation: 'marquee 32s linear infinite' }}>
          {[...ticker, ...ticker].map((t, i) => (
            <span key={i} className="flex items-center gap-12 text-xs font-black tracking-[0.25em] text-sky-700/70">
              {t}<span className="text-sky-400">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ================= METODOLOGÍA ================= */}
      <section id="metodo" className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sky-500">Metodología</p>
          <h2 className="text-grad mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Una forma estructurada de leer el mercado</h2>
          <p className="mt-4 max-w-2xl text-slate-600">
            Aprende a identificar order blocks, liquidez y puntos institucionales en temporalidades menores, y a ejecutar con un plan definido.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: Layers, t: 'Estructura de mercado', d: 'Lee la dirección del precio y entiende dónde está el interés institucional.' },
            { icon: Target, t: 'Puntos de entrada', d: 'Order blocks, fair value gaps y zonas de liquidez con criterios claros.' },
            { icon: ShieldCheck, t: 'Gestión del riesgo', d: 'Define tu riesgo antes de entrar. La constancia se construye protegiendo el capital.' },
          ].map((f, i) => (
            <Reveal key={f.t} delay={i * 120}>
              <SpotCard className="h-full p-7">
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-500"><f.icon size={22} /></span>
                <h3 className="text-lg font-black text-sky-600">{f.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.d}</p>
              </SpotCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= PLATAFORMA ================= */}
      <section id="plataforma" className="relative bg-gradient-to-b from-white via-sky-50/70 to-white py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <Reveal>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sky-500">Plataforma</p>
            <h2 className="text-grad mt-3 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Todo lo que necesitas, en un solo campus</h2>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 100}>
                <SpotCard className="h-full p-6">
                  <span className="btn-blue mb-4 flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-md shadow-sky-300/50"><f.icon size={20} /></span>
                  <h3 className="text-base font-black text-sky-600">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.text}</p>
                </SpotCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PASOS ================= */}
      <section className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <Reveal>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sky-500">Cómo funciona</p>
          <h2 className="text-grad mt-3 text-3xl font-black tracking-tight sm:text-4xl">Tres pasos para entrar</h2>
        </Reveal>

        <div className="relative mt-12 grid gap-6 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-8 hidden h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 150}>
              <div className="relative text-center">
                <span className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-500 shadow-md shadow-sky-100" style={{ animation: 'pulseRing 2.4s infinite' }}>
                  <s.icon size={24} />
                  <span className="btn-blue absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-black text-white">{i + 1}</span>
                </span>
                <h3 className="text-base font-black text-sky-600">{s.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-sm text-slate-600">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ================= PLANES ================= */}
      <section id="planes" className="mx-auto max-w-5xl px-5 py-24 md:px-8">
        <Reveal>
          <div className="text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-sky-500">Niveles de acceso</p>
            <h2 className="text-grad mt-3 text-3xl font-black tracking-tight sm:text-4xl">Elige tu camino</h2>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Reveal>
            <SpotCard className="h-full p-8">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Club</p>
              <h3 className="mt-2 text-2xl font-black text-sky-600">Invictus Club</h3>
              <p className="mt-2 text-sm text-slate-600">Para quienes quieren aprender la metodología y operar con estructura.</p>
              <ul className="mt-6 space-y-3 text-sm text-slate-700">
                {['Clases y grabaciones del club', 'Material educativo', 'Sesiones en vivo', 'Bitácora operativa'].map((i) => (
                  <li key={i} className="flex items-center gap-2"><Check size={16} className="text-sky-500" />{i}</li>
                ))}
              </ul>
              <Link href={REGISTER_HREF} className="mt-8 flex items-center justify-center gap-2 rounded-full border border-sky-200 py-3.5 text-sm font-bold text-sky-700 transition-colors hover:bg-sky-50">
                Solicitar acceso <ArrowRight size={15} />
              </Link>
            </SpotCard>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative h-full rounded-3xl bg-gradient-to-br from-sky-400 via-cyan-300 to-sky-500 p-[1.5px] shadow-xl shadow-sky-200/70">
              <span className="btn-blue absolute -top-3 left-1/2 z-10 -translate-x-1/2 rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white">Más completo</span>
              <div className="h-full rounded-[calc(1.5rem-1px)] bg-white p-8">
                <p className="text-xs font-bold uppercase tracking-widest text-sky-500">Mentoría</p>
                <h3 className="mt-2 text-2xl font-black text-sky-600">Mentoría Invictus</h3>
                <p className="mt-2 text-sm text-slate-600">Todo lo del Club, más el contenido exclusivo del programa de mentoría.</p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {['Todo lo incluido en Club', 'Clases exclusivas de mentoría', 'Material avanzado', 'Seguimiento más cercano'].map((i) => (
                    <li key={i} className="flex items-center gap-2"><Check size={16} className="text-sky-500" />{i}</li>
                  ))}
                </ul>
                <Link href={REGISTER_HREF} className="btn-blue btn-shine mt-8 flex items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white shadow-lg shadow-sky-300/60 transition-transform hover:scale-[1.02]">
                  Solicitar acceso <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="mx-auto max-w-3xl px-5 py-20 md:px-8">
        <Reveal>
          <h2 className="text-grad text-center text-3xl font-black tracking-tight sm:text-4xl">Preguntas frecuentes</h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {faqs.map((f, i) => {
            const open = openFaq === i
            return (
              <Reveal key={f.q} delay={i * 80}>
                <div className={`rounded-2xl border transition-all ${open ? 'border-sky-300 bg-sky-50/60 shadow-md shadow-sky-100' : 'border-sky-100 bg-white'}`}>
                  <button type="button" onClick={() => setOpenFaq(open ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                    <span className="text-sm font-bold text-slate-800">{f.q}</span>
                    <ChevronDown size={18} className={`shrink-0 text-sky-500 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <p className="px-5 pb-5 text-sm leading-relaxed text-slate-600">{f.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* ================= CTA FINAL ================= */}
      <section className="px-5 pb-24 pt-8 md:px-8">
        <Reveal>
          <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-sky-400 via-sky-500 to-cyan-500 px-6 py-16 text-center shadow-2xl shadow-sky-300/60">
            <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-white/30 blur-[90px]" style={{ animation: 'orb 12s ease-in-out infinite' }} />
            <div className="relative">
              <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl">Tu próximo nivel empieza aquí</h2>
              <p className="mx-auto mt-4 max-w-xl text-sky-50">Únete a Invictus Campus y trabaja tu operativa con método, constancia y acompañamiento.</p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link href={REGISTER_HREF} className="btn-shine group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black text-sky-600 transition-transform hover:scale-105">
                  Crear mi cuenta <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href={LOGIN_HREF} className="rounded-full border border-white/60 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-white/15">Iniciar sesión</Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-sky-100 bg-sky-50/60 px-5 py-10 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="btn-blue flex h-9 w-9 items-center justify-center rounded-xl text-xs font-black text-white">IC</span>
            <span className="text-sm font-black text-slate-900">INVICTUS <span className="text-sky-500">CAMPUS</span></span>
          </div>
          <p className="max-w-xl text-[11px] leading-relaxed text-slate-500">
            Aviso de riesgo: operar en mercados financieros implica un riesgo significativo de pérdida. El contenido de Invictus Campus es
            exclusivamente educativo y no constituye asesoramiento financiero ni recomendación de inversión. Los resultados pasados no
            garantizan resultados futuros.
          </p>
        </div>
        <p className="mx-auto mt-8 max-w-7xl text-[11px] text-slate-400">© {new Date().getFullYear()} Invictus Campus. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}