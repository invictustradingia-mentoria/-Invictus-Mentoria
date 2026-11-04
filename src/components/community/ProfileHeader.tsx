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
}

export default function ProfileHeader({ name, role, avatarUrl, coverUrl, followers, following, postsCount, editable = true, onSave, rightSlot }: Props) {
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
        className="relative h-40 sm:h-56"
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
              className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-white/30 bg-black/35 px-3 py-1.5 text-[11.5px] font-bold text-white backdrop-blur transition hover:bg-black/50 disabled:opacity-60"
            >
              {busyCover ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />} Editar portada
            </button>
          </>
        )}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 px-4 pb-4 pt-0 sm:px-6">
        <div className="-mt-10 flex items-end gap-4 sm:-mt-12">
          <div className="relative shrink-0">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={name} className="h-20 w-20 rounded-full border-4 border-white object-cover dark:border-[#0b0f17] sm:h-28 sm:w-28" />
            ) : (
              <span className="grid h-20 w-20 place-items-center rounded-full border-4 border-white bg-gradient-to-br from-sky-500 to-cyan-400 text-2xl font-black text-white dark:border-[#0b0f17] sm:h-28 sm:w-28">
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
                  className="absolute bottom-0 right-0 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-[#0284c7] text-white disabled:opacity-60 dark:border-[#0b0f17]"
                >
                  {busyAvatar ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                </button>
              </>
            )}
          </div>
          <div className="pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg font-black text-[#1d1d1f] dark:text-white sm:text-xl">{name}</h1>
              <RoleBadge role={role} />
            </div>
            {(followers !== undefined || following !== undefined || postsCount !== undefined) && (
              <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-white/50">
                {followers !== undefined && <>{followers} seguidores</>}
                {followers !== undefined && following !== undefined && ' · '}
                {following !== undefined && <>{following} siguiendo</>}
                {(followers !== undefined || following !== undefined) && postsCount !== undefined && ' · '}
                {postsCount !== undefined && <>{postsCount} publicaciones</>}
              </p>
            )}
          </div>
        </div>
        {rightSlot && <div className="pb-1">{rightSlot}</div>}
      </div>
      {err && <p className="px-4 pb-3 text-xs font-semibold text-red-500 sm:px-6">{err}</p>}
    </div>
  )
}
