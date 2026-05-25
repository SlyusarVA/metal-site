'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getWeightTolerance } from '@/data/gost'
import { ProfileKey } from '@/data/profiles'
import { parseQuickInput } from '@/lib/quickInputParser'
import GostTags from './GostTags'
import GostSearchBar from './GostSearchBar'

type CalcMode = 'mass' | 'length' | 'quick'
type QuickStatus = { kind: 'success' | 'warning' | 'error'; message: string }

type ProfileOption = {
  key: ProfileKey
  name: string
}

interface Props {
  calc: ReturnType<typeof import('@/hooks/useCalculator').useCalculator>
  getGrades: (group: string) => import('@/data/materials').MetalMaterial[]
  onGostResult: (metalGroups: string[], profileKeys: ProfileKey[], grade?: string) => void
  needsSortament?: boolean
  onGostClear: () => void
  isMobile?: boolean
  metalGroups?: string[]
  profiles?: ProfileOption[]
}

const MODE_META: Record<CalcMode, { label: string; icon: string; hint: string }> = {
  mass: { label: 'Расчёт массы', icon: '⚖', hint: 'Введите размеры и длину — масса рассчитается автоматически.' },
  length: { label: 'Расчёт длины', icon: '▱', hint: 'Введите размеры и массу — длина рассчитается автоматически.' },
  quick: { label: 'Быстрый ввод', icon: '⚡', hint: 'Введите металл, марку, сортамент, размеры и массу одной строкой.' },
}

