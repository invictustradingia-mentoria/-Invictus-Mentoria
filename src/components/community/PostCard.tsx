'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageCircle, Send, Trash2, Loader2, Share2, Check } from 'lucide-react'
import ChatAvatar from '@/components/chat/ChatAvatar'
import RoleBadge from './RoleBadge'
import MentionText, { type MentionRef } from './MentionText'
import MentionTextarea from './MentionTextarea'
import { REACTION_TYPES, REACTION_EMOJI, REACTION_LABEL, profileHref, NO_LINKS_MESSAGE, type ReactionType } from '@/lib/community-shared'

export interface FeedPost {
  id: string
  authorId: string
  authorName: string
  authorRole: string
  content: string
  imageUrl: string | null
  createdAt: string
  reactionCounts: Record<string, number>
  reactionTotal: number
  myReaction: string | null
  commentsCount: number
  sharesCount?: number
  mentions?: MentionRef[]
  sharedFrom?: {
    id: string
    authorId: string
    authorName: string
    authorRole: string
    content: string
    imageUrl: string | null
    createdAt: string
  } | null
}

interface CommentRow {
  id: string
  authorId: string
  authorName: string | null
  authorRole: string | null
  content: string
  createdAt: string
  reactionCounts?: Record<string, number>
  reactionTotal?: number
  myReaction?: string | null
  mentions?: MentionRef[]
}

function when(d: string) {
  const diff = Date.now() - new Date(d).getTime()
  if (diff < 60000) return 'ahora'
  if (diff < 3600000) return Math.floor(diff / 60000) + ' min'
  if (diff < 86400000) return Math.floor(diff / 3600000) + ' h'
  return new Date(d).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

function SharedPostPreview({
  post,
  avatars,
  meId,
  mentions,
}: {
  post: NonNullable<FeedPost['sharedFrom']>
  avatars: Set<string>
  meId: string
  mentions?: MentionRef[]
}) {
  const staff = post.authorRole === 'ADMIN' || post.authorRole === 'EDITOR'
  return (
    <Link
      href={profileHref(post.authorId, meId)}
      className="mt-3 block rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
    >
      <div className="flex items-center gap-2">
        <ChatAvatar userId={post.authorId} name={post.authorName} hasPhoto={avatars.has(post.authorId)} staff={staff} size={28} />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[12.5px] font-bold text-[#1d1d1f] dark:text-white">{post.authorName}</span>
            <RoleBadge role={post.authorRole} size="sm" />
          </div>
          <span className="text-[10.5px] font-medium text-slate-400 dark:text-white/40">{when(post.createdAt)}</span>
        </div>
      </div>
      {post.content && (
        <p className="mt-2 whitespace-pre-wrap break-words text-[13px] leading-relaxed text-[#2a2d32] dark:text-white/80">
          <MentionText text={post.content} mentions={mentions} meId={meId} />
        </p>
      )}
      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="" className="mt-2 max-h-[320px] w-full rounded-lg object-cover" />
      )}
    </Link>
  )
}

