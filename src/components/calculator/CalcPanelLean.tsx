'use client'

import { useEffect, useRef, useState } from 'react'
import { getWeightTolerance } from '@/data/gost'
import { ProfileKey } from '@/data/profiles'
import { parseQuickInput } from '@/lib/quickInputParser'
import GostTags from './GostTags'
import GostSearchBar from './GostSearchBar'

type CalcMode = 'mass' | 'length' | 'quick'
type QuickStatus = { kind: 'success' | 'warning' | 'error'; message: string }
type ProfileOption = { key: ProfileKey; name: string }

interface Props {
  calc: ReturnType<typeof import('@/hooks/useCalculator').useCalculator>
  getGrades: (group: string) => import('@/data/materials').MetalMaterial[]
  onGostResult: (metalGroups: string[], profileKeys: ProfileKey[], grade?: string) => void
  needsSortament?: boolean
  onGostClear: () => void
  onGostOpen: (code: string) => void
  isMobile?: boolean
  metalGroups?: string[]
  profiles?: ProfileOption[]
}

const modes: Record<CalcMode, { label: string; hint: string }> = {
  mass: { label: 'Расчёт массы', hint: 'Введите размеры и длину — масса рассчитается автоматически.' },
  length: { label: 'Расчёт длины', hint: 'Введите размеры и массу — длина рассчитается автоматически.' },
  quick: { label: 'Быстрый ввод', hint: 'Введите металл, марку, сортамент, размеры и массу одной строкой.' },
}

