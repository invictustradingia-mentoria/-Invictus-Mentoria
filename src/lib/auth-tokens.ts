import crypto from 'crypto'
import { prismaDash } from '@/lib/prisma-dashboard'

export type TokenPurpose = 'RESET' | 'WELCOME'

export const RESET_TTL_MS = 60 * 60 * 1000 // 1 hora
export const WELCOME_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 días

const sha = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

// Crea un enlace de un solo uso. En la base solo se guarda el hash, nunca el token real.
export async function createToken(userId: string, purpose: TokenPurpose): Promise<string> {
  const raw = crypto.randomBytes(32).toString('hex')
  await prismaDash.passwordReset.create({
    data: {
      userId,
      purpose,
      tokenHash: sha(raw),
      expiresAt: new Date(Date.now() + (purpose === 'WELCOME' ? WELCOME_TTL_MS : RESET_TTL_MS)),
    },
  })
  return raw
}

export async function findValidToken(raw: string) {
  if (!raw || raw.length < 20 || raw.length > 200) return null
  const row = await prismaDash.passwordReset.findUnique({ where: { tokenHash: sha(raw) } })
  if (!row || row.usedAt || row.expiresAt.getTime() < Date.now()) return null
  return row
}

// Dirección pública del sitio. Se configura SITE_URL en Netlify (ej: https://tu-sitio.netlify.app).
export function siteUrl(req: Request): string {
  const env = (process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || '').trim()
  const base = env || new URL(req.url).origin
  return base.replace(/\/+$/, '')
}