export default function CalcPanel({
  calc,
  getGrades,
  onGostResult,
  onGostClear,
  needsSortament,
  isMobile = false,
  metalGroups = [],
  profiles = [],
}: Props) {
  const router = useRouter()
  const { state, selectMetal, selectProfile, setParam, setLength, setMass, incrementQty, decrementQty, calculate } = calc

  const [calcMode, setCalcMode] = useState<CalcMode>('mass')
  const [quickInput, setQuickInput] = useState('Сталь 20 круг 16 масса 120 кг')
  const [quickStatus, setQuickStatus] = useState<QuickStatus | null>(null)
  const [quickChips, setQuickChips] = useState<string[]>(['Сталь', '20', 'Круг', 'Ø16', '120 кг'])

  const grades = getGrades(state.metalGroup)
  const tolerance = getWeightTolerance(state.profileKey, Object.fromEntries(
    Object.entries(state.params).filter(([, v]) => v !== null) as [string, number][]
  ))

  const resultMass = state.result?.target === 'mass' ? state.result.value : (state.mass ?? null)
  const resultLength = state.result?.target === 'length' ? state.result.value : (state.length ?? null)
  const displayResult = calcMode === 'length' ? resultLength : resultMass
  const massMin = calcMode === 'mass' && resultMass != null && tolerance != null ? resultMass * (1 - tolerance.minus) : null
  const massMax = calcMode === 'mass' && resultMass != null && tolerance != null ? resultMass * (1 + tolerance.plus) : null
  const gridCols = isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(auto-fill, minmax(140px, 1fr))'

  function changeMode(mode: CalcMode) {
    setCalcMode(mode)
    setQuickStatus(null)
    if (mode === 'mass') setMass(null)
    if (mode === 'length') setLength(null)
  }

  function changeSourceValue(value: number | null) {
    if (calcMode === 'mass') {
      setMass(null)
      setLength(value)
    } else {
      setLength(null)
      setMass(value)
    }
  }

  function changeMetalGroup(group: string) {
    const firstGrade = getGrades(group)[0]?.grade
    if (firstGrade) selectMetal(group, firstGrade)
  }

  function applyQuickInput() {
    const parsed = parseQuickInput(quickInput, state.metalGroup)
    if (parsed.ok === false) {
      setQuickStatus({ kind: 'error', message: parsed.message })
      return
    }

    selectMetal(parsed.metalGroup, parsed.grade)
    selectProfile(parsed.profileKey)
    Object.entries(parsed.params).forEach(([key, value]) => setParam(key, value))
    setLength(null)
    setMass(parsed.mass)
    setCalcMode('length')
    setQuickChips(parsed.chips)
    setQuickStatus(parsed.unsupportedReason
      ? { kind: 'warning', message: parsed.unsupportedReason }
      : { kind: 'success', message: 'Данные перенесены в режим «Расчёт длины». Нажмите «Рассчитать».' })
  }

  return (
    <div style={panelStyle}>
      <div style={headlineStyle}>
        <span style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--on-surface)' }}>
          {state.metalGroup} · {state.profile.name}
        </span>
        <GostTags profile={state.profile} density={state.density} onGostClick={(code) => router.push(`/gost/${encodeURIComponent(code)}`)} />
      </div>

      <div style={searchWrapStyle}>
        <GostSearchBar onResult={onGostResult} onClear={onGostClear} />
      </div>

      {needsSortament && <div style={warningStyle}>Выберите сортамент</div>}

      <div className="ui-scroll-area" style={workAreaStyle}>
        <section style={modeCardStyle}>
          <div style={modeTitleStyle}><span style={{ color: 'var(--primary)' }}>⚡</span>Калькулятор металла</div>
          <div style={modeTabsStyle}>
            {(['mass', 'length', 'quick'] as const).map(mode => {
              const active = calcMode === mode
              return (
                <button key={mode} onClick={() => changeMode(mode)} aria-pressed={active} style={modeBtnStyle(active)}>
                  <span aria-hidden="true">{MODE_META[mode].icon}</span>{MODE_META[mode].label}
                </button>
              )
            })}
          </div>
          <div style={hintStyle}>{MODE_META[calcMode].hint}</div>
        </section>

        {calcMode === 'quick' && (
          <section style={cardStyle}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={quickInput} onChange={e => setQuickInput(e.target.value)} placeholder="Сталь 20 круг 16 масса 120 кг" style={textInputStyle} />
              <button onClick={applyQuickInput} style={primarySmallBtnStyle}>Применить</button>
            </div>
            <div style={chipsRowStyle}><span>Распознано:</span>{quickChips.map(item => <span key={item} style={quickChipStyle}>{item}</span>)}</div>
            {quickStatus && <div style={statusStyle(quickStatus.kind)}>{quickStatus.message}</div>}
          </section>
        )}

        {isMobile && (
          <div style={mobileSelectorsGridStyle}>
            <SelectField label="Металл" value={state.metalGroup} onChange={changeMetalGroup} options={metalGroups.map(g => ({ value: g, label: g }))} />
            <SelectField label="Сортамент" value={state.profileKey} onChange={v => selectProfile(v as ProfileKey)} options={profiles.map(p => ({ value: p.key, label: p.name }))} />
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={inlineLabelStyle}>Марка</span>
          <select value={state.grade} onChange={e => selectMetal(state.metalGroup, e.target.value)} style={selectStyle}>
            {grades.map(g => <option key={g.grade}>{g.grade}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 8 }}>
          {state.profile.params.map(p => (
            <div key={p.key}>
              <div style={fieldLabelStyle}>{p.label}</div>
              <InputWithUnit value={state.params[p.key] ?? ''} unit={p.unit} onChange={v => setParam(p.key, v)} />
            </div>
          ))}

          {!state.profile.isVolume && (
            <>
              <div>
                <div style={fieldLabelStyle}>{calcMode === 'length' ? 'Масса' : 'Длина L'}</div>
                <InputWithUnit value={calcMode === 'length' ? (state.mass ?? '') : (state.length ?? '')} unit={calcMode === 'length' ? 'кг.' : 'м.'} onChange={changeSourceValue} />
              </div>
              <div>
                <div style={fieldLabelStyle}>{calcMode === 'length' ? 'Длина' : 'Масса'}</div>
                <ReadonlyValueWithUnit value={calcMode === 'length' ? resultLength : resultMass} unit={calcMode === 'length' ? 'м' : 'кг'} />
              </div>
            </>
          )}

          <div>
            <div style={fieldLabelStyle}>Количество</div>
            <div style={qtyWrapStyle}>
              <button onClick={decrementQty} style={qtyBtnStyle} aria-label="Уменьшить количество">−</button>
              <div style={qtyValueStyle}>{state.quantity} шт</div>
              <button onClick={incrementQty} style={qtyBtnStyle} aria-label="Увеличить количество">+</button>
            </div>
          </div>
        </div>

        <button onClick={calculate} style={primaryBtnStyle}>Рассчитать</button>

        {state.error && <div role="alert" style={errorStyle}>{state.error.message}</div>}
        {state.snackbar && <div role="status" style={snackbarStyle}>{state.snackbar.message}</div>}
      </div>

      <div style={resultBarStyle}>
        <div>
          <div style={resLabelStyle}>{calcMode === 'length' ? 'Длина' : 'Вес'}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={resultValueStyle}>{displayResult != null ? displayResult.toFixed(3) : '—'}</span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--on-surface-variant)' }}>{calcMode === 'length' ? 'м' : 'кг'}</span>
          </div>
          {massMin != null && massMax != null && <div style={tolRangeStyle}>{massMin.toFixed(2)} ··· {massMax.toFixed(2)} кг</div>}
        </div>

        {state.result?.linearMass != null && state.result.linearMass > 0 && (
          <div style={{ marginInlineStart: 18 }}>
            <div style={resLabelStyle}>Погонный вес</div>
            <div style={{ fontWeight: 600 }}>{state.result.linearMass.toFixed(4)} <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>кг/м</span></div>
          </div>
        )}

        {tolerance && calcMode === 'mass' && <span style={tolerancePillStyle}>{tolerance.label}</span>}
      </div>
    </div>
  )
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={fieldLabelStyle}>{label}</span>
      <select value={value} onChange={e => onChange(e.target.value)} style={mobileSelectStyle}>
        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
      </select>
    </label>
  )
}

