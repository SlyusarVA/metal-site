'use client'

import { MetalProfile } from '@/data/profiles'

interface Props {
  profile: MetalProfile
  density: number
  onGostClick: (code: string) => void
}

export default function GostTags({ profile, density, onGostClick }: Props) {
  const gostCodes = profile.gost ? [profile.gost] : []

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {gostCodes.map(code => (
        <button
          key={code}
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
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-container)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--surface-container)')}
        >
          {code}
        </button>
      ))}
      <span style={{
        background: 'var(--surface-container)',
        border: '1px solid var(--outline-variant)',
        borderRadius: 'var(--radius-full)',
        padding: '3px 12px',
        fontSize: 11,
        color: 'var(--on-surface-variant)',
      }}>
        ρ = {density} кг/м³
      </span>
    </div>
  )
}
