'use client'

import { useEffect, useRef, useState } from 'react'

type Theme = 'light' | 'dark'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const initial: Theme = saved === 'dark' ? 'dark' : 'light'
    setTheme(initial)
    applyTheme(initial)
  }, [])

  function applyTheme(t: Theme) {
    const root = document.documentElement
    root.classList.remove('dark', 'theme-system')
    if (t === 'dark') root.classList.add('dark')
  }

  function toggle() {
    const next: Theme = theme === 'light' ? 'dark' : 'light'

    // prefers-reduced-motion — применяем тему без анимации
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      applyTheme(next)
      setTheme(next)
      localStorage.setItem('theme', next)
      return
    }

    const btn = btnRef.current
    if (!btn) {
      applyTheme(next)
      setTheme(next)
      localStorage.setItem('theme', next)
      return
    }

    const rect = btn.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    )

    // View Transition API — Chrome 111+
    if ('startViewTransition' in document) {
      const style = document.createElement('style')
      style.textContent = `
        ::view-transition-old(root) {
          animation: none;
          mix-blend-mode: normal;
        }
        ::view-transition-new(root) {
          animation: theme-expand .5s cubic-bezier(0.22, 1, 0.36, 1) both;
          mix-blend-mode: normal;
          clip-path: circle(0px at ${x}px ${y}px);
        }
        @keyframes theme-expand {
          to { clip-path: circle(${maxR}px at ${x}px ${y}px); }
        }
      `
      document.head.appendChild(style)
      // @ts-ignore
      const transition = document.startViewTransition(() => {
        applyTheme(next)
        setTheme(next)
        localStorage.setItem('theme', next)
      })
      transition.finished.then(() => style.remove())
      return
    }

    // Fallback — canvas ripple
    const doc = document as Document
    const canvas = doc.createElement('canvas')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    Object.assign(canvas.style, {
      position: 'fixed', inset: '0', zIndex: '9999',
      pointerEvents: 'none',
    })
    doc.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')!
    const newBg = next === 'dark' ? '#1A1A1E' : '#F5F7FA'
    let r = 0

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = newBg
      ctx.fill()
      r += maxR / 20
      if (r < maxR) {
        requestAnimationFrame(draw)
      } else {
        applyTheme(next)
        setTheme(next)
        localStorage.setItem('theme', next)
        canvas.remove()
      }
    }

    requestAnimationFrame(draw)
  }

  return (
    <button
      ref={btnRef}
      onClick={toggle}
      title={theme === 'light' ? 'Тёмная тема' : 'Светлая тема'}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: '50%',
        color: 'var(--on-surface-variant)',
        transition: 'background .15s, color .15s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = 'var(--outline-variant)'
        e.currentTarget.style.color = 'var(--on-surface)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'none'
        e.currentTarget.style.color = 'var(--on-surface-variant)'
      }}
    >
      {theme === 'light' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="5" />
          <line x1="12" y1="19" x2="12" y2="22" />
          <line x1="4.22" y1="4.22" x2="6.34" y2="6.34" />
          <line x1="17.66" y1="17.66" x2="19.78" y2="19.78" />
          <line x1="2" y1="12" x2="5" y2="12" />
          <line x1="19" y1="12" x2="22" y2="12" />
          <line x1="4.22" y1="19.78" x2="6.34" y2="17.66" />
          <line x1="17.66" y1="6.34" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}
