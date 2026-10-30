import { ACCESS_LEVELS } from '@/lib/access'

// Valida y limpia los datos de una llamada (crear o editar).
export function parseCall(body: any, partial = false) {
  const out: any = {}
  const err = (m: string) => ({ error: m })

  if (!partial || body.title !== undefined) {
    const title = typeof body.title === 'string' ? body.title.trim() : ''
    if (!title) return err('Escribe el título de la llamada.')
    out.title = title.slice(0, 140)
  }
  if (!partial || body.description !== undefined) {
    out.description = typeof body.description === 'string' && body.description.trim() ? body.description.trim().slice(0, 1500) : null
  }
  if (!partial || body.startsAt !== undefined) {
    const d = new Date(body.startsAt)
    if (!body.startsAt || isNaN(d.getTime())) return err('Elige la fecha y hora de la llamada.')
    out.startsAt = d
  }
  if (!partial || body.durationMin !== undefined) {
    const n = parseInt(body.durationMin, 10)
    out.durationMin = Math.min(Math.max(isNaN(n) ? 60 : n, 5), 600)
  }
  if (!partial || body.joinUrl !== undefined) {
    const url = typeof body.joinUrl === 'string' ? body.joinUrl.trim() : ''
    try {
      const u = new URL(url)
      if (u.protocol !== 'https:') throw new Error()
    } catch {
      return err('El enlace debe ser una dirección válida que empiece con https:// (por ejemplo, el enlace de Zoom).')
    }
    out.joinUrl = url
  }
  if (!partial || body.meetingId !== undefined) {
    out.meetingId = typeof body.meetingId === 'string' && body.meetingId.trim() ? body.meetingId.trim().slice(0, 40) : null
  }
  if (!partial || body.passcode !== undefined) {
    out.passcode = typeof body.passcode === 'string' && body.passcode.trim() ? body.passcode.trim().slice(0, 40) : null
  }
  if (!partial || body.allowedRole !== undefined) {
    out.allowedRole = ACCESS_LEVELS.includes(body.allowedRole) ? body.allowedRole : 'ALL'
  }
  if (!partial || body.recordingUrl !== undefined) {
    const r = typeof body.recordingUrl === 'string' ? body.recordingUrl.trim() : ''
    if (r) {
      try {
        if (new URL(r).protocol !== 'https:') throw new Error()
      } catch {
        return err('El enlace de la grabación debe empezar con https://')
      }
      out.recordingUrl = r
    } else out.recordingUrl = null
  }
  if (!partial || body.isPublished !== undefined) {
    out.isPublished = body.isPublished !== false
  }
  return { data: out }
}