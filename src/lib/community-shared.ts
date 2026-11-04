// Constantes compartidas por el feed de Comunidad (posts, reacciones, comentarios).
// Usado tanto por las rutas API (student/admin) como por las páginas de Comunidad.

export const REACTION_TYPES = ['LIKE', 'LOVE', 'FIRE', 'CLAP'] as const
export type ReactionType = (typeof REACTION_TYPES)[number]

export const REACTION_EMOJI: Record<ReactionType, string> = {
  LIKE: '👍',
  LOVE: '❤️',
  FIRE: '🔥',
  CLAP: '👏',
}

export const REACTION_LABEL: Record<ReactionType, string> = {
  LIKE: 'Me gusta',
  LOVE: 'Me encanta',
  FIRE: 'Qué fuego',
  CLAP: 'Aplausos',
}

export const MAX_POST_LEN = 2000
export const MAX_COMMENT_LEN = 500
export const MAX_IMAGE_CHARS = 1_200_000 // ~900KB en base64
export const MAX_COVER_CHARS = 600_000 // ~450KB en base64
export const MAX_AVATAR_CHARS = 300_000 // ~225KB en base64

export const IMAGE_DATA_URL_RE = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/

export function cleanPostText(v: unknown, max: number): string {
  if (typeof v !== 'string') return ''
  return v.trim().slice(0, max)
}

export const ROLE_BADGE: Record<string, { label: string; gradient: string; glow?: string }> = {
  ADMIN: { label: 'Admin', gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', glow: 'rgba(245,158,11,.5)' },
  EDITOR: { label: 'Editor', gradient: 'linear-gradient(135deg,#6366f1,#a855f7)' },
  MENTORIA: { label: 'Mentoría', gradient: 'linear-gradient(135deg,#0284c7,#22d3ee)', glow: 'rgba(2,132,199,.4)' },
  CLUB: { label: 'Club', gradient: 'linear-gradient(135deg,#64748b,#475569)' },
}

export function roleBadge(role: string) {
  return ROLE_BADGE[role] || ROLE_BADGE.CLUB
}

// Da forma a un Post (con sus relaciones cargadas) para la respuesta JSON del feed,
// calculando el conteo de reacciones por tipo y cuál puso el usuario actual (si alguna).
export function shapePost(p: any, meId: string) {
  const counts: Record<string, number> = {}
  let myReaction: string | null = null
  for (const r of p.reactions) {
    counts[r.type] = (counts[r.type] || 0) + 1
    if (r.userId === meId) myReaction = r.type
  }
  return {
    id: p.id,
    authorId: p.authorId,
    authorName: p.author?.name || 'Usuario',
    authorRole: p.author?.role || 'CLUB',
    content: p.content,
    imageUrl: p.imageUrl,
    createdAt: p.createdAt,
    reactionCounts: counts,
    reactionTotal: p.reactions.length,
    myReaction,
    commentsCount: p._count.comments,
  }
}
