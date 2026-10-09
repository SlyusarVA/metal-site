'use client'

import { tapeBasis, tapeCoefficient } from '@/data/aluminumTape'

import { plateBasis, plateCoefficient } from '@/data/aluminumPlate'

import { useEffect, useRef, useState } from 'react'
import { getWeightTolerance } from '@/data/gost'
import { ProfileKey } from '@/data/profiles'
import { parseQuickInput } from '@/lib/quickInputParser'
import ProfileIcon from './ProfileIcon'
import { isRectangular, profileGroupKey, rectangularName } from '@/data/profileNavigation'
import { isBrassBar } from '@/data/brassTolerance'
import { sheetBasis, sheetDensity } from '@/data/aluminumSheet'
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
  onContentHeight?: (height: number) => void
  isMobile?: boolean
  metalGroups?: string[]
  profiles?: ProfileOption[]
}

const modes: Record<CalcMode, { label: string; hint: string }> = {
  mass: { label: 'Расчёт массы', hint: 'Введите размеры и длину — масса рассчитается автоматически.' },
  length: { label: 'Расчёт длины', hint: 'Введите размеры и массу — длина рассчитается автоматически.' },
  quick: { label: 'Быстрый ввод', hint: 'Введите металл, марку, сортамент, размеры и массу одной строкой.' },
}

