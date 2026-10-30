import { prismaDash } from '@/lib/prisma-dashboard'

// Devuelve cuáles de estos usuarios tienen foto de perfil.
// Solo se consulta el id (no se descarga la imagen), así el chat se mantiene liviano.
export async function avatarIds(ids: string[]): Promise<string[]> {
  const uniq = Array.from(new Set(ids.filter(Boolean)))
  if (!uniq.length) return []
  const rows = await prismaDash.user.findMany({
    where: { id: { in: uniq }, avatarUrl: { not: null }, NOT: { avatarUrl: '' } },
    select: { id: true },
  })
  return rows.map((r: any) => r.id)
}