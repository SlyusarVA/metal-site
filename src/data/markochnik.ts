import { materials, type MetalMaterial } from './materials'

export type NormativeStatus = 'verified' | 'needs_check' | 'not_specified'

export type NormativeRef = {
  document: string
  section?: string
  table?: string
  note?: string
  url?: string
  status: NormativeStatus
}

export type NormativeValue = {
  value: string
  source?: NormativeRef
  note?: string
}

export type CompositionItem = {
  element: string
  label: string
  min?: number
  max?: number
  valueText: string
  source?: NormativeRef
}

export type GlossaryTerm = {
  id: string
  term: string
  short: string
  details: string
}

export type DesignationTerm = {
  slug: string
  code: string
  aliases: string[]
  title: string
  productGroup: string
  materialScope: string
  summary: string
  parts: { symbol: string; meaning: string; note?: string }[]
  examples: string[]
  relatedCodes: string[]
  source: NormativeRef
}

export type MetalGradePage = {
  slug: string
  designation: string
  title: string
  familySlug: string
  categorySlug: string
  categoryTitle: string
  gradeClass: NormativeValue
  documents: NormativeRef[]
  deliveryForms?: NormativeValue[]
  substitutes?: NormativeValue[]
  designationTermSlugs?: string[]
  decoding?: { symbol: string; meaning: string }[]
  calculatorLinks?: { label: string; href: string }[]
  technicalProperties?: { label: string; value: string; source?: NormativeRef }[]
  storage: {
    method: NormativeValue
    temperature: NormativeValue
    corrosionProtection: NormativeValue
  }
  application: {
    summary: string
    examples: string[]
    equipment: string[]
    note: string
  }
  composition: CompositionItem[]
  relatedGrades: string[]
  dataStatus: 'partial' | 'verified' | 'draft'
}

export const glossaryTerms: Record<string, GlossaryTerm> = {
  alloySteel: {
    id: 'alloySteel',
    term: 'Легированная сталь',
    short: 'Сталь со специально введёнными легирующими элементами.',
    details: 'Легирующие элементы вводят для изменения свойств: твёрдости, износостойкости, прокаливаемости, коррозионной стойкости или жаропрочности.',
  },
  toolSteel: {
    id: 'toolSteel',
    term: 'Инструментальная сталь',
    short: 'Сталь для режущего, измерительного или штампового инструмента.',
    details: 'Такие стали подбирают с учётом твёрдости, износостойкости, стабильности формы и режима термообработки.',
  },
  hardenability: {
    id: 'hardenability',
    term: 'Прокаливаемость',
    short: 'Способность стали закаливаться на определённую глубину.',
    details: 'Прокаливаемость показывает, насколько глубоко требуемая структура и твёрдость достигаются внутри сечения.',
  },
  wearResistance: {
    id: 'wearResistance',
    term: 'Износостойкость',
    short: 'Сопротивление истиранию и разрушению рабочей поверхности.',
    details: 'Для инструментальных сталей это важно, потому что рабочие поверхности должны дольше сохранять форму при трении и нагрузке.',
  },
  heatTreatment: {
    id: 'heatTreatment',
    term: 'Термообработка',
    short: 'Нагрев, выдержка и охлаждение металла для изменения свойств.',
    details: 'К термообработке относятся закалка, отпуск, отжиг и нормализация.',
  },
  storageMethod: {
    id: 'storageMethod',
    term: 'Хранение',
    short: 'Условия складирования металлопродукции.',
    details: 'Для карточки ХВСГФ условия хранения указываются по нормативному документу на хранение металлопродукции.',
  },
  temperatureMode: {
    id: 'temperatureMode',
    term: 'Температурный режим хранения',
    short: 'Допустимый диапазон или отсутствие отдельного температурного диапазона.',
    details: 'Если отдельный температурный диапазон не установлен нормативным документом, в карточке это не заменяется выдуманным диапазоном.',
  },
  referenceApplication: {
    id: 'referenceApplication',
    term: 'Применение',
    short: 'Типовое применение марки в промышленности.',
    details: 'Блок помогает понять, где марка обычно используется.',
  },
  compositionChart: {
    id: 'compositionChart',
    term: 'Диаграмма состава',
    short: 'Визуализация химического состава по числовым значениям таблицы.',
    details: 'Для диапазонов используется среднее значение. Для значений «до ...» берётся верхняя граница.',
  },
}

const gost5950: NormativeRef = {
  document: 'ГОСТ 5950-2000',
  section: 'Марки и химический состав',
  table: 'таблица химического состава инструментальных легированных сталей',
  status: 'verified',
}

const gost7566: NormativeRef = {
  document: 'ГОСТ 7566',
  section: 'Правила приемки, маркировка, упаковка, транспортирование и хранение',
  status: 'verified',
}

const gost1051: NormativeRef = {
  document: 'ГОСТ 1051-73',
  section: 'Прокат калиброванный. Общие технические условия',
  status: 'verified',
}

const gost2590: NormativeRef = {
  document: 'ГОСТ 2590-2006',
  section: 'Прокат сортовой стальной горячекатаный круглый. Сортамент',
  table: 'таблица 1: номинальный диаметр, площадь сечения и масса 1 м',
  status: 'verified',
}

const gost2591: NormativeRef = {
  document: 'ГОСТ 2591-2006',
  section: 'Прокат сортовой стальной горячекатаный квадратный. Сортамент',
  table: 'таблица 1: номинальная сторона квадрата, площадь сечения и масса 1 м',
  status: 'verified',
}

const gost4405: NormativeRef = {
  document: 'ГОСТ 4405-75',
  section: 'Полосы горячекатаные и кованые из инструментальной стали. Сортамент',
  status: 'verified',
}

const gost7417: NormativeRef = {
  document: 'ГОСТ 7417-75',
  section: 'Сталь калиброванная круглая. Сортамент',
  table: 'таблица 1: диаметры, предельные отклонения, площадь сечения и масса 1 м',
  status: 'verified',
}

const gost8559: NormativeRef = {
  document: 'ГОСТ 8559-75',
  section: 'Сталь калиброванная квадратная. Сортамент',
  table: 'таблица 1: сторона квадрата, предельные отклонения, площадь сечения и масса 1 м',
  status: 'verified',
}

const gost8560: NormativeRef = {
  document: 'ГОСТ 8560-78',
  section: 'Прокат калиброванный шестигранный. Сортамент',
  table: 'таблица 1: размер под ключ, предельные отклонения, площадь сечения и масса 1 м',
  status: 'verified',
}

const gost14955: NormativeRef = {
  document: 'ГОСТ 14955-77',
  section: 'Сталь качественная круглая со специальной отделкой поверхности. Технические условия',
  status: 'verified',
}

function ref(document: string, section: string, status: NormativeStatus = 'verified', table?: string, note?: string): NormativeRef {
  return { document, section, table, note, status }
}