export default function CalcPanelLean({ calc, getGrades, onGostResult, onGostClear, onGostOpen, needsSortament, onContentHeight, isMobile = false, metalGroups = [], profiles = [] }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const workRef = useRef<HTMLDivElement>(null)
  const workContentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!onContentHeight || !panelRef.current || !workContentRef.current) return
    const measure = () => {
      if (!panelRef.current || !workContentRef.current) return
      const height = Array.from(panelRef.current.children).reduce((sum, child) => sum + (child === workRef.current ? workContentRef.current!.getBoundingClientRect().height + 24 : child.getBoundingClientRect().height), 0)
      onContentHeight(Math.ceil(height) + 2)
    }
    const observer = new ResizeObserver(measure)
    Array.from(panelRef.current.children).forEach(child => observer.observe(child))
    observer.observe(workContentRef.current)
    measure()
    return () => observer.disconnect()
  }, [onContentHeight])
  const { state, selectMetal, selectProfile, setParam, setLength, setMass, setQuantity, incrementQty, decrementQty, calculate } = calc
  const [selectedMode, setMode] = useState<CalcMode>('mass')
  const [calculationAttempted, setCalculationAttempted] = useState(false)
  const [exactOpen, setExactOpen] = useState(false)
  useEffect(() => {
    setCalculationAttempted(false)
    setExactOpen(false)
  }, [state.profileKey, state.metalGroup, state.grade])
  const isBrass = isBrassBar(state.profileKey, state.metalGroup)
  const isAluminumSheet = state.profileKey === 'sheet' && state.metalGroup === 'Алюминий' && state.flatUseGost
  const isAluminumPlate = state.profileKey === 'plate' && state.metalGroup === 'Алюминий' && state.flatUseGost
  const isAluminumTape = state.profileKey === 'strip' && state.metalGroup === 'Алюминий' && state.flatUseGost
  const tape = isAluminumTape ? tapeBasis(state.grade, state.params.t ?? NaN, state.params.b ?? NaN, state.tapeOptions) : null
  const plate = isAluminumPlate ? plateBasis(state.grade, state.params.t ?? NaN, state.params.b ?? NaN, state.plateOptions) : null
  const basis = isAluminumSheet ? sheetBasis(state.grade, state.params.t ?? NaN, state.params.b ?? NaN, state.sheetOptions) : null
  const mode = state.profile.isVolume && selectedMode === 'length' ? 'mass' : selectedMode
  const [quickInput, setQuickInput] = useState('Сталь 20 круг 16 масса 120 кг')
  const [quickStatus, setQuickStatus] = useState<QuickStatus | null>(null)
  const [quickChips, setQuickChips] = useState(['Сталь', '20', 'Круг', 'Ø16', '120 кг'])
  const grades = getGrades(state.metalGroup)
  const navigationKey = profiles.find(p => profileGroupKey(p.key) === profileGroupKey(state.profileKey))?.key ?? state.profileKey
  const resultMass = state.result?.target === 'mass' ? state.result.value : null
  const resultLength = state.result?.target === 'length' ? state.result.value : null
  const displayResult = mode === 'length' ? resultLength : resultMass
  const tolerance = isRectangular(state.profileKey) && !state.flatUseGost ? null : getWeightTolerance(state.profileKey, Object.fromEntries(Object.entries(state.params).filter(([, v]) => v !== null) as [string, number][]), state.metalGroup, state.brassOptions)
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
    if (mode !== 'length') {
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
    setMode(parsed.unsupportedReason ? 'mass' : 'length')
    setQuickChips(parsed.chips)
    setQuickStatus(parsed.unsupportedReason ? { kind: 'warning', message: parsed.unsupportedReason } : { kind: 'success', message: 'Данные перенесены в режим «Расчёт длины». Нажмите «Рассчитать».' })
  }

  return (
    <div ref={panelRef} style={st.panel}>
      <div style={st.head}>
        <ProfileIcon icon={isRectangular(state.profileKey) ? 'plate' : state.profile.icon} size={32} />
        {!isMobile && (
          <span style={st.headTitle}>
            <span style={st.headMetalSlot}><AnimatedText text={state.metalGroup} /></span>
            <span style={st.headSeparator}> · </span>
            <span style={st.headProfileSlot}><AnimatedText text={isRectangular(state.profileKey) ? rectangularName : state.profile.name} /></span>
          </span>
        )}
        <GostTags metalGroup={state.metalGroup} profile={state.profile} densityText={isAluminumTape ? (tapeCoefficient(state.grade) == null ? 'k: нет в Б.1' : `k = ${tapeCoefficient(state.grade)!.toFixed(3)}`) : isAluminumPlate ? (plateCoefficient(state.grade) == null ? "k: нет в Б.1" : `k = ${plateCoefficient(state.grade)!.toFixed(3)}`) : undefined} density={isAluminumSheet ? sheetDensity(state.grade) : state.density} onGostClick={onGostOpen} onProfileSelect={selectProfile} flatUseGost={state.flatUseGost} />
      </div>
      <div style={st.search}><GostSearchBar onResult={onGostResult} onClear={onGostClear} /></div>
      {needsSortament && <div style={st.warn}>Выберите сортамент</div>}
      <div ref={workRef} className="ui-scroll-area" style={st.work}>
        <div ref={workContentRef} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <section style={st.card}>
          <div style={st.cardTitle}>Калькулятор металла</div>
          <ModeTabs mode={mode} onSelect={switchMode} isVolume={!!state.profile.isVolume} />
          <div style={st.hint}><AnimatedText text={modes[mode].hint} /></div>
        </section>
        {mode === 'quick' && <section style={st.card}>
          <div style={st.quick}><input id="calc-quick-input" name="quick-input" aria-label="Быстрый ввод параметров" value={quickInput} onChange={e => setQuickInput(e.target.value)} style={st.textInput} /><button type="button" onClick={applyQuick} style={st.actionSmall}>Применить</button></div>
          <div style={st.chips}><span>Распознано:</span>{quickChips.map(x => <span key={x} style={st.chip}>{x}</span>)}</div>
        </section>}
        {quickStatus && <div role="status" style={status(quickStatus.kind)}>{quickStatus.message}</div>}
        {isMobile && <div style={st.mobilePickers}>
          <FieldSelect id="calc-mobile-metal" name="mobile-metal" label="Металл" value={state.metalGroup} onChange={setGroup} options={metalGroups.map(x => ({ value: x, label: x }))} />
          <FieldSelect id="calc-mobile-profile" name="mobile-profile" label="Сортамент" value={navigationKey} onChange={v => selectProfile(v as ProfileKey)} options={profiles.map(x => ({ value: x.key, label: x.name }))} />
        </div>}
        <div style={st.markRow}><span id="calc-grade-label" style={st.inlineLabel}>Марка</span><select id="calc-grade" name="grade" aria-labelledby="calc-grade-label" value={state.grade} onChange={e => selectMetal(state.metalGroup, e.target.value)} style={st.select}>{grades.map(x => <option key={x.grade}>{x.grade}</option>)}</select></div>
        {isBrass && <section style={st.card}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8 }}>
            <FieldSelect id="brass-manufacturing" name="brass-manufacturing" label="Изготовление прутка" value={state.brassOptions.manufacturing} onChange={v => calc.setBrassOptions({ manufacturing: v as 'drawn' | 'pressed' })} options={[{ value: 'drawn', label: 'Тянутый' }, { value: 'pressed', label: 'Прессованный' }]} />
            <FieldSelect id="brass-accuracy" name="brass-accuracy" label="Точность размера" value={state.brassOptions.accuracy} onChange={v => calc.setBrassOptions({ accuracy: v as 'high' | 'increased' | 'normal' })} options={[{ value: 'normal', label: 'Нормальная' }, { value: 'increased', label: 'Повышенная' }, ...(state.profileKey === 'rod' && state.brassOptions.manufacturing === 'drawn' ? [{ value: 'high', label: 'Высокая' }] : [])]} />
          </div>
          <div style={st.hint}>{tolerance ? 'Диапазон массы рассчитан по допуску размера сечения при неизменных длине и плотности. Это не отдельный нормативный допуск массы.' : 'Для выбранного размера, изготовления или точности нет подтверждённого табличного допуска. Рассчитывается только номинальная масса.'}</div>
        </section>}

        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 8 }}>
          {state.profile.params.map(p => <div key={p.key}><Label>{p.label}</Label><UnitInput id={`calc-param-${p.key}`} name={`param-${p.key}`} label={p.label} value={state.params[p.key] ?? ''} unit={p.unit} onChange={v => setParam(p.key, v)} /></div>)}
          {!state.profile.isVolume && <div><Label>{mode === 'length' ? 'Масса' : 'Длина L'}</Label><UnitInput id={mode === 'length' ? 'calc-mass' : 'calc-length'} name={mode === 'length' ? 'mass' : 'length'} label={mode === 'length' ? 'Масса' : 'Длина L'} value={mode === 'length' ? state.mass ?? '' : state.length ?? ''} unit={mode === 'length' ? 'кг.' : 'м.'} onChange={setSource} /></div>}
          <div><Label>Количество</Label><div style={st.qty}><button type="button" aria-label="Уменьшить количество" onClick={decrementQty} style={st.qtyBtn}>−</button><input id="calc-quantity" name="quantity" aria-label="Количество" type="number" min={1} step={1} value={state.quantity} onChange={e => setQuantity(e.target.value ? Number(e.target.value) : 1)} style={st.qtyInput} /><button type="button" aria-label="Увеличить количество" onClick={incrementQty} style={st.qtyBtn}>+</button></div></div>
        </div>
        <button type="button" onClick={() => { setCalculationAttempted(true); calculate(mode === 'length' ? 'length' : 'mass') }} style={st.action}>Рассчитать</button>
        {state.error && <ErrorMessage error={state.error} />}
        {state.snackbar && <div style={st.note}>{state.snackbar.message}</div>}
      <div style={{ ...st.result, marginInline: -14 }}>
        <div>
          <div style={st.resultLabel}>{mode === 'length' ? 'Длина' : 'Вес'}</div>
          <span style={st.resultValue}><AnimatedNumber value={displayResult} digits={3} /></span> <span style={st.unitText}>{mode === 'length' ? 'м' : 'кг'}</span>
          {massMin != null && massMax != null && <div style={st.tol}><AnimatedNumber value={massMin} digits={2} /> ··· <AnimatedNumber value={massMax} digits={2} /> кг</div>}
        </div>
        {state.result?.linearMass != null && state.result.linearMass > 0 && <div style={{ marginInlineStart: 18 }}><div style={st.resultLabel}>{state.profile.isVolume ? 'Масса штуки' : 'Погонный вес'}</div><b><AnimatedNumber value={state.result.linearMass} digits={4} /></b> <span style={st.unitText}>{state.profile.isVolume ? 'кг/шт' : 'кг/м'}</span></div>}
        {tolerance && mode === 'mass' && <span style={st.pill}>{tolerance.label}</span>}
      </div>
      {(isAluminumSheet || isAluminumPlate || isAluminumTape) && (calculationAttempted || state.result != null) && <div>
        <button type="button" aria-expanded={exactOpen} aria-controls={isAluminumTape ? "tape-exact-settings" : isAluminumPlate ? "plate-exact-settings" : "sheet-exact-settings"} onClick={() => setExactOpen(open => !open)} style={st.exactToggle}>
          <span aria-hidden="true" style={{ display: 'inline-block', transform: exactOpen ? 'rotate(180deg)' : undefined }}>⌄</span> Точный расчёт
        </button>
        {exactOpen && isAluminumSheet && <section id="sheet-exact-settings" style={st.card} aria-label="Расчёт по ГОСТ 21631-2023">
          <div style={st.cardTitle}>ГОСТ 21631-2023</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8 }}>
            <FieldSelect id="sheet-thickness-accuracy" name="sheet-thickness-accuracy" label="Точность толщины" value={state.sheetOptions.thicknessAccuracy} onChange={v => calc.setSheetOptions({ thicknessAccuracy: v as 'normal' | 'high' })} options={[{ value: 'normal', label: 'Нормальная' }, { value: 'high', label: 'Повышенная' }]} />
            <FieldSelect id="sheet-width-accuracy" name="sheet-width-accuracy" label="Точность ширины" value={state.sheetOptions.widthAccuracy} onChange={v => calc.setSheetOptions({ widthAccuracy: v as 'normal' | 'high' })} options={[{ value: 'normal', label: 'Нормальная' }, { value: 'high', label: 'Повышенная' }]} />
            <FieldSelect id="sheet-condition" name="sheet-condition" label="Состояние материала" value={state.sheetOptions.condition} onChange={v => calc.setSheetOptions({ condition: v as 'annealed' | 'untreated' | 'other' })} options={[{ value: 'annealed', label: 'Отожжённое' }, { value: 'untreated', label: 'Без термообработки' }, { value: 'other', label: 'Другое состояние' }]} />
          </div>
          <label style={st.hint}><input type="checkbox" checked={state.sheetOptions.symmetric} onChange={e => calc.setSheetOptions({ symmetric: e.target.checked })} /> Симметричный допуск толщины согласован с поставщиком</label>
          <div style={st.hint}>Расчёт по п. 4.1.1: обрезанные кромки, стандартные отклонения таблиц 1 и 3, плотность таблицы Б.1. Специальные условия поставки и допустимость сортамента по таблице 2 требуют отдельной проверки.</div>
          {typeof basis === 'string' ? <div role="status" style={st.warn}>{basis}</div> : basis && <div style={st.hint}>Толщина: {basis.thicknessMin.toFixed(3)}–{basis.thicknessMax.toFixed(3)} мм; ширина: {basis.widthMin}–{basis.widthMax} мм. Для массы: {basis.meanThickness.toFixed(3)} × {basis.meanWidth} мм, ρ = {basis.density} кг/м³.</div>}
        </section>}
        {exactOpen && isAluminumTape && <section id="tape-exact-settings" style={st.card} aria-label="Расчёт по ГОСТ 13726-2023">
          <div style={st.cardTitle}>ГОСТ 13726-2023</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8 }}>
            <FieldSelect id="tape-accuracy" name="tape-accuracy" label="Толщина" value={state.tapeOptions.accuracy} onChange={v => calc.setTapeOptions({ accuracy: v as 'normal' | 'high' | 'symmetric' })} options={[{ value: 'normal', label: 'Базовое исполнение' }, { value: 'high', label: 'Повышенная точность' }, { value: 'symmetric', label: 'Симметричные отклонения' }]} />
            <FieldSelect id="tape-manufacturing" name="tape-manufacturing" label="Изготовление" value={state.tapeOptions.manufacturing} onChange={v => calc.setTapeOptions({ manufacturing: v as 'rolled' | 'slit' })} options={[{ value: 'rolled', label: 'Прокатка требуемой ширины' }, { value: 'slit', label: 'Продольная резка' }]} />
            {state.tapeOptions.manufacturing === 'rolled' && <FieldSelect id="tape-edges" name="tape-edges" label="Кромки" value={state.tapeOptions.edges} onChange={v => calc.setTapeOptions({ edges: v as 'trimmed' | 'untrimmed' })} options={[{ value: 'trimmed', label: 'Обрезанные' }, { value: 'untrimmed', label: 'Без обрезки' }]} />}
          </div>
          {state.tapeOptions.manufacturing === 'slit' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 8 }}>
            <div><Label>Исходная ширина</Label><UnitInput id="tape-parent-width" name="tape-parent-width" label="Исходная ширина" value={state.tapeOptions.parentWidth ?? ''} unit="мм" onChange={v => calc.setTapeOptions({ parentWidth: v })} /></div>
            <div><Label>Допуск ширины −</Label><UnitInput id="tape-width-minus" name="tape-width-minus" label="Минусовое отклонение ширины" value={state.tapeOptions.widthMinus ?? ''} unit="мм" onChange={v => calc.setTapeOptions({ widthMinus: v })} /></div>
            <div><Label>Допуск ширины +</Label><UnitInput id="tape-width-plus" name="tape-width-plus" label="Плюсовое отклонение ширины" value={state.tapeOptions.widthPlus ?? ''} unit="мм" onChange={v => calc.setTapeOptions({ widthPlus: v })} /></div>
          </div>}
          {typeof tape === 'string' ? <div role="status" style={st.warn}>{tape}</div> : tape && <>
            <div style={st.hint}>Толщина: {tape.thicknessMin.toFixed(3)}–{tape.thicknessMax.toFixed(3)} мм ({tape.symmetric ? 'симметричные отклонения' : 'минусовой допуск'}); ширина: {tape.widthMin.toFixed(2)}–{tape.widthMax.toFixed(2)} мм.</div>
            <div style={st.hint}>Средние размеры: {tape.meanThickness.toFixed(3)} × {tape.meanWidth.toFixed(2)} мм · базовая масса {tape.referenceMass.toFixed(4)} кг/м × коэффициент Б.1 {tape.coefficient.toFixed(3)} = {tape.linearMass.toFixed(4)} кг/м.{state.tapeOptions.manufacturing === 'slit' ? ' Допуск толщины взят для исходной ширины ' + tape.thicknessWidth + ' мм.' : ''}</div>
          </>}
          <div style={st.hint}>По умолчанию — базовая точность, прокатка и обрезанные кромки. При толщине от 5 мм таблица 2 задаёт только симметричные отклонения. Состояние, плакировку и допустимость поставки по таблице 1 уточните при заказе.</div>
        </section>}
        {exactOpen && isAluminumPlate && <section id="plate-exact-settings" style={st.card} aria-label="Расчёт по ГОСТ 17232-2023">
          <div style={st.cardTitle}>ГОСТ 17232-2023</div>
          <FieldSelect id="plate-accuracy" name="plate-accuracy" label="Точность толщины" value={state.plateOptions.accuracy} onChange={v => calc.setPlateOptions({ accuracy: v as 'normal' | 'high' })} options={[{ value: 'normal', label: 'Нормальная — базовое исполнение' }, { value: 'high', label: 'Повышенная' }]} />
          {typeof plate === 'string' ? <div role="status" style={st.warn}>{plate}</div> : plate && <>
            <div style={st.hint}>{plate.method === 'table' ? 'Масса по таблице А.1' : 'В таблице А.1 этих размеров нет: расчёт по средним предельным размерам'} · коэффициент Б.1: {plate.coefficient.toFixed(3)}. Базовая масса: {plate.referenceMass.toFixed(3)} кг/м × {plate.coefficient.toFixed(3)} = {plate.linearMass.toFixed(4)} кг/м.</div>
            <div style={st.hint}>Толщина: {plate.thicknessMin.toFixed(2)}–{plate.thicknessMax.toFixed(2)} мм; ширина: {plate.widthMin}–{plate.widthMax} мм. Допуск толщины симметричный: точность меняет границы размера, а не табличную массу.</div>
            {plate.warning && <div role="status" style={st.warn}>{plate.warning}</div>}
          </>}
          <div style={st.hint}>Расчёт на введённую длину. Допуски длины и специальные условия поставки не включены; для резаных заготовок размеры уточняются по заказу.</div>
        </section>}
      </div>}
      </div>
      </div>
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) { return <div style={st.label}>{children}</div> }
function UnitInput({ id, name, label, value, unit, onChange }: { id: string; name: string; label: string; value: number | string; unit: string; onChange: (v: number | null) => void }) { return <div style={st.unitWrap}><input id={id} name={name} aria-label={label} type="number" min={0} step={0.1} value={value} onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : null)} style={st.input} /><span style={st.unit}>{unit}</span></div> }
function FieldSelect({ id, name, label, value, onChange, options }: { id: string; name: string; label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) { return <label htmlFor={id} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><Label>{label}</Label><select id={id} name={name} value={value} onChange={e => onChange(e.target.value)} style={st.mobileSelect}>{options.map(x => <option key={x.value} value={x.value}>{x.label}</option>)}</select></label> }
function status(kind: QuickStatus['kind']): React.CSSProperties { return { padding: '7px 9px', borderRadius: 7, fontSize: 'var(--text-xs)', background: kind === 'error' ? 'var(--error-container)' : kind === 'warning' ? 'var(--warning-container)' : 'var(--success-container)', color: kind === 'error' ? 'var(--error)' : kind === 'warning' ? 'var(--warning)' : 'var(--success)' } }

function ModeTabs({ mode, onSelect, isVolume }: { mode: CalcMode; onSelect: (mode: CalcMode) => void; isVolume: boolean }) {
  const barRef = useRef<HTMLDivElement>(null)
  const pillRef = useRef<HTMLSpanElement>(null)
  const readyRef = useRef(false)

  function moveToActive(animate: boolean) {
    const bar = barRef.current
    const pill = pillRef.current
    const active = bar?.querySelector<HTMLButtonElement>('.t-tab[aria-selected="true"]')
    if (!bar || !pill || !active) return

    const previousTransition = pill.style.transition
    if (!animate) pill.style.transition = 'none'
    pill.style.transform = `translateX(${active.offsetLeft}px)`
    pill.style.width = `${active.offsetWidth}px`
    if (!animate) {
      void pill.offsetWidth
      pill.style.transition = previousTransition
    }
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      moveToActive(false)
      readyRef.current = true
    })
    const onResize = () => moveToActive(false)
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
    }
  }, [])

  useEffect(() => {
    if (readyRef.current) moveToActive(true)
  }, [mode])

  return (
    <div ref={barRef} className="t-tabs" role="tablist" aria-label="Режим расчёта" style={{ ...st.tabs, gridTemplateColumns: `repeat(${isVolume ? 2 : 3},minmax(0,1fr))` }}>
      <span ref={pillRef} className="t-tabs-pill" aria-hidden="true" style={{ height: 'calc(100% - 6px)' }} />
      {(['mass', 'length', 'quick'] as const).filter(item => !isVolume || item !== 'length').map(item => (
        <button
          key={item}
          type="button"
          role="tab"
          aria-selected={mode === item}
          className="t-tab"
          onClick={() => onSelect(item)}
          style={{ ...st.tab, height: 'auto', minHeight: 44 }}
        >
          {modes[item].label}
        </button>
      ))}
    </div>
  )
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

