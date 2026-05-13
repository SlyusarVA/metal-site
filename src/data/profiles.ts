// Конвертировано из profiles_data.dart
// Порядок сортамента — по частоте выдач со склада (xlsx 05.05.26)

export type ProfileKey =
  | 'round' | 'rod' | 'sheet' | 'pipe' | 'pipe_prof'
  | 'strip' | 'plate' | 'wire' | 'angle_equal'
  | 'hexagon' | 'armature' | 'beam' | 'square'
  | 'flat' | 'rail' | 'angle_unequal' | 'channel' | 'shpunt'

export interface ProfileParam {
  key: string
  label: string
  unit: string
  defaultValue: number
}

export interface MetalProfile {
  key: ProfileKey
  name: string
  gost: string
  icon: string               // путь к SVG-иконке
  isVolume?: boolean         // лист/плита — объёмный расчёт
  params: ProfileParam[]
  /** Возвращает площадь сечения в мм² (или объём мм³ если isVolume) */
  sectionArea: (v: Record<string, number>) => number
}

export const profiles: MetalProfile[] = [

  // ── Есть в остатках (по убыванию частоты выдач) ──────────────────────

  // Круг — 1243 выдачи
  {
    key: 'round', name: 'Круг', gost: 'ГОСТ 2590-2006', icon: 'circle',
    params: [{ key: 'd', label: 'Диаметр', unit: 'мм', defaultValue: 20 }],
    sectionArea: (v) => Math.PI / 4 * v.d * v.d,
  },

  // Пруток — 1155 выдач
  {
    key: 'rod', name: 'Пруток', gost: 'ГОСТ 2060-2006', icon: 'rod',
    params: [{ key: 'd', label: 'Диаметр', unit: 'мм', defaultValue: 25 }],
    sectionArea: (v) => Math.PI / 4 * v.d * v.d,
  },

  // Лист — 593 выдачи
  {
    key: 'sheet', name: 'Лист', gost: 'ГОСТ 19903-2015', icon: 'sheet', isVolume: true,
    params: [
      { key: 'a', label: 'Длина листа', unit: 'мм', defaultValue: 1000 },
      { key: 'b', label: 'Ширина листа', unit: 'мм', defaultValue: 1000 },
      { key: 't', label: 'Толщина t',    unit: 'мм', defaultValue: 4 },
    ],
    sectionArea: (v) => v.a * v.b * v.t,
  },

  // Труба кр. — часть из 425
  {
    key: 'pipe', name: 'Труба кр.', gost: 'ГОСТ 8732-78', icon: 'pipe',
    params: [
      { key: 'd', label: 'Диаметр d',         unit: 'мм', defaultValue: 57 },
      { key: 't', label: 'Толщина стенки t',  unit: 'мм', defaultValue: 3.5 },
    ],
    sectionArea: (v) => Math.PI / 4 * (v.d * v.d - (v.d - 2 * v.t) * (v.d - 2 * v.t)),
  },

  // Труба проф. — часть из 425
  {
    key: 'pipe_prof', name: 'Труба проф.', gost: 'ГОСТ 8645-68', icon: 'pipe_prof',
    params: [
      { key: 'a', label: 'Сторона A', unit: 'мм', defaultValue: 60 },
      { key: 'b', label: 'Сторона B', unit: 'мм', defaultValue: 40 },
      { key: 't', label: 'Толщина t', unit: 'мм', defaultValue: 2 },
    ],
    sectionArea: (v) => v.a * v.b - (v.a - 2 * v.t) * (v.b - 2 * v.t),
  },

  // Лента — 374 выдачи
  {
    key: 'strip', name: 'Лента', gost: 'ГОСТ 503-81', icon: 'strip',
    params: [
      { key: 'b', label: 'Ширина a',  unit: 'мм', defaultValue: 20 },
      { key: 't', label: 'Толщина t', unit: 'мм', defaultValue: 1.5 },
    ],
    sectionArea: (v) => v.b * v.t,
  },

  // Плита — 130 выдач
  {
    key: 'plate', name: 'Плита', gost: 'ГОСТ 17232-99', icon: 'plate', isVolume: true,
    params: [
      { key: 'a', label: 'Длина',     unit: 'мм', defaultValue: 1000 },
      { key: 'b', label: 'Ширина',    unit: 'мм', defaultValue: 1000 },
      { key: 't', label: 'Толщина t', unit: 'мм', defaultValue: 20 },
    ],
    sectionArea: (v) => v.a * v.b * v.t,
  },

  // Проволока — 122 выдачи
  {
    key: 'wire', name: 'Проволока', gost: 'ГОСТ 792-67', icon: 'wire',
    params: [{ key: 'd', label: 'Диаметр', unit: 'мм', defaultValue: 1.0 }],
    sectionArea: (v) => Math.PI / 4 * v.d * v.d,
  },

  // Уголок равн. — 26 выдач
  {
    key: 'angle_equal', name: 'Уголок равн.', gost: 'ГОСТ 8509-93', icon: 'corner',
    params: [
      { key: 'b', label: 'Ширина полки a', unit: 'мм', defaultValue: 50 },
      { key: 't', label: 'Толщина t',      unit: 'мм', defaultValue: 5 },
    ],
    sectionArea: (v) => v.t * (2 * v.b - v.t),
  },

  // Шестигранник — 10 выдач
  {
    key: 'hexagon', name: 'Шестигранник', gost: 'ГОСТ 2879-2006', icon: 'hexahedron',
    params: [{ key: 'd', label: 'Размер под ключ', unit: 'мм', defaultValue: 24 }],
    sectionArea: (v) => 0.866025 * v.d * v.d,
  },

  // ── Нет в остатках (по алфавиту) ─────────────────────────────────────

  {
    key: 'armature', name: 'Арматура', gost: 'ГОСТ 34028-2016', icon: 'armature',
    params: [{ key: 'd', label: 'Диаметр', unit: 'мм', defaultValue: 12 }],
    sectionArea: (v) => Math.PI / 4 * v.d * v.d,
  },

  {
    key: 'beam', name: 'Балка', gost: 'ГОСТ 8239-89', icon: 'balk',
    params: [
      { key: 'h',  label: 'Высота H',        unit: 'мм', defaultValue: 100 },
      { key: 'b',  label: 'Ширина B',         unit: 'мм', defaultValue: 55 },
      { key: 'tw', label: 'Толщина стенки s', unit: 'мм', defaultValue: 4.5 },
      { key: 'tf', label: 'Толщина полки t',  unit: 'мм', defaultValue: 7.2 },
    ],
    sectionArea: (v) => v.tw * (v.h - 2 * v.tf) + 2 * v.b * v.tf,
  },

  {
    key: 'square', name: 'Квадрат', gost: 'ГОСТ 2591-2006', icon: 'square',
    params: [{ key: 'a', label: 'Сторона a', unit: 'мм', defaultValue: 20 }],
    sectionArea: (v) => v.a * v.a,
  },

  {
    key: 'flat', name: 'Полоса', gost: 'ГОСТ 103-2006', icon: 'strip',
    params: [
      { key: 'b', label: 'Ширина a',  unit: 'мм', defaultValue: 40 },
      { key: 't', label: 'Толщина t', unit: 'мм', defaultValue: 4 },
    ],
    sectionArea: (v) => v.b * v.t,
  },

  {
    key: 'rail', name: 'Рельс', gost: 'ГОСТ Р 51685-2013', icon: 'rail',
    params: [{ key: 'w', label: 'Погонный вес', unit: 'кг/м', defaultValue: 43 }],
    // Обратный расчёт через погонный вес: w = density * A * 1e-6
    // A = w * 1e6 / density → используем density=7850 как базу для рельсовой стали
    sectionArea: (v) => v.w * 1e6 / 7850,
  },

  {
    key: 'angle_unequal', name: 'Уголок неравн.', gost: 'ГОСТ 8510-86', icon: 'corner_unequal',
    params: [
      { key: 'b1', label: 'Полка a', unit: 'мм', defaultValue: 63 },
      { key: 'b2', label: 'Полка b', unit: 'мм', defaultValue: 40 },
      { key: 't',  label: 'Толщина t', unit: 'мм', defaultValue: 5 },
    ],
    sectionArea: (v) => v.t * (v.b1 + v.b2 - v.t),
  },

  {
    key: 'channel', name: 'Швеллер', gost: 'ГОСТ 8240-97', icon: 'channel',
    params: [
      { key: 'h',  label: 'Высота H',        unit: 'мм', defaultValue: 100 },
      { key: 'b',  label: 'Ширина B',         unit: 'мм', defaultValue: 46 },
      { key: 'tw', label: 'Толщина стенки s', unit: 'мм', defaultValue: 4.5 },
      { key: 'tf', label: 'Толщина полки t',  unit: 'мм', defaultValue: 7.2 },
    ],
    sectionArea: (v) => v.tw * v.h + 2 * v.b * v.tf - 2 * v.tf * v.tw,
  },

  {
    key: 'shpunt', name: 'Шпунт', gost: 'ГОСТ 4781-85', icon: 'shpunt',
    params: [
      { key: 'h', label: 'Высота H',  unit: 'мм', defaultValue: 400 },
      { key: 'b', label: 'Ширина B',  unit: 'мм', defaultValue: 150 },
      { key: 't', label: 'Толщина t', unit: 'мм', defaultValue: 9.5 },
    ],
    sectionArea: (v) => v.b * v.t + 2 * (v.h / 2) * v.t,
  },
]

// Быстрый поиск по ключу
export const profileMap = new Map<ProfileKey, MetalProfile>(
  profiles.map(p => [p.key, p])
)

// Автокоррекция: цветмет → Пруток вместо Круга
export function autocorrectProfile(
  currentKey: ProfileKey,
  isNonFerrous: boolean
): ProfileKey {
  if (isNonFerrous && currentKey === 'round') return 'rod'
  if (!isNonFerrous && currentKey === 'rod') return 'round'
  return currentKey
}
