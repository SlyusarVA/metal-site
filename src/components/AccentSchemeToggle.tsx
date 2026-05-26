'use client'

import { useEffect, useRef, useState } from 'react'
import { AccentScheme, useAccentScheme } from '@/hooks/useAccentScheme'

const options: { value: AccentScheme; label: string; color: string; x: number; y: number }[] = [
  { value: 'green', label: 'Зелёная схема', color: '#4F9A68', x: -38, y: 42 },
  { value: 'blue', label: 'Синяя схема', color: '#4E8FC2', x: -78, y: 34 },
  { value: 'graphite', label: 'Графитовая схема', color: '#6F7B86', x: -96, y: 72 },
  { value: 'copper', label: 'Медная схема', color: '#B9783A', x: -48, y: 82 },
]

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
        const active = accentScheme === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-label={option.label}
            title={option.label}
            onClick={() => { setAccentScheme(option.value); setOpen(false) }}
            style={{
              position: 'absolute',
              left: 1,
              top: 1,
              width: 30,
              height: 30,
              borderRadius: '50%',
              border: active ? '2px solid var(--on-surface)' : '1px solid var(--outline-variant)',
              background: option.color,
              boxShadow: active ? '0 0 0 3px var(--primary-container), var(--shadow-2)' : 'var(--shadow-1)',
              cursor: 'pointer',
              opacity: open ? 1 : 0,
              pointerEvents: open ? 'auto' : 'none',
              transform: open ? `translate(${option.x}px, ${option.y}px) scale(1)` : 'translate(0, 0) scale(.72)',
              transition: 'opacity .16s var(--motion-standard), transform .18s var(--motion-decelerate)',
              zIndex: open ? 20 : -1,
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
          zIndex: 21,
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
          <circle cx="7.7" cy="10.2" r="1.05" fill="#4F9A68" />
          <circle cx="11.1" cy="7.7" r="1.05" fill="#4E8FC2" />
          <circle cx="15.2" cy="8.6" r="1.05" fill="#B9783A" />
          <circle cx="8.6" cy="14.2" r="1.05" fill="#6F7B86" />
        </svg>
      </button>
    </div>
  )
}
