import { ProfileKey } from './profiles'
export interface BrassFlatOptions { product: 'cold-sheet' | 'hot-sheet' | 'tape' | 'plate'; accuracy: 'normal' | 'increased' }
export const defaultBrassFlatOptions: BrassFlatOptions = { product: 'cold-sheet', accuracy: 'normal' }
export function validBrassFlatOptions(value: unknown): value is BrassFlatOptions {
  const v = value as BrassFlatOptions | null
  return !!v && ['cold-sheet','hot-sheet','tape','plate'].includes(v.product) && ['normal','increased'].includes(v.accuracy)
}
export function brassFlatDensity(grade: string): number | null {
  if (['Л63','ЛС59-1'].includes(grade)) return 8400
  if (['Л70','Л68','ЛО62-1','ЛМц58-2'].includes(grade)) return 8500
  if (grade === 'Л80') return 8700
  if (['Л90','Л85','ЛО90-1'].includes(grade)) return 8800
  return null
}
// Reviewed numeric rules: docs/standards/gost-2208-2007.md. Table 1 columns: normal/increased <=300, <=600, then <=800, <=1000.
const cold: (number | null)[][] = [
 [.1,.01,null,null,null,null,null], [.14,.02,null,.04,null,null,null], [.22,.03,.02,.04,null,null,null],
 [.35,.04,.03,.05,null,null,null], [.5,.05,.04,.06,.05,.09,.12], [.7,.06,.05,.08,.07,.10,.15],
 [.9,.07,.06,.09,.08,.12,.17], [1.1,.08,.06,.10,.09,.12,.17], [1.5,.09,.07,.12,.11,.14,.18],
 [1.8,.10,.08,.14,.13,.16,.20], [2,.11,.09,.15,.14,.18,.22], [2.2,.12,.10,.16,.10,.18,.22],
 [3,.14,.12,.18,.12,.20,.24], [3.5,.14,.12,.20,.12,.24,.28], [4,.18,.12,.22,.12,.24,.30],
 [4.5,.18,.14,.24,.14,.27,.32], [6.5,.22,.14,.26,.14,.30,.34], [7,.25,.16,.28,.16,.34,.36],
 [8,.25,null,.30,.16,.36,.44], [9,.30,.18,.32,.18,.40,.50], [10,.30,.18,.34,.18,.40,.50],
 [11,.36,null,.40,null,.50,.60], [12,.36,null,.44,null,.50,.70],
]
const tapeWidth: (number | null)[][] = [
 [.1,.5,.3,.5,.4,.8,.7,null,null,null,null,null,null],
 [1,.5,.3,.5,.4,.8,.7,1.2,1,2,1.8,2.6,2.3],
 [2,.8,.4,.8,.6,1.3,1,1.6,1.2,2.8,2.6,3.5,3.2],
 [3,2,1.2,3,1.6,3,2,3,2,null,null,null,null],
 [4,3,2.5,3.5,3,3.5,3,4,3.5,null,null,null,null],
]
const hot: (number | null)[][] = [
 [3.5,.4,.6,null,null],[6,.45,.7,.9,null],[7,.5,.7,.9,null],[8,.5,.8,1,1.2],
 [9,.55,.8,1,1.2],[10,.55,.9,1,1.2],[11,.7,.9,1,1.2],[12,.8,1,1.1,1.2],
 [13,.9,1,1.2,1.4],[14,.9,1.1,1.3,1.5],[15,1,1.2,1.4,1.6],
 [16,1,1.3,1.5,1.6],[17,1.2,1.4,1.5,1.6],[19,1.2,1.5,1.6,1.8],
 [22,1.4,1.6,1.8,2],[25,1.6,1.8,1.8,null],
]
export interface BrassFlatBasis { density: number; meanThickness: number; meanWidth: number; thicknessMin: number; thicknessMax: number; widthMin: number; widthMax: number; linearMass: number; product: BrassFlatOptions['product'] }
export function brassFlatBasis(grade: string, t: number, b: number, options: BrassFlatOptions = defaultBrassFlatOptions): BrassFlatBasis | string {
  const density = brassFlatDensity(grade)
  if (density == null) return 'Для этой марки нет подтверждённой расчётной плотности в приложении А ГОСТ 2208-2007.'
  if (!validBrassFlatOptions(options) || !Number.isFinite(t) || !Number.isFinite(b) || t <= 0 || b <= 0) return 'Укажите положительные размеры и исполнение по ГОСТ 2208-2007.'
  let dt: number | null = null, dw: number | null = null, plusWidth = false
  const increased = options.accuracy === 'increased' ? 1 : 0
  if (options.product === 'cold-sheet' || options.product === 'tape') {
    const minimum = options.product === 'tape' ? .05 : .2
    const maximum = options.product === 'tape' ? 4 : 12
    if (t < minimum || t > maximum || b < 10 || b > 1000) return 'ГОСТ 2208-2007: холоднокатаный лист 0,20–12 мм, лента/фольга 0,05–4 мм; ширина по таблице 1 — 10–1000 мм.'
    const row = cold.find(r => t <= r[0]!)!
    // At 0.10 mm foil and tape have distinct rows: tape uses the 0.10–0.14 interval.
    const thicknessRow = options.product === 'tape' && t === .1 ? cold[1] : row
    dt = thicknessRow[b <= 300 ? 1+increased : b <= 600 ? 3+increased : b <= 800 ? 5 : 6]
    if (options.product === 'tape') {
      if (b > 600 && t < .5) return 'ГОСТ 2208-2007: ленты шириной свыше 600 мм изготовляют толщиной от 0,50 мм.'
      const row = t === .1 ? tapeWidth[1] : tapeWidth.find(r => t <= r[0]!)!
      const band = [100,170,300,600,800,1000].findIndex(limit => b <= limit)
      dw = row[1 + band*2 + increased]
    } else {
      const row = t <= 2 ? [3,2,6,4] : t <= 6 ? [5,4,8,6] : [10,8,10,8]
      dw = row[(b <= 300 ? 0 : 2)+increased]
    }
  } else if (options.product === 'hot-sheet') {
    if (t < 3 || t > 25 || b < 100 || b > 3000) return 'ГОСТ 2208-2007: горячекатаный лист 3–25 мм, ширина 100–3000 мм.'
    if (increased) return 'Для горячекатаного листа используйте стандартное исполнение таблицы 8.'
    dt = hot.find(r=>t <= r[0]!)![[1200,1800,2500,3000].findIndex(limit=>b<=limit)+1]
    dw = t <= 10 ? (b <= 600 ? 10 : 20) : (b <= 600 ? 20 : 25)
  } else {
    if (t <= 25 || t > 150 || b < 150 || b > 2500) return 'ГОСТ 2208-2007: плита толщиной свыше 25 до 150 мм, ширина 150–2500 мм.'
    if (increased) return 'Для плиты используйте стандартное исполнение таблицы 9.'
    const row = t <= 40 ? [2,2.5,3] : t <= 60 ? [2.8,3,4] : t <= 100 ? [3,4,null] : [3.6,5,null]
    dt = row[b <= 1000 ? 0 : b <= 2000 ? 1 : 2]; dw = 40; plusWidth = true
  }
  if (dt == null || dw == null) return 'Таблицы ГОСТ 2208-2007 не предусматривают выбранное сочетание толщины, ширины и точности (знак «—»).'
  return { density, meanThickness: t, meanWidth: b, thicknessMin: t-dt, thicknessMax: t, widthMin: plusWidth ? b : b-dw, widthMax: plusWidth ? b+dw : b, linearMass: t*b*density*1e-6, product: options.product }
}
export const isBrassFlat = (key: ProfileKey, metal: string) => metal === 'Латунь' && ['sheet','strip','plate','flat'].includes(key)
