'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { profiles, ProfileKey } from '@/data/profiles'
import { getGradesForGroup } from '@/data/materials'
import { useCalculator } from '@/hooks/useCalculator'
import { useSettings, sortGrades } from '@/data/settings'
import MetalNav from './MetalNav'
import SortamentNav from './SortamentNav'
import CalcPanel from './CalcPanel'
import SettingsPanel from './SettingsPanel'
import GostPanel from './GostPanel'
import ThemeToggle from '../ThemeToggle'

export default function CalculatorLayout() {
  const router = useRouter()
  const calc = useCalculator()
  const { state, selectProfile, selectMetal } = calc
  const { settings } = useSettings()
  const [showSettings, setShowSettings] = useState(false)
  const [showGost, setShowGost] = useState(false)
  const [mobileMetalOpen, setMobileMetalOpen] = useState(false)
  const [mobileSortamentOpen, setMobileSortamentOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const [highlightedMetals, setHighlightedMetals] = useState<string[]>([])
  const [highlightedProfiles, setHighlightedProfiles] = useState<ProfileKey[]>([])
  const [needsSortament, setNeedsSortament] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleGostResult = (metalGroups: string[], profileKeys: ProfileKey[], grade?: string) => {
    setHighlightedMetals(metalGroups)
    setHighlightedProfiles(profileKeys)
    if (metalGroups.length === 1) {
      const targetGrade = grade ?? getGradesOrdered(metalGroups[0])[0]?.grade
      if (targetGrade) selectMetal(metalGroups[0], targetGrade)
    }
    if (profileKeys.length === 1) {
      selectProfile(profileKeys[0]); setNeedsSortament(false)
    } else if (profileKeys.length === 0 && metalGroups.length > 0) {
      setNeedsSortament(true)
    } else if (metalGroups.length === 1 && profileKeys.length === 1) {
      setNeedsSortament(false)
    }
  }

  const handleGostClear = () => {
    setHighlightedMetals([]); setHighlightedProfiles([]); setNeedsSortament(false)
  }

  const orderedMetals = settings.metalOrder
  const orderedProfiles = settings.profileOrder
    .map(key => profiles.find(p => p.key === key))
    .filter(Boolean) as typeof profiles

  const getGradesOrdered = (group: string) => {
    const raw = getGradesForGroup(group)
    const sort = settings.gradeSorts[group]
    return sortGrades(raw, sort)
  }

  const commonProps = {
    calc,
    getGrades: getGradesOrdered,
    onGostResult: handleGostResult,
    onGostClear: handleGostClear,
    needsSortament,
  }

  // ── Desktop ────────────────────────────────────────────────────────
  if (!isMobile) {
    return (
      <div style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '24px 16px 40px',
      }}>
        <nav
          aria-label="Основная навигация"
          style={{
            width: '100%',
            maxWidth: 860,
            display: 'flex',
            alignItems: 'center',
            marginBottom: 16,
            gap: 2,
          }}
        >
          <SiteTab active>Калькулятор</SiteTab>
          <SiteTab onClick={() => {}}>Марочник</SiteTab>
          <SiteTab onClick={() => setShowGost(true)}>ГОСТы</SiteTab>
          <div style={{ flex: 1 }} />
          <button
            onClick={() => router.push('/history')}
            style={utilBtnStyle}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--outline-variant)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
            История расчётов
          </button>
          <button
            onClick={() => setShowSettings(true)}
            style={{ ...utilBtnStyle, padding: '0 10px' }}
            title="Настройки"
            aria-label="Открыть настройки"
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--outline-variant)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <ThemeToggle />
        </nav>

        <div style={{
          width: '100%',
          maxWidth: 860,
          background: 'var(--surface)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--outline-variant)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: 560,
        }}>
          <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
            <MetalNav
              groups={orderedMetals}
              selected={state.metalGroup}
              highlighted={highlightedMetals}
              onSelect={(group) => {
                const grades = getGradesOrdered(group)
                if (grades.length > 0) selectMetal(group, grades[0].grade)
              }}
            />
            <SortamentNav
              profiles={orderedProfiles}
              selected={state.profileKey}
              highlighted={highlightedProfiles}
              metalGroup={state.metalGroup}
              onSelect={(key) => { selectProfile(key); setNeedsSortament(false) }}
            />
            <CalcPanel {...commonProps} />
          </div>
        </div>

        <p style={{
          marginTop: 10,
          fontSize: 'var(--text-xs)',
          color: 'var(--on-surface-variant)',
          textAlign: 'center',
        }}>
          Данные по плотностям согласно ГОСТ. Результат расчёта — теоретический вес.
        </p>

        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
        {showGost && <GostPanel onClose={() => setShowGost(false)} />}
      </div>
    )
  }

  // ── Mobile ─────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      background: 'var(--surface-variant)',
    }}>
      <nav
        aria-label="Основная навигация"
        style={{
          background: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          height: 48,
          flexShrink: 0,
          boxShadow: 'var(--shadow-2)',
          position: 'relative',
          zIndex: 100,
        }}
      >
        <button
          onClick={() => { setMobileMetalOpen(o => !o); setMobileSortamentOpen(false) }}
          style={mobileNavBtn(mobileMetalOpen)}
          aria-expanded={mobileMetalOpen}
          aria-label="Выбрать металл"
        >
          ⚙ Металл
        </button>
        <button
          onClick={() => { setMobileSortamentOpen(o => !o); setMobileMetalOpen(false) }}
          style={mobileNavBtn(mobileSortamentOpen)}
          aria-expanded={mobileSortamentOpen}
          aria-label="Выбрать сортамент"
        >
          📐 Сортамент
        </button>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => router.push('/history')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,.85)', fontSize: 'var(--text-xs)',
            fontWeight: 500, fontFamily: 'Manrope, sans-serif',
            padding: '0 10px', height: '100%',
            minBlockSize: 44,
          }}
        >
          История
        </button>
        <button
          onClick={() => setShowSettings(true)}
          aria-label="Открыть настройки"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'none', border: 'none',
            borderInlineStart: '1px solid rgba(255,255,255,.15)',
            cursor: 'pointer', color: 'rgba(255,255,255,.8)',
            width: 44, height: '100%',
            minBlockSize: 44,
          }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </nav>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <MetalNav
          groups={orderedMetals}
          selected={state.metalGroup}
          highlighted={highlightedMetals}
          onSelect={(group) => {
            const grades = getGradesOrdered(group)
            if (grades.length > 0) selectMetal(group, grades[0].grade)
          }}
          mobileOpen={mobileMetalOpen}
          onMobileClose={() => setMobileMetalOpen(false)}
        />
        <SortamentNav
          profiles={orderedProfiles}
          selected={state.profileKey}
          highlighted={highlightedProfiles}
          metalGroup={state.metalGroup}
          onSelect={(key) => { selectProfile(key); setNeedsSortament(false) }}
          mobileOpen={mobileSortamentOpen}
          onMobileClose={() => setMobileSortamentOpen(false)}
        />
        <CalcPanel {...commonProps} />
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showGost && <GostPanel onClose={() => setShowGost(false)} />}
    </div>
  )
}