function ErrorMessage({ error }: { error: { message: string } }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return
    element.classList.remove('is-shaking')
    void element.offsetWidth
    element.classList.add('is-shaking')
  }, [error])

  return (
    <div className="t-input-wrap is-error" style={st.errorWrap}>
      <div ref={ref} className="t-input is-error" style={st.error}>
        <p className="t-error-msg" style={st.errorMsg}>{error.message}</p>
      </div>
    </div>
  )
}

const st: Record<string, React.CSSProperties> = {
  panel: { flex: 1, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface-variant)' },
  head: { flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 14px', background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)', overflow: 'hidden' },
  headTitle: { fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--on-surface)', display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'nowrap', flexShrink: 0 },
  headMetalSlot: { display: 'inline-block', width: 112, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  headProfileSlot: { display: 'inline-block', width: 145, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  headSeparator: { color: 'var(--on-surface-variant)', flexShrink: 0 },
  search: { flexShrink: 0, padding: '7px 14px', background: 'var(--surface)', borderBottom: '1px solid var(--outline-variant)' },
  warn: { flexShrink: 0, padding: '7px 14px', color: 'var(--warning)', background: 'var(--warning-container)' },
  work: { flex: '0 1 auto', minHeight: 0, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 },
  card: { padding: 10, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-md)', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 8 },
  cardTitle: { fontWeight: 700, color: 'var(--on-surface)' },
  tabs: { display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 4, padding: 3, border: '1px solid var(--outline-variant)', borderRadius: 'var(--radius-sm)', background: 'var(--surface-container)', ['--tabs-bar-bg' as string]: 'var(--surface-container)', ['--tabs-pill-bg' as string]: 'var(--primary)', ['--tabs-text-muted' as string]: 'var(--on-surface-variant)', ['--tabs-text-active' as string]: '#fff' },
  tab: { width: '100%', padding: '4px 8px', fontWeight: 600, fontFamily: 'Manrope, sans-serif' },
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
  exactToggle: { display: 'flex', alignItems: 'center', gap: 8, minHeight: 40, padding: '4px 0', border: 'none', background: 'transparent', color: 'var(--primary)', font: 'inherit', fontWeight: 600, cursor: 'pointer' },
  resultLabel: { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '.06em' },
  resultValue: { fontSize: 'var(--text-xl)', fontWeight: 700, color: 'var(--on-surface)' },
  unitText: { fontSize: 'var(--text-sm)', color: 'var(--on-surface-variant)' },
  linearMass: { fontWeight: 600 },
  tol: { marginTop: 2, fontSize: 'var(--text-xs)', color: 'var(--success)' },
  pill: { marginInlineStart: 'auto', alignSelf: 'center', padding: '3px 10px', borderRadius: 100, border: '1px solid var(--outline-variant)', background: 'var(--primary-container)', color: 'var(--on-primary-container)', fontSize: 'var(--text-xs)' },
}
