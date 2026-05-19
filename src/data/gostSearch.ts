// Единый поиск: по коду ГОСТа, названию марки, группе металла
import { ProfileKey } from './profiles'
import { materials } from './materials'

export type SearchResultType = 'gost' | 'grade' | 'group'

export interface SearchResult {
  type: SearchResultType
  label: string
  hint: string
  metalGroups: string[]
  grade?: string
  profileKeys: ProfileKey[]
  score: number
}

interface GostMapping {
  code: string
  metalGroups: string[]
  profileKeys: ProfileKey[]
  hint: string
}

export const gostMappings: GostMapping[] = [
  { code: 'ГОСТ 2590-2006',    metalGroups: ['Сталь'],                     profileKeys: ['round'],          hint: 'Круг стальной горячекатаный' },
  { code: 'ГОСТ 2591-2006',    metalGroups: ['Сталь'],                     profileKeys: ['square'],         hint: 'Квадрат стальной горячекатаный' },
  { code: 'ГОСТ 2879-2006',    metalGroups: ['Сталь'],                     profileKeys: ['hexagon'],        hint: 'Шестигранник стальной горячекатаный' },
  { code: 'ГОСТ 8239-89',      metalGroups: ['Сталь'],                     profileKeys: ['beam'],           hint: 'Балка двутавровая стальная' },
  { code: 'ГОСТ 8240-97',      metalGroups: ['Сталь'],                     profileKeys: ['channel'],        hint: 'Швеллер стальной горячекатаный' },
  { code: 'ГОСТ 8509-93',      metalGroups: ['Сталь'],                     profileKeys: ['angle_equal'],    hint: 'Уголок равнополочный стальной' },
  { code: 'ГОСТ 8510-86',      metalGroups: ['Сталь'],                     profileKeys: ['angle_unequal'],  hint: 'Уголок неравнополочный стальной' },
  { code: 'ГОСТ 8732-78',      metalGroups: ['Сталь', 'Нержавейка'],       profileKeys: ['pipe'],           hint: 'Труба бесшовная горячедеформированная' },
  { code: 'ГОСТ 8645-68',      metalGroups: ['Сталь'],                     profileKeys: ['pipe_prof'],      hint: 'Труба стальная профильная' },
  { code: 'ГОСТ 103-2006',     metalGroups: ['Сталь'],                     profileKeys: ['flat'],           hint: 'Полоса стальная горячекатаная' },
  { code: 'ГОСТ 19903-2015',   metalGroups: ['Сталь', 'Нержавейка'],       profileKeys: ['sheet', 'plate'], hint: 'Лист горячекатаный стальной' },
  { code: 'ГОСТ 17232-99',     metalGroups: ['Алюминий'],                  profileKeys: ['plate'],          hint: 'Плита из алюминия и алюминиевых сплавов' },
  { code: 'ГОСТ 34028-2016',   metalGroups: ['Сталь'],                     profileKeys: ['armature'],       hint: 'Арматура для железобетонных конструкций' },
  { code: 'ГОСТ 4781-85',      metalGroups: ['Сталь'],                     profileKeys: ['shpunt'],         hint: 'Шпунт Ларсена металлический' },
  { code: 'ГОСТ Р 51685-2013', metalGroups: ['Сталь'],                     profileKeys: ['rail'],           hint: 'Рельсы железнодорожные' },
  { code: 'ГОСТ 503-81',       metalGroups: ['Сталь'],                     profileKeys: ['strip'],          hint: 'Лента холоднокатаная' },
  { code: 'ГОСТ 792-67',       metalGroups: ['Медь', 'Латунь'],            profileKeys: ['wire'],           hint: 'Проволока из меди и медных сплавов' },
  { code: 'ГОСТ 2060-2006',    metalGroups: ['Медь', 'Латунь', 'Бронза'], profileKeys: ['rod'],            hint: 'Прутки из меди и медных сплавов' },
  { code: 'ГОСТ 380-2005',     metalGroups: ['Сталь'],                     profileKeys: [],                 hint: 'Сталь углеродистая обыкновенного качества (Ст3сп, Ст3пс...)' },
  { code: 'ГОСТ 1050-2013',    metalGroups: ['Сталь'],                     profileKeys: [],                 hint: 'Сталь углеродистая качественная (10, 20, 35, 45...)' },
  { code: 'ГОСТ 4543-2016',    metalGroups: ['Сталь'],                     profileKeys: [],                 hint: 'Сталь легированная конструкционная (20Х, 40Х, 30ХГСА...)' },
  { code: 'ГОСТ 19281-2014',   metalGroups: ['Сталь'],                     profileKeys: [],                 hint: 'Сталь повышенной прочности (09Г2С, 10ХСНД, 17Г1С...)' },
  { code: 'ГОСТ 14959-2016',   metalGroups: ['Сталь'],                     profileKeys: [],                 hint: 'Сталь рессорно-пружинная (60С2А, 65Г...)' },
  { code: 'ГОСТ 5950-2000',    metalGroups: ['Сталь'],                     profileKeys: [],                 hint: 'Сталь инструментальная легированная (9ХС, ХВГ...)' },
  { code: 'ГОСТ 1435-99',      metalGroups: ['Сталь'],                     profileKeys: [],                 hint: 'Сталь инструментальная нелегированная (У8, У10, У12...)' },
  { code: 'ГОСТ 19265-73',     metalGroups: ['Сталь'],                     profileKeys: [],                 hint: 'Сталь быстрорежущая (Р6М5, Р18...)' },
  { code: 'ГОСТ 5632-2014',    metalGroups: ['Нержавейка'],                profileKeys: [],                 hint: 'Стали коррозионностойкие (AISI 304, 316, 12Х18Н10Т...)' },
  { code: 'ГОСТ 4784-2019',    metalGroups: ['Алюминий'],                  profileKeys: [],                 hint: 'Алюминий и сплавы деформируемые (АД0, АД31, АМг2...)' },
  { code: 'ГОСТ 11069-2019',   metalGroups: ['Алюминий'],                  profileKeys: [],                 hint: 'Алюминий первичный (А5, А7...)' },
  { code: 'ГОСТ 15527-2004',   metalGroups: ['Латунь'],                    profileKeys: [],                 hint: 'Сплавы медно-цинковые (Л63, Л68, ЛС59-1...)' },
  { code: 'ГОСТ 859-2014',     metalGroups: ['Медь'],                      profileKeys: [],                 hint: 'Медь марок М0, М00, М1, М2, М3' },
  { code: 'ГОСТ 18175-78',     metalGroups: ['Бронза'],                    profileKeys: [],                 hint: 'Бронзы безоловянные (БрАМц9-2, БрБ2...)' },
  { code: 'ГОСТ 19807-91',     metalGroups: ['Титан'],                     profileKeys: [],                 hint: 'Титан и сплавы (ВТ1-0, ВТ6, ОТ4...)' },
  { code: 'ГОСТ 492-2006',     metalGroups: ['Никель'],                    profileKeys: [],                 hint: 'Никель НП1, НП2' },
  { code: 'ГОСТ 10994-74',     metalGroups: ['Нихром'],                    profileKeys: [],                 hint: 'Нихром (Х15Н60, Х20Н80...)' },
  { code: 'ГОСТ 19335-73',     metalGroups: ['Вольфрам'],                  profileKeys: [],                 hint: 'Вольфрам (ВА, ВАН...)' },
  { code: 'ГОСТ 17431-72',     metalGroups: ['Молибден'],                  profileKeys: [],                 hint: 'Молибден (МВ, МЧ...)' },
  { code: 'ГОСТ 3640-94',      metalGroups: ['Цинк'],                      profileKeys: [],                 hint: 'Цинк (Ц0, Ц1...)' },
]

