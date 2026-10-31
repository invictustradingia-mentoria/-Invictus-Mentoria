import { prismaDash } from '@/lib/prisma-dashboard'

export const OFFLINE_KEY = 'support_offline'
export const MESSAGE_KEY = 'support_offline_message'

export const DEFAULT_OFFLINE_MESSAGE =
  'En este momento el equipo de soporte no se encuentra en línea. Deja tu consulta y tus datos de contacto (teléfono y/o correo) y, cuando vuelva a estar disponible, se pondrá en contacto contigo.'

// Estado de disponibilidad de soporte. Si algo falla, se asume que soporte está en línea.
export async function getSupportSettings(): Promise<{ offline: boolean; message: string; custom: boolean }> {
  try {
    const rows = await prismaDash.appSetting.findMany({ where: { key: { in: [OFFLINE_KEY, MESSAGE_KEY] } } })
    const offline = rows.find((r: any) => r.key === OFFLINE_KEY)?.value === '1'
    const custom = (rows.find((r: any) => r.key === MESSAGE_KEY)?.value || '').trim()
    return { offline, message: custom || DEFAULT_OFFLINE_MESSAGE, custom: !!custom }
  } catch {
    return { offline: false, message: DEFAULT_OFFLINE_MESSAGE, custom: false }
  }
}

export async function saveSupportSettings(offline: boolean, message: string) {
  await prismaDash.appSetting.upsert({
    where: { key: OFFLINE_KEY },
    update: { value: offline ? '1' : '0' },
    create: { key: OFFLINE_KEY, value: offline ? '1' : '0' },
  })
  await prismaDash.appSetting.upsert({
    where: { key: MESSAGE_KEY },
    update: { value: message },
    create: { key: MESSAGE_KEY, value: message },
  })
}
