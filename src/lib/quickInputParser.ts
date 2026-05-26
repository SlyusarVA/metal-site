import { materials } from '@/data/materials'
import { profiles, ProfileKey } from '@/data/profiles'

interface QuickInputParsed {
  ok: true
  metalGroup: string
  grade: string
  profileKey: ProfileKey
  params: Record<string, number>
  mass: number
  chips: string[]
  unsupportedReason?: string
}

interface QuickInputError {
  ok: false
  message: string
}

export type QuickInputResult = QuickInputParsed | QuickInputError

const GROUP_ALIASES: Record<string, string[]> = {
  'Сталь': ['сталь', 'стал', 'стальной'],
  'Нержавейка': ['нержавейка', 'нерж', 'нержавеющая сталь', 'нержавеющую сталь'],
  'Алюминий': ['алюминий', 'алюм'],
  'Латунь': ['латунь', 'лат'],
  'Медь': ['медь', 'медный'],
  'Бронза': ['бронза'],
  'Титан': ['титан'],
  'Никель': ['никель'],
  'Нихром': ['нихром'],
  'Вольфрам': ['вольфрам'],
  'Молибден': ['молибден'],
  'Цинк': ['цинк'],
  'Цирконий': ['цирконий'],
}

const PROFILE_ALIASES: Record<ProfileKey, string[]> = {
  round: ['круг', 'круглый прокат'],
  rod: ['пруток', 'прут'],
  sheet: ['лист'],
  pipe: ['труба кр', 'труба круглая', 'труба'],
  pipe_prof: ['профильная труба', 'труба проф', 'проф труба'],
  strip: ['лента'],
  plate: ['плита'],
  wire: ['проволока'],
  angle_equal: ['уголок равн', 'уголок'],
  hexagon: ['шестигранник', 'шестигр'],
  armature: ['арматура'],
  beam: ['балка'],
  square: ['квадрат'],
  flat: ['полоса'],
  rail: ['рельс'],
  angle_unequal: ['уголок неравн'],
  channel: ['швеллер'],
  shpunt: ['шпунт'],
}

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[×*]/g, 'х')
    .replace(/,/g, '.')
    .replace(/\s+/g, ' ')
    .trim()
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function hasWord(input: string, word: string): boolean {
  const normalizedWord = normalize(word)
  const escaped = escapeRegExp(normalizedWord)
  return new RegExp(`(^|[^0-9a-zа-я])${escaped}([^0-9a-zа-я]|$)`, 'i').test(input)
}

function removeWord(input: string, word: string): string {
  const escaped = escapeRegExp(normalize(word))
  return input.replace(new RegExp(`(^|[^0-9a-zа-я])${escaped}([^0-9a-zа-я]|$)`, 'ig'), ' ')
}

function findMetalGroup(input: string, fallbackGroup: string): string {
  for (const [group, aliases] of Object.entries(GROUP_ALIASES)) {
    if (aliases.some(alias => hasWord(input, alias))) return group
  }
  return fallbackGroup
}

function findGrade(input: string, group: string): string | null {
  const groupGrades = materials
    .filter(m => m.group === group)
    .map(m => m.grade)
    .sort((a, b) => b.length - a.length)

  for (const grade of groupGrades) {
    if (hasWord(input, grade)) return grade
  }

  return null
}

function findProfile(input: string): ProfileKey | null {
  const entries = Object.entries(PROFILE_ALIASES) as [ProfileKey, string[]][]
  entries.sort(([, a], [, b]) => Math.max(...b.map(x => x.length)) - Math.max(...a.map(x => x.length)))

  for (const [profileKey, aliases] of entries) {
    if (aliases.some(alias => hasWord(input, alias))) return profileKey
  }

  return null
}

function findMass(input: string): number | null {
  const explicit = input.match(/(?:масса|вес)\s*[:=]?\s*(\d+(?:\.\d+)?)\s*(?:кг|kg|к)?\b/)
  if (explicit) return Number(explicit[1])

  const withUnit = input.match(/(\d+(?:\.\d+)?)\s*(?:кг|kg|к)\b/)
  if (withUnit) return Number(withUnit[1])

  const numbers = input.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? []
  // Fallback for warehouse-style shorthand: "круг 16 сталь 45 120".
  // The last number is treated as mass only when no explicit kg marker exists.
  return numbers.length >= 3 ? numbers[numbers.length - 1] : null
}

function removeMass(input: string): string {
  return input
    .replace(/(?:масса|вес)\s*[:=]?\s*\d+(?:\.\d+)?\s*(?:кг|kg|к)?\b/g, ' ')
    .replace(/\d+(?:\.\d+)?\s*(?:кг|kg|к)\b/g, ' ')
}

