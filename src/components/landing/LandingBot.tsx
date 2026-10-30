'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { answerFor, BOT_CONTACT, GREETING, type BotAnswer } from '@/lib/faq-bot'

interface Msg {
  id: number
  from: 'bot' | 'me'
  text: string
  actions?: { label: string; href: string }[]
  follow?: string[]
}
interface SMsg {
  id: string
  from: 'VISITOR' | 'STAFF'
  content: string
  createdAt: string
}

const KEY = 'inv-bot-v1'
const TKEY = 'inv-support-token'
const SEENKEY = 'inv-support-seen'

function hm(d: string) {
  return new Date(d).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
}

export default function LandingBot() {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<'bot' | 'support'>('bot')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [unread, setUnread] = useState(true)
  const [notices, setNotices] = useState<{ id: string; content: string }[]>([])
  const end = useRef<HTMLDivElement>(null)
  const idRef = useRef(1)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const noticesLoaded = useRef(false)

  // soporte
  const [token, setToken] = useState<string | null>(null)
  const [sMsgs, setSMsgs] = useState<SMsg[]>([])
  const [sClosed, setSClosed] = useState(false)
  const [sInput, setSInput] = useState('')
  const [sErr, setSErr] = useState('')
  const [sBusy, setSBusy] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [replyDot, setReplyDot] = useState(false)
  const seenStaff = useRef(0)
  const sEnd = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let restored: Msg[] | null = null
    try {
      const raw = sessionStorage.getItem(KEY)
      if (raw) restored = JSON.parse(raw)
    } catch {}
    if (restored && restored.length) {
      setMsgs(restored)
      idRef.current = restored.reduce((m, x) => Math.max(m, x.id), 0) + 1
    } else {
      setMsgs([{ id: 0, from: 'bot', text: GREETING.text, follow: GREETING.follow }])
    }
    try {
      const t = localStorage.getItem(TKEY)
      if (t && /^[a-f0-9]{48}$/.test(t)) setToken(t)
      seenStaff.current = parseInt(localStorage.getItem(SEENKEY) || '0', 10) || 0
    } catch {}
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [])

  useEffect(() => {
    try {
      if (msgs.length) sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-40)))
    } catch {}
    end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [msgs, typing, open, view])

  useEffect(() => {
    sEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [sMsgs, view, open])

  // Avisos fijos del equipo
  useEffect(() => {
    if (!open || noticesLoaded.current) return
    noticesLoaded.current = true
    fetch('/api/public/bot-notices')
      .then((r) => r.json())
      .then((d) => setNotices(d.notices || []))
      .catch(() => {})
  }, [open])

  const loadSupport = useCallback(async () => {
    if (!token) return
    try {
      const r = await fetch('/api/public/support/' + token, { cache: 'no-store' })
      if (r.status === 404) {
        try { localStorage.removeItem(TKEY); localStorage.removeItem(SEENKEY) } catch {}
        seenStaff.current = 0
        setToken(null)
        setSMsgs([])
        return
      }
      const d = await r.json()
      if (!r.ok) return
      setSMsgs(d.messages)
      setSClosed(d.thread.status === 'CLOSED')
      const staff = d.messages.filter((m: SMsg) => m.from === 'STAFF').length
      if (open && view === 'support') {
        seenStaff.current = staff
        try { localStorage.setItem(SEENKEY, String(staff)) } catch {}
        setReplyDot(false)
      } else if (staff > seenStaff.current) {
        setReplyDot(true)
      }
    } catch {}
  }, [token, open, view])

  useEffect(() => {
    if (!token) return
    loadSupport()
    const active = open && view === 'support'
    const t = setInterval(() => !document.hidden && loadSupport(), active ? 4000 : 20000)
    return () => clearInterval(t)
  }, [token, open, view, loadSupport])

  function push(from: 'bot' | 'me', a: Partial<BotAnswer> & { text: string }) {
    setMsgs((m) => [...m, { id: idRef.current++, from, text: a.text, actions: a.actions, follow: a.follow }])
  }

  function ask(q: string) {
    const text = q.trim().slice(0, 200)
    if (!text || typing) return
    push('me', { text })
    setInput('')
    setTyping(true)
    const ans = answerFor(text)
    timer.current = setTimeout(() => {
      setTyping(false)
      push('bot', ans)
    }, 450 + Math.min(ans.text.length * 4, 700))
  }

  function openSupport() {
    setOpen(true)
    setUnread(false)
    setView('support')
    setReplyDot(false)
  }

  async function startSupport(e: React.FormEvent) {
    e.preventDefault()
    if (sBusy) return
    setSErr('')
    setSBusy(true)
    try {
      const r = await fetch('/api/public/support', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) {
        setSErr(d.error || 'No se pudo enviar.')
      } else {
        try { localStorage.setItem(TKEY, d.token); localStorage.setItem(SEENKEY, '0') } catch {}
        seenStaff.current = 0
        setToken(d.token)
        setForm({ name: '', email: '', message: '' })
      }
    } catch {
      setSErr('Sin conexión. Inténtalo de nuevo.')
    } finally {
      setSBusy(false)
    }
  }

  async function sendSupport(e: React.FormEvent) {
    e.preventDefault()
    const text = sInput.trim()
    if (!text || !token || sBusy) return
    setSErr('')
    setSBusy(true)
    try {
      const r = await fetch('/api/public/support/' + token, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text }) })
      const d = await r.json().catch(() => ({}))
      if (!r.ok) setSErr(d.error || 'No se pudo enviar.')
      else {
        setSInput('')
        setSMsgs((m) => [...m, d.message])
      }
    } catch {
      setSErr('Sin conexión. Inténtalo de nuevo.')
    } finally {
      setSBusy(false)
    }
  }

  function newConversation() {
    try { localStorage.removeItem(TKEY); localStorage.removeItem(SEENKEY) } catch {}
    seenStaff.current = 0
    setToken(null)
    setSMsgs([])
    setSClosed(false)
  }

  const lastBotId = [...msgs].reverse().find((m) => m.from === 'bot')?.id
  const showDot = (unread && !open) || replyDot

  return (
    <>
      <style>{CSS}</style>
      <button
        className="ib-fab"
        aria-label={open ? 'Cerrar asistente' : 'Abrir asistente'}
        onClick={() => {
          setOpen((o) => !o)
          setUnread(false)
          if (!open && replyDot) setView('support')
        }}
      >
        {open ? (
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />
            <path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01" strokeWidth="2.6" />
          </svg>
        )}
        {showDot && <span className={'ib-dot' + (replyDot ? ' ib-red' : '')} />}
      </button>

      {!open && unread && !replyDot && <div className="ib-nudge" onClick={() => { setOpen(true); setUnread(false) }}>¿Dudas sobre el Club o la Mentoría? 👋</div>}
      {!open && replyDot && <div className="ib-nudge" onClick={openSupport}>El equipo respondió tu consulta 💬</div>}

      {open && (
        <section className="ib-panel" role="dialog" aria-label="Asistente de Invictus Campus">
          <header className="ib-head">
            {view === 'support' ? (
              <button className="ib-x" onClick={() => setView('bot')} aria-label="Volver al asistente">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
            ) : (
              <div className="ib-av">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
                </svg>
              </div>
            )}
            <div className="ib-ht">
              <b>{view === 'support' ? 'Soporte Invictus' : 'Asistente Invictus'}</b>
              <span><i /> {view === 'support' ? 'Te responde una persona del equipo' : 'En línea · respuestas al instante'}</span>
            </div>
            {view === 'bot' && (
              <button className="ib-x" onClick={openSupport} aria-label="Hablar con soporte" title="Hablar con soporte">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14h3v5H5a1 1 0 0 1-1-1zM20 14h-3v5h2a1 1 0 0 0 1-1z" /></svg>
              </button>
            )}
            <button className="ib-x" onClick={() => setOpen(false)} aria-label="Cerrar">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </header>

          {view === 'bot' ? (
            <>
              <div className="ib-body">
                {notices.map((n) => (
                  <div key={n.id} className="ib-notice">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 17v5M9 3h6l-1 7 3 3v2H7v-2l3-3z" /></svg>
                    <span>{n.content}</span>
                  </div>
                ))}
                {msgs.map((m) => (
                  <div key={m.id} className={'ib-row ' + m.from}>
                    <div className="ib-bub">{m.text}</div>
                    {m.from === 'bot' && ((m.actions && m.actions.length > 0) || m.id === lastBotId) && (
                      <div className="ib-acts">
                        {(m.actions || []).map((a) =>
                          a.href === '#soporte' ? (
                            <button key={a.label} onClick={openSupport}>{a.label}</button>
                          ) : (
                            <a key={a.label} href={a.href} onClick={() => a.href.startsWith('#') && setOpen(false)}>{a.label}</a>
                          )
                        )}
                        {m.actions && m.actions.length > 0 && BOT_CONTACT.url && <a href={BOT_CONTACT.url} target="_blank" rel="noopener noreferrer">{BOT_CONTACT.label}</a>}
                      </div>
                    )}
                    {m.from === 'bot' && m.id === lastBotId && m.follow && !typing && (
                      <div className="ib-chips">
                        {m.follow.map((f) => (
                          <button key={f} onClick={() => ask(f)}>{f}</button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {typing && (
                  <div className="ib-row bot"><div className="ib-bub ib-typing"><i /><i /><i /></div></div>
                )}
                <div ref={end} />
              </div>

              <form className="ib-form" onSubmit={(e) => { e.preventDefault(); ask(input) }}>
                <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe tu pregunta…" maxLength={200} aria-label="Tu pregunta" />
                <button type="submit" disabled={!input.trim() || typing} aria-label="Enviar">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>
                </button>
              </form>
              <p className="ib-foot">
                ¿Prefieres hablar con una persona? <button onClick={openSupport}>Hablar con soporte{token ? ' · ver mi conversación' : ''}</button>
              </p>
            </>
          ) : !token ? (
            <>
              <form className="ib-sform" onSubmit={startSupport}>
                <p className="ib-sintro">Déjanos tu consulta y una persona del equipo te responderá aquí mismo. Si cierras esta ventana, tu conversación se guarda en este dispositivo.</p>
                <label>Tu nombre *<input value={form.name} maxLength={60} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Martín" required /></label>
                <label>Correo (opcional)<input type="email" value={form.email} maxLength={120} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Para avisarte si no estás conectado" /></label>
                <label>Tu consulta *<textarea value={form.message} maxLength={1000} rows={4} onChange={(e) => setForm({ ...form, message: e.target.value })} placeholder="Cuéntanos en qué podemos ayudarte…" required /></label>
                {sErr && <p className="ib-err">{sErr}</p>}
                <button type="submit" className="ib-go" disabled={sBusy || !form.name.trim() || !form.message.trim()}>{sBusy ? 'Enviando…' : 'Enviar consulta'}</button>
              </form>
              <p className="ib-foot">No compartas contraseñas ni datos bancarios por este chat.</p>
            </>
          ) : (
            <>
              <div className="ib-body">
                {sMsgs.map((m) => (
                  <div key={m.id} className={'ib-row ' + (m.from === 'VISITOR' ? 'me' : 'bot')}>
                    {m.from === 'STAFF' && <span className="ib-who">Equipo Invictus</span>}
                    <div className="ib-bub">{m.content}</div>
                    <span className="ib-time">{hm(m.createdAt)}</span>
                  </div>
                ))}
                {!sMsgs.some((m) => m.from === 'STAFF') && !sClosed && sMsgs.length > 0 && (
                  <p className="ib-wait">Recibimos tu consulta. Te responderemos aquí en cuanto podamos.</p>
                )}
                {sClosed && (
                  <div className="ib-closed">
                    Esta conversación fue cerrada por el equipo.
                    <button onClick={newConversation}>Iniciar una nueva</button>
                  </div>
                )}
                <div ref={sEnd} />
              </div>
              {!sClosed && (
                <form className="ib-form" onSubmit={sendSupport}>
                  <input value={sInput} onChange={(e) => setSInput(e.target.value)} placeholder="Escribe un mensaje…" maxLength={1000} aria-label="Mensaje para soporte" />
                  <button type="submit" disabled={!sInput.trim() || sBusy} aria-label="Enviar">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>
                  </button>
                </form>
              )}
              {sErr && <p className="ib-err ib-errpad">{sErr}</p>}
              <p className="ib-foot">No compartas contraseñas ni datos bancarios por este chat.</p>
            </>
          )}
        </section>
      )}
    </>
  )
}

const CSS = `
.ib-fab{position:fixed;right:20px;bottom:20px;z-index:9998;width:58px;height:58px;border-radius:50%;border:0;cursor:pointer;color:#fff;
background:linear-gradient(135deg,#38bdf8,#0284c7);box-shadow:0 10px 30px rgba(2,132,199,.45),0 0 0 4px rgba(56,189,248,.18);display:grid;place-items:center;transition:transform .2s}
.ib-fab:hover{transform:scale(1.07)}
.ib-dot{position:absolute;top:4px;right:4px;width:13px;height:13px;border-radius:50%;background:#22c55e;border:2px solid #fff;animation:ib-p 2s infinite}
.ib-dot.ib-red{background:#ef4444}
@keyframes ib-p{0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,.5)}50%{box-shadow:0 0 0 7px rgba(34,197,94,0)}}
.ib-nudge{position:fixed;right:90px;bottom:32px;z-index:9997;background:#fff;color:#0f172a;font:600 13px/1.3 system-ui,sans-serif;padding:10px 14px;border-radius:14px 14px 4px 14px;
box-shadow:0 8px 28px rgba(15,23,42,.18);cursor:pointer;max-width:220px;animation:ib-in .5s .8s both}
@keyframes ib-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.ib-panel{position:fixed;right:20px;bottom:90px;z-index:9999;width:380px;max-width:calc(100vw - 24px);height:560px;max-height:calc(100dvh - 110px);background:#fff;border-radius:22px;
box-shadow:0 24px 70px rgba(15,23,42,.28),0 0 0 1px rgba(15,23,42,.06);display:flex;flex-direction:column;overflow:hidden;font-family:system-ui,-apple-system,Segoe UI,sans-serif;animation:ib-up .28s cubic-bezier(.2,.9,.3,1.1)}
@keyframes ib-up{from{opacity:0;transform:translateY(16px) scale(.97)}to{opacity:1;transform:none}}
.ib-head{display:flex;align-items:center;gap:10px;padding:14px 16px;background:linear-gradient(135deg,#0ea5e9,#0369a1);color:#fff}
.ib-av{width:38px;height:38px;border-radius:12px;background:rgba(255,255,255,.18);display:grid;place-items:center}
.ib-ht{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.ib-ht b{font-size:15px}
.ib-ht span{font-size:11.5px;opacity:.9;display:flex;align-items:center;gap:6px}
.ib-ht i{width:7px;height:7px;border-radius:50%;background:#4ade80;display:inline-block;flex:none}
.ib-x{background:rgba(255,255,255,.15);border:0;color:#fff;width:32px;height:32px;border-radius:10px;cursor:pointer;display:grid;place-items:center;flex:none}
.ib-body{flex:1;overflow-y:auto;padding:16px 14px;background:linear-gradient(#f0f9ff,#fff);display:flex;flex-direction:column;gap:12px;overscroll-behavior:contain}
.ib-notice{display:flex;gap:8px;align-items:flex-start;background:#fffbeb;border:1px solid #fde68a;color:#92400e;font-size:12.5px;line-height:1.45;padding:9px 12px;border-radius:12px}
.ib-notice svg{flex:none;margin-top:2px;color:#d97706}
.ib-row{display:flex;flex-direction:column;gap:6px;max-width:88%}
.ib-row.me{align-self:flex-end;align-items:flex-end}
.ib-row.bot{align-self:flex-start}
.ib-who{font-size:11px;font-weight:700;color:#0369a1;padding-left:4px}
.ib-time{font-size:10px;color:#94a3b8;padding:0 4px}
.ib-bub{padding:10px 14px;font-size:14px;line-height:1.5;border-radius:16px;white-space:pre-wrap;word-wrap:break-word}
.bot .ib-bub{background:#fff;color:#0f172a;border:1px solid #e0f2fe;border-bottom-left-radius:4px;box-shadow:0 2px 8px rgba(14,165,233,.08)}
.me .ib-bub{background:linear-gradient(135deg,#0ea5e9,#0284c7);color:#fff;border-bottom-right-radius:4px}
.ib-typing{display:flex;gap:4px;padding:14px 16px}
.ib-typing i{width:7px;height:7px;border-radius:50%;background:#7dd3fc;animation:ib-b 1s infinite}
.ib-typing i:nth-child(2){animation-delay:.15s}.ib-typing i:nth-child(3){animation-delay:.3s}
@keyframes ib-b{0%,60%,100%{transform:none;opacity:.5}30%{transform:translateY(-5px);opacity:1}}
.ib-acts,.ib-chips{display:flex;flex-wrap:wrap;gap:6px}
.ib-acts a,.ib-acts button{background:#0284c7;color:#fff;text-decoration:none;font-size:12.5px;font-weight:600;padding:7px 13px;border-radius:999px;border:0;cursor:pointer;font-family:inherit}
.ib-chips button{background:#fff;color:#0369a1;border:1px solid #bae6fd;font-size:12.5px;font-weight:500;padding:6px 12px;border-radius:999px;cursor:pointer;transition:.15s}
.ib-chips button:hover{background:#e0f2fe}
.ib-form{display:flex;gap:8px;padding:10px 12px;border-top:1px solid #e2e8f0;background:#fff}
.ib-form input{flex:1;min-width:0;border:1px solid #e2e8f0;border-radius:12px;padding:11px 14px;font-size:16px;outline:none;color:#0f172a;background:#f8fafc}
.ib-form input:focus{border-color:#38bdf8;background:#fff}
.ib-form button{width:44px;border:0;border-radius:12px;background:#0284c7;color:#fff;cursor:pointer;display:grid;place-items:center}
.ib-form button:disabled{opacity:.4;cursor:default}
.ib-foot{margin:0;padding:0 12px 10px;font-size:11px;color:#94a3b8;text-align:center;background:#fff}
.ib-foot button{background:none;border:0;color:#0284c7;font-weight:600;cursor:pointer;font-size:11px;padding:0;font-family:inherit;text-decoration:underline}
.ib-sform{flex:1;overflow-y:auto;padding:16px 16px 8px;display:flex;flex-direction:column;gap:12px;background:linear-gradient(#f0f9ff,#fff)}
.ib-sintro{margin:0;font-size:13px;line-height:1.5;color:#475569}
.ib-sform label{display:flex;flex-direction:column;gap:5px;font-size:12px;font-weight:600;color:#475569}
.ib-sform input,.ib-sform textarea{border:1px solid #e2e8f0;border-radius:12px;padding:10px 12px;font-size:16px;font-family:inherit;outline:none;color:#0f172a;background:#fff;resize:none}
.ib-sform input:focus,.ib-sform textarea:focus{border-color:#38bdf8;box-shadow:0 0 0 3px rgba(56,189,248,.18)}
.ib-go{border:0;border-radius:12px;background:linear-gradient(135deg,#0ea5e9,#0284c7);color:#fff;font-weight:700;font-size:14px;padding:12px;cursor:pointer;font-family:inherit}
.ib-go:disabled{opacity:.45;cursor:default}
.ib-err{margin:0;background:#fef2f2;color:#dc2626;font-size:12.5px;padding:8px 12px;border-radius:10px}
.ib-errpad{margin:0 12px 6px}
.ib-wait{margin:0;text-align:center;font-size:12px;color:#64748b;background:#f1f5f9;padding:8px 12px;border-radius:10px}
.ib-closed{text-align:center;font-size:12.5px;color:#64748b;background:#f1f5f9;padding:12px;border-radius:12px;display:flex;flex-direction:column;gap:8px;align-items:center}
.ib-closed button{background:#0284c7;color:#fff;border:0;border-radius:999px;padding:7px 14px;font-weight:600;font-size:12.5px;cursor:pointer;font-family:inherit}
@media(max-width:520px){
.ib-panel{right:0;left:0;bottom:0;width:100%;max-width:100%;height:100dvh;max-height:100dvh;border-radius:0}
.ib-nudge{display:none}
}
@media (prefers-reduced-motion:reduce){.ib-panel,.ib-nudge,.ib-dot,.ib-typing i{animation:none}}
`