const gostRefs: Record<string, NormativeRef> = {
  'ГОСТ 1050-2013': ref('ГОСТ 1050-2013', 'Металлопродукция из нелегированных конструкционных качественных и специальных сталей'),
  'ГОСТ 1414-75': ref('ГОСТ 1414-75', 'Прокат из конструкционной стали высокой обрабатываемости резанием'),
  'ГОСТ 1435-99': ref('ГОСТ 1435-99', 'Прутки, полосы и мотки из инструментальной нелегированной стали'),
  'ГОСТ 14959-2016': ref('ГОСТ 14959-2016', 'Металлопродукция из рессорно-пружинной стали'),
  'ГОСТ 19265-73': ref('ГОСТ 19265-73', 'Прутки и полосы из быстрорежущей стали'),
  'ГОСТ 19281-2014': ref('ГОСТ 19281-2014', 'Прокат повышенной прочности'),
  'ГОСТ 4543-2016': ref('ГОСТ 4543-2016', 'Металлопродукция из конструкционной легированной стали'),
  'ГОСТ 5632-2014': ref('ГОСТ 5632-2014', 'Легированные нержавеющие стали и сплавы. Марки'),
  'ГОСТ 4784-2019': ref('ГОСТ 4784-2019', 'Алюминий и алюминиевые деформируемые сплавы. Марки'),
  'ГОСТ 11069-2019': ref('ГОСТ 11069-2019', 'Алюминий первичный. Марки'),
  'ГОСТ 15527-2004': ref('ГОСТ 15527-2004', 'Сплавы медно-цинковые, обрабатываемые давлением. Марки'),
  'ГОСТ 859-2014': ref('ГОСТ 859-2014', 'Медь. Марки'),
  'ГОСТ 18175-78': ref('ГОСТ 18175-78', 'Бронзы безоловянные, обрабатываемые давлением. Марки'),
  'ГОСТ 613-79': ref('ГОСТ 613-79', 'Бронзы оловянные литейные. Марки'),
  'ГОСТ 19807-91': ref('ГОСТ 19807-91', 'Титан и сплавы титановые деформируемые. Марки'),
  'ГОСТ 492-2006': ref('ГОСТ 492-2006', 'Никель, сплавы никелевые и медно-никелевые. Марки'),
  'ГОСТ 10994-74': ref('ГОСТ 10994-74', 'Сплавы прецизионные. Марки'),
  'ГОСТ 17431-72': ref('ГОСТ 17431-72', 'Материалы порошковые. Листы из сплава марки М-МП'),
  'ГОСТ 3640-94': ref('ГОСТ 3640-94', 'Цинк. Технические условия'),
  'ГОСТ 380-2005': ref('ГОСТ 380-2005', 'Сталь углеродистая обыкновенного качества. Марки'),
  'ГОСТ 19671-91': ref('ГОСТ 19671-91', 'Проволока вольфрамовая для источников света'),
  'ГОСТ 18903-73': ref('ГОСТ 18903-73', 'Проволока вольфрамовая. Сортамент'),
}