export default function CalcPanelLean({ calc, getGrades, onGostResult, onGostClear, onGostOpen, needsSortament, isMobile = false, metalGroups = [], profiles = [] }: Props) {
  const { state, selectMetal, selectProfile, setParam, setLength, setMass, setQuantity, incrementQty, decrementQty, calculate } = calc
  const [mode, setMode] = useState<CalcMode>('mass')
  const [quickInput, setQuickInput] = useState('Сталь 20 круг 16 масса 120 кг')
  const [quickStatus, setQuickStatus] = useState<QuickStatus | null>(null)
  const [quickChips, setQuickChips] = useState(['Сталь', '20', 'Круг', 'Ø16', '120 кг'])
  const grades = getGrades(state.metalGroup)
  const resultMass = state.result?.target === 'mass' ? state.result.value : null
  const resultLength = state.result?.target === 'length' ? state.result.value : null
  const displayResult = mode === 'length' ? resultLength : resultMass
  const tolerance = getWeightTolerance(state.profileKey, Object.fromEntries(Object.entries(state.params).filter(([, v]) => v !== null) as [string, number][]))
  const massMin = mode === 'mass' && resultMass != null && tolerance ? resultMass * (1 - tolerance.minus) : null
  const massMax = mode === 'mass' && resultMass != null && tolerance ? resultMass * (1 + tolerance.plus) : null
  const gridCols = isMobile ? 'repeat(2,minmax(0,1fr))' : 'repeat(auto-fill,minmax(140px,1fr))'

  function switchMode(next: CalcMode) {
    setMode(next)
    setQuickStatus(null)
    if (next === 'mass') setMass(null)
    if (next === 'length') setLength(null)
  }

  function setSource(value: number | null) {
    if (mode === 'mass') {
      setMass(null)
      setLength(value)
    } else {
      setLength(null)
      setMass(value)
    }
  }

  function setGroup(group: string) {
    const firstGrade = getGrades(group)[0]?.grade
    if (firstGrade) selectMetal(group, firstGrade)
  }

  function applyQuick() {
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
    setMode('length')
    setQuickChips(parsed.chips)
    setQuickStatus(parsed.unsupportedReason ? { kind: 'warning', message: parsed.unsupportedReason } : { kind: 'success', message: 'Данные перенесены в режим «Расчёт длины». Нажмите «Рассчитать».' })
  }

  return (
    <div style={st.panel}>
      <div style={st.head}>
        <span style={st.headTitle}><AnimatedText text={`${state.metalGroup} · ${state.profile.name}`} /></span>
        <GostTags profile={state.profile} density={state.density} onGostClick={onGostOpen} />
      </div>
      <div style={st.search}><GostSearchBar onResult={onGostResult} onClear={onGostClear} /></div>
      {needsSortament && <div style={st.warn}>Выберите сортамент</div>}
      <div className="ui-scroll-area" style={st.work}>
        <section style={st.card}>
          <div style={st.cardTitle}>Калькулятор металла</div>
          <div style={st.tabs}>{(['mass', 'length', 'quick'] as const).map(x => <button key={x} onClick={() => switchMode(x)} style={tab(mode === x)}>{modes[x].label}</button>)}</div>
          <div style={st.hint}><AnimatedText text={modes[mode].hint} /></div>
        </section>
        {mode === 'quick' && <section style={st.card}>
          <div style={st.quick}><input value={quickInput} onChange={e => setQuickInput(e.target.value)} style={st.textInput} /><button onClick={applyQuick} style={st.actionSmall}>Применить</button></div>
          <div style={st.chips}><span>Распознано:</span>{quickChips.map(x => <span key={x} style={st.chip}>{x}</span>)}</div>
          {quickStatus && <div style={status(quickStatus.kind)}>{quickStatus.message}</div>}
        </section>}
        {isMobile && <div style={st.mobilePickers}>
          <FieldSelect label="Металл" value={state.metalGroup} onChange={setGroup} options={metalGroups.map(x => ({ value: x, label: x }))} />
          <FieldSelect label="Сортамент" value={state.profileKey} onChange={v => selectProfile(v as ProfileKey)} options={profiles.map(x => ({ value: x.key, label: x.name }))} />
        </div>}
        <div style={st.markRow}><span style={st.inlineLabel}>Марка</span><select value={state.grade} onChange={e => selectMetal(state.metalGroup, e.target.value)} style={st.select}>{grades.map(x => <option key={x.grade}>{x.grade}</option>)}</select></div>
        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 8 }}>
          {state.profile.params.map(p => <div key={p.key}><Label>{p.label}</Label><UnitInput value={state.params[p.key] ?? ''} unit={p.unit} onChange={v => setParam(p.key, v)} /></div>)}
          {!state.profile.isVolume && <div><Label>{mode === 'length' ? 'Масса' : 'Длина L'}</Label><UnitInput value={mode === 'length' ? state.mass ?? '' : state.length ?? ''} unit={mode === 'length' ? 'кг.' : 'м.'} onChange={setSource} /></div>}
          <div><Label>Количество</Label><div style={st.qty}><button onClick={decrementQty} style={st.qtyBtn}>−</button><input type="number" min={1} step={1} value={state.quantity} onChange={e => setQuantity(e.target.value ? Number(e.target.value) : 1)} style={st.qtyInput} /><button onClick={incrementQty} style={st.qtyBtn}>+</button></div></div>
        </div>
        <button onClick={calculate} style={st.action}>Рассчитать</button>
        {state.error && <ErrorMessage message={state.error.message} />}
        {state.snackbar && <div style={st.note}>{state.snackbar.message}</div>}
      </div>
      <div style={st.result}>
        <div>
          <div style={st.resultLabel}>{mode === 'length' ? 'Длина' : 'Вес'}</div>
          <span style={st.resultValue}><AnimatedNumber value={displayResult} digits={3} /></span> <span style={st.unitText}>{mode === 'length' ? 'м' : 'кг'}</span>
          {massMin != null && massMax != null && <div style={st.tol}><AnimatedNumber value={massMin} digits={2} /> ··· <AnimatedNumber value={massMax} digits={2} /> кг</div>}
        </div>
        {state.result?.linearMass != null && state.result.linearMass > 0 && <div style={{ marginInlineStart: 18 }}><div style={st.resultLabel}>Погонный вес</div><b><AnimatedNumber value={state.result.linearMass} digits={4} /></b> <span style={st.unitText}>кг/м</span></div>}
        {tolerance && mode === 'mass' && <span style={st.pill}>{tolerance.label}</span>}
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) { return <div style={st.label}>{children}</div> }
function UnitInput({ value, unit, onChange }: { value: number | string; unit: string; onChange: (v: number | null) => void }) { return <div style={st.unitWrap}><input type="number" min={0} step={0.1} value={value} onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : null)} style={st.input} /><span style={st.unit}>{unit}</span></div> }
function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) { return <label style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><Label>{label}</Label><select value={value} onChange={e => onChange(e.target.value)} style={st.mobileSelect}>{options.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}</select></label> }
function tab(active: boolean): React.CSSProperties { return { border: 'none', borderRadius: 7, padding: '7px 8px', background: active ? 'var(--primary)' : 'transparent', color: active ? '#fff' : 'var(--on-surface-variant)', fontWeight: active ? 700 : 500, fontFamily: 'Manrope, sans-serif', cursor: 'pointer' } }
function status(kind: QuickStatus['kind']): React.CSSProperties { return { padding: '7px 9px', borderRadius: 7, fontSize: 'var(--text-xs)', background: kind === 'error' ? 'var(--error-container)' : kind === 'warning' ? 'var(--warning-container)' : 'var(--success-container)', color: kind === 'error' ? 'var(--error)' : kind === 'warning' ? 'var(--warning)' : 'var(--success)' } }

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

function AnimatedNumber({ value, digits }: { value: number | null; digits: number }) {
  if (value == null) return <>—</>

  const text = value.toFixed(digits)
  const chars = text.split('')
  return (
    <span
      key={text}
      className="t-digit-group is-animating"
      style={{
        '--digit-dur': '220ms',
        '--digit-stagger': '24ms',
        '--digit-distance': '4px',
        '--digit-blur': '1px',
      } as React.CSSProperties}
    >
      {chars.map((char, index) => (
        <span
          key={`${char}-${index}`}
          className="t-digit"
          data-stagger={index === chars.length - 2 ? '1' : index === chars.length - 1 ? '2' : undefined}
        >
          {char}
        </span>
      ))}
    </span>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div key={message} className="t-input-wrap is-error" style={st.errorWrap}>
      <div className="t-input is-error is-shaking" style={st.error}>
        <p className="t-error-msg" style={st.errorMsg}>{message}</p>
      </div>
    </div>
  )
}

