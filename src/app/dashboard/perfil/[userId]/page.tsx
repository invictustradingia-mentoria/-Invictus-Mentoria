'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import ProfileHeader from '@/components/community/ProfileHeader'
import FollowButton from '@/components/community/FollowButton'
import PostCard, { type FeedPost } from '@/components/community/PostCard'

interface PublicProfile {
  user: { id: string; name: string | null; role: string; avatarUrl: string | null; coverUrl: string | null; createdAt: string }
  isMe: boolean
  followersCount: number
  followingCount: number
  postsCount: number
  isFollowing: boolean | null
}

export default function PublicProfilePage() {
  const router = useRouter()
  const params = useParams<{ userId: string }>()
  const userId = params?.userId as string
  const { data: session } = useSession()
  const meId = (session?.user as any)?.id as string | undefined

  const [data, setData] = useState<PublicProfile | null>(null)
  const [posts, setPosts] = useState<FeedPost[]>([])
  const [avatars, setAvatars] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const load = useCallback(async () => {
    try {
      const [ur, pr] = await Promise.all([
        fetch(`/api/student/community/users/${userId}`, { cache: 'no-store' }),
        fetch(`/api/student/community/users/${userId}/posts`, { cache: 'no-store' }),
      ])
      if (ur.status === 404) {
        setNotFound(true)
        return
      }
      const ud = await ur.json()
      const pd = await pr.json()
      if (ur.ok) setData(ud)
      if (pr.ok) {
        setPosts(pd.posts || [])
        setAvatars(new Set<string>(pd.avatars || []))
      }
    } catch {}
    setLoading(false)
  }, [userId])

  useEffect(() => {
    load()
  }, [load])

  // Si es mi propio perfil, redirijo a la versión editable con configuración.
  useEffect(() => {
    if (data?.isMe) router.replace('/dashboard/perfil')
  }, [data, router])

  function removePost(id: string) {
    setPosts((p) => p.filter((x) => x.id !== id))
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center text-xs font-bold text-slate-400">Cargando perfil...</div>
  if (notFound || !data) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <p className="font-semibold text-slate-600 dark:text-white/70">No encontramos ese perfil.</p>
        <Link href="/dashboard/chat" className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-[#0284c7] hover:underline">
          <ArrowLeft size={14} /> Volver a Comunidad
        </Link>
      </div>
    )
  }
  if (data.isMe) return null // se está redirigiendo a /dashboard/perfil

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-5 md:p-8">
      <Link href="/dashboard/chat" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#0284c7] dark:text-white/50">
        <ArrowLeft size={14} /> Volver a Comunidad
      </Link>

      <ProfileHeader
        name={data.user.name || 'Usuario'}
        role={data.user.role}
        avatarUrl={data.user.avatarUrl}
        coverUrl={data.user.coverUrl}
        followers={data.followersCount}
        following={data.followingCount}
        postsCount={data.postsCount}
        editable={false}
        rightSlot={
          meId ? (
            <FollowButton
              userId={data.user.id}
              initialFollowing={!!data.isFollowing}
              onChange={(following, followersCount) => setData((d) => (d ? { ...d, isFollowing: following, followersCount } : d))}
            />
          ) : null
        }
      />

      <div className="space-y-4">
        {posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center dark:border-white/10 dark:bg-white/[0.04]">
            <p className="font-semibold text-slate-600 dark:text-white/70">Todavía no publicó nada.</p>
          </div>
        )}
        {meId && posts.map((p) => (
          <PostCard key={p.id} post={p} avatars={avatars} meId={meId} canModerate={false} apiBase="/api/student/community" onDeleted={removePost} />
        ))}
      </div>
    </div>
  )
}
