export type MembershipKey = 'CLUB' | 'MENTORIA' | 'ADMIN'

export const MEMBERSHIPS: Record<MembershipKey, {
  label: string
  title: string
  tagline: string
  gradient: string
  chip: string
  glow: string
}> = {
  CLUB: {
    label: 'Club',
    title: 'Membresía Club',
    tagline: 'Acceso al contenido del Club y a las clases para todos.',
    gradient: 'from-sky-600 via-sky-500 to-cyan-400',
    chip: 'bg-sky-100 text-sky-700',
    glow: 'shadow-sky-300/60',
  },
  MENTORIA: {
    label: 'Mentoría',
    title: 'Membresía Mentoría',
    tagline: 'Acceso al programa exclusivo de mentoría y a las clases para todos.',
    gradient: 'from-sky-400 via-sky-500 to-blue-600',
    chip: 'bg-amber-100 text-amber-700',
    glow: 'shadow-sky-300/60',
  },
  ADMIN: {
    label: 'Administrador',
    title: 'Administración',
    tagline: 'Acceso completo a todo el contenido y al panel de gestión.',
    gradient: 'from-slate-900 via-slate-800 to-slate-600',
    chip: 'bg-slate-200 text-slate-700',
    glow: 'shadow-slate-400/60',
  },
}

export function getMembership(role?: string | null) {
  const key: MembershipKey = role === 'ADMIN' ? 'ADMIN' : role === 'MENTORIA' ? 'MENTORIA' : 'CLUB'
  return { key, ...MEMBERSHIPS[key] }
}