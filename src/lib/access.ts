// Niveles de contenido y roles del equipo.
export const ACCESS_LEVELS = ['ALL', 'CLUB', 'MENTORIA']

// Roles que gestionan el panel: el administrador (todo) y el editor (solo contenido, chat, llamadas y soporte).
export const STAFF_ROLES = ['ADMIN', 'EDITOR']

// Secciones del panel que puede usar un editor.
export const EDITOR_PATHS = ['/admin/content', '/admin/chat', '/admin/llamadas', '/admin/soporte', '/admin/testimonios']

export function isAdminRole(role?: string | null): boolean {
  return role === 'ADMIN'
}

export function isStaff(role?: string | null): boolean {
  return role === 'ADMIN' || role === 'EDITOR'
}

// Qué niveles de contenido puede ver cada rol.
// null = ve todo (administrador).
// El editor ve lo que el administrador le habilite: 'ALL' (todo), 'CLUB' o 'MENTORIA'.
export function visibleLevels(role?: string | null, viewLevel?: string | null): string[] | null {
  if (role === 'ADMIN') return null
  if (role === 'EDITOR') {
    if (viewLevel === 'CLUB') return ['ALL', 'CLUB']
    if (viewLevel === 'MENTORIA') return ['ALL', 'MENTORIA']
    return null
  }
  if (role === 'MENTORIA') return ['ALL', 'MENTORIA']
  return ['ALL', 'CLUB']
}
