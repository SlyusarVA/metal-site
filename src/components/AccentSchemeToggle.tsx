'use client'

import { useEffect, useRef, useState } from 'react'
import { AccentScheme, useAccentScheme } from '@/hooks/useAccentScheme'

const options: { value: AccentScheme; label: string; color: string; angle: number }[] = [
  { value: 'green', label: 'Зелёная схема', color: '#287D4F', angle: -132 },
  { value: 'blue', label: 'Синяя схема', color: '#2F6FA4', angle: -92 },
  { value: 'graphite', label: 'Графитовая схема', color: '#4D5863', angle: -52 },
  { value: 'copper', label: 'Медная схема', color: '#94612E', angle: -12 },
]

const distance = 52

export default function AccentSchemeToggle() {
  const { accentScheme, setAccentScheme } = useAccentScheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  return (
    <div ref={rootRef} style={{ position: 'relative', width: 32, height: 32, flexShrink: 0 }}>
      {options.map(option => {
        const radians = option.angle * Math.PI / 180
        const active = accentScheme === option.value
        const x = Math.cos(radians) * distance
        const y = Math.sin(radians) * distance
        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            title={option.label}
            onClick={() => { setAccentScheme(option.value); setOpen(false) }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: active ? '2px solid var(--on-surface)' : '1px solid var(--outline-variant)',
              background: option.color,
              boxShadow: active ? '0 0 0 3px var(--primary-container), var(--shadow-2)' : 'var(--shadow-1)',
              cursor: 'pointer',
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transform: open ? `translate(${x}px, ${y}px) scale(1)` : 'translate(0, 0) scale(.72)',
              transition: 'opacity .16s var(--motion-standard), transform .18s var(--motion-decelerate)',
              zIndex: open ? 5 : -1,
            }}
          />
        )
      })}

      <button
        type="button"
        aria-label="Выбрать цветовую схему"
        aria-expanded={open}
        title="Цветовая схема"
        onClick={() => setOpen(v => !v)}
        style={{
          position: 'relative',
          zIndex: 6,
          width: 32,
          height: 32,
          border: 'none',
          borderRadius: 'var(--radius-sm)',
          background: open ? 'var(--outline-variant)' : 'transparent',
          color: 'var(--on-surface-variant)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          transition: 'background .15s, color .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--outline-variant)'; e.currentTarget.style.color = 'var(--on-surface)' }}
        onMouseLeave={e => { e.currentTarget.style.background = open ? 'var(--outline-variant)' : 'transparent'; e.currentTarget.style.color = 'var(--on-surface-variant)' }}
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3a9 9 0 0 0-9 9c0 4.42 3.28 8 7.33 8H12a1.7 1.7 0 0 0 1.7-1.7c0-.44-.17-.86-.48-1.17a1.7 1.7 0 0 1 1.2-2.9h1.33A5.25 5.25 0 0 0 21 8.98C21 5.68 17 3 12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7.7" cy="10.2" r="1.05" fill="#287D4F" />
          <circle cx="11.1" cy="7.7" r="1.05" fill="#2F6FA4" />
          <circle cx="15.2" cy="8.6" r="1.05" fill="#94612E" />
          <circle cx="8.6" cy="14.2" r="1.05" fill="#4D5863" />
        </svg>
      </button>
    </div>
  )
}
