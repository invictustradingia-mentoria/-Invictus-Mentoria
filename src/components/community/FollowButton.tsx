'use client'

import { useState } from 'react'
import { UserPlus, UserCheck, Loader2 } from 'lucide-react'

export default function FollowButton({
  userId,
  initialFollowing,
  onChange,
}: {
  userId: string
  initialFollowing: boolean
  onChange?: (following: boolean, followersCount: number) => void
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
      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold transition disabled:opacity-60 ${
        following ? 'border border-slate-200 bg-white text-slate-600 hover:border-red-200 hover:text-red-500 dark:border-white/15 dark:bg-transparent dark:text-white/70' : 'bg-[#0284c7] text-white hover:bg-[#0369a1]'
      }`}
    >
      {busy ? <Loader2 size={15} className="animate-spin" /> : following ? <UserCheck size={15} /> : <UserPlus size={15} />}
      {following ? 'Siguiendo' : 'Seguir'}
    </button>
  )
}