function normalize(s: string): string {
  return s.toUpperCase().replace(/Ё/g, 'Е').replace(/\s+/g, '').replace(/-/g, '')
}

export function search(query: string): SearchResult[] {
  const q = query.trim()
  if (q.length < 2) return []
  const qn = normalize(q)
  const results: SearchResult[] = []
  const seen = new Set<string>()

  // 1. Марки металла
  for (const mat of materials) {
    const gradeN = normalize(mat.grade)
    let score = 0
    if (gradeN === qn) score = 1.0
    else if (gradeN.startsWith(qn)) score = 0.85
    else if (gradeN.includes(qn)) score = 0.6
    if (score > 0) {
      const key = `grade:${mat.group}:${mat.grade}`
      if (!seen.has(key)) {
        seen.add(key)
        results.push({ type: 'grade', label: mat.grade, hint: `${mat.group} · ρ = ${mat.density} кг/м³ · ${mat.gost}`, metalGroups: [mat.group], grade: mat.grade, profileKeys: [], score })
      }
    }
  }

  // 2. Группы металла
  const groups = Array.from(new Set(materials.map(m => m.group)))
  for (const group of groups) {
    const gn = normalize(group)
    let score = 0
    if (gn === qn) score = 0.9
    else if (gn.startsWith(qn)) score = 0.75
    else if (gn.includes(qn)) score = 0.5
    if (score > 0 && !seen.has(`group:${group}`)) {
      seen.add(`group:${group}`)
      results.push({ type: 'group', label: group, hint: `Все марки группы "${group}"`, metalGroups: [group], profileKeys: [], score })
    }
  }

  // 3. ГОСТы
  for (const m of gostMappings) {
    const cn = normalize(m.code)
    const hn = normalize(m.hint)
    let score = 0
    if (cn === qn) score = 1.0
    else if (cn.startsWith(qn)) score = 0.9
    else if (cn.includes(qn)) score = 0.7
    else if (hn.includes(qn)) score = 0.4
    const nums = qn.replace(/\D/g, '')
    if (nums.length >= 3 && cn.replace(/\D/g, '').startsWith(nums)) score = Math.max(score, 0.8)
    if (score > 0 && !seen.has(`gost:${m.code}`)) {
      seen.add(`gost:${m.code}`)
      results.push({ type: 'gost', label: m.code, hint: m.hint, metalGroups: m.metalGroups, profileKeys: m.profileKeys, score })
    }
  }

  return results.sort((a, b) => b.score - a.score).slice(0, 10)
}

export type GostSearchResult = { mapping: GostMapping; score: number }
export function searchGost(query: string): GostSearchResult[] {
  const qn = normalize(query)
  return gostMappings
    .map(m => {
      const cn = normalize(m.code)
      let score = 0
      if (cn === qn) score = 1.0
      else if (cn.startsWith(qn)) score = 0.9
      else if (cn.includes(qn)) score = 0.7
      const nums = qn.replace(/\D/g, '')
      if (nums.length >= 3 && cn.replace(/\D/g, '').startsWith(nums)) score = Math.max(score, 0.8)
      return { mapping: m, score }
    })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
}