export const designationTerms: DesignationTerm[] = [
  {
    slug: 'dprnm',
    code: 'ДПРНМ',
    aliases: ['ДПРНМ', 'Д-ПР-Н-М', 'лента ДПРНМ', 'лист ДПРНМ'],
    title: 'ДПРНМ для латунного плоского проката',
    productGroup: 'Фольга, ленты, полосы, листы и плиты латунные',
    materialScope: 'Латунь и плоский прокат на медной основе',
    summary: 'Холоднокатаный плоский прокат прямоугольного сечения нормальной точности, поставляемый в мягком состоянии.',
    parts: [
      { symbol: 'Д', meaning: 'холоднокатаная / холоднодеформированная продукция' },
      { symbol: 'ПР', meaning: 'прямоугольное сечение' },
      { symbol: 'Н', meaning: 'нормальная точность изготовления по толщине и ширине' },
      { symbol: 'М', meaning: 'мягкое состояние материала' },
    ],
    examples: [
      'Лента ДПРНМ 0,25 x 100 НД Л90 ГВ ГОСТ 2208-2007',
      'Лист ДПРНМ 2,10 x 300 НД ЛМц58-2 Р ГОСТ 2208-2007',
    ],
    relatedCodes: ['ДПРНП', 'ДПРНТ', 'ДПРПП', 'ГПРХХ'],
    source: {
      document: 'ГОСТ 2208-2007',
      section: 'схема и примеры условных обозначений латунного плоского проката',
      url: 'https://rags.ru/documents/prod/gost_gosudarstvennyj-standart/6/gost_84166.html',
      status: 'verified',
    },
  },
  {
    slug: 'b-2a',
    code: 'Б-2А',
    aliases: ['Б-2А', 'Б2А', 'проволока Б-2А', 'проволока Б2А'],
    title: 'Б-2А для пружинной проволоки',
    productGroup: 'Проволока стальная углеродистая пружинная',
    materialScope: 'Пружинная проволока по ГОСТ 9389-75',
    summary: 'Проволока марки Б, класса 2А; класс 2А по стандарту выпускается только повышенной точности.',
    parts: [
      { symbol: 'Б', meaning: 'марка проволоки по механическим свойствам', note: 'В приложении 3 ГОСТ 9389-75 марка Б рекомендована для пружин с расчетным относительным показателем разбега прочности K не более 0,17.' },
      { symbol: '2А', meaning: 'класс прочности пружинной проволоки', note: 'ГОСТ 9389-75 указывает, что проволока класса 2А изготавливается повышенной точности.' },
      { symbol: '1,2', meaning: 'диаметр проволоки в миллиметрах, если число указано после класса' },
    ],
    examples: [
      'Проволока Б-2А-1,2 ГОСТ 9389-75',
      'Проволока Б-2А-3,5 ГОСТ 9389-75',
    ],
    relatedCodes: ['А-1-П', 'Б-3', 'В-2А'],
    source: {
      document: 'ГОСТ 9389-75',
      section: 'п. 1.1, примеры условных обозначений, приложение 3',
      url: 'https://opm.ru/GOSTI_PDF/gost_9389-75.pdf',
      status: 'verified',
    },
  },
  {
    slug: 'latun-rods-gost-2060',
    code: 'ДКРНТ',
    aliases: ['ДКРНТ', 'ДКВПТ', 'ДШГНП', 'ГКВНХ', 'латунный пруток', 'пруток ГОСТ 2060'],
    title: 'Условные обозначения латунных прутков',
    productGroup: 'Прутки латунные',
    materialScope: 'Латунные прутки круглого, квадратного и шестигранного сечений',
    summary: 'Схема для латунных прутков: способ изготовления, форма сечения, точность, состояние материала, размер и марка сплава.',
    parts: [
      { symbol: 'Д', meaning: 'холоднодеформированный, тянутый пруток' },
      { symbol: 'Г', meaning: 'горячедеформированный, прессованный пруток' },
      { symbol: 'КР / КВ / ШГ', meaning: 'круглое, квадратное или шестигранное сечение' },
      { symbol: 'Н / П / В', meaning: 'нормальная, повышенная или высокая точность изготовления' },
      { symbol: 'М / П / Т / Х', meaning: 'мягкое, полутвердое, твердое или без дополнительного указания состояния в примере стандарта' },
    ],
    examples: [
      'Пруток ДКРНТ 12 НД ЛС63-3 ГОСТ 2060-2006',
      'Пруток ДШГНП 24 x 3000 ЛО62-1 СК ГОСТ 2060-2006',
      'Пруток ГКВНХ 24 НД ЛЖС58-1-1 ГОСТ 2060-2006',
    ],
    relatedCodes: ['ДКВПТ', 'ДКРВП', 'ДКРВТ', 'ДШГНП', 'ГКВНХ'],
    source: {
      document: 'ГОСТ 2060-2006',
      section: 'п. 4.6, схема и примеры условных обозначений латунных прутков',
      url: 'https://files.stroyinf.ru/Data2/1/4293843/4293843785.htm',
      status: 'verified',
    },
  },
  {
    slug: 'copper-flat-gost-1173',
    code: 'ДПРПП',
    aliases: ['ДПРПП', 'ДПРНМ', 'ДПРНТ', 'медная лента', 'медный лист', 'ГОСТ 1173'],
    title: 'Условные обозначения медной ленты и листа',
    productGroup: 'Ленты, полосы, фольга и листы из меди',
    materialScope: 'Медный плоский прокат',
    summary: 'Схема похожа на латунный плоский прокат: способ изготовления, прямоугольное сечение, точность и состояние меди.',
    parts: [
      { symbol: 'Д', meaning: 'холоднокатаная / холоднодеформированная продукция' },
      { symbol: 'ПР', meaning: 'прямоугольное сечение' },
      { symbol: 'Н / П', meaning: 'нормальная или повышенная точность изготовления' },
      { symbol: 'М / П / Т', meaning: 'мягкое, полутвердое или твердое состояние меди' },
    ],
    examples: [
      'Лента ДПРПП 0,70 x 35 НД М1 ГОСТ 1173-2006',
      'Лента ДПРНМ 0,50 x 100 НД М1 ГОСТ 1173-2006',
    ],
    relatedCodes: ['ДПРНМ', 'ДПРНП', 'ДПРНТ', 'ДПРПМ', 'ДПРПТ'],
    source: {
      document: 'ГОСТ 1173-2006',
      section: 'схема условного обозначения медной ленты',
      url: 'https://russkijmetall.ru/mednaya-lenta-m1/',
      status: 'needs_check',
    },
  },
  {
    slug: 'aluminum-temper',
    code: 'М / Н / Т',
    aliases: ['М', 'Н', 'Н2', 'Т', 'Т1', 'Т2', 'Д16Т', 'АМг2М', 'алюминий состояние поставки'],
    title: 'Состояния алюминиевых полуфабрикатов',
    productGroup: 'Листы, плиты, профили и другие полуфабрикаты из алюминия',
    materialScope: 'Алюминий и деформируемые алюминиевые сплавы',
    summary: 'Буквы после марки или в условном обозначении показывают состояние материала: отжиг, нагартовку или термообработку.',
    parts: [
      { symbol: 'М', meaning: 'мягкое, отожженное состояние' },
      { symbol: 'Н', meaning: 'нагартованное состояние' },
      { symbol: 'Н2', meaning: 'полунагартованное состояние' },
      { symbol: 'Т', meaning: 'закаленное и естественно состаренное состояние' },
      { symbol: 'Т1', meaning: 'закаленное и искусственно состаренное состояние' },
    ],
    examples: [
      'Лист АМг2М 0,7 x 1200 x 2000 ГОСТ 21631',
      'Плита Д16 А Т 20 x 1200 x 3000 ГОСТ 17232',
      'Марка Д16Т: сплав Д16 в термически упрочненном состоянии',
    ],
    relatedCodes: ['АМг2М', 'Д16Т', 'В95Т1', 'АД0Н', 'Н2'],
    source: {
      document: 'ГОСТ 21631 / ГОСТ 17232',
      section: 'состояние материала в условном обозначении алюминиевых листов и плит',
      url: 'https://ssa.ru/articles/sortament-i-klassifikatsiya-alyuminievyh-listov-po-gost-21631-76.html',
      status: 'needs_check',
    },
  },
  {
    slug: 'steel-deoxidation-gost-380',
    code: 'кп / пс / сп',
    aliases: ['кп', 'пс', 'сп', 'Ст3кп', 'Ст3пс', 'Ст3сп', 'Ст5сп', 'степень раскисления'],
    title: 'Степень раскисления углеродистой стали',
    productGroup: 'Прокат из углеродистой стали обыкновенного качества',
    materialScope: 'Марки Ст3кп, Ст3пс, Ст3сп, Ст5сп и близкие обозначения',
    summary: 'Индекс в конце марки показывает степень раскисления стали: кипящая, полуспокойная или спокойная.',
    parts: [
      { symbol: 'кп', meaning: 'кипящая сталь' },
      { symbol: 'пс', meaning: 'полуспокойная сталь' },
      { symbol: 'сп', meaning: 'спокойная сталь' },
    ],
    examples: [
      'Ст3кп ГОСТ 380-2005',
      'Ст3пс ГОСТ 380-2005',
      'Ст3сп ГОСТ 380-2005',
    ],
    relatedCodes: ['Ст5сп', 'Ст4пс', 'Ст2кп'],
    source: {
      document: 'ГОСТ 380-2005',
      section: 'обозначения степени раскисления в марках стали',
      url: 'https://metal.place/ru/wiki/standart/gost-380-2005/',
      status: 'verified',
    },
  },
  {
    slug: 'spring-wire-gost-9389',
    code: 'А / Б / В',
    aliases: ['А-1-П', 'Б-3', 'В-2А', 'проволока А', 'проволока Б', 'проволока В', 'класс 2А'],
    title: 'Марки и классы пружинной проволоки',
    productGroup: 'Проволока стальная углеродистая пружинная',
    materialScope: 'Пружинная проволока по ГОСТ 9389-75',
    summary: 'В условном обозначении указывают марку проволоки по механическим свойствам, класс прочности, точность и диаметр.',
    parts: [
      { symbol: 'А / Б / В', meaning: 'марка проволоки по механическим свойствам' },
      { symbol: '1 / 2 / 2А / 3', meaning: 'класс прочности пружинной проволоки' },
      { symbol: 'П', meaning: 'повышенная точность, если указана в обозначении' },
      { symbol: '1,2', meaning: 'диаметр проволоки в миллиметрах' },
    ],
    examples: [
      'Проволока А-1-П-1,0 ГОСТ 9389-75',
      'Проволока Б-2А-1,2 ГОСТ 9389-75',
      'Проволока В-2А-1,2 ГОСТ 9389-75',
    ],
    relatedCodes: ['Б-2А', 'Б-3', 'В-2А', 'А-1-П'],
    source: {
      document: 'ГОСТ 9389-75',
      section: 'п. 1.1, марки А/Б/В, классы 1/2/2А/3 и примеры условных обозначений',
      url: 'https://opm.ru/GOSTI_PDF/gost_9389-75.pdf',
      status: 'verified',
    },
  },
]

const needsZirconiumStandard: NormativeRef = {
  document: 'НД на металлический цирконий',
  section: 'Требуется уточнение: ГОСТ 21907-76 относится к двуокиси циркония, а не к металлическому цирконию',
  status: 'needs_check',
}

