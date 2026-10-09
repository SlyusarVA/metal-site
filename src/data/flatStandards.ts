import { getAllowedProfiles } from './materials'
import { rectangularProfiles } from './profileNavigation'
import { getProfileGostCodes } from './profileStandards'
import { findGostReference } from './gost'
import { ProfileKey } from './profiles'

export interface FlatStandardChoice { code: string | null; title: string; profileKey: ProfileKey; profileKeys: ProfileKey[] }
// One entry per standard: sheet and plate can share the same standard for steel.
export function getFlatStandardChoices(metalGroup: string): FlatStandardChoice[] {
  const choices: FlatStandardChoice[] = []
  for (const profile of rectangularProfiles(getAllowedProfiles(metalGroup))) {
    const codes = getProfileGostCodes(profile.key, metalGroup)
    for (const code of codes.length ? codes : [null]) {
      const existing = choices.find(c => c.code === code)
      if (existing) { existing.profileKeys.push(profile.key); continue }
      choices.push({ code, title: code ? findGostReference(code)?.title ?? profile.name : 'Расчёт по размерам — ГОСТ не указан', profileKey: profile.key, profileKeys: [profile.key] })
    }
  }
  // Keep the geometric rectangular calculation accessible where the catalog has no verified standard.
  for (const c of choices) if (!c.code && c.profileKeys.includes('flat')) c.profileKey = 'flat'
  return choices
}
