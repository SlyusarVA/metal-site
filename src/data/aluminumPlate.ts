// ГОСТ 17232-2023: reviewed tables 1, 2, А.1, Б.1; see docs/standards/gost-17232-2023.md.
export interface PlateOptions { accuracy: 'normal' | 'high' }
export const defaultPlateOptions: PlateOptions = { accuracy: 'normal' }
export function validPlateOptions(value: unknown): value is PlateOptions {
  return !!value && typeof value === 'object' && ['normal','high'].includes((value as PlateOptions).accuracy)
}
const factors: Record<string,number> = {
 'А7':.950,'А6':.950,'А5':.950,'А0':.950,'АД00':.950,'АД0':.950,'АД':.950,'АД1':.950,
 'Д1':.982,'АК4-1':.982,'Д16':.976,'Д19':.968,'ВАД1':.968,'Д20':.996,
 'АМц':.958,'АМцС':.958,'1407':.947,'1407ч':.947,'АМг2':.940,'АМг3':.937,
 'АМг5':.930,'АМг6':.926,'1565ч':.930,'1580':.926,'1581':.926,'АД31':.947,
 'АД33':.947,'АВ':.947,'АД35':.947,'1915':.972,'В95':1,
}
const baseGrade = (grade: string) => grade === 'Д16Т' ? 'Д16' : grade
export const plateCoefficient = (grade: string): number | null => factors[baseGrade(grade)] ?? null
// Equivalent calculation density only, not a measured material density.
export const plateDensity = (grade: string): number | null => plateCoefficient(grade) == null ? null : 2850 * plateCoefficient(grade)!
// Upper inclusive thickness; normal/high pairs for width <=1200,1500,2000,2500,3000.
const deviations: (number|null)[][] = [
 [12,.5,.5,.75,.6,1,.75,1.25,1,null,null],
 [20,.5,.5,.75,.7,1,.85,1.25,1.15,null,null],
 [30,.75,.7,1,.8,1.25,.9,1.5,1.25,null,null],
 [45,1,.8,1.25,.9,1.5,1.1,1.75,1.45,null,null],
 [65,1.5,1.2,1.75,1.3,2,1.5,2.25,1.75,2.5,2],
 [80,2,1.5,2.5,1.6,3,1.8,3.5,2,4,2.2],
 [200,3,2.5,3.5,2.5,4,2.5,4.5,2.5,5,3],
]
const widths = [1200,1500,1800,2000,2500,3000]
// Published А.1 values are preserved, including anomalous cells; never silently repaired.
const massRows = [
 [11,39.188,49.593,57.998,64.268,80.334,96.401],
 [12,42.750,53.010,63.270,70.110,87.638,105.165],
 [13,46.313,57.428,68.543,75.953,94.941,113.929],
 [14,49.875,61.845,73.815,81.795,102.244,122.693],
 [15,53.438,66.263,79.088,87.638,109.547,131.456],
 [16,57.000,70.680,84.360,93.480,116.850,140.220],
 [17,60.563,76.098,89.633,99.323,124.153,148.984],
 [18,64.125,79.515,94.905,105.165,131.456,157.748],
 [19,67.688,83.933,100.178,111.008,138.759,166.511],
 [20,71.250,88.350,105.450,116.850,146.063,175.275],
 [22,78.375,97.185,115.450,128.535,160.669,192.803],
 [25,89.063,110.438,131.813,146.063,182.578,219.094],
 [28,99.750,123.690,147.630,163.590,204.488,245.385],
 [30,106.875,132.525,158.175,175.275,219.094,262.913],
 [32,114.000,141.360,168.720,186.960,233.700,280.440],
 [35,124.688,154.470,184.538,204.488,255.609,306.731],
 [38,135.375,167.865,200.355,222.015,277.519,333.023],
 [40,142.500,176.700,210.900,233.700,292.125,350.550],
 [45,160.313,198.788,237.263,262.913,328.641,394.369],
 [50,178.125,220.875,263.625,292.125,365.156,438.188],
 [55,195.938,242.963,289.988,321.338,401.672,482.006],
 [60,213.750,265.050,316.350,350.550,438.188,525.825],
 [65,231.563,287.138,342.713,379.763,474.703,569.644],
 [70,249.375,309.225,369.075,408.975,511.219,613.463],
 [75,267.188,331.313,395.438,438.188,547.734,657.281],
 [80,285.000,353.400,421.800,467.400,584.250,701.100],
 [85,302.813,375.488,448.163,496.613,620.766,744.919],
 [90,320.625,397.575,474.525,525.825,657.281,788.738],
 [100,356.250,441.750,527.250,584.250,730.313,876.375],
 [120,427.500,530.100,632.700,701.100,876.375,1051.650],
 [140,498.750,618.450,738.150,817.950,1022.438,1226.925],
 [160,570.000,706.800,843.600,934.800,1168.500,1402.200],
 [180,641.250,795.150,949.050,1051.650,1314.563,1577.475],
 [200,712.500,883.500,1054.500,1168.500,1460.625,1752.750],
]
export function plateReferenceMass(thickness: number, width: number): number | null {
 const column = widths.indexOf(width)
 const row = massRows.find(r => r[0] === thickness)
 return column < 0 || !row ? null : row[column+1]
}
export interface PlateBasis {
 density: number; coefficient: number; thicknessMin: number; thicknessMax: number;
 widthMin: number; widthMax: number; meanThickness: number; meanWidth: number;
 linearMass: number; referenceMass: number; method: 'table'|'dimensions'; warning?: string
}
export function plateBasis(grade: string, t: number, b: number, options: PlateOptions = defaultPlateOptions): PlateBasis|string {
 if(!validPlateOptions(options)) return 'Проверьте точность изготовления плиты.'
 const k=plateCoefficient(grade)
 if(k == null) return `Для марки ${grade} нет подтверждённого коэффициента по ГОСТ 17232-2023.`
 if(!Number.isFinite(t)||!Number.isFinite(b)||t<=10.5||t>200||b<1000||b>3000) return 'ГОСТ 17232-2023: плита толщиной свыше 10,5 до 200 мм, ширина 1000–3000 мм. Для меньшей толщины выберите «Лист».'
 const g=baseGrade(grade)
 const pure=['А7','А6','А5','А0','АД00','АД0','АД','АД1','АМц','АМцС','АМг2','АВ'].includes(g)
 let maxWidth=pure ? (t<=40?2500:3000) : g==='АК4-1' ? (t<=100?2000:2500) : (t<=45?2000:t<=100?2500:3000)
 const limited: Record<string,number>={'1407':80,'1407ч':80,'1565ч':60,'1580':50,'1581':50,'1915':80}
 if(limited[g]!=null){if(t>limited[g])return `Таблица 1 ГОСТ 17232-2023: для ${grade} толщина не более ${limited[g]} мм.`;maxWidth=2000}
 if(b>maxWidth)return `Таблица 1 ГОСТ 17232-2023: для ${grade} при этой толщине ширина не более ${maxWidth} мм; другие размеры требуют согласования.`
 const row=deviations.find(r=>t<=r[0]!)!
 const band=[1200,1500,2000,2500,3000].findIndex(w=>b<=w)
 const delta=row[1+band*2+(options.accuracy==='high'?1:0)]
 if(delta==null)return 'В таблице 2 нет допуска для выбранного сочетания толщины и ширины.'
 const tabulated=plateReferenceMass(t,b)
 const geometric=t*(b+50)*2850*1e-6
 const referenceMass=tabulated??geometric
 const mismatch=tabulated!=null&&Math.abs(tabulated-geometric)>.0011
 return {density:2850*k,coefficient:k,thicknessMin:t-delta,thicknessMax:t+delta,widthMin:b,widthMax:b+100,
 meanThickness:t,meanWidth:b+50,linearMass:referenceMass*k,referenceMass,method:tabulated==null?'dimensions':'table',
 warning:mismatch?'Значение таблицы А.1 отличается от расчёта по средним размерам. Использовано опубликованное табличное значение.':undefined}
}