const familyByGroup: Record<string, { familySlug: string; familyTitle: string; categorySlug: string; categoryTitle: string; categoryDescription: string }> = {
  'Сталь': { familySlug: 'stali', familyTitle: 'Стали', categorySlug: 'konstrukcionnye', categoryTitle: 'Конструкционные стали', categoryDescription: 'Заготовки, детали машин, металлоконструкции.' },
  'Нержавейка': { familySlug: 'stali', familyTitle: 'Стали', categorySlug: 'nerzhaveyushchie', categoryTitle: 'Нержавеющие стали', categoryDescription: 'Коррозионностойкие, жаростойкие и жаропрочные стали.' },
  'Алюминий': { familySlug: 'cvetnye-metally', familyTitle: 'Цветные металлы', categorySlug: 'alyuminievye-splavy', categoryTitle: 'Алюминий и алюминиевые сплавы', categoryDescription: 'Первичный алюминий и деформируемые алюминиевые сплавы.' },
  'Латунь': { familySlug: 'cvetnye-metally', familyTitle: 'Цветные металлы', categorySlug: 'latuni', categoryTitle: 'Латуни', categoryDescription: 'Медно-цинковые сплавы, обрабатываемые давлением.' },
  'Медь': { familySlug: 'cvetnye-metally', familyTitle: 'Цветные металлы', categorySlug: 'med', categoryTitle: 'Медь', categoryDescription: 'Марки меди для проката и проводниковой продукции.' },
  'Бронза': { familySlug: 'cvetnye-metally', familyTitle: 'Цветные металлы', categorySlug: 'bronzy', categoryTitle: 'Бронзы', categoryDescription: 'Безоловянные и оловянные бронзы.' },
  'Никель': { familySlug: 'cvetnye-metally', familyTitle: 'Цветные металлы', categorySlug: 'nikel', categoryTitle: 'Никель и никелевые сплавы', categoryDescription: 'Никель, никелевые и медно-никелевые сплавы.' },
  'Титан': { familySlug: 'cvetnye-metally', familyTitle: 'Цветные металлы', categorySlug: 'titanovye-splavy', categoryTitle: 'Титановые сплавы', categoryDescription: 'Титан и титановые деформируемые сплавы.' },
  'Цинк': { familySlug: 'cvetnye-metally', familyTitle: 'Цветные металлы', categorySlug: 'cink', categoryTitle: 'Цинк', categoryDescription: 'Марки цинка по техническим условиям.' },
  'Нихром': { familySlug: 'specialnye-splavy', familyTitle: 'Специальные сплавы', categorySlug: 'precizionnye-splavy', categoryTitle: 'Прецизионные сплавы', categoryDescription: 'Сплавы с заданными электрическими и физическими свойствами.' },
  'Вольфрам': { familySlug: 'tugoplavkie-metally', familyTitle: 'Тугоплавкие металлы', categorySlug: 'volfram', categoryTitle: 'Вольфрам', categoryDescription: 'Вольфрамовая проволока и марки для источников света.' },
  'Молибден': { familySlug: 'tugoplavkie-metally', familyTitle: 'Тугоплавкие металлы', categorySlug: 'molibden', categoryTitle: 'Молибден', categoryDescription: 'Молибденовые порошковые материалы и сплавы.' },
  'Цирконий': { familySlug: 'tugoplavkie-metally', familyTitle: 'Тугоплавкие металлы', categorySlug: 'cirkoniy', categoryTitle: 'Цирконий', categoryDescription: 'Позиции, требующие уточнения нормативного документа на металлический цирконий.' },
}

const steelToolGosts = new Set(['ГОСТ 5950-2000', 'ГОСТ 1435-99', 'ГОСТ 19265-73'])
const tinBronzes = new Set(['БрОФ10-1', 'БрОЦС4-4-2.5'])

const baseCompositionByGroup: Record<string, CompositionItem> = {
  'Сталь': { element: 'Fe', label: 'Железо', min: 95, max: 99, valueText: 'основа' },
  'Нержавейка': { element: 'Fe', label: 'Железо', min: 60, max: 75, valueText: 'основа' },
  'Алюминий': { element: 'Al', label: 'Алюминий', min: 88, max: 99.7, valueText: 'основа' },
  'Латунь': { element: 'Cu', label: 'Медь', min: 57, max: 70, valueText: 'основа' },
  'Медь': { element: 'Cu', label: 'Медь', min: 99.5, max: 99.99, valueText: 'основа' },
  'Бронза': { element: 'Cu', label: 'Медь', min: 80, max: 98, valueText: 'основа' },
  'Вольфрам': { element: 'W', label: 'Вольфрам', min: 99, max: 99.95, valueText: 'основа' },
  'Молибден': { element: 'Mo', label: 'Молибден', min: 98, max: 99.95, valueText: 'основа' },
  'Никель': { element: 'Ni', label: 'Никель', min: 58, max: 99.9, valueText: 'основа' },
  'Нихром': { element: 'Ni', label: 'Никель', min: 55, max: 80, valueText: 'основа' },
  'Титан': { element: 'Ti', label: 'Титан', min: 88, max: 99.7, valueText: 'основа' },
  'Цинк': { element: 'Zn', label: 'Цинк', min: 98.7, max: 99.99, valueText: 'основа' },
  'Цирконий': { element: 'Zr', label: 'Цирконий', min: 95, max: 99, valueText: 'основа' },
}

const elementLabels: Record<string, string> = {
  Al: 'Алюминий',
  Be: 'Бериллий',
  C: 'Углерод',
  Cr: 'Хром',
  Cu: 'Медь',
  Fe: 'Железо',
  Mg: 'Магний',
  Mn: 'Марганец',
  Mo: 'Молибден',
  Ni: 'Никель',
  P: 'Фосфор',
  Pb: 'Свинец',
  Si: 'Кремний',
  Sn: 'Олово',
  Ti: 'Титан',
  V: 'Ванадий',
  W: 'Вольфрам',
  Zn: 'Цинк',
  Zr: 'Цирконий',
}

const alloyLetterMap: Record<string, { element: string; meaning: string; defaultValue: number }> = {
  'А': { element: 'N', meaning: 'азот', defaultValue: 0.1 },
  'Б': { element: 'Nb', meaning: 'ниобий', defaultValue: 0.2 },
  'В': { element: 'W', meaning: 'вольфрам', defaultValue: 1 },
  'Г': { element: 'Mn', meaning: 'марганец', defaultValue: 1 },
  'Д': { element: 'Cu', meaning: 'медь', defaultValue: 1 },
  'К': { element: 'Co', meaning: 'кобальт', defaultValue: 1 },
  'М': { element: 'Mo', meaning: 'молибден', defaultValue: 1 },
  'Н': { element: 'Ni', meaning: 'никель', defaultValue: 1 },
  'Р': { element: 'B', meaning: 'бор', defaultValue: 0.1 },
  'С': { element: 'Si', meaning: 'кремний', defaultValue: 1 },
  'Т': { element: 'Ti', meaning: 'титан', defaultValue: 0.5 },
  'Ф': { element: 'V', meaning: 'ванадий', defaultValue: 0.2 },
  'Х': { element: 'Cr', meaning: 'хром', defaultValue: 1 },
  'Ц': { element: 'Zr', meaning: 'цирконий', defaultValue: 0.2 },
  'Ю': { element: 'Al', meaning: 'алюминий', defaultValue: 1 },
}

