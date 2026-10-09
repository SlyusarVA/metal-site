'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { getFlatStandardChoices } from '@/data/flatStandards'
import { isRectangular } from '@/data/profileNavigation'
import { getProfileGostCodes } from '@/data/profileStandards'
import { MetalProfile, ProfileKey } from '@/data/profiles'

interface Props {
  profile: MetalProfile
  metalGroup: string
  densityText?: string
  density: number | null
  flatUseGost?: boolean
  showGost?: boolean
  onProfileSelect?: (key: ProfileKey, useGost: boolean) => void
  onGostClick: (code: string) => void
}

export default function GostTags({ profile, metalGroup, density, densityText, onGostClick, onProfileSelect, flatUseGost = false, showGost = true }: Props) {
  const gostCodes = getProfileGostCodes(profile.key, metalGroup)

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center', minWidth: 0 }}>
      {showGost && (isRectangular(profile.key) && onProfileSelect ? <FlatGostMenu profile={profile} metalGroup={metalGroup} onSelect={onProfileSelect} useGost={flatUseGost} onGostClick={onGostClick} /> : gostCodes.map((code, index) => (
        <button
          key={`gost-${index}`}
          title={code}
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
      )))}
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
        <AnimatedText text={densityText ?? (density == null ? 'ρ: нет в Б.1' : `ρ = ${density} кг/м³`)} />
      </span>
    </div>
  )
}

export function FlatGostMenu({ profile, metalGroup, onSelect, onGostClick, useGost }: { profile: MetalProfile; metalGroup: string; useGost: boolean; onSelect: (key: ProfileKey, useGost: boolean) => void; onGostClick: (code: string) => void }) {
  const choices = getFlatStandardChoices(metalGroup)
  const current = choices.find(c => useGost ? c.code != null && c.profileKeys.includes(profile.key) : c.code === null)
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ left: 12, top: 40, width: 520, maxHeight: 400 })
  const trigger = useRef<HTMLButtonElement>(null)
  const menu = useRef<HTMLElement>(null)
  const menuId = useId()
  function close(focus = false) { setOpen(false); if (focus) trigger.current?.focus() }
  function show() {
    const rect = trigger.current?.getBoundingClientRect()
    if (!rect) return
    const width = Math.min(520, window.innerWidth - 24)
    const top = Math.min(rect.bottom + 6, Math.max(12, window.innerHeight - 240))
    setPosition({ left: Math.max(12, Math.min(rect.left, window.innerWidth - width - 12)), top, width, maxHeight: window.innerHeight - top - 12 })
    setOpen(true)
  }
  useEffect(() => { setOpen(false) }, [profile.key, metalGroup])
  useEffect(() => {
    if (!open) return
    menu.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus()
    const outside = (event: PointerEvent) => { if (!menu.current?.contains(event.target as Node) && !trigger.current?.contains(event.target as Node)) setOpen(false) }
    const resize = () => setOpen(false)
    document.addEventListener('pointerdown', outside)
    window.addEventListener('resize', resize)
    return () => { document.removeEventListener('pointerdown', outside); window.removeEventListener('resize', resize) }
  }, [open])
  return <>
    <button ref={trigger} type="button" aria-label="Выбрать ГОСТ плоского проката" aria-haspopup="menu" aria-expanded={open} aria-controls={open ? menuId : undefined} title={current?.code ? current.title + ' — ' + current.code : current?.title} onClick={() => open ? close() : show()} onKeyDown={e => { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); show() } }} style={{ width: '100%', height: 44, boxSizing: 'border-box', lineHeight: 1.2, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', minHeight: 44, padding: '4px 12px', fontSize: 14, fontWeight: 600, color: 'var(--primary)', cursor: 'pointer', fontFamily: 'Manrope, sans-serif', background: 'var(--primary-container)', borderColor: 'var(--primary)' }}>
      <span style={{ display: 'block' }}>{choices.length === 1 && choices[0].code ? 'ГОСТ' : 'Выбрать ГОСТ'} <span aria-hidden="true">⌄</span></span>
      <span style={{ display: 'block', fontSize: 12, fontWeight: 400 }}>{current?.code ?? 'По размерам'}</span>
    </button>
    {open && createPortal(<section ref={menu} id={menuId} role="menu" aria-label="ГОСТ плоского проката" onKeyDown={e => {
      if (e.key === 'Escape') { e.preventDefault(); close(true) }
      if (e.key === 'Tab') close(true)
      if (['ArrowDown','ArrowUp','Home','End'].includes(e.key)) {
        e.preventDefault()
        const items = Array.from(menu.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? [])
        const index = items.indexOf(document.activeElement as HTMLButtonElement)
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? items.length - 1 : (index + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length
        items[next]?.focus()
      }
    }} style={{ position: 'fixed', ...position, overflowY: 'auto', zIndex: 1000, boxSizing: 'border-box', padding: 6, border: '1px solid var(--outline)', borderRadius: 10, background: 'var(--surface)', color: 'var(--on-surface)', boxShadow: '0 8px 28px #0005' }}>
      {choices.map(choice => <button key={choice.code ?? 'dimensions'} type="button" role="menuitemradio" aria-checked={choice === current} tabIndex={-1} onClick={() => { onSelect(choice.profileKeys.includes(profile.key) ? profile.key : choice.profileKey, choice.code != null); close(true) }} style={{ display: 'flex', width: '100%', gap: 8, alignItems: 'flex-start', padding: '10px 12px', border: 0, borderRadius: 7, textAlign: 'left', font: 'inherit', fontSize: 13, cursor: 'pointer', color: choice === current ? 'var(--primary)' : 'var(--on-surface)', background: choice === current ? 'var(--primary-container)' : 'transparent' }}>
        <span aria-hidden="true" style={{ width: 14, flexShrink: 0 }}>{choice === current ? '✓' : ''}</span>
        <span style={{ minWidth: 0, whiteSpace: 'normal' }}>{choice.title}{choice.code && <strong style={{ display: 'block', marginTop: 3 }}>{choice.code}</strong>}</span>
      </button>)}
      {current?.code && <button type="button" role="menuitem" tabIndex={-1} onClick={() => { close(true); onGostClick(current.code!) }} style={{ display: 'block', width: '100%', marginTop: 4, padding: '10px 12px', border: 0, borderTop: '1px solid var(--outline-variant)', textAlign: 'left', font: 'inherit', fontSize: 12, cursor: 'pointer', color: 'var(--on-surface-variant)', background: 'transparent' }}>Открыть справку: {current.code}</button>}
    </section>, document.body)}
  </>
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
