'use client'

import { roleBadge } from '@/lib/community-shared'

// Insignia de rol llamativa (gradiente + resplandor) reutilizada en el feed y el perfil.
export default function RoleBadge({ role, size = 'md' }: { role: string; size?: 'sm' | 'md' }) {
  const b = roleBadge(role)
  const pad = size === 'sm' ? '2px 8px' : '4px 12px'
  const font = size === 'sm' ? '9px' : '10.5px'
  return (
    <span
      style={{
        background: b.gradient,
        boxShadow: b.glow ? `0 0 14px ${b.glow}` : undefined,
        padding: pad,
        fontSize: font,
      }}
      className="rounded-full font-black uppercase tracking-wide text-white"
    >
      {b.label}
    </span>
  )
}
