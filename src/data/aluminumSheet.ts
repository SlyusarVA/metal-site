// Verified from ГОСТ 21631-2023, tables 1, 3 and Б.1, clause 4.1.1.
// Source: https://23met.ru/gost_files/gost-21631-2023.pdf (November 2024 edition).
export type SheetAccuracy = 'normal' | 'high'
export interface SheetOptions {
  thicknessAccuracy: SheetAccuracy
  widthAccuracy: SheetAccuracy
  condition: 'annealed' | 'untreated' | 'other'
  symmetric: boolean
}
export const defaultSheetOptions: SheetOptions = { thicknessAccuracy: 'normal', widthAccuracy: 'normal', condition: 'annealed', symmetric: false }
export function validSheetOptions(v: unknown): v is SheetOptions {
  if (!v || typeof v !== 'object') return false
  const o = v as SheetOptions
  return ['normal','high'].includes(o.thicknessAccuracy) && ['normal','high'].includes(o.widthAccuracy) && ['annealed','untreated','other'].includes(o.condition) && typeof o.symmetric === 'boolean'
}
// Columns: thickness; at width <=600, <=1000, <=1400, <=1800, <=2000:
// high/normal pairs; then normal only at <=2500 and <=2800. Values are hundredths mm.
const rows: (number | null)[][] = [
[.3,4,5,6,8,null,null,null,null,null,null,null,null],
[.4,4,5,6,8,10,12,null,null,null,null,null,null],
[.5,4,5,6,8,10,12,10,12,null,null,null,null],
[.6,5,6,8,10,10,12,11,13,null,null,null,null],
[.7,5,6,8,10,10,12,11,13,null,null,null,null],
[.8,6,8,10,12,12,13,12,14,14,16,null,null],
[.9,6,8,10,12,12,13,12,14,14,16,null,null],
[1,8,10,12,15,14,16,15,17,16,18,null,null],
[1.2,8,10,12,15,14,16,15,17,18,20,25,null],
[1.5,10,15,14,20,18,22,20,25,24,26,30,null],
[1.6,10,15,14,20,18,22,22,25,24,26,32,null],
[1.8,10,15,16,20,20,22,22,25,24,26,32,null],
[1.9,10,15,16,20,20,22,22,25,24,26,34,null],
[2,10,15,16,20,20,24,24,26,25,27,36,null],
[2.5,12,20,18,25,22,28,26,29,28,30,38,null],
[3,14,25,20,30,26,30,28,34,33,35,38,null],
[3.5,16,25,22,30,28,32,30,35,34,36,42,null],
[4,18,25,24,30,32,35,34,36,35,37,45,null],
[4.5,20,25,26,30,34,35,34,36,35,37,48,null],
[5,24,30,30,35,34,36,35,37,36,38,50,56],
[5.5,24,30,30,35,34,36,35,37,36,38,55,60],
[6,28,30,35,40,38,41,40,42,41,43,58,62],
[6.5,28,30,35,40,38,41,40,42,41,43,60,65],
[7,28,30,35,40,40,42,41,43,42,44,62,68],
[7.5,28,30,35,40,40,42,41,43,42,44,65,70],
[8,33,35,40,45,44,46,45,47,46,48,70,75],
[8.5,33,35,40,45,44,46,45,47,46,48,72,78],
[9,33,35,40,45,45,47,46,48,47,49,75,80],
[9.5,33,35,40,45,45,47,46,48,47,49,80,85],
[10,38,40,45,50,48,50,48,50,48,50,85,90],
[10.5,38,40,45,50,48,50,48,50,48,50,90,95],
]
const densities: Record<string, number> = { 'А7':2710,'А6':2710,'А5':2710,'А0':2710,'АД0':2710,'АД1':2710,'АД00':2710,'АД':2710,'АМц':2730,'АМцС':2730,'1407':2700,'АМг2':2690,'АМг3':2660,'АМг5':2650,'АМг6':2650,'ВД1':2800,'1565ч':2650,'1580':2650,'1581':2650,'Д16':2770,'В95':2850,'1915':2770,'Д12':2720 }
export const sheetGrade = (grade: string) => grade === 'Д16Т' ? 'Д16' : grade
export const sheetDensity = (grade: string): number | null => densities[sheetGrade(grade)] ?? null
export interface SheetBasis { density: number; thicknessMin: number; thicknessMax: number; widthMin: number; widthMax: number; meanThickness: number; meanWidth: number; linearMass: number; referenceThickness: number }
export function sheetBasis(grade: string, thickness: number, width: number, options: SheetOptions): SheetBasis | string {
  if (!validSheetOptions(options)) return 'Проверьте параметры точности и состояния листа.'
  const density = sheetDensity(grade)
  if (density == null) return `Марки ${grade} нет в таблице Б.1 ГОСТ 21631-2023. Выберите марку из этой таблицы.`
  if (!Number.isFinite(thickness) || !Number.isFinite(width) || thickness < .3 || thickness > 10.5 || width < 600 || width > 2800) return 'Таблица 1 ГОСТ 21631-2023: толщина 0,3–10,5 мм, ширина 600–2800 мм.'
  const row = [...rows].reverse().find(r => r[0]! <= thickness)!
  const band = [600,1000,1400,1800,2000,2500,2800].findIndex(max => width <= max)
  if (band >= 5 && options.thicknessAccuracy === 'high') return 'Для ширины свыше 2000 мм в таблице 1 нет повышенной точности толщины.'
  const column = band < 5 ? 1 + band * 2 + (options.thicknessAccuracy === 'normal' ? 1 : 0) : band + 6
  const cell = row[column]
  if (cell == null) return 'В таблице 1 нет допуска для выбранного сочетания толщины, ширины и точности.'
  const special = ['АМг3','АМг5','АМг6','1565ч'].includes(sheetGrade(grade)) && thickness >= 5 && options.condition !== 'other'
  if (options.symmetric && (thickness < 1.2 || width > 2000)) return 'Симметричное поле по примечанию 3: толщина 1,2–10,5 мм, ширина до 2000 мм.'
  const delta = cell / 100
  const thicknessMin = special ? thickness * .95 : thickness - (options.symmetric ? delta / 2 : delta)
  const thicknessMax = special ? thickness * 1.05 : thickness + (options.symmetric ? delta / 2 : 0)
  if (options.widthAccuracy === 'high' && width > 1000) return 'Повышенная точность ширины свыше 1000 мм устанавливается соглашением сторон; табличного допуска нет.'
  const widthDelta = thickness <= 5 ? (width <= 1000 ? (options.widthAccuracy === 'high' ? 6 : 8) : width <= 2000 ? 10 : 20) : (width <= 1000 ? (options.widthAccuracy === 'high' ? 10 : 12) : width <= 2000 ? 15 : 30)
  const meanThickness = (thicknessMin + thicknessMax) / 2
  const meanWidth = width + widthDelta / 2
  return { density, thicknessMin, thicknessMax, widthMin: width, widthMax: width + widthDelta, meanThickness, meanWidth, linearMass: meanThickness * meanWidth * density * 1e-6, referenceThickness: row[0]! }
}
