'use client'

import Link from 'next/link'
import { profileHref } from '@/lib/community-shared'

export interface MentionRef {
  id: string
  username: string
  name: string
}

// Pinta un texto reemplazando cada @usuario mencionado por un enlace a su perfil
// (solo si ese @usuario corresponde a una cuenta real, provista en `mentions`).
export default function MentionText({ text, mentions, meId }: { text: string; mentions?: MentionRef[]; meId: string }) {
  if (!mentions || mentions.length === 0) return <>{text}</>
  const byHandle = new Map(mentions.map((m) => [m.username.toLowerCase(), m]))
  const parts = text.split(/(@[a-zA-Z0-9_]{2,20})/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          const m = byHandle.get(part.slice(1).toLowerCase())
          if (m) {
            return (
              <Link key={i} href={profileHref(m.id, meId)} className="font-bold text-[#0284c7] hover:underline">
                {part}
              </Link>
            )
          }
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
