'use client'

import { useCallback, useEffect, useState } from 'react'

export type AccentScheme = 'green' | 'blue' | 'graphite' | 'copper'

const STORAGE_KEY = 'accentScheme'
const DEFAULT_SCHEME: AccentScheme = 'green'
const schemes: AccentScheme[] = ['green', 'blue', 'graphite', 'copper']

function isAccentScheme(value: string | null): value is AccentScheme {
  return value != null && schemes.includes(value as AccentScheme)
}

function applyAccentScheme(value: AccentScheme) {
  document.documentElement.dataset.accent = value
}

export function useAccentScheme() {
  const [accentScheme, setAccentSchemeState] = useState<AccentScheme>(DEFAULT_SCHEME)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    const next = isAccentScheme(saved) ? saved : DEFAULT_SCHEME
    setAccentSchemeState(next)
    applyAccentScheme(next)
  }, [])

  const setAccentScheme = useCallback((value: AccentScheme) => {
    setAccentSchemeState(value)
    localStorage.setItem(STORAGE_KEY, value)
    applyAccentScheme(value)
  }, [])

  return { accentScheme, setAccentScheme }
}
