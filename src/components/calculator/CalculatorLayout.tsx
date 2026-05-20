'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { profiles, ProfileKey } from '@/data/profiles'
import { getMetalGroups, getGradesForGroup } from '@/data/materials'
import { useCalculator } from '@/hooks/useCalculator'
import { useSettings, sortGrades } from '@/data/settings'
import MetalNav from './MetalNav'
import SortamentNav from './SortamentNav'
import CalcPanel from './CalcPanel'
import SettingsPanel from './SettingsPanel'
import GostPanel from './GostPanel'

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--surface-variant)' }}>

      {/* ── Топ-бар ── */}
      <nav style={{
        background: '#1565C0',
        display: 'flex',
        alignItems: 'center',
        height: 48,
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(21,101,192,.4)',
        position: 'relative',
        zIndex: 100,
      }}>
        {isMobile ? (
          <>
            <button onClick={() => { setMobileMetalOpen(o => !o); setMobileSortamentOpen(false) }} style={mobileNavBtn(mobileMetalOpen)}>
              ⚙ Металл
            </button>
            <button onClick={() => { setMobileSortamentOpen(o => !o); setMobileMetalOpen(false) }} style={mobileNavBtn(mobileSortamentOpen)}>
              📐 Сортамент
            </button>
            <div style={{ flex: 1 }} />
            <button onClick={() => router.push('/history')} style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,.85)', fontSize: 11, fontWeight: 500,
              fontFamily: 'Manrope, sans-serif', padding: '0 10px', height: '100%',
            }}>
              История
            </button>
            <button onClick={() => setShowSettings(true)} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', borderLeft: '1px solid rgba(255,255,255,.15)',
              cursor: 'pointer', color: 'rgba(255,255,255,.8)', width: 44, height: '100%',
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </>
        ) : (
          <>
            <TopTab active>Калькулятор металла</TopTab>
            <TopTab onClick={() => {}}>Марочник металлов</TopTab>
            <TopTab onClick={() => setShowGost(true)}>ГОСТы</TopTab>
            <div style={{ flex: 1 }} />
            <button onClick={() => router.push('/history')} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(255,255,255,.85)', fontSize: 12, fontWeight: 500,
              fontFamily: 'Manrope, sans-serif', padding: '0 16px',
              letterSpacing: '.04em', height: '100%',
              transition: 'background .15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', flexShrink: 0 }} />
              ИСТОРИЯ РАСЧЁТОВ
            </button>
            <button onClick={() => setShowSettings(true)} title="Настройки" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'none', border: 'none', borderLeft: '1px solid rgba(255,255,255,.15)',
              cursor: 'pointer', color: 'rgba(255,255,255,.8)', width: 48, height: '100%',
              transition: 'background .15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </>
        )}
      </nav>

      {/* ── Контент ── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {isMobile ? (
          <>
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
            <CalcPanel
              calc={calc}
              getGrades={getGradesOrdered}
              onGostResult={handleGostResult}
              onGostClear={handleGostClear}
              needsSortament={needsSortament}
            />
          </>
        ) : (
          <>
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
            <CalcPanel
              calc={calc}
              getGrades={getGradesOrdered}
              onGostResult={handleGostResult}
              onGostClear={handleGostClear}
              needsSortament={needsSortament}
            />
          </>
        )}
      </div>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showGost && <GostPanel onClose={() => setShowGost(false)} />}
    </div>
  )
}

function mobileNavBtn(active: boolean): React.CSSProperties {
  return {
    background: active ? 'rgba(255,255,255,.2)' : 'none',
    border: 'none',
    borderRight: '1px solid rgba(255,255,255,.12)',
    cursor: 'pointer',
    color: '#fff',
    fontSize: 12,
    fontWeight: 600,
    fontFamily: 'Manrope, sans-serif',
    padding: '0 14px',
    height: '100%',
    whiteSpace: 'nowrap',
  }
}

function TopTab({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} style={{
      background: active ? 'rgba(255,255,255,.15)' : 'none',
      border: 'none', borderRight: '1px solid rgba(255,255,255,.12)',
      cursor: 'pointer', color: active ? '#fff' : 'rgba(255,255,255,.72)',
      fontSize: 12, fontWeight: 600, fontFamily: 'Manrope, sans-serif',
      padding: '0 22px', height: '100%', letterSpacing: '.05em',
      transition: 'background .15s', whiteSpace: 'nowrap',
    }}
      onMouseEnter={e => { if (!active) (e.target as HTMLElement).style.background = 'rgba(255,255,255,.08)' }}
      onMouseLeave={e => { if (!active) (e.target as HTMLElement).style.background = 'none' }}
    >
      {children}
    </button>
  )
}
