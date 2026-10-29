// Qué niveles de contenido puede ver cada rol.
// null = ve todo (administrador).
export function visibleLevels(role?: string | null): string[] | null {
  if (role === 'ADMIN') return null
  if (role === 'MENTORIA') return ['ALL', 'MENTORIA']
  return ['ALL', 'CLUB']
}

export const ACCESS_LEVELS = ['ALL', 'CLUB', 'MENTORIA']