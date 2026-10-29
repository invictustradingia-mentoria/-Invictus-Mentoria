export interface Geo { country: string; countryCode: string; city: string; lat: number; lon: number }

const cache = new Map<string, Geo | null>()

function isPrivate(ip: string) {
  return !ip || ip === '::1' || ip.startsWith('127.') || ip.startsWith('10.') || ip.startsWith('192.168.') || /^172\.(1[6-9]|2\d|3[01])\./.test(ip)
}

export async function lookupGeo(ip?: string | null): Promise<Geo | null> {
  if (!ip || isPrivate(ip)) return null
  if (cache.has(ip)) return cache.get(ip)!
  try {
    const ctrl = new AbortController()
    const t = setTimeout(() => ctrl.abort(), 2500)
    const r = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, { signal: ctrl.signal })
    clearTimeout(t)
    const d: any = await r.json()
    if (!d?.success) { cache.set(ip, null); return null }
    const g: Geo = { country: d.country || 'Desconocido', countryCode: d.country_code || '', city: d.city || '', lat: Number(d.latitude), lon: Number(d.longitude) }
    cache.set(ip, g)
    return g
  } catch {
    return null
  }
}