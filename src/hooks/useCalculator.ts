'use client'

import { useState, useCallback, useRef } from 'react'
import { profiles, ProfileKey, autocorrectProfile, MetalProfile } from '@/data/profiles'
import { materials, getMetalGroups, getGradesForGroup, isNonFerrous } from '@/data/materials'
import { calcMass, calcLength } from '@/lib/calculations'
import { saveRecord, HistoryRecord } from '@/lib/history'

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
      const params: Record<string, number | null> = {}
      for (const p of profile.params) params[p.key] = p.defaultValue
      return {
        ...s,
        profileKey: key,
        profile,
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

  // ── Изменение размерного поля ─────────────────────────────────────────────
  const setParam = useCallback((key: string, value: number | null) => {
    setState(s => ({
      ...s,
      params: { ...s.params, [key]: value },
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

  // ── Очистить поле предыдущего результата (как _clearPrevResultField) ────────
  const clearPrevResultField = useCallback((s: CalculatorState): CalculatorState => {
    if (!s.prevResult) return s
    if (s.prevResult.target === 'mass') {
      return { ...s, mass: null, prevResult: null }
    }
    if (s.prevResult.target === 'length') {
      return { ...s, length: null, prevResult: null }
    }
    return s
  }, [])

  // ── Основной расчёт (аналог _calculate в Flutter) ─────────────────────────
  const calculate = useCallback(() => {
    setState(s => {
      // Очищаем поле предыдущего результата
      const cleared = clearPrevResultField(s)

      // Определяем что считаем
      const params: Record<string, number> = {}
      const missingDims: string[] = []

      for (const p of cleared.profile.params) {
        const v = cleared.params[p.key]
        if (v == null || v <= 0) {
          missingDims.push(p.label)
        } else {
          params[p.key] = v
        }
      }

      if (missingDims.length > 0) {
        return {
          ...cleared,
          result: null,
          error: { message: 'Заполните размеры', missingFields: missingDims },
        }
      }

      const hasLength = cleared.length != null && cleared.length > 0
      const hasMass   = cleared.mass   != null && cleared.mass   > 0

      // Для листа/плиты — только масса, длина не нужна
      if (cleared.profile.isVolume) {
        const res = calcMass({
          profileKey: cleared.profileKey,
          params,
          metalGroup: cleared.metalGroup,
          grade: cleared.grade,
          quantity: cleared.quantity,
          length: 1, // не используется для isVolume
        })
        if (!res) {
          return { ...cleared, result: null, error: { message: 'Ошибка расчёта', missingFields: [] } }
        }
        const calcResult: CalcResult = {
          target: 'mass',
          value: res.mass,
          linearMass: res.massOne,   // для листа: 1 шт = X кг
          massOne: res.massOne,
        }
        const same = cleared.prevResult?.target === 'mass' &&
          Math.abs((cleared.prevResult?.value ?? 0) - res.mass) < 0.0001

        const newRecord = !same ? saveRecord({
          profileKey: cleared.profileKey,
          profileName: cleared.profile.name,
          metalGroup: cleared.metalGroup,
          grade: cleared.grade,
          params,
          quantity: cleared.quantity,
          length: 0,
          mass: res.mass,
          massOne: res.massOne,
          linearDensity: 0,
        }) : null

        return {
          ...cleared,
          result: calcResult,
          prevResult: calcResult,
          error: null,
          unchanged: same,
          history: newRecord ? [newRecord, ...cleared.history].slice(0, 50) : cleared.history,
        }
      }

      // Обычный профиль — определяем что считаем
      let target: CalcTarget = null
      let resultValue = 0
      let massResult = null

      if (hasLength && !hasMass) {
        // Считаем массу
        const res = calcMass({
          profileKey: cleared.profileKey,
          params,
          metalGroup: cleared.metalGroup,
          grade: cleared.grade,
          quantity: cleared.quantity,
          length: cleared.length!,
        })
        if (!res) {
          return { ...cleared, result: null, error: { message: 'Ошибка расчёта', missingFields: [] } }
        }
        target = 'mass'
        resultValue = res.mass
        massResult = res

        return buildFinalState(cleared, target, resultValue, res, params)

      } else if (hasMass && !hasLength) {
        // Считаем длину
        const length = calcLength(cleared.mass!, {
          profileKey: cleared.profileKey,
          params,
          metalGroup: cleared.metalGroup,
          grade: cleared.grade,
          quantity: cleared.quantity,
        })
        if (length == null) {
          return { ...cleared, result: null, error: { message: 'Не удалось рассчитать длину', missingFields: [] } }
        }
        target = 'length'
        resultValue = length

        // Считаем линейную плотность для результата
        const res = calcMass({
          profileKey: cleared.profileKey,
          params,
          metalGroup: cleared.metalGroup,
          grade: cleared.grade,
          quantity: cleared.quantity,
          length,
        })
        return buildFinalState(cleared, target, resultValue, res, params)

      } else {
        // Оба поля или ни одного
        const msg = (!hasLength && !hasMass)
          ? 'Введите длину или массу'
          : 'Оставьте одно поле пустым для расчёта'
        return { ...cleared, result: null, error: { message: msg, missingFields: [] } }
      }
    })
  }, [clearPrevResultField])

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
        length: record.length > 0 ? record.length : null,
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
    target,
    value,
    linearMass: massResult?.linearDensity ?? null,
    massOne: massResult?.massOne ?? 0,
  }

  const same = s.prevResult?.target === target &&
    Math.abs((s.prevResult?.value ?? 0) - value) < 0.0001

  const newState: CalculatorState = {
    ...s,
    result: calcResult,
    prevResult: calcResult,
    error: null,
    unchanged: same,
  }

  // Вписываем результат в соответствующее поле для совместимости с историей и восстановлением.
  if (target === 'mass') newState.mass = value
  if (target === 'length') newState.length = value

  // Сохраняем в историю
  if (!same) {
    const record = saveRecord({
      profileKey: s.profileKey,
      profileName: s.profile.name,
      metalGroup: s.metalGroup,
      grade: s.grade,
      params,
      quantity: s.quantity,
      length: newState.length ?? 0,
      mass: newState.mass ?? 0,
      massOne: massResult?.massOne ?? 0,
      linearDensity: massResult?.linearDensity ?? 0,
    })
    newState.history = [record, ...s.history].slice(0, 50)
  }

  return newState
}
