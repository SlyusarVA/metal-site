// Конвертировано из profiles_data.dart
// Сортировка марок: цифры → кириллица → латиница

export interface MetalMaterial {
  group: string
  grade: string
  density: number // кг/м³
  gost: string
}

export const materials: MetalMaterial[] = [

  // ── СТАЛЬ ──────────────────────────────────────────────────────────────
  { group: 'Сталь', grade: '08пс',   density: 7850, gost: 'ГОСТ 1050-2013' },
  { group: 'Сталь', grade: '09Г2С',  density: 7850, gost: 'ГОСТ 19281-2014' },
  { group: 'Сталь', grade: '10',     density: 7850, gost: 'ГОСТ 1050-2013' },
  { group: 'Сталь', grade: '10ХСНД', density: 7850, gost: 'ГОСТ 19281-2014' },
  { group: 'Сталь', grade: '17Г1С',  density: 7850, gost: 'ГОСТ 19281-2014' },
  { group: 'Сталь', grade: '18ХГТ',  density: 7850, gost: 'ГОСТ 4543-2016' },
  { group: 'Сталь', grade: '20',     density: 7850, gost: 'ГОСТ 1050-2013' },
  { group: 'Сталь', grade: '20Х',    density: 7850, gost: 'ГОСТ 4543-2016' },
  { group: 'Сталь', grade: '30ХГСА', density: 7850, gost: 'ГОСТ 4543-2016' },
  { group: 'Сталь', grade: '35',     density: 7850, gost: 'ГОСТ 1050-2013' },
  { group: 'Сталь', grade: '40',     density: 7850, gost: 'ГОСТ 1050-2013' },
  { group: 'Сталь', grade: '40Х',    density: 7850, gost: 'ГОСТ 4543-2016' },
  { group: 'Сталь', grade: '45',     density: 7850, gost: 'ГОСТ 1050-2013' },
  { group: 'Сталь', grade: '50',     density: 7850, gost: 'ГОСТ 1050-2013' },
  { group: 'Сталь', grade: '60С2А',  density: 7850, gost: 'ГОСТ 14959-2016' },
  { group: 'Сталь', grade: '65Г',    density: 7850, gost: 'ГОСТ 14959-2016' },
  { group: 'Сталь', grade: '9ХС',    density: 7830, gost: 'ГОСТ 5950-2000' },
  { group: 'Сталь', grade: 'А12',    density: 7850, gost: 'ГОСТ 1414-75' },
  { group: 'Сталь', grade: 'Р18',    density: 8700, gost: 'ГОСТ 19265-73' },
  { group: 'Сталь', grade: 'Р6М5',   density: 8150, gost: 'ГОСТ 19265-73' },
  { group: 'Сталь', grade: 'Ст3кп',  density: 7850, gost: 'ГОСТ 380-2005' },
  { group: 'Сталь', grade: 'Ст3пс',  density: 7850, gost: 'ГОСТ 380-2005' },
  { group: 'Сталь', grade: 'Ст3сп',  density: 7850, gost: 'ГОСТ 380-2005' },
  { group: 'Сталь', grade: 'Ст5сп',  density: 7850, gost: 'ГОСТ 380-2005' },
  { group: 'Сталь', grade: 'У10',    density: 7830, gost: 'ГОСТ 1435-99' },
  { group: 'Сталь', grade: 'У12',    density: 7830, gost: 'ГОСТ 1435-99' },
  { group: 'Сталь', grade: 'У8',     density: 7830, gost: 'ГОСТ 1435-99' },
  { group: 'Сталь', grade: 'ХВГ',    density: 7830, gost: 'ГОСТ 5950-2000' },
  { group: 'Сталь', grade: 'ХВСГФ',  density: 7830, gost: 'ГОСТ 5950-2000' },

  // ── НЕРЖАВЕЙКА ─────────────────────────────────────────────────────────
  { group: 'Нержавейка', grade: '03Х17Н14М3 (316L)', density: 7980, gost: 'ГОСТ 5632-2014' },
  { group: 'Нержавейка', grade: '08Х18Н10 (304)',    density: 7930, gost: 'ГОСТ 5632-2014' },
  { group: 'Нержавейка', grade: '08Х18Н10Т (321)',   density: 7900, gost: 'ГОСТ 5632-2014' },
  { group: 'Нержавейка', grade: '10Х17Н13М2Т (316)', density: 8000, gost: 'ГОСТ 5632-2014' },
  { group: 'Нержавейка', grade: '12Х13 (410)',       density: 7750, gost: 'ГОСТ 5632-2014' },
  { group: 'Нержавейка', grade: '12Х17 (430)',       density: 7700, gost: 'ГОСТ 5632-2014' },
  { group: 'Нержавейка', grade: '12Х18Н10Т',         density: 7900, gost: 'ГОСТ 5632-2014' },
  { group: 'Нержавейка', grade: '12Х18Н9',           density: 7900, gost: 'ГОСТ 5632-2014' },
  { group: 'Нержавейка', grade: '14Х17Н2 (431)',     density: 7750, gost: 'ГОСТ 5632-2014' },
  { group: 'Нержавейка', grade: '15Х25Т (446)',      density: 7600, gost: 'ГОСТ 5632-2014' },
  { group: 'Нержавейка', grade: '20Х13 (420)',       density: 7750, gost: 'ГОСТ 5632-2014' },
  { group: 'Нержавейка', grade: '25Х13Н2',           density: 7800, gost: 'ГОСТ 5632-2014' },
  { group: 'Нержавейка', grade: '30Х13',             density: 7750, gost: 'ГОСТ 5632-2014' },
  { group: 'Нержавейка', grade: '40Х13',             density: 7650, gost: 'ГОСТ 5632-2014' },
  { group: 'Нержавейка', grade: 'AISI 201',          density: 7800, gost: 'AISI/ASTM' },
  { group: 'Нержавейка', grade: 'AISI 304',          density: 7930, gost: 'AISI/ASTM' },
  { group: 'Нержавейка', grade: 'AISI 316',          density: 7980, gost: 'AISI/ASTM' },
  { group: 'Нержавейка', grade: 'AISI 316L',         density: 7980, gost: 'AISI/ASTM' },
  { group: 'Нержавейка', grade: 'AISI 321',          density: 7900, gost: 'AISI/ASTM' },
  { group: 'Нержавейка', grade: 'AISI 430',          density: 7700, gost: 'AISI/ASTM' },

  // ── АЛЮМИНИЙ ───────────────────────────────────────────────────────────
  { group: 'Алюминий', grade: '6061',       density: 2700, gost: 'ASTM B209' },
  { group: 'Алюминий', grade: '6082',       density: 2710, gost: 'EN 755' },
  { group: 'Алюминий', grade: '7075 (В95)', density: 2810, gost: 'ASTM B209' },
  { group: 'Алюминий', grade: 'А5',         density: 2700, gost: 'ГОСТ 11069-2019' },
  { group: 'Алюминий', grade: 'АД0',        density: 2710, gost: 'ГОСТ 4784-2019' },
  { group: 'Алюминий', grade: 'АД1',        density: 2710, gost: 'ГОСТ 4784-2019' },
  { group: 'Алюминий', grade: 'АД31',       density: 2710, gost: 'ГОСТ 4784-2019' },
  { group: 'Алюминий', grade: 'АК4',        density: 2800, gost: 'ГОСТ 4784-2019' },
  { group: 'Алюминий', grade: 'АМг2',       density: 2680, gost: 'ГОСТ 4784-2019' },
  { group: 'Алюминий', grade: 'АМг3',       density: 2670, gost: 'ГОСТ 4784-2019' },
  { group: 'Алюминий', grade: 'АМг5',       density: 2650, gost: 'ГОСТ 4784-2019' },
  { group: 'Алюминий', grade: 'АМг6',       density: 2640, gost: 'ГОСТ 4784-2019' },
  { group: 'Алюминий', grade: 'АМц',        density: 2730, gost: 'ГОСТ 4784-2019' },
  { group: 'Алюминий', grade: 'В95',        density: 2850, gost: 'ГОСТ 4784-2019' },
  { group: 'Алюминий', grade: 'Д1',         density: 2790, gost: 'ГОСТ 4784-2019' },
  { group: 'Алюминий', grade: 'Д16',        density: 2780, gost: 'ГОСТ 4784-2019' },
  { group: 'Алюминий', grade: 'Д16Т',       density: 2780, gost: 'ГОСТ 4784-2019' },

  // ── ЛАТУНЬ ─────────────────────────────────────────────────────────────
  { group: 'Латунь', grade: 'Л63',    density: 8440, gost: 'ГОСТ 15527-2004' },
  { group: 'Латунь', grade: 'Л68',    density: 8600, gost: 'ГОСТ 15527-2004' },
  { group: 'Латунь', grade: 'ЛО62-1', density: 8500, gost: 'ГОСТ 15527-2004' },
  { group: 'Латунь', grade: 'ЛС59-1', density: 8500, gost: 'ГОСТ 15527-2004' },

  // ── МЕДЬ ───────────────────────────────────────────────────────────────
  { group: 'Медь', grade: 'М0',  density: 8940, gost: 'ГОСТ 859-2014' },
  { group: 'Медь', grade: 'М00', density: 8940, gost: 'ГОСТ 859-2014' },
  { group: 'Медь', grade: 'М1',  density: 8900, gost: 'ГОСТ 859-2014' },
  { group: 'Медь', grade: 'М2',  density: 8900, gost: 'ГОСТ 859-2014' },
  { group: 'Медь', grade: 'М3',  density: 8900, gost: 'ГОСТ 859-2014' },

  // ── БРОНЗА ─────────────────────────────────────────────────────────────
  { group: 'Бронза', grade: 'БрАМц9-2',     density: 7600, gost: 'ГОСТ 18175-78' },
  { group: 'Бронза', grade: 'БрБ2',         density: 8200, gost: 'ГОСТ 18175-78' },
  { group: 'Бронза', grade: 'БрКМц3-1',     density: 8400, gost: 'ГОСТ 18175-78' },
  { group: 'Бронза', grade: 'БрОФ10-1',     density: 8780, gost: 'ГОСТ 18175-78' },
  { group: 'Бронза', grade: 'БрОЦС4-4-2.5', density: 8900, gost: 'ГОСТ 18175-78' },

  // ── ВОЛЬФРАМ ───────────────────────────────────────────────────────────
  { group: 'Вольфрам', grade: 'ВА',  density: 19100, gost: 'ГОСТ 19335-73' },
  { group: 'Вольфрам', grade: 'ВАН', density: 19200, gost: 'ГОСТ 19335-73' },

  // ── МОЛИБДЕН ───────────────────────────────────────────────────────────
  { group: 'Молибден', grade: 'МВ', density: 10200, gost: 'ГОСТ 17431-72' },
  { group: 'Молибден', grade: 'МЧ', density: 10200, gost: 'ГОСТ 17431-72' },

  // ── НИКЕЛЬ ─────────────────────────────────────────────────────────────
  { group: 'Никель', grade: 'ВНМ3-2',      density: 8900, gost: 'ТУ 48-19-90-90' },
  { group: 'Никель', grade: 'НП1',         density: 8900, gost: 'ГОСТ 492-2006' },
  { group: 'Никель', grade: 'НП2',         density: 8900, gost: 'ГОСТ 492-2006' },
  { group: 'Никель', grade: 'Inconel 625', density: 8440, gost: 'ASTM B446' },

  // ── НИХРОМ ─────────────────────────────────────────────────────────────
  { group: 'Нихром', grade: 'Х15Н60', density: 8200, gost: 'ГОСТ 10994-74' },
  { group: 'Нихром', grade: 'Х20Н80', density: 8400, gost: 'ГОСТ 10994-74' },

  // ── ТИТАН ──────────────────────────────────────────────────────────────
  { group: 'Титан', grade: 'ВТ1-0',      density: 4510, gost: 'ГОСТ 19807-91' },
  { group: 'Титан', grade: 'ВТ1-00',     density: 4505, gost: 'ГОСТ 19807-91' },
  { group: 'Титан', grade: 'ВТ6',        density: 4430, gost: 'ГОСТ 19807-91' },
  { group: 'Титан', grade: 'ОТ4',        density: 4500, gost: 'ГОСТ 19807-91' },
  { group: 'Титан', grade: 'Ti Grade 2', density: 4510, gost: 'ASTM B265' },
  { group: 'Титан', grade: 'Ti Grade 5', density: 4430, gost: 'ASTM B265' },

  // ── ЦИНК ───────────────────────────────────────────────────────────────
  { group: 'Цинк', grade: 'Ц0', density: 7133, gost: 'ГОСТ 3640-94' },
  { group: 'Цинк', grade: 'Ц1', density: 7133, gost: 'ГОСТ 3640-94' },

  // ── ЦИРКОНИЙ ───────────────────────────────────────────────────────────
  { group: 'Цирконий', grade: 'ЦрНб-1', density: 6510, gost: 'ГОСТ 21907-76' },
]

