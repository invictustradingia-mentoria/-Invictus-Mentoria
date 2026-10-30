import crypto from 'crypto'

export const TOKEN_RE = /^[a-f0-9]{48}$/
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export const newToken = () => crypto.randomBytes(24).toString('hex')

// Huella anónima del visitante (no se guarda la IP real) para limitar abusos.
export function clientIpHash(req: Request): string {
  const h = req.headers
  const ip =
    h.get('x-nf-client-connection-ip') ||
    h.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    h.get('x-real-ip') ||
    'unknown'
  return crypto
    .createHash('sha256')
    .update(ip + (process.env.NEXTAUTH_SECRET || 'invictus'))
    .digest('hex')
    .slice(0, 32)
}

export function short(input: unknown, max: number): string {
  if (typeof input !== 'string') return ''
  return input.replace(/[\u0000-\u001F\u007F]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
}