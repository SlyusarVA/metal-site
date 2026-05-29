export type NormativeStatus = 'verified' | 'needs_check' | 'not_specified'

export type NormativeRef = {
  document: string
  section?: string
  table?: string
  note?: string
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
    details: 'В марочнике это поле считается нормативным. Значение выводится только при наличии ГОСТ, ТУ, СП или другого действующего нормативного источника с пунктом или примечанием.',
  },
  temperatureMode: {
    id: 'temperatureMode',
    term: 'Температурный режим хранения',
    short: 'Допустимый диапазон или отсутствие нормирования температуры хранения.',
    details: 'Если температурный режим не указан в используемом нормативном источнике, карточка должна показывать именно этот статус, а не придуманное значение.',
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

const needsCheckSource: NormativeRef = {
  document: 'Нормативный источник требует проверки перед публикацией',
  status: 'needs_check',
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
      source: needsCheckSource,
    },
    documents: [needsCheckSource],
    storage: {
      method: {
        value: 'Не опубликовано: требуется проверка по действующему нормативному документу',
        source: needsCheckSource,
      },
      temperature: {
        value: 'Не указано в карточке до проверки нормативного источника',
        source: needsCheckSource,
      },
      corrosionProtection: {
        value: 'Не опубликовано: требуется нормативное основание',
        source: needsCheckSource,
      },
    },
    application: {
      summary: 'Круглые плашки, развертки и другой режущий инструмент',
      examples: ['круглые плашки', 'развертки', 'режущий инструмент', 'измерительный инструмент', 'инструментальная оснастка'],
      equipment: ['токарные станки', 'сверлильные станки', 'фрезерные станки', 'резьбонарезное оборудование', 'инструментальные участки'],
      note: 'Справочная информация. Конкретное применение зависит от термообработки, конструкции инструмента, режима резания, КД и технологического процесса.',
    },
    composition: [
      { element: 'C', label: 'Углерод', min: 0.95, max: 1.05, valueText: '0,95–1,05 %', source: needsCheckSource },
      { element: 'Si', label: 'Кремний', min: 0.65, max: 1.0, valueText: '0,65–1,00 %', source: needsCheckSource },
      { element: 'Mn', label: 'Марганец', min: 0.6, max: 0.9, valueText: '0,60–0,90 %', source: needsCheckSource },
      { element: 'S', label: 'Сера', max: 0.03, valueText: 'до 0,03 %', source: needsCheckSource },
      { element: 'P', label: 'Фосфор', max: 0.03, valueText: 'до 0,03 %', source: needsCheckSource },
      { element: 'Cr', label: 'Хром', min: 0.6, max: 1.1, valueText: '0,60–1,10 %', source: needsCheckSource },
      { element: 'W', label: 'Вольфрам', min: 0.5, max: 0.8, valueText: '0,50–0,80 %', source: needsCheckSource },
      { element: 'V', label: 'Ванадий', min: 0.05, max: 0.15, valueText: '0,05–0,15 %', source: needsCheckSource },
      { element: 'Fe', label: 'Железо', min: 95, max: 96, valueText: 'остальное', source: needsCheckSource },
    ],
    relatedGrades: ['ХВГ', '9ХС', 'Х12МФ', 'У10А', 'У12А'],
    dataStatus: 'partial',
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