// Порядок групп — по частоте выдач со склада
const GROUP_ORDER: string[] = [
  'Сталь', 'Латунь', 'Медь', 'Бронза', 'Алюминий', 'Нержавейка',
  'Вольфрам', 'Молибден', 'Никель', 'Нихром', 'Титан', 'Цинк', 'Цирконий',
]

export function getMetalGroups(): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  for (const g of GROUP_ORDER) {
    if (materials.some(m => m.group === g) && !seen.has(g)) {
      seen.add(g)
      result.push(g)
    }
  }
  for (const m of materials) {
    if (!seen.has(m.group)) {
      seen.add(m.group)
      result.push(m.group)
    }
  }
  return result
}

export function getGradesForGroup(group: string): MetalMaterial[] {
  return materials.filter(m => m.group === group)
}

export function getDensity(group: string, grade: string): number {
  return materials.find(m => m.group === group && m.grade === grade)?.density ?? 7850
}

// Цветные металлы — для автокоррекции сортамента (Круг → Пруток)
export const NON_FERROUS_GROUPS = new Set([
  'Латунь', 'Медь', 'Бронза', 'Алюминий',
  'Вольфрам', 'Молибден', 'Никель', 'Нихром', 'Титан', 'Цинк', 'Цирконий',
])

export function isNonFerrous(group: string): boolean {
  return NON_FERROUS_GROUPS.has(group)
}

