import { ProfileKey } from './profiles'
import { gostMappings } from './gostSearch'

// A product shape alone cannot determine the material-specific standard.
export function getProfileGostCodes(profileKey: ProfileKey, metalGroup: string): string[] {
  return gostMappings.filter(item => item.profileKeys.includes(profileKey) && item.metalGroups.includes(metalGroup)).map(item => item.code)
}
