'use client'

import { useEffect, useState } from 'react'
import { Wallet, TrendingUp, TrendingDown, Clock3, CalendarDays } from 'lucide-react'
import RoleBadge from './RoleBadge'
import { ROLE_ORDER, ROLE_BADGE, sessionLabel } from '@/lib/community-shared'

interface Stats {
  activeAccounts: number
  monthResult: number
  favoriteSession: string | null
  memberSince: string
}

function money(n: number) {
  const sign = n > 0 ? '+' : n < 0 ? '−' : ''
  return `${sign}$${Math.abs(n).toLocaleString('es-AR', { maximumFractionDigits: 0 })}`
}

export default function ProfileInfoPanel({ userId, role }: { userId: string; role: string }) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    fetch(`/api/student/community/users/${userId}/stats`, { cache: 'no-store' })
      .then((r) => r.json())
      .then((d) => {
        if (active && d && !d.error) setStats(d)
      })
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [userId])

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
        <h3 className="mb-3 text-sm font-black text-slate-900 dark:text-white">Información</h3>
        <dl className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-slate-500 dark:text-white/50">Rol</dt>
            <dd><RoleBadge role={role} /></dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-slate-500 dark:text-white/50">
              <Wallet size={15} /> Cuentas activas en Journal
            </dt>
            <dd className="font-bold text-slate-800 dark:text-white/85">{loading ? '…' : stats?.activeAccounts ?? 0}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-slate-500 dark:text-white/50">
              {stats && stats.monthResult < 0 ? <TrendingDown size={15} /> : <TrendingUp size={15} />} Resultado del mes
            </dt>
            <dd className={`font-bold ${stats && stats.monthResult < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
              {loading ? '…' : money(stats?.monthResult ?? 0)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="flex items-center gap-2 text-slate-500 dark:text-white/50">
              <Clock3 size={15} /> Sesión favorita
            </dt>
            <dd className="font-bold text-slate-800 dark:text-white/85">{loading ? '…' : sessionLabel(stats?.favoriteSession)}</dd>
          </div>
          {stats?.memberSince && (
            <div className="flex items-center justify-between gap-3">
              <dt className="flex items-center gap-2 text-slate-500 dark:text-white/50">
                <CalendarDays size={15} /> Miembro desde
              </dt>
              <dd className="font-bold text-slate-800 dark:text-white/85">
                {new Date(stats.memberSince).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
              </dd>
            </div>
          )}
        </dl>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
        <h3 className="mb-3 text-sm font-black text-slate-900 dark:text-white">Roles de la comunidad</h3>
        <div className="flex flex-col gap-2">
          {ROLE_ORDER.map((r) => (
            <span
              key={r}
              className="inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide text-white"
              style={{ background: ROLE_BADGE[r].gradient }}
            >
              {ROLE_BADGE[r].label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
