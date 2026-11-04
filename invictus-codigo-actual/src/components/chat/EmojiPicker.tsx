'use client'

import { useEffect, useRef, useState } from 'react'

const CATS: { key: string; icon: string; label: string; list: string }[] = [
  { key: 'caras', icon: '😀', label: 'Caras', list: '😀 😃 😄 😁 😆 😅 😂 🤣 😊 😇 🙂 🙃 😉 😌 😍 🥰 😘 😗 😙 😚 😋 😛 😝 😜 🤪 🤨 🧐 🤓 😎 🥳 🤩 😏 😒 😞 😔 😟 😕 🙁 ☹️ 😣 😖 😫 😩 🥺 😢 😭 😤 😠 😡 🤬 🤯 😳 🥵 🥶 😱 😨 😰 😥 😓 🤗 🤔 🤭 🤫 🤥 😶 😐 😑 😬 🙄 😯 😦 😧 😮 😲 🥱 😴 🤤 😪 😵 🤐 🥴 🤢 🤮 🤧 😷 🤒 🤕' },
  { key: 'gestos', icon: '👍', label: 'Gestos', list: '👍 👎 👌 ✌️ 🤞 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐️ 🖖 👋 🤝 🙏 👏 🙌 👐 🤲 💪 🦾 ✍️ 🤳 💅 🫶 🫡 🫰 🫵' },
  { key: 'amor', icon: '❤️', label: 'Corazones', list: '❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ♥️ 😻 💌' },
  { key: 'trading', icon: '📈', label: 'Trading', list: '📈 📉 📊 💹 💰 💵 💸 💳 🏦 🪙 💎 🏆 🥇 🥈 🥉 🎯 🚀 🔥 ⚡ 💡 🧠 ⏰ ⌛ 🕐 📅 📌 📍 🔔 ✅ ❌ ⚠️ 🛑 🟢 🔴 🟡 🔵 ⬆️ ⬇️ ➡️ 🐂 🐻 🦅 🦁 🐺 🧭 🛡️ ⚔️ 🏛️' },
  { key: 'fiesta', icon: '🎉', label: 'Celebrar', list: '🎉 🎊 🎈 🎁 🥂 🍾 🍻 ☕ 🍕 🍔 🌮 🍿 🎮 🎧 🎵 🎶 ⭐ 🌟 ✨ 💫 🌈 ☀️ 🌙 ⚽ 🏀 🏁 🌎 🌍 🌏' },
  { key: 'simbolos', icon: '💯', label: 'Símbolos', list: '💯 ✔️ ➕ ➖ ✖️ ❓ ❗ ‼️ 🔝 🆗 🆒 🆕 🔜 ♻️ 🔰 ⭕ 🚫 👀 💬 💭 🗯️ 🔒 🔓 🔑 📣 📢 📎 📝 📚 🎓 💻 📱 🖥️ ⌨️' },
]

const RECENT_KEY = 'inv-emoji-recent'

function readRecent(): string[] {
  try {
    const r = JSON.parse(localStorage.getItem(RECENT_KEY) || '[]')
    return Array.isArray(r) ? r.filter((x) => typeof x === 'string').slice(0, 16) : []
  } catch {
    return []
  }
}

export default function EmojiPicker({ onPick, onClose }: { onPick: (e: string) => void; onClose: () => void }) {
  const [cat, setCat] = useState('recientes')
  const [recent, setRecent] = useState<string[]>([])
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const r = readRecent()
    setRecent(r)
    if (!r.length) setCat('caras')
  }, [])

  useEffect(() => {
    const down = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const key = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    // pequeño retraso para no cerrar con el mismo clic que lo abre
    const t = setTimeout(() => document.addEventListener('mousedown', down), 0)
    document.addEventListener('keydown', key)
    return () => {
      clearTimeout(t)
      document.removeEventListener('mousedown', down)
      document.removeEventListener('keydown', key)
    }
  }, [onClose])

  function pick(e: string) {
    onPick(e)
    const next = [e, ...recent.filter((x) => x !== e)].slice(0, 16)
    setRecent(next)
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next))
    } catch {}
  }

  const items = cat === 'recientes' ? recent : (CATS.find((c) => c.key === cat)?.list || '').split(' ').filter(Boolean)

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label="Emojis"
      className="absolute bottom-full left-0 z-30 mb-2 w-[min(320px,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-sky-100 bg-white shadow-2xl shadow-sky-900/15"
    >
      <div className="flex gap-0.5 overflow-x-auto border-b border-slate-100 bg-sky-50/60 p-1.5">
        {recent.length > 0 && (
          <button type="button" title="Recientes" onClick={() => setCat('recientes')} className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-base ${cat === 'recientes' ? 'bg-white shadow-sm ring-1 ring-sky-200' : 'hover:bg-white/70'}`}>🕘</button>
        )}
        {CATS.map((c) => (
          <button key={c.key} type="button" title={c.label} onClick={() => setCat(c.key)} className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-base ${cat === c.key ? 'bg-white shadow-sm ring-1 ring-sky-200' : 'hover:bg-white/70'}`}>{c.icon}</button>
        ))}
      </div>
      <div className="grid max-h-56 grid-cols-8 gap-0.5 overflow-y-auto p-2">
        {items.map((e, i) => (
          <button key={e + i} type="button" onClick={() => pick(e)} className="grid h-9 w-9 place-items-center rounded-lg text-xl transition hover:scale-110 hover:bg-sky-50">{e}</button>
        ))}
      </div>
    </div>
  )
}