const exactCompositionByGrade: Record<string, CompositionItem[]> = {
  'Л63': [
    { element: 'Cu', label: 'Медь', min: 62, max: 65, valueText: '62,0-65,0 %' },
    { element: 'Zn', label: 'Цинк', min: 34, max: 37, valueText: 'остальное' },
  ],
  'Л68': [
    { element: 'Cu', label: 'Медь', min: 67, max: 70, valueText: '67,0-70,0 %' },
    { element: 'Zn', label: 'Цинк', min: 29, max: 32, valueText: 'остальное' },
  ],
  'ЛС59-1': [
    { element: 'Cu', label: 'Медь', min: 57, max: 60, valueText: '57,0-60,0 %' },
    { element: 'Pb', label: 'Свинец', min: 0.8, max: 1.9, valueText: '0,8-1,9 %' },
    { element: 'Zn', label: 'Цинк', min: 38, max: 41, valueText: 'остальное' },
  ],
  'ЛО62-1': [
    { element: 'Cu', label: 'Медь', min: 60, max: 63, valueText: '60,0-63,0 %' },
    { element: 'Sn', label: 'Олово', min: 0.7, max: 1.1, valueText: '0,7-1,1 %' },
    { element: 'Zn', label: 'Цинк', min: 36, max: 39, valueText: 'остальное' },
  ],
  'М00': [{ element: 'Cu', label: 'Медь', min: 99.99, max: 99.99, valueText: 'не менее 99,99 %' }],
  'М0': [{ element: 'Cu', label: 'Медь', min: 99.95, max: 99.95, valueText: 'не менее 99,95 %' }],
  'М1': [{ element: 'Cu', label: 'Медь', min: 99.9, max: 99.9, valueText: 'не менее 99,90 %' }],
  'М2': [{ element: 'Cu', label: 'Медь', min: 99.7, max: 99.7, valueText: 'не менее 99,70 %' }],
  'М3': [{ element: 'Cu', label: 'Медь', min: 99.5, max: 99.5, valueText: 'не менее 99,50 %' }],
  'БрАМц9-2': [
    { element: 'Cu', label: 'Медь', min: 86, max: 90, valueText: 'основа' },
    { element: 'Al', label: 'Алюминий', min: 8, max: 10, valueText: '8,0-10,0 %' },
    { element: 'Mn', label: 'Марганец', min: 1.5, max: 2.5, valueText: '1,5-2,5 %' },
  ],
  'БрБ2': [
    { element: 'Cu', label: 'Медь', min: 97, max: 98, valueText: 'основа' },
    { element: 'Be', label: 'Бериллий', min: 1.8, max: 2.1, valueText: '1,8-2,1 %' },
  ],
  'БрКМц3-1': [
    { element: 'Cu', label: 'Медь', min: 95, max: 97, valueText: 'основа' },
    { element: 'Si', label: 'Кремний', min: 2.75, max: 3.5, valueText: '2,75-3,5 %' },
    { element: 'Mn', label: 'Марганец', min: 1, max: 1.5, valueText: '1,0-1,5 %' },
  ],
  'БрОФ10-1': [
    { element: 'Cu', label: 'Медь', min: 88, max: 91, valueText: 'основа' },
    { element: 'Sn', label: 'Олово', min: 9, max: 11, valueText: '9,0-11,0 %' },
    { element: 'P', label: 'Фосфор', min: 0.4, max: 1.1, valueText: '0,4-1,1 %' },
  ],
  'Х15Н60': [
    { element: 'Ni', label: 'Никель', min: 55, max: 61, valueText: '55,0-61,0 %' },
    { element: 'Cr', label: 'Хром', min: 15, max: 18, valueText: '15,0-18,0 %' },
    { element: 'Fe', label: 'Железо', min: 20, max: 27, valueText: 'остальное' },
  ],
  'Х20Н80': [
    { element: 'Ni', label: 'Никель', min: 75, max: 78, valueText: '75,0-78,0 %' },
    { element: 'Cr', label: 'Хром', min: 20, max: 23, valueText: '20,0-23,0 %' },
    { element: 'Fe', label: 'Железо', min: 1, max: 3, valueText: 'до 3,0 %' },
  ],
}

function gradeSlug(value: string) {
  const map: Record<string, string> = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y',
    'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f',
    'х': 'x', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  }
  return value
    .toLowerCase()
    .replace(/[а-яё]/g, char => map[char] ?? char)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sourceForMaterial(material: MetalMaterial): NormativeRef {
  if (material.group === 'Вольфрам') return gostRefs['ГОСТ 19671-91']
  if (material.group === 'Цирконий') return needsZirconiumStandard
  if (tinBronzes.has(material.grade)) return gostRefs['ГОСТ 613-79']
  return gostRefs[material.gost] ?? ref(material.gost, 'Нормативный документ из карточки материала', 'needs_check')
}

function compositionSource(source: NormativeRef): NormativeRef {
  return {
    ...source,
    section: `${source.section}; состав заполнен как справочный слой карточки`,
    note: 'Для марок без ручной вычитки таблицы диапазоны требуют последующей проверки по локальному PDF ГОСТа.',
    status: source.status === 'verified' ? 'needs_check' : source.status,
  }
}

function item(element: string, value: number, source: NormativeRef, valueText?: string): CompositionItem {
  return {
    element,
    label: elementLabels[element] ?? element,
    min: value,
    max: value,
    valueText: valueText ?? `около ${String(value).replace('.', ',')} %`,
    source,
  }
}

function withCompositionSource(items: CompositionItem[], source: NormativeRef) {
  return items.map(entry => ({ ...entry, source }))
}

function parseSteelDesignation(material: MetalMaterial, source: NormativeRef): CompositionItem[] {
  const clean = material.grade.replace(/\s*\(.+?\)\s*/g, '')
  const rows: CompositionItem[] = []
  const carbonMatch = clean.match(/^(\d{1,3})/)
  if (carbonMatch) {
    const raw = Number(carbonMatch[1])
    const value = raw >= 100 ? raw / 1000 : raw / 100
    rows.push(item('C', value, source, raw < 10 ? `${String(value).replace('.', ',')} %` : `около ${String(value).replace('.', ',')} %`))
  }

  const alloyPattern = /([АБВГДКМНРСТФХЦЮ])(\d{0,2})/g
  let match: RegExpExecArray | null
  while ((match = alloyPattern.exec(clean)) !== null) {
    const meta = alloyLetterMap[match[1]]
    if (!meta) continue
    const value = match[2] ? Number(match[2]) : meta.defaultValue
    rows.push(item(meta.element, value, source))
  }

  const base = baseCompositionByGroup[material.group]
  if (base) rows.push({ ...base, source })
  return mergeComposition(rows)
}

function mergeComposition(rows: CompositionItem[]) {
  const result: CompositionItem[] = []
  const seen = new Set<string>()
  for (const row of rows) {
    if (seen.has(row.element)) continue
    seen.add(row.element)
    result.push(row)
  }
  return result
}

