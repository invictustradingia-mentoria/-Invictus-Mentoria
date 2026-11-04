// Resuelve @menciones de texto (posts, comentarios, chat) a usuarios reales y crea las notificaciones.
import { prismaDash } from '@/lib/prisma-dashboard'
import { extractMentionHandles } from '@/lib/community-shared'

export interface MentionUser {
  id: string
  username: string
  name: string
}

// Busca qué @handles del texto corresponden a usuarios reales (por nombre de usuario, ya guardado en minúsculas).
export async function resolveMentions(text: string): Promise<MentionUser[]> {
  const handles = extractMentionHandles(text)
  if (!handles.length) return []
  const users = await prismaDash.user.findMany({
    where: { username: { in: handles } },
    select: { id: true, username: true, name: true },
  })
  return users
    .filter((u: any) => !!u.username)
    .map((u: any) => ({ id: u.id, username: u.username as string, name: u.name || 'Usuario' }))
}

// Resuelve las menciones de un texto recién publicado y crea una notificación para cada usuario mencionado
// (menos para quien escribió, si se mencionó a sí mismo). Devuelve los usuarios mencionados para incluirlos
// en la respuesta de la API y así poder pintarlos como enlaces en el frontend.
export async function notifyMentions(opts: {
  text: string
  actorId: string
  actorName: string
  actorRole: string
  postId?: string
  commentId?: string
  chatMessageId?: string
}): Promise<MentionUser[]> {
  const users = await resolveMentions(opts.text)
  const targets = users.filter((u) => u.id !== opts.actorId)
  if (targets.length) {
    await prismaDash.notification.createMany({
      data: targets.map((u) => ({
        userId: u.id,
        type: 'MENTION',
        actorId: opts.actorId,
        actorName: opts.actorName,
        actorRole: opts.actorRole,
        postId: opts.postId || null,
        commentId: opts.commentId || null,
        chatMessageId: opts.chatMessageId || null,
        snippet: opts.text.slice(0, 160),
      })),
    })
  }
  return users
}

// Para cuando hay que pintar varios posts/comentarios/mensajes a la vez (listados):
// junta todos los @handles presentes en los textos y resuelve de una sola consulta.
export async function resolveMentionsForTexts(texts: string[]): Promise<MentionUser[]> {
  const handles = new Set<string>()
  for (const t of texts) {
    for (const h of extractMentionHandles(t)) handles.add(h)
  }
  if (!handles.size) return []
  const users = await prismaDash.user.findMany({
    where: { username: { in: Array.from(handles) } },
    select: { id: true, username: true, name: true },
  })
  return users
    .filter((u: any) => !!u.username)
    .map((u: any) => ({ id: u.id, username: u.username as string, name: u.name || 'Usuario' }))
}
