'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { profiles, ProfileKey, autocorrectProfile, MetalProfile } from '@/data/profiles'
import { materials, getMetalGroups, getGradesForGroup, isNonFerrous } from '@/data/materials'
import { calcMass, calcLength } from '@/lib/calculations'
import { createRecord, persistRecord, HistoryRecord } from '@/lib/history'

import { BrassOptions, defaultBrassOptions, isBrassBar, brassAvailabilityError } from '@/data/brassTolerance'
import { defaultSheetOptions, sheetBasis, SheetOptions, SheetBasis } from '@/data/aluminumSheet'
import { isRectangular } from '@/data/profileNavigation'
import { validateDimensions } from '@/lib/validation'

// ── Константы полей ────────────────────────────────────────────────────────────
export const K_LENGTH   = 'length'
export const K_MASS     = 'mass'
export const K_QUANTITY = 'quantity'

// ── Допуски по весу ГОСТ ───────────────────────────────────────────────────────
export const GOST_WEIGHT_TOLERANCE: Record<string, number> = {
  'Круг':           0.025,
  'Арматура':       0.040,
  'Квадрат':        0.025,
  'Шестигранник':   0.025,
  'Полоса':         0.040,
  'Лента':          0.040,
  'Труба кр.':      0.075,
  'Труба проф.':    0.060,
  'Балка':          0.030,
  'Швеллер':        0.030,
  'Уголок равн.':   0.040,
  'Уголок неравн.': 0.040,
  'Пруток':         0.010,
}

// ── Типы результата ────────────────────────────────────────────────────────────
export type CalcTarget = 'mass' | 'length' | null

export interface CalcResult {
  sheetBasis?: SheetBasis
  target: CalcTarget
  value: number
  linearMass: number | null   // кг/м или кг/шт для листа
  massOne: number
}

export interface CalcError {
  message: string
  missingFields: string[]
}

// ── Снэкбар для автокоррекции ──────────────────────────────────────────────────
export interface Snackbar {
  message: string
  id: number
}

// ── Состояние калькулятора ─────────────────────────────────────────────────────
export interface CalculatorState {
  brassOptions: BrassOptions
  sheetOptions: SheetOptions
  // Выбор
  profileKey: ProfileKey
  profile: MetalProfile
  metalGroup: string
  grade: string
  density: number

  // Размеры и поля расчёта
  params: Record<string, number | null>    // размерные поля
  length: number | null                    // м
  mass: number | null                      // кг
  quantity: number

  // Результат
  result: CalcResult | null
  prevResult: CalcResult | null
  error: CalcError | null
  unchanged: boolean

  // История
  history: HistoryRecord[]

  // UI
  snackbar: Snackbar | null
}

// ── Начальное состояние ────────────────────────────────────────────────────────
function makeInitialState(): CalculatorState {
  const profile = profiles[0]
  const groups  = getMetalGroups()
  const grade   = getGradesForGroup(groups[0])[0]

  const params: Record<string, number | null> = {}
  for (const p of profile.params) {
    params[p.key] = p.defaultValue
  }

  return {
    brassOptions: { ...defaultBrassOptions },
    sheetOptions: { ...defaultSheetOptions },
    profileKey: profile.key,
    profile,
    metalGroup: grade.group,
    grade: grade.grade,
    density: grade.density,
    params,
    length: null,
    mass: null,
    quantity: 1,
    result: null,
    prevResult: null,
    error: null,
    unchanged: false,
    history: [],
    snackbar: null,
  }
}