function compositionForMaterial(material: MetalMaterial, source: NormativeRef): CompositionItem[] {
  const src = compositionSource(source)
  const exact = exactCompositionByGrade[material.grade]
  if (exact) return withCompositionSource(exact, source.status === 'verified' ? source : src)

  if (material.group === 'Сталь' || material.group === 'Нержавейка') {
    return parseSteelDesignation(material, src)
  }

  if (material.group === 'Алюминий') {
    const addByGrade: Record<string, CompositionItem[]> = {
      'АД31': [item('Mg', 0.7, src), item('Si', 0.6, src)],
      'АМг2': [item('Mg', 2, src)],
      'АМг3': [item('Mg', 3, src)],
      'АМг5': [item('Mg', 5, src)],
      'АМг6': [item('Mg', 6, src)],
      'АМц': [item('Mn', 1.3, src)],
      'АК4': [item('Cu', 2.5, src), item('Mg', 1.5, src)],
      'В95': [item('Zn', 5.5, src), item('Mg', 2.5, src), item('Cu', 1.6, src)],
      '7075 (В95)': [item('Zn', 5.6, src), item('Mg', 2.5, src), item('Cu', 1.6, src)],
      '6061': [item('Mg', 1, src), item('Si', 0.6, src)],
      '6082': [item('Mg', 0.8, src), item('Si', 1, src), item('Mn', 0.7, src)],
      'Д1': [item('Cu', 4, src), item('Mg', 0.6, src), item('Mn', 0.6, src)],
      'Д16': [item('Cu', 4.4, src), item('Mg', 1.5, src), item('Mn', 0.6, src)],
      'Д16Т': [item('Cu', 4.4, src), item('Mg', 1.5, src), item('Mn', 0.6, src)],
    }
    return mergeComposition([...(addByGrade[material.grade] ?? []), { ...baseCompositionByGroup['Алюминий'], source: src }])
  }

  if (material.group === 'Титан') {
    const addByGrade: Record<string, CompositionItem[]> = {
      'ВТ6': [item('Al', 6, src), item('V', 4, src)],
      'Ti Grade 5': [item('Al', 6, src), item('V', 4, src)],
      'ОТ4': [item('Al', 4, src), item('Mn', 1.5, src)],
    }
    return mergeComposition([...(addByGrade[material.grade] ?? []), { ...baseCompositionByGroup['Титан'], source: src }])
  }

  if (material.group === 'Никель') {
    const addByGrade: Record<string, CompositionItem[]> = {
      'Inconel 625': [item('Ni', 61, src), item('Cr', 21.5, src), item('Mo', 9, src)],
      'ВНМ3-2': [item('Ni', 58, src), item('W', 3, src), item('Mo', 2, src)],
    }
    return mergeComposition([...(addByGrade[material.grade] ?? []), { ...baseCompositionByGroup['Никель'], source: src }])
  }

  const base = baseCompositionByGroup[material.group]
  return base ? [{ ...base, source: src }] : []
}

function decodingForMaterial(material: MetalMaterial) {
  const rows: { symbol: string; meaning: string }[] = []
  const clean = material.grade.replace(/\s*\(.+?\)\s*/g, '')

  if (material.gost.startsWith('ГОСТ') && (material.group === 'Сталь' || material.group === 'Нержавейка' || material.group === 'Нихром')) {
    const alloyPattern = /([АБВГДКМНРСТФХЦЮ])(\d{0,2})/g
    let match: RegExpExecArray | null
    while ((match = alloyPattern.exec(clean)) !== null) {
      const meta = alloyLetterMap[match[1]]
      if (meta) rows.push({ symbol: match[0], meaning: match[2] ? `${meta.meaning}, около ${match[2]} %` : meta.meaning })
    }
  }

  if (material.group === 'Алюминий') {
    if (clean.startsWith('АМг')) rows.push({ symbol: 'АМг', meaning: 'алюминиево-магниевый сплав' })
    if (clean.startsWith('АМц')) rows.push({ symbol: 'АМц', meaning: 'алюминиево-марганцевый сплав' })
    if (clean.startsWith('Д')) rows.push({ symbol: 'Д', meaning: 'дюралюминий' })
    if (clean.startsWith('АД')) rows.push({ symbol: 'АД', meaning: 'алюминий деформируемый' })
    if (clean.startsWith('В')) rows.push({ symbol: 'В', meaning: 'высокопрочный алюминиевый сплав' })
  }

  if (material.group === 'Латунь') {
    rows.push({ symbol: 'Л', meaning: 'латунь' })
    if (clean.includes('С')) rows.push({ symbol: 'С', meaning: 'свинец' })
    if (clean.includes('О')) rows.push({ symbol: 'О', meaning: 'олово' })
  }

  if (material.group === 'Бронза') {
    rows.push({ symbol: 'Бр', meaning: 'бронза' })
    if (clean.includes('А')) rows.push({ symbol: 'А', meaning: 'алюминий' })
    if (clean.includes('Мц')) rows.push({ symbol: 'Мц', meaning: 'марганец' })
    if (clean.includes('Б')) rows.push({ symbol: 'Б', meaning: 'бериллий' })
    if (clean.includes('К')) rows.push({ symbol: 'К', meaning: 'кремний' })
    if (clean.includes('О')) rows.push({ symbol: 'О', meaning: 'олово' })
    if (clean.includes('Ф')) rows.push({ symbol: 'Ф', meaning: 'фосфор' })
    if (clean.includes('С')) rows.push({ symbol: 'С', meaning: 'свинец' })
  }

  if (rows.length === 0) {
    rows.push({ symbol: material.grade, meaning: `обозначение марки по ${material.gost}` })
  }
  return rows
}

function technicalPropertiesFor(material: MetalMaterial, source: NormativeRef): { label: string; value: string; source?: NormativeRef }[] {
  return [
    { label: 'Плотность', value: `${material.density} кг/м³`, source },
    { label: 'Нормативный документ', value: source.document, source },
    { label: 'Состояние поставки', value: 'Уточняется по виду продукции, сортаменту и условиям заказа.', source },
    { label: 'Термообработка', value: material.group === 'Сталь' || material.group === 'Нержавейка' ? 'Назначается по марке стали и требованиям ГОСТ/ТУ.' : 'Для этой группы указывается только при наличии требования в документе поставки.', source },
  ]
}

function categoryForMaterial(material: MetalMaterial) {
  const base = familyByGroup[material.group] ?? familyByGroup['Сталь']
  if (material.group === 'Сталь' && steelToolGosts.has(material.gost)) {
    return { ...base, categorySlug: 'instrumentalnye', categoryTitle: 'Инструментальные стали', categoryDescription: 'Стали для режущего, измерительного и штампового инструмента.' }
  }
  return base
}

function gradeClassForMaterial(material: MetalMaterial, source: NormativeRef): NormativeValue {
  const byGroup: Record<string, string> = {
    'Сталь': material.gost === 'ГОСТ 19281-2014' ? 'Прокат повышенной прочности' : material.gost === 'ГОСТ 14959-2016' ? 'Рессорно-пружинная сталь' : steelToolGosts.has(material.gost) ? 'Инструментальная сталь' : 'Конструкционная сталь',
    'Нержавейка': 'Коррозионностойкая, жаростойкая или жаропрочная сталь',
    'Алюминий': 'Алюминий или деформируемый алюминиевый сплав',
    'Латунь': 'Медно-цинковый сплав',
    'Медь': 'Медь',
    'Бронза': tinBronzes.has(material.grade) ? 'Оловянная бронза' : 'Безоловянная бронза',
    'Вольфрам': 'Вольфрамовая марка',
    'Молибден': 'Молибденовый материал',
    'Никель': 'Никель или никелевый сплав',
    'Нихром': 'Прецизионный сплав высокого электрического сопротивления',
    'Титан': 'Титановый деформируемый сплав',
    'Цинк': 'Цинк',
    'Цирконий': 'Циркониевый материал',
  }
  return { value: byGroup[material.group] ?? material.group, source }
}

function storageFor(source: NormativeRef): MetalGradePage['storage'] {
  return {
    method: { value: 'Хранение и транспортирование назначают по нормативному документу на конкретный металл или вид поставки.', source },
    temperature: { value: 'Отдельный универсальный температурный диапазон для марки не задан; режим уточняется условиями поставки и складирования.', source },
    corrosionProtection: { value: 'Защиту поверхности и упаковку выбирают по документу на продукцию и требованиям договора поставки.', source },
  }
}

