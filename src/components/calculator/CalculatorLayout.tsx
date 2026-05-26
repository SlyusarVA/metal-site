'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { profiles, ProfileKey } from '@/data/profiles'
import { getGradesForGroup } from '@/data/materials'
import { useCalculator } from '@/hooks/useCalculator'
import { useSettings, sortGrades } from '@/data/settings'
import MetalNav from './MetalNav'
import SortamentNav from './SortamentNav'
import CalcPanel from './CalcPanelLean'
import SettingsPanel from './SettingsPanel'
import GostPanel from './GostPanel'
import ThemeToggle from '../ThemeToggle'
import AccentSchemeToggle from '../AccentSchemeToggle'

export default function CalculatorLayout() {
  const router = useRouter()
  const calc = useCalculator()
  const { state, selectProfile, selectMetal } = calc
  const { settings } = useSettings()
  const [showSettings, setShowSettings] = useState(false)
  const [showGost, setShowGost] = useState(false)
  const [selectedGostCode, setSelectedGostCode] = useState<string | null>(null)
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

  const orderedMetals = settings.metalOrder
  const orderedProfiles = settings.profileOrder
    .map(key => profiles.find(p => p.key === key))
    .filter(Boolean) as typeof profiles

  const getGradesOrdered = (group: string) => {
    const raw = getGradesForGroup(group)
    const sort = settings.gradeSorts[group]
    return sortGrades(raw, sort)
  }

  function openGost(code?: string | null) {
    setSelectedGostCode(code ?? null)
    setShowGost(true)
  }

  function handleGostResult(metalGroups: string[], profileKeys: ProfileKey[], grade?: string) {
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

  function handleGostClear() {
    setHighlightedMetals([]); setHighlightedProfiles([]); setNeedsSortament(false)
  }

  const commonProps = {
    calc,
    getGrades: getGradesOrdered,
    onGostResult: handleGostResult,
    onGostClear: handleGostClear,
    onGostOpen: openGost,
    needsSortament,
  }

  if (!isMobile) {
    return (
      <div style={desktopPageStyle}>
        <nav aria-label="Основная навигация" style={desktopNavStyle}>
          <SiteTab active>Калькулятор</SiteTab>
          <SiteTab onClick={() => {}}>Марочник</SiteTab>
          <SiteTab onClick={() => openGost(null)}>ГОСТы</SiteTab>
          <div style={{ flex: 1 }} />
          <button onClick={() => router.push('/history')} style={utilBtnStyle}>● История расчётов</button>
          <button onClick={() => setShowSettings(true)} style={{ ...utilBtnStyle, ...topbarIconBtnStyle }} title="Настройки" aria-label="Открыть настройки"><SettingsIcon /></button>
          <AccentSchemeToggle />
          <ThemeToggle />
        </nav>

        <div style={desktopShellStyle}>
          <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
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

        <p style={footerNoteStyle}>Данные по плотностям согласно ГОСТ. Результат расчёта — теоретический вес.</p>
        {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
        {showGost && <GostPanel initialCode={selectedGostCode} onClose={() => setShowGost(false)} />}
      </div>
    )
  }

  return (
    <div style={mobilePageStyle}>
      <nav aria-label="Основная навигация" style={mobileNavStyle}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--on-surface)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Калькулятор металла</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{state.metalGroup} · {state.profile.name}</div>
        </div>
        <button onClick={() => router.push('/history')} style={mobileTopBtnStyle}>История</button>
        <AccentSchemeToggle />
        <button onClick={() => setShowSettings(true)} aria-label="Открыть настройки" style={mobileIconBtnStyle}><SettingsIcon /></button>
      </nav>
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <CalcPanel {...commonProps} isMobile metalGroups={orderedMetals} profiles={orderedProfiles.map(p => ({ key: p.key, name: p.name }))} />
      </div>
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
      {showGost && <GostPanel initialCode={selectedGostCode} onClose={() => setShowGost(false)} />}
    </div>
  )
}

function SettingsIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function SiteTab({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} aria-current={active ? 'page' : undefined} style={siteTabStyle(active)}>{children}</button>
}

const desktopPageStyle: React.CSSProperties = { height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '18px 16px 16px', overflow: 'hidden' }
const desktopNavStyle: React.CSSProperties = { width: '100%', maxWidth: 'clamp(980px, 92vw, 1180px)', display: 'flex', alignItems: 'center', marginBottom: 12, gap: 4, flexShrink: 0 }
const desktopShellStyle: React.CSSProperties = { width: '100%', maxWidth: 'clamp(980px, 92vw, 1180px)', background: 'var(--surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--outline-variant)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'min(646px, calc(100dvh - 80px))', minHeight: 0 }
const footerNoteStyle: React.CSSProperties = { marginTop: 8, marginBottom: 0, fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)', textAlign: 'center', flexShrink: 0 }
const mobilePageStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', height: '100dvh', minHeight: 0, background: 'var(--surface-variant)', overflow: 'hidden' }
const mobileNavStyle: React.CSSProperties = { background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', gap: 8, minHeight: 48, padding: '0 12px', flexShrink: 0 }
const utilBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'transparent', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--on-surface-variant)', fontSize: 'var(--text-xs)', fontWeight: 500, fontFamily: 'Manrope, sans-serif', height: 32, minBlockSize: 32, padding: '0 10px', whiteSpace: 'nowrap' }
const topbarIconBtnStyle: React.CSSProperties = { width: 32, padding: 0, gap: 0, flexShrink: 0 }
const mobileTopBtnStyle: React.CSSProperties = { border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-container)', color: 'var(--on-surface)', fontSize: 'var(--text-xs)', fontWeight: 600, fontFamily: 'Manrope, sans-serif', minHeight: 38, padding: '0 12px', cursor: 'pointer', flexShrink: 0 }
const mobileIconBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 38, height: 38, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-container)', color: 'var(--on-surface-variant)', cursor: 'pointer', flexShrink: 0 }
function siteTabStyle(active?: boolean): React.CSSProperties { return { background: 'transparent', border: 'none', borderRadius: 6, cursor: active ? 'default' : 'pointer', color: active ? 'var(--primary)' : 'var(--on-surface-variant)', fontSize: 'var(--text-sm)', fontWeight: active ? 600 : 400, fontFamily: 'Manrope, sans-serif', padding: '5px 12px', letterSpacing: '.02em', whiteSpace: 'nowrap', minBlockSize: 32 } }