function InputWithUnit({ value, unit, onChange }: { value: number | string; unit: string; onChange: (v: number | null) => void }) {
  return (
    <div style={inputUnitWrapStyle}>
      <input type="number" value={value} min={0} step={0.1} onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : null)} style={numberInputStyle} />
      <span style={unitStyle}>{unit}</span>
    </div>
  )
}

function ReadonlyValueWithUnit({ value, unit }: { value: number | null; unit: string }) {
  return (
    <div style={{ ...inputUnitWrapStyle, background: 'var(--surface-container)', borderColor: 'var(--outline-variant)' }}>
      <div style={{ ...numberInputStyle, display: 'flex', alignItems: 'center' }}>{value != null ? value.toFixed(3) : '—'}</div>
      <span style={unitStyle}>{unit}</span>
    </div>
  )
}

const panelStyle: React.CSSProperties = { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface-variant)', minWidth: 0, minHeight: 0 }
const headlineStyle: React.CSSProperties = { background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)', padding: '10px 14px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }
const searchWrapStyle: React.CSSProperties = { background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)', padding: '7px 14px', flexShrink: 0 }
const workAreaStyle: React.CSSProperties = { flex: 1, minHeight: 0, padding: '12px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }
const warningStyle: React.CSSProperties = { background: 'var(--warning-container)', borderBottom: '1px solid var(--warning-border)', padding: '7px 14px', fontSize: 'var(--text-sm)', color: 'var(--warning)', fontWeight: 500, flexShrink: 0 }
const modeCardStyle: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: 10, display: 'flex', flexDirection: 'column', gap: 8, boxShadow: 'var(--shadow-1)' }
const cardStyle: React.CSSProperties = { background: 'var(--surface)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }
const modeTitleStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, color: 'var(--on-surface)', fontSize: 'var(--text-base)', fontWeight: 700 }
const modeTabsStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4, background: 'var(--surface-container)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--outline-variant)', padding: 3 }
const modeBtnStyle = (active: boolean): React.CSSProperties => ({ border: 'none', cursor: 'pointer', borderRadius: 7, padding: '7px 8px', fontSize: 'var(--text-xs)', fontWeight: active ? 700 : 500, fontFamily: 'Manrope, sans-serif', background: active ? 'var(--primary)' : 'transparent', color: active ? '#fff' : 'var(--on-surface-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, whiteSpace: 'nowrap' })
const hintStyle: React.CSSProperties = { fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)', lineHeight: 1.45 }
const mobileSelectorsGridStyle: React.CSSProperties = { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 }
const inlineLabelStyle: React.CSSProperties = { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--on-surface-variant)', whiteSpace: 'nowrap', minWidth: 48 }
const fieldLabelStyle: React.CSSProperties = { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: 3 }
const resLabelStyle: React.CSSProperties = { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '.06em' }
const selectStyle: React.CSSProperties = { flex: 1, height: 34, border: '1px solid var(--outline)', borderRadius: 7, background: 'var(--surface)', padding: '0 9px', fontSize: 'var(--text-sm)', color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif', cursor: 'pointer' }
const mobileSelectStyle: React.CSSProperties = { ...selectStyle, width: '100%', minHeight: 44, flex: 'none' }
const textInputStyle: React.CSSProperties = { flex: 1, minWidth: 0, height: 38, border: '1px solid var(--outline)', borderRadius: 7, background: 'var(--surface-container)', padding: '0 10px', color: 'var(--on-surface)', fontSize: 'var(--text-sm)', fontFamily: 'Manrope, sans-serif' }
const primarySmallBtnStyle: React.CSSProperties = { border: 'none', borderRadius: 7, background: 'var(--primary)', color: '#fff', fontSize: 'var(--text-sm)', fontWeight: 700, fontFamily: 'Manrope, sans-serif', padding: '0 14px', cursor: 'pointer', whiteSpace: 'nowrap' }
const inputUnitWrapStyle: React.CSSProperties = { display: 'flex', alignItems: 'stretch', height: 38, border: '1px solid var(--outline)', borderRadius: 7, overflow: 'hidden', background: 'var(--surface)' }
const numberInputStyle: React.CSSProperties = { flex: 1, border: 'none', background: 'transparent', padding: '0 9px', fontSize: 'var(--text-sm)', color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif', outline: 'none', minWidth: 0 }
const unitStyle: React.CSSProperties = { padding: '0 8px', fontSize: 'var(--text-xs)', fontWeight: 500, color: 'var(--on-surface-variant)', borderInlineStart: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', background: 'var(--surface-container)', whiteSpace: 'nowrap' }
const qtyWrapStyle: React.CSSProperties = { display: 'flex', height: 38, border: '1px solid var(--outline)', borderRadius: 7, overflow: 'hidden' }
const qtyBtnStyle: React.CSSProperties = { width: 36, border: 'none', background: 'var(--surface-container)', color: 'var(--on-surface-variant)', fontSize: 18, fontWeight: 600, cursor: 'pointer', fontFamily: 'Manrope, sans-serif', flexShrink: 0 }
const qtyValueStyle: React.CSSProperties = { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--on-surface)', background: 'var(--surface)', borderInlineStart: '1px solid var(--outline-variant)', borderInlineEnd: '1px solid var(--outline-variant)' }
const primaryBtnStyle: React.CSSProperties = { background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: 7, padding: '10px 22px', fontSize: 'var(--text-sm)', fontWeight: 700, fontFamily: 'Manrope, sans-serif', cursor: 'pointer', alignSelf: 'flex-start' }
const resultBarStyle: React.CSSProperties = { background: 'var(--surface)', borderTop: '1px solid var(--outline-variant)', padding: '10px 14px', display: 'flex', alignItems: 'flex-start', flexShrink: 0, gap: 0 }
const resultValueStyle: React.CSSProperties = { fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--on-surface)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em' }
const tolerancePillStyle: React.CSSProperties = { marginInlineStart: 'auto', alignSelf: 'center', background: 'var(--primary-container)', color: 'var(--on-primary-container)', border: '1px solid var(--outline-variant)', borderRadius: 100, padding: '3px 10px', fontSize: 'var(--text-xs)', fontWeight: 500, whiteSpace: 'nowrap' }
const tolRangeStyle: React.CSSProperties = { marginTop: 2, fontSize: 'var(--text-xs)', color: 'var(--success)', fontVariantNumeric: 'tabular-nums' }
const quickChipStyle: React.CSSProperties = { border: '1px solid var(--outline-variant)', background: 'var(--surface-container)', color: 'var(--on-surface)', borderRadius: 999, padding: '2px 8px', fontSize: 'var(--text-xs)', fontWeight: 600 }
const chipsRowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)' }
const statusStyle = (kind: QuickStatus['kind']): React.CSSProperties => ({ background: kind === 'error' ? 'var(--error-container)' : kind === 'warning' ? 'var(--warning-container)' : 'var(--success-container)', color: kind === 'error' ? 'var(--error)' : kind === 'warning' ? 'var(--warning)' : 'var(--success)', borderRadius: 7, padding: '7px 9px', fontSize: 'var(--text-xs)', lineHeight: 1.4 })
const errorStyle: React.CSSProperties = { background: 'var(--error-container)', borderRadius: 6, padding: '7px 10px', fontSize: 'var(--text-xs)', color: 'var(--error)' }
const snackbarStyle: React.CSSProperties = { background: 'var(--surface-container)', borderRadius: 6, padding: '7px 10px', fontSize: 'var(--text-xs)', color: 'var(--on-surface)', lineHeight: 1.5 }