function SiteTab({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      style={{
        background: 'transparent',
        border: 'none',
        borderRadius: 6,
        cursor: active ? 'default' : 'pointer',
        color: active ? 'var(--primary)' : 'var(--on-surface-variant)',
        fontSize: 'var(--text-sm)',
        fontWeight: active ? 600 : 400,
        fontFamily: 'Manrope, sans-serif',
        padding: '5px 12px',
        letterSpacing: '.02em',
        transition: 'background .15s, color .15s',
        whiteSpace: 'nowrap',
        minBlockSize: 32,
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget.style.background = 'var(--outline-variant)') }}
      onMouseLeave={e => { if (!active) (e.currentTarget.style.background = 'transparent') }}
    >
      {children}
    </button>
  )
}

const utilBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  background: 'transparent',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  color: 'var(--on-surface-variant)',
  fontSize: 'var(--text-xs)' as string,
  fontWeight: 500,
  fontFamily: 'Manrope, sans-serif',
  padding: '5px 10px',
  transition: 'background .15s',
  whiteSpace: 'nowrap',
}

function mobileNavBtn(active: boolean): React.CSSProperties {
  return {
    background: active ? 'rgba(255,255,255,.2)' : 'none',
    border: 'none',
    borderInlineEnd: '1px solid rgba(255,255,255,.12)',
    cursor: 'pointer',
    color: '#fff',
    fontSize: 'var(--text-sm)' as string,
    fontWeight: 600,
    fontFamily: 'Manrope, sans-serif',
    padding: '0 14px',
    height: '100%',
    whiteSpace: 'nowrap',
  }
}