function applicationFor(material: MetalMaterial): MetalGradePage['application'] {
  const summaryByGroup: Record<string, string> = {
    'Сталь': 'Детали машин, инструмент или прокат по назначению марки и категории стали.',
    'Нержавейка': 'Изделия и узлы, где требуется стойкость к коррозии, температуре или агрессивной среде.',
    'Алюминий': 'Лёгкие конструкции, листы, плиты, профили и детали с пониженной массой.',
    'Латунь': 'Детали арматуры, крепежа, втулки, элементы приборов и декоративный прокат.',
    'Медь': 'Электротехнические детали, теплообменные элементы и медный прокат.',
    'Бронза': 'Втулки, антифрикционные детали, литые и деформируемые заготовки.',
    'Вольфрам': 'Вольфрамовая продукция для светотехнических и высокотемпературных применений.',
    'Молибден': 'Порошковые и жаростойкие материалы для ответственных деталей.',
    'Никель': 'Коррозионностойкие детали и никелевый прокат.',
    'Нихром': 'Нагревательные элементы и резистивные детали.',
    'Титан': 'Лёгкие коррозионностойкие детали и ответственные конструкции.',
    'Цинк': 'Цинковая продукция и защитные покрытия.',
    'Цирконий': 'Позиция требует уточнения нормативного документа перед применением в расчётах.',
  }
  return {
    summary: summaryByGroup[material.group] ?? 'Справочное применение уточняется по нормативному документу и условиям поставки.',
    examples: [material.group, material.grade, 'прокат', 'заготовки'],
    equipment: ['металлообработка', 'складской учет', 'расчет массы'],
    note: material.group === 'Цирконий' ? 'ГОСТ 21907-76 исключён из источников, потому что относится к двуокиси циркония.' : '',
  }
}

function deliveryFormsFor(material: MetalMaterial, source: NormativeRef): NormativeValue[] {
  const valuesByGroup: Record<string, string[]> = {
    'Сталь': ['круг', 'квадрат', 'полоса', 'лист', 'пруток'],
    'Нержавейка': ['лист', 'круг', 'труба', 'пруток'],
    'Алюминий': ['лист', 'плита', 'пруток', 'профиль'],
    'Латунь': ['пруток', 'проволока', 'лист', 'лента'],
    'Медь': ['пруток', 'проволока', 'лист', 'лента'],
    'Бронза': ['пруток', 'лента', 'отливки', 'заготовки'],
    'Вольфрам': ['проволока'],
    'Молибден': ['лист', 'заготовки'],
    'Никель': ['лист', 'пруток', 'лента'],
    'Нихром': ['проволока', 'лента'],
    'Титан': ['лист', 'пруток', 'плита'],
    'Цинк': ['слитки', 'чушки', 'заготовки'],
    'Цирконий': ['уточняется'],
  }
  return (valuesByGroup[material.group] ?? ['прокат']).map(value => ({ value, source }))
}

function calculatorLinksFor(material: MetalMaterial) {
  const profileByGroup: Record<string, string> = {
    'Сталь': 'round',
    'Нержавейка': 'sheet',
    'Алюминий': 'sheet',
    'Латунь': 'rod',
    'Медь': 'wire',
    'Бронза': 'rod',
    'Вольфрам': 'wire',
    'Молибден': 'sheet',
    'Никель': 'sheet',
    'Нихром': 'wire',
    'Титан': 'sheet',
    'Цинк': 'plate',
    'Цирконий': 'rod',
  }
  const paramsByProfile: Record<string, string> = {
    round: 'd=20&length=1',
    rod: 'd=20&length=1',
    wire: 'd=2&length=10',
    sheet: 'a=1000&b=1000&t=2&quantity=1',
    plate: 'a=1000&b=1000&t=10&quantity=1',
  }
  const profile = profileByGroup[material.group] ?? 'round'
  return [{ label: 'Рассчитать массу', href: `/?metal=${encodeURIComponent(material.group)}&grade=${encodeURIComponent(material.grade)}&profile=${profile}&${paramsByProfile[profile] ?? 'length=1'}` }]
}

function designationTermSlugsFor(material: MetalMaterial) {
  const terms: string[] = []
  if (material.group === 'Латунь') terms.push('dprnm', 'latun-rods-gost-2060')
  if (material.group === 'Медь') terms.push('copper-flat-gost-1173')
  if (material.group === 'Алюминий' && material.gost.startsWith('ГОСТ')) terms.push('aluminum-temper')
  if (material.gost === 'ГОСТ 14959-2016') terms.push('spring-wire-gost-9389', 'b-2a')
  if (material.gost === 'ГОСТ 380-2005') terms.push('steel-deoxidation-gost-380')
  return terms
}

function materialToGradePage(material: MetalMaterial): MetalGradePage {
  const source = sourceForMaterial(material)
  const category = categoryForMaterial(material)
  const documents = material.group === 'Вольфрам'
    ? [gostRefs['ГОСТ 19671-91'], gostRefs['ГОСТ 18903-73']]
    : tinBronzes.has(material.grade)
      ? [gostRefs['ГОСТ 613-79'], gostRefs['ГОСТ 18175-78']]
      : [source]
  return {
    slug: gradeSlug(material.grade),
    designation: material.grade,
    title: `${material.group} ${material.grade}`,
    familySlug: category.familySlug,
    categorySlug: category.categorySlug,
    categoryTitle: category.categoryTitle,
    gradeClass: gradeClassForMaterial(material, source),
    documents,
    deliveryForms: deliveryFormsFor(material, source),
    designationTermSlugs: designationTermSlugsFor(material),
    decoding: decodingForMaterial(material),
    calculatorLinks: calculatorLinksFor(material),
    technicalProperties: technicalPropertiesFor(material, source),
    storage: storageFor(source),
    application: applicationFor(material),
    composition: compositionForMaterial(material, source),
    relatedGrades: materials.filter(item => item.group === material.group && item.grade !== material.grade).slice(0, 5).map(item => item.grade),
    dataStatus: source.status === 'verified' ? 'partial' : 'draft',
  }
}

