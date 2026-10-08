import { ProfileKey } from './profiles'
export interface BrassOptions { manufacturing: 'drawn' | 'pressed'; accuracy: 'high' | 'increased' | 'normal' }
export const defaultBrassOptions: BrassOptions = { manufacturing: 'drawn', accuracy: 'normal' }
export function validBrassOptions(value: unknown): value is BrassOptions {
  const v = value as BrassOptions | null
  return !!v && ['drawn','pressed'].includes(v.manufacturing) && ['high','increased','normal'].includes(v.accuracy)
}
export const isBrassBar = (key: ProfileKey, metal: string) => metal === 'Латунь' && ['rod','square','hexagon'].includes(key)
// ГОСТ 2060-2006 table 1; supplied page, section 4.1. Only drawn bars <=50 mm.
const limits = [
  [3,.04,.05,.10,null,.10], [4.5,.05,.08,.15,null,.15],
  [6,.05,.08,.15,.08,.15], [10,.06,.11,.20,.11,.20],
  [18,.07,.14,.25,.14,.25], [30,.08,.17,.30,.17,.30], [50,.10,.20,.60,.20,.60],
]
const pressedLimits = [
  [10,.18,.29,null,null], [18,.22,.35,null,null], [30,.26,.42,.26,.42],
  [50,.31,.50,null,.50], [80,null,.60,null,.60], [100,null,.70,null,.70],
  [120,null,1.10,null,null], [160,null,1.25,null,null], [180,null,1.40,null,null],
]
export function brassAvailabilityError(key: ProfileKey, size: number, options: BrassOptions): string | null {
  if (options.manufacturing === 'pressed' && Number.isFinite(size) && size > 0 && size <= 180 && brassDimensionTolerance(key, size, options) == null) return 'Таблица 2 ГОСТ 2060-2006 не предусматривает прессованный пруток выбранного сечения, размера и точности (знак «—»).'
  return null
}
export function brassDimensionTolerance(key: ProfileKey, size: number, options: BrassOptions): number | null {
  if (!validBrassOptions(options) || !Number.isFinite(size) || size <= 0) return null
  if (options.manufacturing === 'pressed') {
    if (size > 180 || options.accuracy === 'high') return null
    const row = pressedLimits.find(r => size <= r[0]!)!
    const col = key === 'rod' ? (options.accuracy === 'increased' ? 1 : 2) : key === 'square' || key === 'hexagon' ? (options.accuracy === 'increased' ? 3 : 4) : -1
    return col < 0 ? null : row[col]
  }
  if (size > 50) return null
  const row = limits.find(r => size <= r[0]!)!
  if (key === 'rod') return row[{ high:1, increased:2, normal:3 }[options.accuracy]]
  if (key !== 'square' && key !== 'hexagon' || options.accuracy === 'high') return null
  return row[options.accuracy === 'increased' ? 4 : 5]
}
export function brassMassRange(key: ProfileKey, size: number, options: BrassOptions) {
  const delta = brassDimensionTolerance(key, size, options)
  if (delta == null || size <= delta) return null
  // All three sections scale with the square of diameter / across-flats size.
  return { minus: 1 - ((size-delta)/size)**2, plus: ((size+delta)/size)**2 - 1,
    label: `По размеру ±${delta.toLocaleString('ru-RU')} мм (ГОСТ 2060, табл. ${options.manufacturing === 'drawn' ? 1 : 2})` }
}
