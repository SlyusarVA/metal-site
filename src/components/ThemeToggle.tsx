'use client'

import { useEffect, useRef, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const icons: Record<Theme, string> = {
  light: '☀️',
  dark: '🌙',
  system: '💻',
}

const labels: Record<Theme, string> = {
  light: 'Светлая',
  dark: 'Тёмная',
  system: 'Системная',
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system')
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = (localStorage.getItem('theme') as Theme) || 'system'
    setTheme(saved)
    applyTheme(saved)
  }, [])

  // Закрытие по клику вне компонента
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function applyTheme(t: Theme) {
    const root = document.documentElement
    root.classList.remove('dark', 'theme-system')
    if (t === 'dark') root.classList.add('dark')
    else if (t === 'system') root.classList.add('theme-system')
  }

  function select(t: Theme) {
    setTheme(t)
    setOpen(false)
    localStorage.setItem('theme', t)
    applyTheme(t)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        title="Тема оформления"
        style={{
          background: open ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.1)',
          border: '1px solid rgba(255,255,255,.3)',
          borderRadius: 'var(--radius-full)',
          padding: '4px 10px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 13,
          color: '#fff',
          fontFamily: 'Manrope, sans-serif',
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.2)')}
        onMouseLeave={e => (e.currentTarget.style.background = open ? 'rgba(255,255,255,.2)' : 'rgba(255,255,255,.1)')}
      >
        <span>{icons[theme]}</span>
        <span>{labels[theme]}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: 'calc(100% + 6px)',
          background: 'var(--surface)',
          border: '1px solid var(--outline-variant)',
          borderRadius: 'var(--radius-md)',
          boxShadow: '0 4px 16px rgba(0,0,0,.2)',
          zIndex: 200,
          minWidth: 160,
          overflow: 'hidden',
        }}>
          {(['light', 'dark', 'system'] as Theme[]).map(t => (
            <button
              key={t}
              onClick={() => select(t)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 14px',
                background: theme === t ? 'var(--primary-container)' : 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 13,
                fontFamily: 'Manrope, sans-serif',
                color: theme === t ? 'var(--on-primary-container)' : 'var(--on-surface)',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                if (theme !== t) e.currentTarget.style.background = 'var(--surface-container)'
              }}
              onMouseLeave={e => {
                if (theme !== t) e.currentTarget.style.background = 'none'
              }}
            >
              <span>{icons[t]}</span>
              <span>{labels[t]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