const st: Record<string, React.CSSProperties> = {
  panel: { flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface-variant)' },
  head: { flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 14px', background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' },
  headTitle: { fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--on-surface)' },
  search: { flexShrink: 0, padding: '7px 14px', background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' },
  warn: { flexShrink: 0, padding: '7px 14px', color: 'var(--warning)', background: 'var(--warning-container)' },
  work: { flex: '0 1 auto', minHeight: 0, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 },
  card: { padding: 10, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 8 },
  cardTitle: { fontWeight: 700, color: 'var(--on-surface)' },
  tabs: { display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 4, padding: 3, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-container)' },
  hint: { fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)' },
  quick: { display: 'flex', gap: 8 },
  textInput: { flex: 1, minWidth: 0, height: 38, padding: '0 10px', border: '1px solid var(--outline)', borderRadius: 7, background: 'var(--surface-container)', color: 'var(--on-surface)' },
  actionSmall: { border: 'none', borderRadius: 7, padding: '0 14px', background: 'var(--primary)', color: '#fff', fontWeight: 700 },
  chips: { display: 'flex', gap: 6, flexWrap: 'wrap', fontSize: 'var(--text-xs)', color: 'var(--on-surface-variant)' },
  chip: { border: '1px solid var(--outline-variant)', borderRadius: 999, padding: '2px 8px', background: 'var(--surface-container)' },
  mobilePickers: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 8 },
  markRow: { display: 'flex', alignItems: 'center', gap: 8, maxWidth: 440 },
  inlineLabel: { minWidth: 48, fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--on-surface-variant)' },
  label: { marginBottom: 3, fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '.06em' },
  select: { flex: 1, minWidth: 0, height: 34, padding: '0 9px', border: '1px solid var(--outline)', borderRadius: 7, background: 'var(--surface)', color: 'var(--on-surface)' },
  mobileSelect: { height: 44, padding: '0 9px', border: '1px solid var(--outline)', borderRadius: 7, background: 'var(--surface)', color: 'var(--on-surface)' },
  unitWrap: { display: 'flex', height: 38, overflow: 'hidden', border: '1px solid var(--outline)', borderRadius: 7, background: 'var(--surface)' },
  input: { flex: 1, minWidth: 0, border: 'none', outline: 'none', padding: '0 9px', background: 'transparent', color: 'var(--on-surface)' },
  unit: { display: 'flex', alignItems: 'center', padding: '0 8px', borderInlineStart: '1px solid var(--outline-variant)', background: 'var(--surface-container)', color: 'var(--on-surface-variant)' },
  qty: { display: 'flex', height: 38, overflow: 'hidden', border: '1px solid var(--outline)', borderRadius: 7 },
  qtyBtn: { width: 36, border: 'none', background: 'var(--surface-container)', color: 'var(--on-surface-variant)', fontSize: 18 },
  qtyInput: { flex: 1, minWidth: 48, border: 'none', outline: 'none', textAlign: 'center', background: 'var(--surface)', color: 'var(--on-surface)', fontWeight: 700 },
  action: { alignSelf: 'flex-start', border: 'none', borderRadius: 7, padding: '10px 22px', background: 'var(--primary)', color: '#fff', fontWeight: 700 },
  errorWrap: { width: '100%' },
  error: { padding: '7px 10px', borderRadius: 6, border: '1px solid var(--error)', background: 'var(--error-container)', color: 'var(--error)', fontSize: 'var(--text-xs)' },
  errorMsg: { margin: 0 },
  note: { padding: '7px 10px', borderRadius: 6, background: 'var(--surface-container)', color: 'var(--on-surface)', fontSize: 'var(--text-xs)' },
  result: { flexShrink: 0, display: 'flex', alignItems: 'flex-start', padding: '10px 14px', borderTop: '1px solid var(--outline-variant)', background: 'var(--surface)' },
  resultLabel: { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '.06em' },
  resultValue: { fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--on-surface)' },
  unitText: { fontSize: 'var(--text-sm)', color: 'var(--on-surface-variant)' },
  linearMass: { fontWeight: 600 },
  tol: { marginTop: 2, fontSize: 'var(--text-xs)', color: 'var(--success)' },
  pill: { marginInlineStart: 'auto', alignSelf: 'center', padding: '3px 10px', borderRadius: 100, border: '1px solid var(--outline-variant)', background: 'var(--primary-container)', color: 'var(--on-primary-container)', fontSize: 'var(--text-xs)' },
}
