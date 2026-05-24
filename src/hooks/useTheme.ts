'use client'

import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

const THEME_STORAGE_KEY = 'theme'

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

function applyTheme(t: Theme) {
  const root = document.documentElement
  root.classList.remove('light', 'dark', 'theme-system')

  if (t === 'light') root.classList.add('light')
  else if (t === 'dark') root.classList.add('dark')
  else root.classList.add('theme-system')
}

function readStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system'
  const saved = localStorage.getItem(THEME_STORAGE_KEY)
  return isTheme(saved) ? saved : 'system'
}

// Синхронизация через storage event — работает между вкладками
// и между компонентами в одном окне через один источник истины
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system')

  useEffect(() => {
    const saved = readStoredTheme()
    setThemeState(saved)
    applyTheme(saved)
  }, [])

  function setTheme(t: Theme) {
    applyTheme(t)
    localStorage.setItem(THEME_STORAGE_KEY, t)
    setThemeState(t)
    // Уведомляем другие компоненты в этом же окне и соседних вкладках
    window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: t }))
  }

  // Слушаем изменения от других компонентов
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === THEME_STORAGE_KEY && isTheme(e.newValue)) {
        setThemeState(e.newValue)
        applyTheme(e.newValue)
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { theme, setTheme, applyTheme }
}
