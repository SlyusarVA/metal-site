'use client'

import { useEffect, useRef } from 'react'
import { MetalProfile, ProfileKey } from '@/data/profiles'
import ProfileIcon from './ProfileIcon'
import { groupProfiles, profileGroupKey } from '@/data/profileNavigation'
import { getAllowedProfiles } from '@/data/materials'

interface Props {
  profiles: MetalProfile[]
  selected: ProfileKey
  highlighted?: ProfileKey[]
  onSelect: (key: ProfileKey) => void
  metalGroup: string
  onContentHeight?: (height: number) => void
  mobileOpen?: boolean
  onMobileClose?: () => void
}

export default function SortamentNav({
  profiles, selected, highlighted = [], onSelect, metalGroup,
  mobileOpen, onMobileClose, onContentHeight,
}: Props) {

  const headerRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!onContentHeight || !headerRef.current || !listRef.current) return
    const measure = () => onContentHeight(Math.ceil(headerRef.current!.getBoundingClientRect().height + listRef.current!.getBoundingClientRect().height) + 2)
    const observer = new ResizeObserver(measure)
    observer.observe(headerRef.current)
    observer.observe(listRef.current)
    measure()
    return () => observer.disconnect()
  }, [onContentHeight])

  const allowed = getAllowedProfiles(metalGroup)
  const visibleProfiles = groupProfiles(profiles, allowed)

  const renderList = (fontSize = 15, padding = '7px 14px', iconSize = 28, minHeight = 40) =>
    visibleProfiles.map(p => {
      const isActive = profileGroupKey(p.key) === profileGroupKey(selected)
      const isHighlighted = highlighted.some(key => profileGroupKey(key) === profileGroupKey(p.key))

      let bg = 'none'
      let borderColor = 'transparent'
      let color = 'var(--on-surface)'
      let fontWeight: number = 500

      if (isActive && isHighlighted) {
        bg = 'var(--primary-container)'; borderColor = 'var(--primary)'; color = 'var(--primary)'; fontWeight = 800
      } else if (isActive) {
        bg = 'var(--primary-container)'; borderColor = 'var(--primary)'; color = 'var(--primary)'; fontWeight = 700
      } else if (isHighlighted) {
        bg = '#FFFDE7'; borderColor = '#F9A825'; color = '#E65100'; fontWeight = 700
      }

      return (
        <button
          key={p.key}
          className="nav-item"
          onClick={() => { onSelect(isActive ? selected : p.key); onMobileClose?.() }}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            width: '100%', textAlign: 'left',
            background: bg, border: 'none',
            borderLeft: `4px solid ${borderColor}`,
            cursor: 'pointer', padding,
            fontSize, fontWeight, color,
            fontFamily: 'Manrope, sans-serif',
            transition: 'background .12s',
            minHeight,
            lineHeight: 1.16,
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
          <ProfileIcon icon={p.icon} size={iconSize} />
          <span style={{ flex: 1, whiteSpace: 'normal' }}>{p.name}</span>
          {isHighlighted && !isActive && (
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#F9A825', flexShrink: 0 }} />
          )}
        </button>
      )
    })

  if (mobileOpen === undefined) return (
    <div style={{
      width: 208, flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--outline-variant)',
      overflow: 'hidden',
      height: '100%',
      minHeight: 0,
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div ref={headerRef} style={{
        fontSize: 11, fontWeight: 800, letterSpacing: '.08em',
        color: 'var(--on-surface-variant)',
        padding: '12px 16px 6px', textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        Сортамент
      </div>
      <div className="ui-scroll-area" style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <div ref={listRef}>{renderList()}</div>
      </div>
    </div>
  )

  return (
    <>
      {mobileOpen && (
        <div onClick={onMobileClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 200 }} />
      )}
      <div style={{
        position: 'fixed', top: 48, right: 0, bottom: 0,
        width: 240, zIndex: 201,
        transform: mobileOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .25s cubic-bezier(0.2,0,0,1)',
        overflowY: 'auto',
        background: 'var(--surface)',
        borderLeft: '1px solid var(--outline-variant)',
      }}>
        <div style={{
          fontSize: 11, fontWeight: 800, letterSpacing: '.08em',
          color: 'var(--on-surface-variant)',
          padding: '12px 14px 6px', textTransform: 'uppercase',
        }}>
          Сортамент
        </div>
        {renderList(15, '12px 14px', 28, 44)}
      </div>
    </>
  )
}
