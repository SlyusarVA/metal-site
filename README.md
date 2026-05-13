# Калькулятор металла — Next.js

## Быстрый старт

```bash
npm install
npm run dev
```

Открой http://localhost:3000

## Структура

```
src/
  app/
    page.tsx              # Главная — калькулятор
    gost/[code]/page.tsx  # Справочник ГОСТ
    history/page.tsx      # История расчётов
  components/calculator/
    CalculatorLayout.tsx  # Топ-бар + три колонки
    MetalNav.tsx          # Левая колонка: металлы
    SortamentNav.tsx      # Средняя колонка: сортамент + иконки
    CalcPanel.tsx         # Правая: форма + диаграмма + результат
    ProfileDiagram.tsx    # SVG-диаграммы сечений
    GostTags.tsx          # Теги ГОСТ + плотность
  data/
    materials.ts          # 13 групп металлов, 100+ марок
    profiles.ts           # 18 сортаментов с формулами
    gost.ts               # Справочник + допуски по ГОСТ
  lib/
    calculations.ts       # calcMass / calcLength
    history.ts            # localStorage история
  hooks/
    useCalculator.ts      # Главный хук — всё состояние
public/
  icons/                  # 18 SVG-иконок сортамента
```
