import { tapeBasis, TapeBasis, TapeOptions, defaultTapeOptions } from '../data/aluminumTape'
import { plateBasis, PlateBasis, PlateOptions, defaultPlateOptions } from '../data/aluminumPlate'
// Ядро расчётов — конвертировано из Flutter calc_screen.dart
// Все формулы взяты из profiles_data.dart без изменений

import { profileMap, ProfileKey } from '../data/profiles'
import { getDensity } from '../data/materials'
import { sheetBasis, defaultSheetOptions, SheetOptions, SheetBasis } from '../data/aluminumSheet'
import { validateDimensions } from './validation'

export interface CalcInput {
  tapeOptions?: TapeOptions
  plateOptions?: PlateOptions
  sheetOptions?: SheetOptions
  profileKey: ProfileKey
  params: Record<string, number>   // размеры в мм (или кг/м для рельса)
  metalGroup: string
  grade: string
  quantity: number
  length?: number | null           // метры
}

export interface CalcResult {
  tapeBasis?: TapeBasis
  plateBasis?: PlateBasis
  sheetBasis?: SheetBasis
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
  // Legacy sheet/plate links and records store length as params.a in millimetres.
  if ((input.profileKey === 'sheet' || input.profileKey === 'plate') && input.length == null && input.params.a != null) {
    input = { ...input, length: input.params.a / 1000 }
  }
  const profile = profileMap.get(input.profileKey)
  if (!profile || validateDimensions(input.profileKey, input.params)) return null
  if (!Number.isSafeInteger(input.quantity) || input.quantity <= 0) return null
  if (!profile.isVolume && (input.length == null || !Number.isFinite(input.length) || input.length <= 0)) return null

  const basis = input.metalGroup === 'Алюминий' ? (input.profileKey === 'sheet' ? sheetBasis(input.grade, input.params.t, input.params.b, input.sheetOptions ?? defaultSheetOptions) : input.profileKey === 'plate' ? plateBasis(input.grade, input.params.t, input.params.b, input.plateOptions ?? defaultPlateOptions) : input.profileKey === 'strip' ? tapeBasis(input.grade, input.params.t, input.params.b, input.tapeOptions ?? defaultTapeOptions) : undefined) : undefined
  if (typeof basis === 'string') return null
  const density = basis?.density ?? getDensity(input.metalGroup, input.grade)   // кг/м³
  const densityMm3 = density * 1e-9                           // кг/мм³

  const area = basis ? basis.meanThickness * basis.meanWidth : profile.sectionArea(input.params)              // мм² или мм³

  let massOne: number

  if (profile.isVolume) {
    // Лист/Плита: объём уже в мм³, длина не используется
    massOne = densityMm3 * area
  } else {
    const lengthMm = input.length! * 1000                      // м → мм
    massOne = basis ? basis.linearMass * input.length! : densityMm3 * area * lengthMm
  }

  const mass = massOne * input.quantity
  const linearDensity = profile.isVolume ? 0 : basis?.linearMass ?? densityMm3 * area * 1000 // кг/м
  if (![density, mass, massOne].every(v => Number.isFinite(v) && v > 0) || !Number.isFinite(linearDensity)) return null

  return {
    tapeBasis: input.profileKey === 'strip' ? basis as TapeBasis | undefined : undefined,
    plateBasis: input.profileKey === 'plate' ? basis as PlateBasis | undefined : undefined,
    sheetBasis: input.profileKey === 'sheet' ? basis as SheetBasis | undefined : undefined,
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
  if (!profile || profile.isVolume) return null
  if (!Number.isFinite(massKg) || massKg <= 0) return null
  if (!Number.isSafeInteger(input.quantity) || input.quantity <= 0) return null
  if (validateDimensions(input.profileKey, input.params)) return null

  const basis = input.metalGroup === 'Алюминий' ? (input.profileKey === 'sheet' ? sheetBasis(input.grade, input.params.t, input.params.b, input.sheetOptions ?? defaultSheetOptions) : input.profileKey === 'plate' ? plateBasis(input.grade, input.params.t, input.params.b, input.plateOptions ?? defaultPlateOptions) : input.profileKey === 'strip' ? tapeBasis(input.grade, input.params.t, input.params.b, input.tapeOptions ?? defaultTapeOptions) : undefined) : undefined
  if (typeof basis === 'string') return null
  const density = basis?.density ?? getDensity(input.metalGroup, input.grade)
  const densityMm3 = density * 1e-9
  const area = basis ? basis.meanThickness * basis.meanWidth : profile.sectionArea(input.params)

  if (area <= 0 || densityMm3 <= 0) return null

  const massOne = massKg / input.quantity
  const lengthMm = massOne / (densityMm3 * area)
  const length = basis ? massOne / basis.linearMass : lengthMm / 1000
  return Number.isFinite(length) && length > 0 ? round(length, 4) : null
}

function round(value: number, decimals: number): number {
  return Number(value.toFixed(decimals))
}
