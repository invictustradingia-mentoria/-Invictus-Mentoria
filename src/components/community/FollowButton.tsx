'use client'

import { useState } from 'react'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'

export default function FollowButton({
  userId,
  initialFollowing,
  onChange,
  compact,
}: {
  userId: string
  initialFollowing: boolean
  onChange?: (following: boolean, followersCount: number) => void
  compact?: boolean
}) {
  const [following, setFollowing] = useState(initialFollowing)
  const [busy, setBusy] = useState(false)

  async function toggle() {
    if (busy) return
    setBusy(true)
    const prev = following
    setFollowing(!prev)
    try {
      const r = await fetch('/api/student/community/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })
      const d = await r.json()
      if (!r.ok) throw new Error()
      setFollowing(d.following)
      onChange?.(d.following, d.followersCount)
    } catch {
      setFollowing(prev)
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`flex shrink-0 items-center gap-1.5 rounded-xl font-bold transition disabled:opacity-60 ${
        compact ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm'
      } ${
        following ? 'border border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-500 dark:border-white/15 dark:bg-transparent dark:text-white/70' : 'bg-[#0284c7] text-white hover:bg-[#0369a1]'
      }`}
    >
      {busy ? <Loader2 size={compact ? 13 : 15} className="animate-spin" /> : following ? <UserCheck size={compact ? 13 : 15} /> : <UserPlus size={compact ? 13 : 15} />}
      {following ? 'Siguiendo' : 'Seguir'}
    </button>
  )
}
