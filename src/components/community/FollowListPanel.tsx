'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users2 } from 'lucide-react'
import ChatAvatar from '@/components/chat/ChatAvatar'
import RoleBadge from './RoleBadge'
import FollowButton from './FollowButton'
import { profileHref } from '@/lib/community-shared'

interface Row {
  id: string
  name: string
  role: string
  avatarUrl: string | null
  isFollowing: boolean | null
}

export default function FollowListPanel({
  userId,
  kind,
  meId,
  emptyText,
}: {
  userId: string
  kind: 'followers' | 'following'
  meId: string
  emptyText: string
}) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(`/api/student/community/users/${userId}/${kind}`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (active) setRows(d.users || [])
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [userId, kind])

  if (loading) return <p className="py-10 text-center text-sm text-slate-400 dark:text-white/40">Cargando…</p>

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center dark:border-white/10 dark:bg-white/[0.04]">
        <Users2 className="mx-auto mb-2 text-slate-300 dark:text-white/20" size={28} />
        <p className="font-semibold text-slate-600 dark:text-white/70">{emptyText}</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {rows.map((u) => (
        <div key={u.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-white/10 dark:bg-white/[0.04] sm:p-3.5">
          <Link href={profileHref(u.id, meId)} className="flex min-w-0 flex-1 items-center gap-3">
            <ChatAvatar userId={u.id} name={u.name} hasPhoto={!!u.avatarUrl} staff={u.role === 'ADMIN' || u.role === 'EDITOR'} size={40} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-[13.5px] font-bold text-[#1d1d1f] hover:underline dark:text-white">{u.name}</span>
              </div>
              <RoleBadge role={u.role} size="sm" />
            </div>
          </Link>
          {u.isFollowing !== null && u.id !== meId && (
            <FollowButton userId={u.id} initialFollowing={u.isFollowing} compact />
          )}
        </div>
      ))}
    </div>
  )
}
