'use client'

import { MetalProfile, ProfileKey } from '@/data/profiles'
import { getAllowedProfiles } from '@/data/materials'

interface Props {
  profiles: MetalProfile[]
  selected: ProfileKey
  highlighted?: ProfileKey[]
  onSelect: (key: ProfileKey) => void
  metalGroup: string
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function SortamentNav({
  profiles, selected, highlighted = [], onSelect, metalGroup,
  mobileOpen, onMobileClose,
}: Props) {

  const allowed = getAllowedProfiles(metalGroup)
  const visibleProfiles = allowed
    ? profiles.filter(p => allowed.includes(p.key))
    : profiles

  const renderList = (fontSize = 13, padding = '6px 12px') =>
    visibleProfiles.map(p => {
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
          className="nav-item"
          onClick={() => { onSelect(p.key); onMobileClose?.() }}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            width: '100%', textAlign: 'left',
            background: bg, border: 'none',
            borderLeft: `3px solid ${borderColor}`,
            cursor: 'pointer', padding,
            fontSize, fontWeight, color,
            fontFamily: 'Manrope, sans-serif',
            transition: 'background .12s',
            minHeight: 36,
          }}
          onMouseEnter={e => {
            if (!isActive && !isHighlighted)
              (e.currentTarget as HTMLElement).style.background = 'var(--surface-container)'
          }}
          onMouseLeave={e => {
            if (!isActive && !isHighlighted)
              (e.currentTarget as HTMLElement).style.background = 'none'
          }}
        >
          <img
            src={`/icons/${p.icon}.svg`}
            alt=""
            width={22} height={22}
            style={{ flexShrink: 0, opacity: isActive || isHighlighted ? 1 : 0.55 }}
          />
          <span style={{ flex: 1 }}>{p.name}</span>
          {isHighlighted && !isActive && (
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F9A825', flexShrink: 0 }} />
          )}
        </button>
      )
    })

  if (mobileOpen === undefined) return (
    <div style={{
      width: 168, flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--outline-variant)',
      overflowY: 'auto',
    }}>
      <div style={{
        fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
        color: 'var(--on-surface-variant)',
        padding: '10px 14px 4px', textTransform: 'uppercase',
      }}>
        Сортамент
      </div>
      {renderList()}
    </div>
  )

  return (
    <>
      {mobileOpen && (
        <div onClick={onMobileClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200 }} />
      )}
      <div style={{
        position: 'fixed', top: 48, right: 0, bottom: 0,
        width: 220, zIndex: 201,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .25s cubic-bezier(0.2,0,0,1)',
        overflowY: 'auto',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--outline-variant)',
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: '.08em',
          color: 'var(--on-surface-variant)',
          padding: '12px 14px 6px', textTransform: 'uppercase',
        }}>
          Сортамент
        </div>
        {renderList(14, '12px 14px')}
      </div>
    </>
  )
}
