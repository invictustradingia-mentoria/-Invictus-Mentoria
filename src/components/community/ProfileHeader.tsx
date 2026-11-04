'use client'

import { useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import RoleBadge from './RoleBadge'

function initialsOf(n: string) {
  const p = n.trim().split(/\s+/)
  return ((p[0]?.[0] || '?') + (p[1]?.[0] || '')).toUpperCase()
}

// Redimensiona la imagen en el navegador antes de subirla (evita payloads enormes en base64).
function resizeToDataUrl(file: File, maxDim: number, quality = 0.85): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.onload = () => {
      img.onerror = () => reject(new Error('Archivo de imagen no válido'))
      img.onload = () => {
        let { width, height } = img
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height)
          width = Math.round(width * ratio)
          height = Math.round(height * ratio)
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('No se pudo procesar la imagen'))
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

interface Props {
  name: string
  role: string
  avatarUrl: string | null
  coverUrl: string | null
  followers?: number
  following?: number
  postsCount?: number
  editable?: boolean
  onSave?: (patch: { avatarUrl?: string | null; coverUrl?: string | null }) => Promise<void>
  rightSlot?: React.ReactNode
  onFollowersClick?: () => void
  onFollowingClick?: () => void
}

export default function ProfileHeader({
  name,
  role,
  avatarUrl,
  coverUrl,
  followers,
  following,
  postsCount,
  editable = true,
  onSave,
  rightSlot,
  onFollowersClick,
  onFollowingClick,
}: Props) {
  const [busyAvatar, setBusyAvatar] = useState(false)
  const [busyCover, setBusyCover] = useState(false)
  const [err, setErr] = useState('')
  const avatarInput = useRef<HTMLInputElement>(null)
  const coverInput = useRef<HTMLInputElement>(null)

  async function pick(kind: 'avatar' | 'cover', file: File | undefined) {
    if (!file || !onSave) return
    setErr('')
    const setBusy = kind === 'avatar' ? setBusyAvatar : setBusyCover
    setBusy(true)
    try {
      const dataUrl = await resizeToDataUrl(file, kind === 'avatar' ? 480 : 1600, kind === 'avatar' ? 0.85 : 0.8)
      await onSave(kind === 'avatar' ? { avatarUrl: dataUrl } : { coverUrl: dataUrl })
    } catch (e: any) {
      setErr(e?.message || 'No se pudo actualizar la imagen.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-white/[0.04]">
      <div
        className="relative h-28 sm:h-56"
        style={{ background: coverUrl ? `url(${coverUrl}) center/cover no-repeat` : 'linear-gradient(120deg,#0b1220,#0f3a5f 45%,#0284c7 100%)' }}
      >
        {!coverUrl && (
          <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 80% 20%, rgba(56,189,248,.35), transparent 55%)' }} />
        )}
        {editable && (
          <>
            <input ref={coverInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick('cover', e.target.files?.[0])} />
            <button
              type="button"
              onClick={() => coverInput.current?.click()}
              disabled={busyCover}
              className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg border border-white/30 bg-black/35 px-2.5 py-1.5 text-[10.5px] font-bold text-white backdrop-blur transition hover:bg-black/50 disabled:opacity-60 sm:bottom-3 sm:right-3 sm:px-3 sm:text-[11.5px]"
            >
              {busyCover ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />} Editar portada
            </button>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 px-3 pb-4 pt-0 sm:gap-4 sm:px-6">
        <div className="-mt-8 flex items-end gap-3 sm:-mt-12 sm:gap-4">
          <div className="relative shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={name} className="h-16 w-16 rounded-full border-4 border-white object-cover dark:border-[#0b0f17] sm:h-28 sm:w-28" />
            ) : (
              <span className="grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-gradient-to-br from-sky-500 to-cyan-400 text-xl font-black text-white dark:border-[#0b0f17] sm:h-28 sm:w-28 sm:text-2xl">
                {initialsOf(name)}
              </span>
            )}
            {editable && (
              <>
                <input ref={avatarInput} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(e) => pick('avatar', e.target.files?.[0])} />
                <button
                  type="button"
                  onClick={() => avatarInput.current?.click()}
                  disabled={busyAvatar}
                  aria-label="Cambiar foto de perfil"
                  className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-[#0284c7] text-white disabled:opacity-60 dark:border-[#0b0f17] sm:h-8 sm:w-8"
                >
                  {busyAvatar ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                </button>
              </>
            )}
          </div>
          <div className="min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="truncate text-base font-black text-[#1d1d1f] dark:text-white sm:text-xl">{name}</h1>
              <RoleBadge role={role} size="sm" />
            </div>
            {(followers !== undefined || following !== undefined || postsCount !== undefined) && (
              <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-[11px] font-semibold text-slate-500 dark:text-white/50 sm:text-xs">
                {followers !== undefined && (
                  <button type="button" onClick={onFollowersClick} disabled={!onFollowersClick} className={onFollowersClick ? 'hover:underline' : ''}>
                    {followers} seguidores
                  </button>
                )}
                {followers !== undefined && following !== undefined && <span>·</span>}
                {following !== undefined && (
                  <button type="button" onClick={onFollowingClick} disabled={!onFollowingClick} className={onFollowingClick ? 'hover:underline' : ''}>
                    {following} siguiendo
                  </button>
                )}
                {(followers !== undefined || following !== undefined) && postsCount !== undefined && <span>·</span>}
                {postsCount !== undefined && <span>{postsCount} publicaciones</span>}
              </p>
            )}
          </div>
        </div>
        {rightSlot && <div className="pb-1">{rightSlot}</div>}
      </div>
      {err && <p className="px-3 pb-3 text-xs font-semibold text-red-500 sm:px-6">{err}</p>}
    </div>
  )
}