// ── Главный хук ───────────────────────────────────────────────────────────────
export function useCalculator() {
  const [state, setState] = useState<CalculatorState>(makeInitialState)
  const snackbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const newestRecord = state.history[0]
  useEffect(() => {
    if (newestRecord && !persistRecord(newestRecord)) {
      setState(s => ({ ...s, snackbar: { message: 'Расчёт выполнен, но историю не удалось сохранить в браузере.', id: Date.now() } }))
    }
  }, [newestRecord])

  useEffect(() => () => {
    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current)
  }, [])

  // ── Показать снэкбар ───────────────────────────────────────────────────────
  const showSnackbar = useCallback((message: string) => {
    if (snackbarTimerRef.current) clearTimeout(snackbarTimerRef.current)
    setState(s => ({ ...s, snackbar: { message, id: Date.now() } }))
    snackbarTimerRef.current = setTimeout(() => {
      setState(s => ({ ...s, snackbar: null }))
    }, 3000)
  }, [])

  // ── Выбор профиля ─────────────────────────────────────────────────────────
  const selectProfile = useCallback((key: ProfileKey) => {
    setState(s => {
      const profile = profiles.find(p => p.key === key)!
      const keepDimensions = isRectangular(s.profileKey) && isRectangular(key)
      const params: Record<string, number | null> = {}
      for (const p of profile.params) params[p.key] = keepDimensions ? s.params[p.key] ?? null : p.defaultValue
      return {
        ...s,
        brassOptions: key !== 'rod' && s.brassOptions.accuracy === 'high' ? { ...s.brassOptions, accuracy: 'normal' } : s.brassOptions,
        profileKey: key,
        profile,
        params,
        length: keepDimensions ? s.length : null,
        mass: keepDimensions ? s.mass : null,
        quantity: keepDimensions ? s.quantity : 1,
        result: null,
        prevResult: null,
        error: null,
        unchanged: false,
      }
    })
  }, [])

  // ── Выбор металла / марки ──────────────────────────────────────────────────
  const selectMetal = useCallback((group: string, grade: string) => {
    const mat = materials.find(m => m.group === group && m.grade === grade)
    if (!mat) return

    setState(s => {
      const nonFerrous = isNonFerrous(mat.group)
      const correctedKey = autocorrectProfile(s.profileKey, nonFerrous)

      if (correctedKey !== s.profileKey) {
        // Нужна автокоррекция профиля
        const oldProfile = profiles.find(p => p.key === s.profileKey)!
        const newProfile = profiles.find(p => p.key === correctedKey)!
        const params: Record<string, number | null> = {}
        for (const p of newProfile.params) params[p.key] = p.defaultValue

        // Показываем снэкбар отдельно (не внутри setState)
        setTimeout(() => showSnackbar(`Сортамент изменён: ${oldProfile.name} → ${newProfile.name}`), 0)

        return {
          ...s,
          profileKey: correctedKey,
          profile: newProfile,
          metalGroup: mat.group,
          grade: mat.grade,
          density: mat.density,
          params,
          length: null,
          mass: null,
          quantity: 1,
          result: null,
          prevResult: null,
          error: null,
          unchanged: false,
          snackbar: null,
        }
      }

      return {
        ...s,
        metalGroup: mat.group,
        grade: mat.grade,
        density: mat.density,
        result: null,
        prevResult: null,
        error: null,
        unchanged: false,
      }
    })
  }, [showSnackbar])

  const setBrassOptions = useCallback((patch: Partial<BrassOptions>) => {
    setState(s => ({ ...s, brassOptions: { ...s.brassOptions, ...patch, ...(patch.manufacturing === 'pressed' && s.brassOptions.accuracy === 'high' ? { accuracy: 'normal' as const } : {}) }, result: null, error: null }))
  }, [])
  const setSheetOptions = useCallback((patch: Partial<SheetOptions>) => {
    setState(s => ({ ...s, sheetOptions: { ...s.sheetOptions, ...patch }, result: null, error: null }))
  }, [])

  // ── Изменение размерного поля ─────────────────────────────────────────────
  const setParam = useCallback((key: string, value: number | null) => {
    setState(s => ({
      ...s,
      params: (key === 'a' && (s.profileKey === 'sheet' || s.profileKey === 'plate')) ? s.params : { ...s.params, [key]: value },
      length: key === 'a' && (s.profileKey === 'sheet' || s.profileKey === 'plate') ? (value == null ? null : value / 1000) : s.length,
      result: null,
      error: null,
      unchanged: false,
    }))
  }, [])

  // ── Изменение длины ───────────────────────────────────────────────────────
  const setLength = useCallback((value: number | null) => {
    setState(s => ({
      ...s,
      length: value,
      result: null,
      error: null,
      unchanged: false,
    }))
  }, [])

  // ── Изменение массы ───────────────────────────────────────────────────────
  const setMass = useCallback((value: number | null) => {
    setState(s => ({
      ...s,
      mass: value,
      result: null,
      error: null,
      unchanged: false,
    }))
  }, [])

  // ── Количество ─────────────────────────────────────────────────────────────
  const setQuantity = useCallback((value: number) => {
    const normalized = Number.isFinite(value) ? Math.max(1, Math.floor(value)) : 1
    setState(s => ({
      ...s,
      quantity: normalized,
      result: null,
      error: null,
      unchanged: false,
    }))
  }, [])

  const incrementQty = useCallback(() => {
    setState(s => ({
      ...s,
      quantity: s.quantity + 1,
      result: null,
      error: null,
      unchanged: false,
    }))
  }, [])

  const decrementQty = useCallback(() => {
    setState(s => ({
      ...s,
      quantity: Math.max(1, s.quantity - 1),
      result: null,
      error: null,
      unchanged: false,
    }))
  }, [])

  const resetQty = useCallback(() => {
    setState(s => ({
      ...s,
      quantity: 1,
      result: null,
      error: null,
      unchanged: false,
    }))
  }, [])

  // Source fields stay separate from calculated results.
  const calculate = useCallback((requestedTarget?: 'mass' | 'length') => {
    setState(s => {
      const params: Record<string, number> = {}
      for (const p of s.profile.params) params[p.key] = s.params[p.key] ?? NaN
      const dimensionError = validateDimensions(s.profileKey, params)
      if (dimensionError) return { ...s, result: null, error: { message: dimensionError, missingFields: [] } }
      if (isBrassBar(s.profileKey, s.metalGroup)) {
        const issue = brassAvailabilityError(s.profileKey, s.profileKey === 'square' ? params.a : params.d, s.brassOptions)
        if (issue) return { ...s, result: null, error: { message: issue, missingFields: [] } }
      }
      if (s.profileKey === 'sheet' && s.metalGroup === 'Алюминий') {
        const basis = sheetBasis(s.grade, params.t, params.b, s.sheetOptions)
        if (typeof basis === 'string') return { ...s, result: null, error: { message: basis, missingFields: [] } }
      }
      const hasLength = s.length != null && Number.isFinite(s.length) && s.length > 0
      const hasMass = s.mass != null && Number.isFinite(s.mass) && s.mass > 0
      const target = s.profile.isVolume ? 'mass' : requestedTarget ??
        (hasLength && !hasMass ? 'mass' : hasMass && !hasLength ? 'length' : null)
      const input = { sheetOptions: s.sheetOptions, profileKey: s.profileKey, params, metalGroup: s.metalGroup, grade: s.grade, quantity: s.quantity }
      if (target === 'mass' && (s.profile.isVolume || hasLength)) {
        const result = calcMass({ ...input, length: s.length })
        if (result) return buildFinalState(s, target, result.mass, result, params)
      } else if (target === 'length' && hasMass) {
        const length = calcLength(s.mass!, input)
        if (length != null && length > 0) {
          const result = calcMass({ ...input, length })
          if (result) return buildFinalState(s, target, length, result, params)
        }
      }
      return { ...s, result: null, error: {
        message: target === 'mass' && !hasLength && !s.profile.isVolume ? 'Введите длину' :
          target === 'length' && !hasMass ? 'Введите массу' :
          !target ? 'Введите длину или массу, оставив второе поле пустым' : 'Проверьте значения: результат вне допустимого диапазона',
        missingFields: [],
      } }
    })
  }, [])

  // ── Очистить все поля (кнопка "Очистить поля") ─────────────────────────────
  const resetAll = useCallback(() => {
    setState(s => {
      const params: Record<string, number | null> = {}
      for (const p of s.profile.params) params[p.key] = p.defaultValue
      return {
        ...s,
        params,
        length: null,
        mass: null,
        quantity: 1,
        result: null,
        prevResult: null,
        error: null,
        unchanged: false,
      }
    })
  }, [])

  // ── Восстановить из истории (аналог _restoreFromHistory) ──────────────────
  const restoreFromHistory = useCallback((record: HistoryRecord) => {
    const profile = profiles.find(p => p.key === record.profileKey) ?? profiles[0]
    const mat = materials.find(
      m => m.group === record.metalGroup && m.grade === record.grade
    )

    setState(s => {
      const params: Record<string, number | null> = {}
      for (const p of profile.params) {
        params[p.key] = record.params[p.key] ?? p.defaultValue
      }
      return {
        ...s,
        profileKey: profile.key,
        profile,
        metalGroup: record.metalGroup,
        grade: record.grade,
        density: mat?.density ?? s.density,
        params,
        brassOptions: record.brassOptions ?? { ...defaultBrassOptions },
        sheetOptions: record.sheetOptions ?? { ...defaultSheetOptions },
        length: (record.profileKey === 'sheet' || record.profileKey === 'plate') && record.params.a != null ? record.params.a / 1000 : record.length > 0 ? record.length : null,
        mass: null,
        quantity: record.quantity,
        result: null,
        prevResult: null,
        error: null,
        unchanged: false,
      }
    })
  }, [])

  return {
    state,
    // Действия
    selectProfile,
    selectMetal,
    setBrassOptions,
    setSheetOptions,
    setParam,
    setLength,
    setMass,
    setQuantity,
    incrementQty,
    decrementQty,
    resetQty,
    calculate,
    resetAll,
    restoreFromHistory,
    // Вспомогательное
    metalGroups: getMetalGroups(),
    getGradesForGroup,
    profiles,
    GOST_WEIGHT_TOLERANCE,
  }
}

