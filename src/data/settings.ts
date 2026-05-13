'use client'

import { useState, useEffect, useCallback } from 'react'
import { getMetalGroups } from './materials'
import { profiles, ProfileKey } from './profiles'

// ── Типы ─────────────────────────────────────────────────────────────────────

export type GradeSortMode = 'default' | 'alpha' | 'density' | 'numeric'

export interface GradeSort {
  enabled: boolean
  mode: GradeSortMode
}

export interface Settings {
  /** Порядок групп металлов */
  metalOrder: string[]
  /** Порядок сортаментов */
  profileOrder: ProfileKey[]
  /** Сортировка марок — отдельно для каждой группы */
  gradeSorts: Record<string, GradeSort>
}

const STORAGE_KEY = 'metal_calc_settings'

function defaultSettings(): Settings {
  return {
    metalOrder: getMetalGroups(),
    profileOrder: profiles.map(p => p.key),
    gradeSorts: {},
  }
}

function loadSettings(): Settings {
  if (typeof window === 'undefined') return defaultSettings()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultSettings()
    const saved = JSON.parse(raw) as Partial<Settings>
    const def = defaultSettings()
    // Добавить новые металлы/сортаменты если появились
    const metalOrder = [
      ...(saved.metalOrder ?? []).filter(g => def.metalOrder.includes(g)),
      ...def.metalOrder.filter(g => !(saved.metalOrder ?? []).includes(g)),
    ]
    const profileOrder = [
      ...(saved.profileOrder ?? []).filter(k => def.profileOrder.includes(k as ProfileKey)),
      ...def.profileOrder.filter(k => !(saved.profileOrder ?? []).includes(k)),
    ] as ProfileKey[]
    return { metalOrder, profileOrder, gradeSorts: saved.gradeSorts ?? {} }
  } catch {
    return defaultSettings()
  }
}

function saveSettings(s: Settings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

// ── Хук ──────────────────────────────────────────────────────────────────────

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)

  useEffect(() => {
    setSettings(loadSettings())
  }, [])

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }, [])

  const setMetalOrder = useCallback((order: string[]) => {
    update({ metalOrder: order })
  }, [update])

  const setProfileOrder = useCallback((order: ProfileKey[]) => {
    update({ profileOrder: order })
  }, [update])

  const setGradeSort = useCallback((group: string, sort: GradeSort) => {
    setSettings(prev => {
      const next = {
        ...prev,
        gradeSorts: { ...prev.gradeSorts, [group]: sort },
      }
      saveSettings(next)
      return next
    })
  }, [])

  const resetToDefault = useCallback(() => {
    const def = defaultSettings()
    saveSettings(def)
    setSettings(def)
  }, [])

  return { settings, setMetalOrder, setProfileOrder, setGradeSort, resetToDefault }
}

// ── Применение сортировки марок ───────────────────────────────────────────────

import { MetalMaterial } from './materials'

export function sortGrades(grades: MetalMaterial[], sort: GradeSort | undefined): MetalMaterial[] {
  if (!sort?.enabled || sort.mode === 'default') return grades
  const copy = [...grades]
  switch (sort.mode) {
    case 'alpha':
      return copy.sort((a, b) => a.grade.localeCompare(b.grade, 'ru'))
    case 'density':
      return copy.sort((a, b) => b.density - a.density)
    case 'numeric': {
      // Сортировка по первому числу в названии марки
      const num = (s: string) => parseFloat(s.match(/\d+(\.\d+)?/)?.[0] ?? '9999')
      return copy.sort((a, b) => num(a.grade) - num(b.grade))
    }
    default:
      return copy
  }
}
