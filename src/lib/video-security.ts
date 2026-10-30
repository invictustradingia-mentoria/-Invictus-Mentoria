import { prismaDash } from '@/lib/prisma-dashboard'

// Señales que el navegador puede detectar. "score" = peso: con 3 puntos en 10 minutos el alumno queda bloqueado.
export const SIGNALS: Record<string, { score: number; label: string }> = {
  screenshot_key: { score: 3, label: 'Intento de captura de pantalla (Impr Pant o atajo de captura)' },
  print: { score: 3, label: 'Intento de imprimir la página' },
  devtools_key: { score: 2, label: 'Intento de abrir las herramientas de desarrollador' },
}

export const LOCK_THRESHOLD = 3
export const WINDOW_MS = 10 * 60 * 1000

export function signalLabel(signal: string): string {
  return SIGNALS[signal]?.label || signal
}

// Devuelve el bloqueo vigente del alumno (o null). Si la tabla aún no existe, no rompe los videos.
export async function activeLock(userId: string): Promise<{ reason: string | null } | null> {
  try {
    const l = await prismaDash.videoLock.findUnique({ where: { userId } })
    return l && l.locked ? { reason: l.reason } : null
  } catch {
    return null
  }
}