// ── Вспомогательная функция сборки финального состояния ──────────────────────
function buildFinalState(
  s: CalculatorState,
  target: CalcTarget,
  value: number,
  massResult: ReturnType<typeof calcMass> | null,
  params: Record<string, number>,
): CalculatorState {
  const calcResult: CalcResult = {
    sheetBasis: massResult?.sheetBasis,
    target,
    value,
    linearMass: massResult?.linearDensity ?? null,
    massOne: massResult?.massOne ?? 0,
  }

  const recordData = {
    brassOptions: isBrassBar(s.profileKey, s.metalGroup) ? s.brassOptions : undefined,
    sheetOptions: s.profileKey === 'sheet' && s.metalGroup === 'Алюминий' ? s.sheetOptions : undefined,
    profileKey: s.profileKey, profileName: s.profile.name,
    metalGroup: s.metalGroup, grade: s.grade, params, quantity: s.quantity,
    length: s.profile.isVolume ? 0 : target === 'length' ? value : s.length ?? 0,
    mass: target === 'mass' ? value : s.mass ?? 0,
    massOne: massResult?.massOne ?? 0,
    linearDensity: massResult?.linearDensity ?? 0,
  }
  const previous = s.history[0]
  const same = !!previous && previous.profileKey === recordData.profileKey &&
    previous.metalGroup === recordData.metalGroup && previous.grade === recordData.grade &&
    JSON.stringify(previous.brassOptions) === JSON.stringify(recordData.brassOptions) &&
    JSON.stringify(previous.sheetOptions) === JSON.stringify(recordData.sheetOptions) &&
    previous.quantity === recordData.quantity && previous.length === recordData.length &&
    previous.mass === recordData.mass &&
    s.profile.params.every(p => previous.params[p.key] === params[p.key])

  return {
    ...s, result: { ...calcResult, linearMass: s.profile.isVolume ? calcResult.massOne : calcResult.linearMass },
    prevResult: calcResult, error: null, unchanged: same,
    history: same ? s.history : [createRecord(recordData), ...s.history].slice(0, 50),
  }
}
