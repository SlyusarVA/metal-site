/** ГОСТ 13726-2023: tables 2, 3, Б.1 and clauses 4.2.6, 4.2.10, 4.2.14.
 * Source and limitations: docs/standards/gost-13726-2023.md. */
export interface TapeOptions {
  accuracy: 'normal' | 'high' | 'symmetric'
  edges: 'trimmed' | 'untrimmed'
  manufacturing: 'rolled' | 'slit'
  parentWidth: number | null
  widthMinus: number | null
  widthPlus: number | null
}
export const defaultTapeOptions: TapeOptions = { accuracy: 'normal', edges: 'trimmed', manufacturing: 'rolled', parentWidth: null, widthMinus: null, widthPlus: null }
export function validTapeOptions(value: unknown): value is TapeOptions {
  if (!value || typeof value !== 'object') return false
  const o = value as TapeOptions
  return ['normal','high','symmetric'].includes(o.accuracy) && ['trimmed','untrimmed'].includes(o.edges) && ['rolled','slit'].includes(o.manufacturing) && [o.parentWidth,o.widthMinus,o.widthPlus].every(v => v === null || typeof v === 'number' && Number.isFinite(v) && v >= 0)
}
const coefficients: Record<string, number> = { А7:.950, А6:.950, А5:.950, А0:.950, АД0:.950, АД1:.950, АД00:.950, АД:.950, АМц:.958, АМцС:.958, ММ:.958, АМг2:.940, АМг3:.937, АМг5:.930, АМг6:.926, АВ:.947, '1915':.972, Д1:.982, Д16:.976, Д12:.954, В95:1, 'В95-1':1 }
export function tapeCoefficient(grade: string): number | undefined { return coefficients[grade === 'Д16Т' ? 'Д16' : grade] }
// All deviations in hundredths of a millimetre. null = dash, not a zero tolerance.
// Columns: <=600 asym, <=900 asym, <=1000 asym/sym, <=1200 normal/high/sym,
// <=1500 normal/high, <=1600 asym/sym; then <=1800, <=2000, <=2500, <=2800 asym/sym.
const rows: (number | null)[][] = [
[.2,5,8,8,3,null,null,4,null,null,null,6,null,6,null,7,null,null,null,null],
[.3,5,8,10,3,null,null,4,null,null,null,6,null,6,null,8,null,null,null,null],
[.4,5,8,10,3,12,10,5,11,10,12,6,13,7,14,9,null,null,null,null],
[.5,5,8,10,3,12,10,6,12,10,13,6,14,7,15,9,null,null,null,null],
[.6,5,10,12,4,12,10,6,13,11,13,8,15,9,16,10,null,null,null,null],
[.7,5,10,12,4,13,10,6,13,11,14,8,16,9,18,10,null,null,null,null],
[.8,10,12,12,5,13,12,7,14,12,14,10,16,11,18,12,null,null,null,null],
[.9,10,12,12,5,13,12,7,14,12,14,10,16,11,18,12,null,null,null,null],
[1,10,15,15,6,16,14,8,17,15,17,10,18,12,20,13,null,null,null,null],
[1.1,10,15,15,6,16,14,8,17,15,17,10,18,12,20,13,22,15,null,null],
[1.2,10,15,15,7,16,14,9,17,15,17,12,20,13,22,14,24,18,null,null],
[1.3,10,15,15,7,18,16,9,20,17,20,12,22,13,26,14,28,18,null,null],
[1.4,10,15,15,7,18,16,9,20,17,20,12,22,14,26,15,28,18,null,null],
[1.5,15,20,20,7,22,18,10,25,20,25,14,26,15,27,16,30,18,null,null],
[1.6,15,20,20,7,22,18,10,25,22,25,14,26,15,27,16,30,20,null,null],
[1.7,15,20,20,8,22,20,10,25,22,25,14,26,16,27,17,30,20,null,null],
[1.8,15,20,20,8,22,20,11,25,22,25,14,26,16,27,17,32,20,null,null],
[1.9,15,20,20,8,22,20,11,25,22,25,14,26,16,27,18,32,20,null,null],
[2,15,20,20,9,24,20,12,25,24,25,16,26,17,28,18,35,20,null,null],
[2.5,16,25,25,10,28,22,13,29,25,29,17,30,18,30,20,35,22,null,null],
[3,18,30,30,11,33,25,14,34,30,34,18,35,20,35,22,40,24,null,null],
[3.5,20,30,30,12,34,26,16,35,30,35,20,36,22,36,24,42,25,null,null],
[4,25,30,30,15,35,30,18,36,32,36,22,37,25,37,27,45,30,null,null],
[4.5,25,30,30,15,35,30,18,36,32,36,22,37,25,37,27,45,30,null,null],
[5,null,null,null,18,null,null,22,null,null,null,25,null,30,null,32,null,35,null,40],
[5.5,null,null,null,18,null,null,22,null,null,null,25,null,30,null,32,null,35,null,40],
[6,null,null,null,22,null,null,25,null,null,null,30,null,35,null,36,null,40,null,45],
[6.5,null,null,null,22,null,null,25,null,null,null,30,null,35,null,36,null,40,null,45],
[7,null,null,null,22,null,null,25,null,null,null,30,null,35,null,36,null,45,null,50],
[7.5,null,null,null,22,null,null,25,null,null,null,30,null,35,null,36,null,45,null,50],
[8,null,null,null,30,null,null,30,null,null,null,35,null,38,null,40,null,50,null,55],
[8.5,null,null,null,30,null,null,30,null,null,null,35,null,38,null,40,null,50,null,55],
[9,null,null,null,30,null,null,30,null,null,null,35,null,38,null,40,null,55,null,60],
[9.5,null,null,null,30,null,null,30,null,null,null,35,null,38,null,40,null,55,null,60],
[10,null,null,null,35,null,null,35,null,null,null,38,null,40,null,45,null,60,null,65],
[10.5,null,null,null,35,null,null,35,null,null,null,38,null,40,null,45,null,65,null,70],
]
export interface TapeBasis {
  coefficient: number; density: number; thicknessMin: number; thicknessMax: number
  widthMin: number; widthMax: number; meanThickness: number; meanWidth: number
  linearMass: number; referenceMass: number; symmetric: boolean; thicknessWidth: number
}
export function tapeBasis(grade: string, t: number, b: number, options: TapeOptions = defaultTapeOptions): TapeBasis | string {
  if (!validTapeOptions(options)) return 'Проверьте параметры ленты.'
  const k = tapeCoefficient(grade)
  if (k == null) return 'Для марки ' + grade + ' нет подтверждённого коэффициента в таблице Б.1 ГОСТ 13726-2023.'
  if (!Number.isFinite(t) || !Number.isFinite(b) || t < .2 || t > 10.5 || b < 20 || b > 2800) return 'ГОСТ 13726-2023: толщина 0,2–10,5 мм, ширина 20–2800 мм.'
  const row = rows.find(r => Math.abs(r[0]! - t) < 1e-8)
  if (!row) return 'Для этой промежуточной толщины нет строки таблицы 2. Уточните допуск у поставщика; ближайшую строку автоматически не подставляем.'
  const slit = options.manufacturing === 'slit'
  const w = slit ? options.parentWidth : b
  if (w == null || !Number.isFinite(w) || w > 2800 || (slit && (w <= 1000 || w <= b || b >= 1000 || t > 5))) return 'Для резаной ленты нужны толщина до 5 мм, ширина менее 1000 мм и ширина исходной ленты свыше 1000 мм (до 2800 мм).'
  if (!slit && ((b <= 300 && b % 5 !== 0) || (b > 300 && b <= 500 && b % 50 !== 0))) return 'Для прокатанной ленты ширина до 300 мм кратна 5 мм, свыше 300 до 500 мм — 50 мм. Для других размеров выберите продольную резку.'
  // Thickness >=5 has only symmetric tolerances in table 2; normal baseline resolves to that column.
  const symmetric = options.accuracy === 'symmetric' || t >= 5 && options.accuracy === 'normal'
  const high = options.accuracy === 'high'
  const col = w <= 1000 ? (symmetric ? 4 : w <= 600 ? 1 : w <= 900 ? 2 : 3)
    : w <= 1200 ? (symmetric ? 7 : high ? 6 : 5)
    : w <= 1600 ? (symmetric ? 11 : w <= 1500 ? high ? 9 : 8 : 10)
    : w <= 1800 ? symmetric ? 13 : 12
    : w <= 2000 ? symmetric ? 15 : 14
    : w <= 2500 ? symmetric ? 17 : 16 : symmetric ? 19 : 18
  const deviation = row[col]
  if (deviation == null) return 'Для выбранной толщины, ширины и точности таблица 2 не задаёт допуск. Проверьте исполнение в «Точном расчёте».'
  let minus: number, plus: number
  if (slit) {
    if (options.widthMinus == null || options.widthPlus == null) return 'Для резаной ленты укажите согласованные с поставщиком отклонения ширины (п. 4.2.5).'
    minus = options.widthMinus; plus = options.widthPlus
  } else if (options.edges === 'trimmed') {
    if (t > 5) return 'Таблица 3 задаёт допуск обрезанной ширины только до 5 мм. Для более толстой ленты нужны условия поставки.'
    const bands = [200,400,600,1000,1800,2800]
    const deviations = t <= 1 ? [.5,1,2,5,6,6] : t <= 2 ? [.6,1,3,5,6,6] : t <= 4 ? [1,1.5,4,5,6,6] : [1.5,2,5,6,7,7]
    minus = plus = deviations[bands.findIndex(v => b <= v)]
  } else {
    if (b <= 1000) return 'Без обрезки кромок базовое исполнение предусмотрено при ширине свыше 1000 мм; узкая лента требует согласования.'
    minus = 0; plus = b > 2000 ? 100 : ['А7','А6','А5','А0','АД0','АД1','АД00','АД','ММ','АМц','АМцС','АМг2'].includes(grade) ? 50 : 80
  }
  const thicknessMin = t - deviation / 100
  const thicknessMax = symmetric ? t + deviation / 100 : t
  const widthMin = b - minus, widthMax = b + plus
  if (thicknessMin <= 0 || widthMin <= 0) return 'Предельные размеры должны быть положительными.'
  const meanThickness = (thicknessMin + thicknessMax) / 2, meanWidth = (widthMin + widthMax) / 2
  const referenceMass = meanThickness * meanWidth * .00285
  return { coefficient:k, density:2850*k, thicknessMin, thicknessMax, widthMin, widthMax, meanThickness, meanWidth, referenceMass, linearMass:referenceMass*k, symmetric, thicknessWidth:w }
}
