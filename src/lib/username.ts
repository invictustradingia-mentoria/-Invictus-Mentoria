// Nombres de usuario únicos: 3 a 20 caracteres, minúsculas, números, punto y guion bajo.
export const USERNAME_RE = /^[a-z0-9](?:[a-z0-9._]{1,18})[a-z0-9]$/
const RESERVED = ['admin', 'administrador', 'invictus', 'soporte', 'support', 'staff', 'editor', 'moderador', 'mod', 'root', 'sistema', 'bot', 'campus', 'invictuscampus']

export function normalizeUsername(v: unknown): string {
  return typeof v === 'string' ? v.trim().toLowerCase().replace(/^@/, '') : ''
}

export function validateUsername(u: string): string | null {
  if (!u) return 'Elige un nombre de usuario'
  if (u.length < 3) return 'Debe tener al menos 3 caracteres'
  if (u.length > 20) return 'Máximo 20 caracteres'
  if (!USERNAME_RE.test(u)) return 'Solo letras minúsculas, números, punto y guion bajo (sin espacios)'
  if (/[._]{2}/.test(u)) return 'No uses dos símbolos seguidos'
  if (RESERVED.includes(u)) return 'Ese nombre está reservado'
  return null
}