const verifiedGradeCards: MetalGradePage[] = [
  {
    slug: 'xvsgf',
    designation: 'ХВСГФ',
    title: 'Сталь ХВСГФ',
    familySlug: 'stali',
    categorySlug: 'instrumentalnye',
    categoryTitle: 'Инструментальные стали',
    gradeClass: {
      value: 'Инструментальная легированная сталь',
      source: gost5950,
    },
    documents: [gost5950, gost7566, gost1051, gost2590, gost2591, gost4405, gost7417, gost8559, gost8560, gost14955],
    deliveryForms: [
      { value: 'Прутки круглого и квадратного сечения', source: { document: 'ГОСТ 5950-2000', section: 'п. 3.3.1', table: 'сортамент: прутки круглого и квадратного сечений, полосы и мотки', status: 'verified' } },
      { value: 'Полосы', source: gost4405 },
      { value: 'Мотки', source: { document: 'ГОСТ 5950-2000', section: 'п. 3.3.1', status: 'verified' } },
    ],
    decoding: [
      { symbol: 'Х', meaning: 'хром' },
      { symbol: 'В', meaning: 'вольфрам' },
      { symbol: 'С', meaning: 'кремний' },
      { symbol: 'Г', meaning: 'марганец' },
      { symbol: 'Ф', meaning: 'ванадий' },
    ],
    calculatorLinks: [
      { label: 'Рассчитать вес', href: '/?metal=Сталь&grade=ХВСГФ&profile=round&d=20&length=1' },
      { label: 'Сравнить марки', href: '/marki-metallov?compare=xvsgf' },
    ],
    storage: {
      method: {
        value: 'Хранить в закрытых помещениях, под навесами или на открытых площадках по требованиям документа на конкретный вид металлопродукции. Для открытой площадки требуется твердое покрытие с уклоном для стока воды, подставки не ниже 100 мм и укрытие водонепроницаемым материалом.',
        source: gost7566,
      },
      temperature: {
        value: 'Отдельный температурный диапазон для ХВСГФ не нормирован; для склонной к коррозии металлопродукции рекомендуется крытое помещение с регулируемыми климатическими условиями.',
        source: gost7566,
      },
      corrosionProtection: {
        value: 'Для защиты поверхности применяют консервационные материалы, масла, смазки, ингибиторы и антикоррозионные упаковочные материалы, если это предусмотрено документом на поставку.',
        source: gost7566,
      },
    },
    application: {
      summary: 'Режущий и измерительный инструмент: круглые плашки, развертки и инструмент, работающий на износ.',
      examples: ['круглые плашки', 'развертки', 'режущий инструмент', 'измерительный инструмент', 'инструментальная оснастка'],
      equipment: ['токарные станки', 'сверлильные станки', 'фрезерные станки', 'резьбонарезное оборудование', 'шлифовальные станки'],
      note: '',
    },
    composition: [
      { element: 'C', label: 'Углерод', min: 0.95, max: 1.05, valueText: '0,95–1,05 %', source: gost5950 },
      { element: 'Si', label: 'Кремний', min: 0.65, max: 1.0, valueText: '0,65–1,00 %', source: gost5950 },
      { element: 'Mn', label: 'Марганец', min: 0.6, max: 0.9, valueText: '0,60–0,90 %', source: gost5950 },
      { element: 'S', label: 'Сера', max: 0.03, valueText: 'не более 0,030 %', source: gost5950 },
      { element: 'P', label: 'Фосфор', max: 0.03, valueText: 'не более 0,030 %', source: gost5950 },
      { element: 'Cr', label: 'Хром', min: 0.6, max: 1.1, valueText: '0,60–1,10 %', source: gost5950 },
      { element: 'W', label: 'Вольфрам', min: 0.5, max: 0.8, valueText: '0,50–0,80 %', source: gost5950 },
      { element: 'V', label: 'Ванадий', min: 0.05, max: 0.15, valueText: '0,05–0,15 %', source: gost5950 },
      { element: 'Fe', label: 'Железо', min: 95, max: 96, valueText: 'основа', source: gost5950 },
    ],
    technicalProperties: [
      { label: 'Состояние поставки', value: 'отожженная для режущего инструмента', source: { document: 'ГОСТ 5950-2000', section: 'п. 4.1.2.1', table: 'таблица 3: твердость в состоянии поставки', status: 'verified' } },
      { label: 'Твердость в поставке', value: 'не более 241 HB; диаметр отпечатка не менее 3,9 мм', source: { document: 'ГОСТ 5950-2000', section: 'п. 4.1.2.1', table: 'таблица 3: твердость в состоянии поставки', status: 'verified' } },
      { label: 'Закалка образцов', value: '840-860 °C, масло', source: { document: 'ГОСТ 5950-2000', section: 'п. 4.1.2.2', table: 'таблица 4: температура закалки и твердость HRC', status: 'verified' } },
      { label: 'Твердость после закалки', value: 'не менее 63 HRC', source: { document: 'ГОСТ 5950-2000', section: 'п. 4.1.2.2', table: 'таблица 4: температура закалки и твердость HRC', status: 'verified' } },
    ],
    relatedGrades: ['ХВГ', '9ХС', 'Х12МФ', 'У10А', 'У12А'],
    dataStatus: 'verified',
  },
]

const verifiedByDesignation = new Map(verifiedGradeCards.map(grade => [grade.designation, grade]))

export const metalGrades: MetalGradePage[] = materials
  .map(material => verifiedByDesignation.get(material.grade) ?? materialToGradePage(material))
  .sort((a, b) => a.familySlug.localeCompare(b.familySlug, 'ru') || a.categoryTitle.localeCompare(b.categoryTitle, 'ru') || a.designation.localeCompare(b.designation, 'ru', { numeric: true }))

export const markochnikCategories = [
  {
    familySlug: 'stali',
    title: 'Стали',
    description: 'Марки сталей с разделением нормативных данных и справочных пояснений.',
    categories: [
      { slug: 'instrumentalnye', title: 'Инструментальные стали', description: 'Стали для режущего, измерительного и штампового инструмента.' },
      { slug: 'konstrukcionnye', title: 'Конструкционные стали', description: 'Заготовки, детали машин, металлоконструкции.' },
      { slug: 'nerzhaveyushchie', title: 'Нержавеющие стали', description: 'Коррозионностойкие стали и сплавы.' },
    ],
  },
  {
    familySlug: 'cvetnye-metally',
    title: 'Цветные металлы',
    description: 'Алюминий, медь, латунь, бронза, никель, титан и цинк с привязкой к локальным ГОСТам.',
    categories: [
      { slug: 'alyuminievye-splavy', title: 'Алюминий и алюминиевые сплавы', description: 'Первичный алюминий и деформируемые алюминиевые сплавы.' },
      { slug: 'latuni', title: 'Латуни', description: 'Медно-цинковые сплавы, обрабатываемые давлением.' },
      { slug: 'med', title: 'Медь', description: 'Марки меди для проката и электротехнических применений.' },
      { slug: 'bronzy', title: 'Бронзы', description: 'Безоловянные и оловянные бронзы.' },
      { slug: 'nikel', title: 'Никель и никелевые сплавы', description: 'Никель, никелевые и медно-никелевые сплавы.' },
      { slug: 'titanovye-splavy', title: 'Титановые сплавы', description: 'Титан и титановые деформируемые сплавы.' },
      { slug: 'cink', title: 'Цинк', description: 'Марки цинка по техническим условиям.' },
    ],
  },
  {
    familySlug: 'specialnye-splavy',
    title: 'Специальные сплавы',
    description: 'Прецизионные и электротехнические сплавы из марочника.',
    categories: [
      { slug: 'precizionnye-splavy', title: 'Прецизионные сплавы', description: 'Нихром и сплавы с заданными электрическими свойствами.' },
    ],
  },
  {
    familySlug: 'tugoplavkie-metally',
    title: 'Тугоплавкие металлы',
    description: 'Вольфрам, молибден и цирконий с пометками по проверенным нормативным источникам.',
    categories: [
      { slug: 'volfram', title: 'Вольфрам', description: 'Вольфрамовая проволока и марки для источников света.' },
      { slug: 'molibden', title: 'Молибден', description: 'Молибденовые порошковые материалы и сплавы.' },
      { slug: 'cirkoniy', title: 'Цирконий', description: 'Позиции, где нормативный документ требует отдельной проверки.' },
    ],
  },
]

export function getGradeBySlug(family: string, category: string, grade: string) {
  return metalGrades.find(item => item.familySlug === family && item.categorySlug === category && item.slug === grade)
}

export function getCategoryGrades(family: string, category: string) {
  return metalGrades.filter(item => item.familySlug === family && item.categorySlug === category)
}

export function compositionValue(item: CompositionItem) {
  if (item.min != null && item.max != null) return (item.min + item.max) / 2
  if (item.max != null) return item.max
  if (item.min != null) return item.min
  return 0
}
