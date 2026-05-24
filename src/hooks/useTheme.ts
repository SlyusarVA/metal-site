'use client'

import { useEffect, useState } from 'react'

export type Theme = 'light' | 'dark' | 'system'

function applyTheme(t: Theme) {
  const root = document.documentElement
  root.classList.remove('dark', 'theme-system')
  if (t === 'dark') root.classList.add('dark')
  else if (t === 'system') root.classList.add('theme-system')
}

// Синхронизация через storage event — работает между вкладками
// и между компонентами в одном окне через один источник истины
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('system')

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme) || 'system'
    setThemeState(saved)
    applyTheme(saved)
  }, [])

  function setTheme(t: Theme) {
    applyTheme(t)
    localStorage.setItem('theme', t)
    setThemeState(t)
    // Уведомляем другие компоненты через storage event
    window.dispatchEvent(new StorageEvent('storage', { key: 'theme', newValue: t }))
  }

  // Слушаем изменения от других компонентов
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'theme' && e.newValue) {
        setThemeState(e.newValue as Theme)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  return { theme, setTheme, applyTheme }
}