function extractDimensionSource(input: string, group: string, grade: string, profileKey: ProfileKey, mass: number): string {
  let source = input
  for (const aliases of Object.values(GROUP_ALIASES)) {
    for (const alias of aliases) source = removeWord(source, alias)
  }
  source = removeWord(source, grade)
  for (const alias of PROFILE_ALIASES[profileKey] ?? []) source = removeWord(source, alias)
  source = removeMass(source)
  // Remove one remaining mass token for shorthand without unit: "круг 16 сталь 45 120".
  source = source.replace(new RegExp(`(^|\\s)${escapeRegExp(String(mass))}(?=\\s|$)`), ' ')
  return source.replace(/\s+/g, ' ').trim()
}

function parseParams(profileKey: ProfileKey, source: string): Record<string, number> | null {
  const profile = profiles.find(p => p.key === profileKey)
  if (!profile) return null

  const compact = source.replace(/\s+/g, '')
  const numbers = source.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? []

  if (profileKey === 'pipe_prof') {
    const m = compact.match(/(\d+(?:\.\d+)?)х(\d+(?:\.\d+)?)х(\d+(?:\.\d+)?)/)
    return m ? { a: Number(m[1]), b: Number(m[2]), t: Number(m[3]) } : null
  }

  if (profileKey === 'pipe') {
    const m = compact.match(/(\d+(?:\.\d+)?)х(\d+(?:\.\d+)?)/)
    return m ? { d: Number(m[1]), t: Number(m[2]) } : null
  }

  if (profileKey === 'angle_equal') {
    const m = compact.match(/(\d+(?:\.\d+)?)х(?:\1х)?(\d+(?:\.\d+)?)/)
    if (m) return { b: Number(m[1]), t: Number(m[2]) }
  }

  if (profileKey === 'sheet' || profileKey === 'plate') {
    const m = compact.match(/(\d+(?:\.\d+)?)х(\d+(?:\.\d+)?)(?:х(\d+(?:\.\d+)?))?/)
    if (m) {
      const first = Number(m[1])
      const second = Number(m[2])
      const third = m[3] ? Number(m[3]) : undefined
      return third != null
        ? { a: second, b: third, t: first }
        : { a: 1000, b: second, t: first }
    }
  }

  if ((profileKey === 'flat' || profileKey === 'strip') && numbers.length >= 2) {
    return { b: numbers[0], t: numbers[1] }
  }

  if (profile.params.length === 1 && numbers.length >= 1) {
    return { [profile.params[0].key]: numbers[0] }
  }

  return null
}

function buildParamChip(profileKey: ProfileKey, params: Record<string, number>): string {
  if ('d' in params) return `Ø${params.d}`
  if (profileKey === 'pipe_prof') return `${params.a}×${params.b}×${params.t}`
  if (profileKey === 'pipe') return `${params.d}×${params.t}`
  if ('a' in params && 'b' in params && 't' in params) return `${params.t}×${params.b}`
  if ('b' in params && 't' in params) return `${params.b}×${params.t}`
  return Object.values(params).join('×')
}

export function parseQuickInput(input: string, fallbackGroup: string): QuickInputResult {
  const normalized = normalize(input)

  if (!normalized) {
    return { ok: false, message: 'Введите строку. Пример: «Сталь 20 круг 16 масса 120 кг».' }
  }

  const metalGroup = findMetalGroup(normalized, fallbackGroup)
  const grade = findGrade(normalized, metalGroup)
  if (!grade) {
    return { ok: false, message: `Не удалось определить марку для группы «${metalGroup}». Пример: «Сталь 20 круг 16 масса 120 кг».` }
  }

  const profileKey = findProfile(normalized)
  if (!profileKey) {
    return { ok: false, message: 'Не удалось определить сортамент. Пример: «круг 16», «труба 57х3», «полоса 40х4».' }
  }

  const mass = findMass(normalized)
  if (mass == null || mass <= 0) {
    return { ok: false, message: 'Не удалось распознать массу. Укажите значение в кг, например: «масса 120 кг».' }
  }

  const dimensionSource = extractDimensionSource(normalized, metalGroup, grade, profileKey, mass)
  const params = parseParams(profileKey, dimensionSource)
  if (!params) {
    return { ok: false, message: 'Не удалось распознать размеры. Примеры: «круг 16», «труба 57х3», «полоса 40х4».' }
  }

  const profile = profiles.find(p => p.key === profileKey)

  return {
    ok: true,
    metalGroup,
    grade,
    profileKey,
    params,
    mass,
    chips: [metalGroup, grade, profile?.name ?? profileKey, buildParamChip(profileKey, params), `${mass} кг`],
    unsupportedReason: profile?.isVolume
      ? 'Для листа и плиты расчёт длины по массе требует отдельной логики раскроя. Данные распознаны, но автоматический расчёт длины пока отключён.'
      : undefined,
  }
}
