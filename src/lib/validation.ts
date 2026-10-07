import { profileMap, ProfileKey } from '../data/profiles'

/** Shared by manual input, quick input and both calculation directions. */
export function validateDimensions(key: ProfileKey, params: Record<string, number>): string | null {
  const profile = profileMap.get(key)
  if (!profile || profile.params.some(p => !Number.isFinite(params[p.key]) || params[p.key] <= 0)) {
    return 'Введите положительные конечные размеры'
  }
  const v = params
  if (key === 'pipe' && 2 * v.t >= v.d) return 'Толщина стенки должна быть меньше половины диаметра'
  if (key === 'pipe_prof' && 2 * v.t >= Math.min(v.a, v.b)) return 'Толщина стенки должна быть меньше половины меньшей стороны'
  if (key === 'angle_equal' && v.t >= v.b) return 'Толщина должна быть меньше ширины полки'
  if (key === 'angle_unequal' && v.t >= Math.min(v.b1, v.b2)) return 'Толщина должна быть меньше меньшей полки'
  if ((key === 'beam' || key === 'channel') && (2 * v.tf >= v.h || v.tw >= v.b)) return 'Проверьте высоту профиля и толщины стенки и полок'
  const area = profile.sectionArea(params)
  return Number.isFinite(area) && area > 0 ? null : 'Размеры не позволяют рассчитать сечение'
}
