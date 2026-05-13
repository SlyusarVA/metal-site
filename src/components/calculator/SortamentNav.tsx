'use client'

import Image from 'next/image'
import { MetalProfile, ProfileKey } from '@/data/profiles'

interface Props {
  profiles: MetalProfile[]
  selected: ProfileKey
  /** Ключи сортаментов подсвеченных через поиск ГОСТа */
  highlighted?: ProfileKey[]
  onSelect: (key: ProfileKey) => void
}

export default function SortamentNav({ profiles, selected, highlighted = [], onSelect }: Props) {
  return (
    <div style={{
      width: 168,
      flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--outline-variant)',
      overflowY: 'auto',
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: '.08em',
        color: 'var(--on-surface-variant)',
        padding: '12px 14px 6px',
        textTransform: 'uppercase',
      }}>
        Сортамент
      </div>

      {profiles.map(p => {
        const isActive = p.key === selected
        const isHighlighted = highlighted.includes(p.key)

        let bg = 'none'
        let borderColor = 'transparent'
        let color = 'var(--on-surface)'
        let fontWeight: number = 400

        if (isActive && isHighlighted) {
          bg = 'var(--primary-container)'; borderColor = 'var(--primary)'; color = 'var(--primary)'; fontWeight = 700
        } else if (isActive) {
          bg = 'var(--primary-container)'; borderColor = 'var(--primary)'; color = 'var(--primary)'; fontWeight = 600
        } else if (isHighlighted) {
          bg = '#FFFDE7'; borderColor = '#F9A825'; color = '#E65100'; fontWeight = 600
        }

        return (
          <button
            key={p.key}
            onClick={() => onSelect(p.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              width: '100%', textAlign: 'left',
              background: bg, border: 'none',
              borderLeft: `3px solid ${borderColor}`,
              cursor: 'pointer', padding: '8px 12px',
              fontSize: 13, fontWeight, color,
              fontFamily: 'Manrope, sans-serif',
              transition: 'background .12s',
            }}
            onMouseEnter={e => { if (!isActive && !isHighlighted) (e.currentTarget as HTMLElement).style.background = 'var(--surface-container)' }}
            onMouseLeave={e => { if (!isActive && !isHighlighted) (e.currentTarget as HTMLElement).style.background = 'none' }}
          >
            <img
              src={`/icons/${p.icon}.svg`}
              alt=""
              width={28} height={28}
              style={{ flexShrink: 0, opacity: isActive || isHighlighted ? 1 : 0.6 }}
            />
            <span style={{ flex: 1 }}>{p.name}</span>
            {isHighlighted && !isActive && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F9A825', flexShrink: 0 }} />
            )}
          </button>
        )
      })}
    </div>
  )
}
