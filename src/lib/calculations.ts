// Ядро расчётов — конвертировано из Flutter calc_screen.dart
// Все формулы взяты из profiles_data.dart без изменений

import { profileMap, ProfileKey } from '../data/profiles'
import { getDensity } from '../data/materials'

export interface CalcInput {
  profileKey: ProfileKey
  params: Record<string, number>   // размеры в мм (или кг/м для рельса)
  metalGroup: string
  grade: string
  quantity: number
  length?: number | null           // метры
}

export interface CalcResult {
  mass: number           // кг (для всего количества)
  massOne: number        // кг (за 1 штуку)
  linearDensity: number  // кг/м — погонный вес
  density: number        // кг/м³
  sectionArea: number    // мм²
}

/**
 * Рассчитать массу по длине.
 * Формула: mass = density(кг/мм³) × sectionArea(мм²) × length(мм) × qty
 * Для isVolume (лист/плита): mass = density × volume(мм³) × qty
 */
export function calcMass(input: CalcInput): CalcResult | null {
  const profile = profileMap.get(input.profileKey)
  if (!profile) return null
  if (input.length == null || input.length <= 0) return null

  const density = getDensity(input.metalGroup, input.grade)   // кг/м³
  const densityMm3 = density * 1e-9                           // кг/мм³

  const area = profile.sectionArea(input.params)              // мм² или мм³

  let massOne: number

  if (profile.isVolume) {
    // Лист/Плита: объём уже в мм³, длина не используется
    massOne = densityMm3 * area
  } else {
    const lengthMm = input.length * 1000                      // м → мм
    massOne = densityMm3 * area * lengthMm
  }

  const mass = massOne * input.quantity
  const linearDensity = profile.isVolume ? 0 : densityMm3 * area * 1000 // кг/м

  return {
    mass: round(mass, 4),
    massOne: round(massOne, 4),
    linearDensity: round(linearDensity, 4),
    density,
    sectionArea: round(area, 4),
  }
}

/**
 * Обратный расчёт: длина по массе.
 * length = mass / (density_мм³ × sectionArea × qty) / 1000
 */
export function calcLength(
  massKg: number,
  input: Omit<CalcInput, 'length'>
): number | null {
  const profile = profileMap.get(input.profileKey)
  if (!profile || profile.isVolume) return null  // для листа обратный расчёт не применим
  if (massKg <= 0) return null

  const density = getDensity(input.metalGroup, input.grade)
  const densityMm3 = density * 1e-9
  const area = profile.sectionArea(input.params)

  if (area <= 0 || densityMm3 <= 0) return null

  const massOne = massKg / input.quantity
  const lengthMm = massOne / (densityMm3 * area)
  return round(lengthMm / 1000, 4)  // мм → м
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}
