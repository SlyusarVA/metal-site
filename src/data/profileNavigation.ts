import { MetalProfile, ProfileKey, profiles } from './profiles'

export const rectangularKeys: ProfileKey[] = ['sheet', 'plate', 'flat', 'strip']
export const rectangularName = 'Плоский прокат'
export const isRectangular = (key: ProfileKey) => rectangularKeys.includes(key)
export const profileGroupKey = (key: ProfileKey): ProfileKey => isRectangular(key) ? 'sheet' : key

// Calculation IDs remain stable for saved links, history, standards and tolerances.
export function groupProfiles(items: MetalProfile[], allowed: ProfileKey[] | null = null): MetalProfile[] {
  const seen = new Set<ProfileKey>()
  return items.filter(p => !allowed || allowed.includes(p.key)).flatMap(p => {
    const group = profileGroupKey(p.key)
    if (seen.has(group)) return []
    seen.add(group)
    return [{ ...p, name: isRectangular(p.key) ? rectangularName : p.name, icon: isRectangular(p.key) ? 'plate' : p.icon }]
  })
}

export function groupedProfileOrder(order: ProfileKey[]): ProfileKey[] {
  return Array.from(new Set(order.map(profileGroupKey)))
}

export function expandProfileOrder(order: ProfileKey[]): ProfileKey[] {
  return order.flatMap(key => isRectangular(key) ? rectangularKeys : [key])
}

export function rectangularProfiles(allowed: ProfileKey[] | null): MetalProfile[] {
  return rectangularKeys.filter(key => !allowed || allowed.includes(key)).map(key => profiles.find(p => p.key === key)!)
}