export default function PostCard({
  post,
  avatars,
  meId,
  canModerate,
  apiBase,
  onDeleted,
  onShared,
}: {
  post: FeedPost
  avatars: Set<string>
  meId: string
  canModerate: boolean
  apiBase: string
  onDeleted: (id: string) => void
  onShared?: (post: FeedPost) => void
}) {
  const [counts, setCounts] = useState(post.reactionCounts)
  const [mine, setMine] = useState<string | null>(post.myReaction)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState<CommentRow[]>([])
  const [commentsLoaded, setCommentsLoaded] = useState(false)
  const [commentText, setCommentText] = useState('')
  const [commentsCount, setCommentsCount] = useState(post.commentsCount)
  const [commentError, setCommentError] = useState('')
  const [busy, setBusy] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareText, setShareText] = useState('')
  const [sharesCount, setSharesCount] = useState(post.sharesCount ?? 0)
  const [sharing, setSharing] = useState(false)
  const [shareError, setShareError] = useState('')
  const [shared, setShared] = useState(false)

  const staff = post.authorRole === 'ADMIN' || post.authorRole === 'EDITOR'
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const topTypes = REACTION_TYPES.filter((t) => counts[t] > 0).slice(0, 3)
  const authorHref = profileHref(post.authorId, meId)

  async function react(type: ReactionType) {
    const prevMine = mine
    const prevCounts = { ...counts }
    const next = { ...counts }
    if (prevMine) next[prevMine] = Math.max(0, (next[prevMine] || 0) - 1)
    let nextMine: string | null = type
    if (prevMine === type) {
      nextMine = null
    } else {
      next[type] = (next[type] || 0) + 1
    }
    setMine(nextMine)
    setCounts(next)
    try {
      const r = await fetch(`${apiBase}/posts/${post.id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (!r.ok) throw new Error()
    } catch {
      setMine(prevMine)
      setCounts(prevCounts)
    }
  }

  async function loadComments() {
    setCommentsOpen((v) => !v)
    if (commentsLoaded) return
    try {
      const r = await fetch(`${apiBase}/posts/${post.id}/comments`, { cache: 'no-store' })
      const d = await r.json()
      if (r.ok) {
        setComments(d.comments || [])
        setCommentsLoaded(true)
      }
    } catch {}
  }

  async function sendComment() {
    const content = commentText.trim()
    if (!content || busy) return
    setBusy(true)
    setCommentError('')
    try {
      const r = await fetch(`${apiBase}/posts/${post.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const d = await r.json()
      if (r.ok) {
        setComments((c) => [...c, d.comment])
        setCommentsCount((c) => c + 1)
        setCommentText('')
      } else {
        setCommentError(d?.error || 'No se pudo comentar.')
      }
    } catch {}
    setBusy(false)
  }

  async function reactComment(commentId: string, type: ReactionType) {
    const prev = comments
    setComments((cs) =>
      cs.map((c) => {
        if (c.id !== commentId) return c
        const counts = { ...(c.reactionCounts || {}) }
        const prevMine = c.myReaction || null
        if (prevMine) counts[prevMine] = Math.max(0, (counts[prevMine] || 0) - 1)
        let nextMine: string | null = type
        if (prevMine === type) nextMine = null
        else counts[type] = (counts[type] || 0) + 1
        const total = Object.values(counts).reduce((a, b) => a + b, 0)
        return { ...c, reactionCounts: counts, reactionTotal: total, myReaction: nextMine }
      })
    )
    try {
      const r = await fetch(`${apiBase}/posts/${post.id}/comments/${commentId}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      })
      if (!r.ok) throw new Error()
    } catch {
      setComments(prev)
    }
  }

  async function removeComment(id: string) {
    setComments((c) => c.filter((x) => x.id !== id))
    setCommentsCount((c) => Math.max(0, c - 1))
    await fetch(`${apiBase}/posts/${post.id}/comments?commentId=${encodeURIComponent(id)}`, { method: 'DELETE' }).catch(() => {})
  }

  async function removePost() {
    if (deleting) return
    setDeleting(true)
    const r = await fetch(`${apiBase}/posts/${post.id}`, { method: 'DELETE' }).catch(() => null)
    setDeleting(false)
    if (r && r.ok) onDeleted(post.id)
  }

  async function sendShare() {
    if (sharing) return
    setSharing(true)
    setShareError('')
    try {
      const r = await fetch(`${apiBase}/posts/${post.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: shareText.trim() }),
      })
      const d = await r.json()
      if (r.ok) {
        setSharesCount((c) => c + 1)
        setShareText('')
        setShareOpen(false)
        setShared(true)
        setTimeout(() => setShared(false), 2500)
        onShared?.(d.post)
      } else {
        setShareError(d?.error || 'No se pudo compartir.')
      }
    } catch {
      setShareError('No se pudo compartir.')
    }
    setSharing(false)
  }

  const canDeletePost = canModerate || post.authorId === meId

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/[0.04] sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <Link href={authorHref} className="flex items-center gap-3">
          <ChatAvatar userId={post.authorId} name={post.authorName} hasPhoto={avatars.has(post.authorId)} staff={staff} size={42} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#1d1d1f] hover:underline dark:text-white">{post.authorName}</span>
              <RoleBadge role={post.authorRole} size="sm" />
            </div>
            <span className="text-[11px] font-medium text-slate-400 dark:text-white/40">{when(post.createdAt)}</span>
          </div>
        </Link>
        {canDeletePost && (
          <button
            onClick={removePost}
            disabled={deleting}
            title="Eliminar publicación"
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-50 dark:text-white/30 dark:hover:bg-red-500/10"
          >
            {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
        )}
      </div>

      {post.content && (
        <p className="mt-3 whitespace-pre-wrap break-words text-[14px] leading-relaxed text-[#2a2d32] dark:text-white/85">
          <MentionText text={post.content} mentions={post.mentions} meId={meId} />
        </p>
      )}
      {post.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.imageUrl} alt="" className="mt-3 max-h-[480px] w-full rounded-xl object-cover" />
      )}
      {post.sharedFrom && <SharedPostPreview post={post.sharedFrom} avatars={avatars} meId={meId} mentions={post.mentions} />}

      {total > 0 && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-white/50">
          <span className="flex -space-x-1">
            {topTypes.map((t) => (
              <span key={t} className="grid h-5 w-5 place-items-center rounded-full border-2 border-white bg-slate-100 text-[11px] dark:border-[#0b0f17] dark:bg-white/10">
                {REACTION_EMOJI[t]}
              </span>
            ))}
          </span>
          {total}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-2 dark:border-white/10">
        {REACTION_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => react(t)}
            title={REACTION_LABEL[t]}
            className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-semibold transition sm:px-2.5 ${
              mine === t ? 'bg-sky-50 text-[#0284c7] dark:bg-sky-500/15 dark:text-sky-300' : 'text-slate-500 hover:bg-slate-50 dark:text-white/50 dark:hover:bg-white/5'
            }`}
          >
            <span>{REACTION_EMOJI[t]}</span>
            {counts[t] > 0 && <span className="text-[11px]">{counts[t]}</span>}
          </button>
        ))}
        <button
          onClick={loadComments}
          className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 dark:text-white/50 dark:hover:bg-white/5 sm:px-2.5"
        >
          <MessageCircle size={16} /> {commentsCount > 0 ? commentsCount : 'Comentar'}
        </button>
        <button
          onClick={() => setShareOpen((v) => !v)}
          className={`ml-auto flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold transition sm:px-2.5 ${
            shared ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 hover:bg-slate-50 dark:text-white/50 dark:hover:bg-white/5'
          }`}
        >
          {shared ? <Check size={16} /> : <Share2 size={16} />}
          {shared ? 'Compartido' : sharesCount > 0 ? sharesCount : 'Compartir'}
        </button>
      </div>

      {shareOpen && (
        <div className="mt-3 space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.03]">
          <MentionTextarea
            value={shareText}
            onChange={setShareText}
            placeholder="Agrega algo (opcional)…"
            maxLength={2000}
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-white/10 dark:bg-white/[0.05] dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
          />
          {shareError && <p className="text-[12px] font-medium text-red-500">{shareError}</p>}
          <p className="text-[11px] text-slate-400 dark:text-white/40">{NO_LINKS_MESSAGE}</p>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShareOpen(false)} className="rounded-lg px-3 py-1.5 text-[13px] font-semibold text-slate-500 hover:bg-slate-100 dark:text-white/50 dark:hover:bg-white/5">
              Cancelar
            </button>
            <button
              onClick={sendShare}
              disabled={sharing}
              className="flex items-center gap-1.5 rounded-lg bg-[#0284c7] px-3 py-1.5 text-[13px] font-semibold text-white disabled:opacity-50"
            >
              {sharing ? <Loader2 size={14} className="animate-spin" /> : <Share2 size={14} />} Compartir ahora
            </button>
          </div>
        </div>
      )}

      {commentsOpen && (
        <div className="mt-3 space-y-2.5 border-t border-slate-100 pt-3 dark:border-white/10">
          {comments.map((c) => (
            <div key={c.id} className="flex items-start gap-2">
              <Link href={profileHref(c.authorId, meId)}>
                <ChatAvatar userId={c.authorId} name={c.authorName || '?'} hasPhoto={avatars.has(c.authorId)} staff={c.authorRole === 'ADMIN' || c.authorRole === 'EDITOR'} size={30} />
              </Link>
              <div className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2 dark:bg-white/[0.06]">
                <div className="flex items-center justify-between gap-2">
                  <Link href={profileHref(c.authorId, meId)} className="text-[12.5px] font-bold text-slate-700 hover:underline dark:text-white/80">
                    {c.authorName}
                  </Link>
                  {(canModerate || c.authorId === meId) && (
                    <button onClick={() => removeComment(c.id)} className="text-slate-300 hover:text-red-500 dark:text-white/30">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
                <p className="whitespace-pre-wrap break-words text-[13px] text-slate-600 dark:text-white/70">
                  <MentionText text={c.content} mentions={c.mentions} meId={meId} />
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-0.5">
                  {REACTION_TYPES.map((t) => {
                    const n = (c.reactionCounts || {})[t] || 0
                    const active = c.myReaction === t
                    return (
                      <button
                        key={t}
                        onClick={() => reactComment(c.id, t)}
                        title={REACTION_LABEL[t]}
                        className={`flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold transition ${
                          active ? 'bg-sky-100 text-[#0284c7] dark:bg-sky-500/20 dark:text-sky-300' : 'text-slate-400 hover:bg-slate-100 dark:text-white/40 dark:hover:bg-white/10'
                        }`}
                      >
                        <span>{REACTION_EMOJI[t]}</span>
                        {n > 0 && <span>{n}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          ))}
          {commentError && <p className="text-[12px] font-medium text-red-500">{commentError}</p>}
          <p className="text-[11px] text-slate-400 dark:text-white/40">{NO_LINKS_MESSAGE}</p>
          <div className="flex items-end gap-2 pt-1">
            <div className="flex-1">
              <MentionTextarea
                value={commentText}
                onChange={setCommentText}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    sendComment()
                  }
                }}
                placeholder="Escribe un comentario…"
                maxLength={500}
                rows={1}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-[13px] outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:border-white/10 dark:bg-white/[0.06] dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
            <button onClick={sendComment} disabled={!commentText.trim() || busy} className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#0284c7] text-white disabled:opacity-40">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
