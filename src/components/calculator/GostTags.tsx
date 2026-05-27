'use client'

import { useEffect, useRef, useState } from 'react'
import { MetalProfile } from '@/data/profiles'

interface Props {
  profile: MetalProfile
  density: number
  onGostClick: (code: string) => void
}

export default function GostTags({ profile, density, onGostClick }: Props) {
  const gostCodes = profile.gost ? [profile.gost] : []

  return (
    <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 6, alignItems: 'center', flexShrink: 0 }}>
      {gostCodes.map((code, index) => (
        <button
          key={`gost-${index}`}
          onClick={() => onGostClick(code)}
          style={{
            background: 'var(--surface-container)',
            border: '1px solid var(--outline-variant)',
            borderRadius: 'var(--radius-full)',
            padding: '3px 12px',
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--primary)',
            cursor: 'pointer',
            fontFamily: 'Manrope, sans-serif',
            transition: 'background .12s',
            width: 118,
            textAlign: 'center',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            flexShrink: 0,
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-container)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-container)')}
        >
          <AnimatedText text={code} />
        </button>
      ))}
      <span style={{
        background: 'var(--surface-container)',
        border: '1px solid var(--outline-variant)',
        borderRadius: 'var(--radius-full)',
        padding: '3px 12px',
        fontSize: 11,
        color: 'var(--on-surface-variant)',
        width: 116,
        textAlign: 'center',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        <AnimatedText text={`ρ = ${density} кг/м³`} />
      </span>
    </div>
  )
}

function AnimatedText({ text }: { text: string }) {
  const [shown, setShown] = useState(text)
  const [phase, setPhase] = useState('')
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (text === shown) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(text)
      return
    }

    const dur = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--text-swap-dur')) || 150
    setPhase('is-exit')
    const timer = window.setTimeout(() => {
      setShown(text)
      setPhase('is-enter-start')
      requestAnimationFrame(() => {
        void ref.current?.offsetHeight
        setPhase('')
      })
    }, dur)

    return () => window.clearTimeout(timer)
  }, [text, shown])

  return <span ref={ref} className={`t-text-swap ${phase}`}>{shown}</span>
}
