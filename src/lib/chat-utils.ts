import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prismaDash } from '@/lib/prisma-dashboard'

export interface Actor {
  id: string
  name: string
  email: string
  role: string
}

export const MAX_LEN = 500

// Usuario autenticado y habilitado (aprobado y sin bloqueo general).
export async function getActor(): Promise<Actor | null> {
  const session: any = await getServerSession(authOptions)
  const id = session?.user?.id
  if (!id) return null
  const u = await prismaDash.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true, status: true, isBanned: true },
  })
  if (!u || u.isBanned || u.status !== 'APPROVED') return null
  return { id: u.id, name: u.name || u.email.split('@')[0], email: u.email, role: u.role }
}

export async function getAdmin(): Promise<Actor | null> {
  const a = await getActor()
  return a && a.role === 'ADMIN' ? a : null
}

// Sanción vigente del chat (silencio temporal o bloqueo). Limpia las vencidas.
export async function activeSanction(userId: string) {
  const s = await prismaDash.chatSanction.findUnique({ where: { userId } })
  if (!s) return null
  if (s.until && s.until.getTime() <= Date.now()) {
    await prismaDash.chatSanction.delete({ where: { userId } }).catch(() => {})
    return null
  }
  return s
}

export function cleanText(input: unknown): string {
  if (typeof input !== 'string') return ''
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// Los alumnos no pueden publicar enlaces (evita spam y estafas).
export const LINK_RE = /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|io|me|ly|gg|co|ar|es|app|xyz|link|bio|site|online|shop|top)\b)/i