import type { ProfileKey } from '@/data/profiles'

// Допустимые профили для каждой группы металлов.
// Если группы нет в маппинге — доступны все профили.
const ALLOWED_PROFILES: Record<string, ProfileKey[]> = {
  'Сталь': [
    'round', 'sheet', 'pipe', 'pipe_prof', 'strip', 'plate', 'wire',
    'angle_equal', 'hexagon', 'armature', 'beam', 'square', 'flat',
    'rail', 'angle_unequal', 'channel', 'shpunt',
  ],
  'Нержавейка': [
    'round', 'sheet', 'pipe', 'pipe_prof', 'strip', 'plate', 'wire',
    'angle_equal', 'hexagon', 'square', 'flat',
  ],
  'Латунь': [
    'rod', 'sheet', 'pipe', 'strip', 'plate', 'wire', 'hexagon', 'square',
  ],
  'Медь': [
    'rod', 'sheet', 'pipe', 'strip', 'plate', 'wire',
  ],
  'Бронза': [
    'rod', 'sheet', 'strip', 'plate', 'wire',
  ],
  'Алюминий': [
    'rod', 'sheet', 'pipe', 'pipe_prof', 'strip', 'plate', 'wire',
    'angle_equal', 'hexagon', 'square', 'flat',
  ],
  'Вольфрам': ['rod', 'wire', 'sheet', 'plate'],
  'Молибден': ['rod', 'wire', 'sheet', 'plate'],
  'Никель':   ['rod', 'wire', 'sheet', 'strip', 'plate', 'pipe'],
  'Нихром':   ['rod', 'wire', 'strip'],
  'Титан':    ['rod', 'sheet', 'pipe', 'plate', 'wire'],
  'Цинк':     ['sheet', 'strip', 'plate'],
  'Цирконий': ['rod', 'wire', 'sheet'],
}

export function getAllowedProfiles(group: string): ProfileKey[] | null {
  return ALLOWED_PROFILES[group] ?? null
}
