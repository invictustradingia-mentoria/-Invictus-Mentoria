'use client'

import { useState } from 'react'
import { ShieldCheck } from 'lucide-react'

const COLORS = ['#0ea5e9', '#6366f1', '#14b8a6', '#f59e0b', '#ec4899', '#8b5cf6', '#22c55e', '#ef4444']

function colorFor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0
  return COLORS[h % COLORS.length]
}
function initialsOf(n: string) {
  const p = n.trim().split(/\s+/)
  return ((p[0]?.[0] || '?') + (p[1]?.[0] || '')).toUpperCase()
}

// Foto de perfil del miembro; si no tiene (o falla), muestra sus iniciales.
export default function ChatAvatar({
  userId,
  name,
  hasPhoto,
  staff,
  size = 32,
}: {
  userId: string
  name: string
  hasPhoto: boolean
  staff?: boolean
  size?: number
}) {
  const [failed, setFailed] = useState(false)
  const box = { width: size, height: size, fontSize: Math.round(size * 0.36) }

  if (hasPhoto && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/student/avatar/${encodeURIComponent(userId)}`}
        alt={name}
        loading="lazy"
        onError={() => setFailed(true)}
        style={box}
        className={`shrink-0 rounded-full object-cover ring-2 ${staff ? 'ring-sky-400' : 'ring-white'}`}
      />
    )
  }
  return (
    <span
      style={{ ...box, background: staff ? 'linear-gradient(135deg,#0ea5e9,#0369a1)' : colorFor(userId) }}
      className="grid shrink-0 place-items-center rounded-full font-bold text-white ring-2 ring-white"
    >
      {staff ? <ShieldCheck size={Math.round(size * 0.5)} /> : initialsOf(name)}
    </span>
  )
}