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

export type MetalGradePage = {
  slug: string
  designation: string
  title: string
  familySlug: string
  categorySlug: string
  categoryTitle: string
  gradeClass: NormativeValue
  documents: NormativeRef[]
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
    details: 'Легирующие элементы, например хром, вольфрам, ванадий, никель или молибден, вводят для изменения свойств: твёрдости, износостойкости, прокаливаемости, коррозионной стойкости или жаропрочности.',
  },
  toolSteel: {
    id: 'toolSteel',
    term: 'Инструментальная сталь',
    short: 'Сталь для режущего, измерительного или штампового инструмента.',
    details: 'Такие стали подбирают с учётом твёрдости, износостойкости, стабильности формы и режима термообработки. Конкретное применение всегда зависит от КД и технологического процесса.',
  },
  hardenability: {
    id: 'hardenability',
    term: 'Прокаливаемость',
    short: 'Способность стали закаливаться на определённую глубину.',
    details: 'Прокаливаемость не равна твёрдости. Твёрдость показывает результат на поверхности или в точке контроля, а прокаливаемость — насколько глубоко требуемая структура и твёрдость достигаются внутри сечения.',
  },
  wearResistance: {
    id: 'wearResistance',
    term: 'Износостойкость',
    short: 'Сопротивление истиранию и разрушению рабочей поверхности.',
    details: 'Для инструментальных сталей это важно, потому что режущие кромки, плашки, развертки и рабочие поверхности оснастки должны дольше сохранять форму при трении и нагрузке.',
  },
  heatTreatment: {
    id: 'heatTreatment',
    term: 'Термообработка',
    short: 'Нагрев, выдержка и охлаждение металла для изменения свойств.',
    details: 'К термообработке относятся закалка, отпуск, отжиг и нормализация. Для инструментальных сталей режим термообработки критически влияет на твёрдость, хрупкость и ресурс инструмента.',
  },
  storageMethod: {
    id: 'storageMethod',
    term: 'Способ хранения',
    short: 'Условия складирования продукции: помещение, навес или открытая площадка.',
    details: 'В карточке это нормативное поле. Для ХВСГФ условия хранения приняты по общему стандарту на приёмку, маркировку, упаковку, транспортирование и хранение металлопродукции, так как ГОСТ на марку задаёт химический состав и назначение, но не отдельный температурный складской режим.',
  },
  temperatureMode: {
    id: 'temperatureMode',
    term: 'Температурный режим хранения',
    short: 'Допустимый диапазон или отсутствие нормирования температуры хранения.',
    details: 'Если отдельный температурный диапазон не установлен нормативным документом, карточка показывает это прямо. Это не означает отсутствие требований к защите от атмосферных осадков, загрязнений и коррозии.',
  },
  referenceApplication: {
    id: 'referenceApplication',
    term: 'Справочное применение',
    short: 'Типовое применение марки в промышленности, не нормативное требование.',
    details: 'Этот блок помогает понять, где марка обычно используется. Он не заменяет ГОСТ, ТУ, КД, технологическую инструкцию или требования входного контроля.',
  },
  compositionChart: {
    id: 'compositionChart',
    term: 'Диаграмма состава',
    short: 'Визуализация химического состава по числовым значениям таблицы.',
    details: 'Для диапазонов используется среднее значение. Для значений «до ...» берётся верхняя граница. Диаграмма является визуализацией, а нормативным источником остаётся таблица с документом.',
  },
}

const gost5950: NormativeRef = {
  document: 'ГОСТ 5950-2000',
  section: 'Марки и химический состав',
  table: 'таблица химического состава инструментальных легированных сталей',
  note: 'Ссылка на полный текст временно снята: ранее указанная страница вела на другой документ. До подтверждения точного URL источник показывается только текстом.',
  status: 'verified',
}

const gost7566: NormativeRef = {
  document: 'ГОСТ 7566-2018',
  section: 'Маркировка, упаковка, транспортирование и хранение металлопродукции',
  note: 'Общий нормативный источник для условий хранения металлопродукции из стали. Отдельный температурный диапазон для ХВСГФ не установлен.',
  status: 'verified',
}

export const metalGrades: MetalGradePage[] = [
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
    documents: [gost5950, gost7566],
    storage: {
      method: {
        value: 'Хранить как металлопродукцию из стали с защитой от коррозии, загрязнения и механических повреждений; способ складирования выбирается по виду поставки, упаковке и условиям склада.',
        source: gost7566,
      },
      temperature: {
        value: 'Отдельный температурный диапазон хранения для марки ХВСГФ не нормирован; применяется общий режим хранения металлопродукции без указания специальных температурных ограничений.',
        source: gost7566,
      },
      corrosionProtection: {
        value: 'Требуется исключить условия, вызывающие коррозию и ухудшение качества поверхности при хранении и транспортировании металлопродукции.',
        source: gost7566,
      },
    },
    application: {
      summary: 'Режущий и измерительный инструмент: круглые плашки, развертки и инструмент, работающий на износ.',
      examples: ['круглые плашки', 'развертки', 'режущий инструмент', 'измерительный инструмент', 'инструментальная оснастка', 'детали с повышенными требованиями к износостойкости'],
      equipment: ['токарные станки', 'сверлильные станки', 'фрезерные станки', 'резьбонарезное оборудование', 'шлифовальные станки', 'инструментальные участки'],
      note: 'Применение указано справочно для выбора и идентификации марки. Конкретное использование зависит от термообработки, конструкции инструмента, режима резания, КД и технологического процесса.',
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
    relatedGrades: ['ХВГ', '9ХС', 'Х12МФ', 'У10А', 'У12А'],
    dataStatus: 'verified',
  },
]

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
