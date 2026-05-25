'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getWeightTolerance } from '@/data/gost'
import { profiles, ProfileKey } from '@/data/profiles'
import GostTags from './GostTags'
import GostSearchBar from './GostSearchBar'

type CalcMode = 'mass' | 'length' | 'quick'

interface Props {
  calc: ReturnType<typeof import('@/hooks/useCalculator').useCalculator>
  getGrades: (group: string) => import('@/data/materials').MetalMaterial[]
  onGostResult: (metalGroups: string[], profileKeys: ProfileKey[], grade?: string) => void
  needsSortament?: boolean
  onGostClear: () => void
}

const MODE_META: Record<CalcMode, { label: string; icon: string; hint: string }> = {
  mass: {
    label: 'Расчёт массы',
    icon: '⚖',
    hint: 'Введите размеры и длину — масса рассчитается автоматически.',
  },
  length: {
    label: 'Расчёт длины',
    icon: '▱',
    hint: 'Введите размеры и массу — длина рассчитается автоматически.',
  },
  quick: {
    label: 'Быстрый ввод',
    icon: '⚡',
    hint: 'Введите металл, марку, сортамент, размеры и массу одной строкой.',
  },
}

export default function CalcPanel({ calc, getGrades, onGostResult, onGostClear, needsSortament }: Props) {
  const router = useRouter()
  const {
    state,
    selectMetal,
    selectProfile,
    setParam,
    setLength,
    setMass,
    incrementQty,
    decrementQty,
    calculate,
  } = calc

  const [calcMode, setCalcMode] = useState<CalcMode>('mass')
  const [quickInput, setQuickInput] = useState('Сталь 20 круг 16 масса 120 кг')
  const [quickStatus, setQuickStatus] = useState<string | null>(null)

  const grades = getGrades(state.metalGroup)
  const tolerance = getWeightTolerance(state.profileKey, Object.fromEntries(
    Object.entries(state.params).filter(([, v]) => v !== null) as [string, number][]
  ))

  const resultMass = state.result?.target === 'mass' ? state.result.value : (state.mass ?? null)
  const resultLength = state.result?.target === 'length' ? state.result.value : (state.length ?? null)
  const displayResult = calcMode === 'mass' ? resultMass : calcMode === 'length' ? resultLength : state.result?.value ?? null

  const massMin = calcMode === 'mass' && resultMass != null && tolerance != null ? resultMass * (1 - tolerance.minus) : null
  const massMax = calcMode === 'mass' && resultMass != null && tolerance != null ? resultMass * (1 + tolerance.plus) : null

  const gridFieldCount = state.profile.params.length + (state.profile.isVolume ? 0 : 2) + 1
  const gridCols = gridFieldCount <= 2 ? '1fr' : 'repeat(auto-fill, minmax(140px, 1fr))'

  function handleModeChange(mode: CalcMode) {
    setCalcMode(mode)
    if (mode === 'mass') setMass(null)
    if (mode === 'length') setLength(null)
  }

  function handleSourceValueChange(value: number | null) {
    if (calcMode === 'mass') {
      setMass(null)
      setLength(value)
      return
    }

    if (calcMode === 'length') {
      setLength(null)
      setMass(value)
    }
  }

  function applyQuickInput() {
    const normalized = quickInput.toLowerCase().replace(',', '.')
    const massMatch = normalized.match(/(?:масса|вес)?\s*(\d+(?:\.\d+)?)\s*(?:кг|kg)\b/)
    const numbers = normalized.match(/\d+(?:\.\d+)?/g) ?? []
    const profile = profiles.find(p => normalized.includes(p.name.toLowerCase().replace('.', ''))) ??
      (normalized.includes('круг') ? profiles.find(p => p.key === 'round') : undefined)

    const gradeCandidate = grades.find(g => normalized.includes(g.grade.toLowerCase()))
    const diameterCandidate = numbers
      .map(Number)
      .find(n => n > 0 && n < 1000 && (!massMatch || Math.abs(n - Number(massMatch[1])) > 0.0001))

    if (profile) selectProfile(profile.key)
    if (gradeCandidate) selectMetal(state.metalGroup, gradeCandidate.grade)
    if (profile?.params.length === 1 && diameterCandidate != null) setParam(profile.params[0].key, diameterCandidate)
    if (massMatch) {
      setCalcMode('length')
      setLength(null)
      setMass(Number(massMatch[1]))
      setQuickStatus('Данные перенесены в режим «Расчёт длины». Нажмите «Рассчитать».')
      return
    }

    setQuickStatus('Не удалось распознать массу. Пример: «Сталь 20 круг 16 масса 120 кг».')
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--surface-variant)',
      minWidth: 0,
    }}>

      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--outline-variant)',
        padding: '10px 14px',
        flexShrink: 0,
        display: 'flex', alignItems: 'center',
        gap: 10, flexWrap: 'wrap',
      }}>
        <span style={{
          fontSize: 'var(--text-base)', fontWeight: 600,
          color: 'var(--on-surface)', whiteSpace: 'nowrap',
        }}>
          {state.metalGroup} · {state.profile.name}
        </span>
        <GostTags
          profile={state.profile}
          density={state.density}
          onGostClick={(code) => router.push(`/gost/${encodeURIComponent(code)}`)}
        />
      </div>

      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--outline-variant)',
        padding: '7px 14px', flexShrink: 0,
      }}>
        <GostSearchBar onResult={onGostResult} onClear={onGostClear} />
      </div>

      {needsSortament && (
        <div style={{
          background: 'var(--warning-container)',
          borderBottom: '1px solid var(--warning-border)',
          padding: '7px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 'var(--text-sm)', color: 'var(--warning)', fontWeight: 500,
          flexShrink: 0,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }} aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Выберите сортамент в колонке слева
        </div>
      )}

      <div style={{
        flex: 1, padding: '12px 14px',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>

        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--outline-variant)',
          borderRadius: 'var(--radius-md)',
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          boxShadow: 'var(--shadow-1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            color: 'var(--on-surface)',
            fontSize: 'var(--text-base)' as string,
            fontWeight: 700,
          }}>
            <span style={{ color: 'var(--primary)' }}>⚡</span>
            Калькулятор металла
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: 4,
            background: 'var(--surface-container)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--outline-variant)',
            padding: 3,
          }}>
            {(['mass', 'length', 'quick'] as const).map(mode => {
              const active = calcMode === mode
              return (
                <button
                  key={mode}
                  onClick={() => handleModeChange(mode)}
                  aria-pressed={active}
                  style={{
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: 7,
                    padding: '7px 10px',
                    fontSize: 'var(--text-xs)' as string,
                    fontWeight: active ? 700 : 500,
                    fontFamily: 'Manrope, sans-serif',
                    background: active ? 'var(--primary)' : 'transparent',
                    color: active ? '#fff' : 'var(--on-surface-variant)',
                    transition: 'background .15s, color .15s',
                    whiteSpace: 'nowrap',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <span aria-hidden="true">{MODE_META[mode].icon}</span>
                  {MODE_META[mode].label}
                </button>
              )
            })}
          </div>

          <div style={{
            fontSize: 'var(--text-xs)' as string,
            color: 'var(--on-surface-variant)',
            lineHeight: 1.45,
          }}>
            {MODE_META[calcMode].hint}
          </div>
        </div>

        {calcMode === 'quick' && (
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--outline-variant)',
            borderRadius: 'var(--radius-md)',
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                value={quickInput}
                onChange={e => setQuickInput(e.target.value)}
                placeholder="Сталь 20 круг 16 масса 120 кг"
                style={{
                  flex: 1,
                  height: 34,
                  border: '1px solid var(--outline)',
                  borderRadius: 7,
                  background: 'var(--surface-container)',
                  padding: '0 10px',
                  color: 'var(--on-surface)',
                  fontSize: 'var(--text-sm)' as string,
                  fontFamily: 'Manrope, sans-serif',
                  outline: 'none',
                }}
              />
              <button
                onClick={applyQuickInput}
                style={{
                  border: 'none',
                  borderRadius: 7,
                  background: 'var(--primary)',
                  color: '#fff',
                  fontSize: 'var(--text-sm)' as string,
                  fontWeight: 700,
                  fontFamily: 'Manrope, sans-serif',
                  padding: '0 14px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Применить
              </button>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              flexWrap: 'wrap',
              fontSize: 'var(--text-xs)' as string,
              color: 'var(--on-surface-variant)',
            }}>
              <span>Пример:</span>
              {['Сталь', '20', 'Круг Ø16', '120 кг'].map(item => (
                <span key={item} style={quickChipStyle}>{item}</span>
              ))}
            </div>

            {quickStatus && (
              <div style={{
                background: quickStatus.startsWith('Не удалось') ? 'var(--error-container)' : 'var(--success-container)',
                color: quickStatus.startsWith('Не удалось') ? 'var(--error)' : 'var(--success)',
                borderRadius: 7,
                padding: '7px 9px',
                fontSize: 'var(--text-xs)' as string,
                lineHeight: 1.4,
              }}>
                {quickStatus}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={inlineLabelStyle}>Марка</span>
          <select
            value={state.grade}
            onChange={e => selectMetal(state.metalGroup, e.target.value)}
            style={{
              flex: 1, height: 30,
              border: '1px solid var(--outline)',
              borderRadius: 6,
              background: 'var(--surface)',
              padding: '0 8px',
              fontSize: 'var(--text-sm)' as string,
              color: 'var(--on-surface)',
              fontFamily: 'Manrope, sans-serif',
              outline: 'none', cursor: 'pointer',
            }}
          >
            {grades.map(g => <option key={g.grade}>{g.grade}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: gridCols, gap: 8 }}>
          {state.profile.params.map(p => (
            <div key={p.key}>
              <div style={fieldLabelStyle}>{p.label}</div>
              <InputWithUnit
                value={state.params[p.key] ?? ''}
                unit={p.unit}
                onChange={v => setParam(p.key, v)}
              />
            </div>
          ))}

          {!state.profile.isVolume && (
            <>
              <div>
                <div style={fieldLabelStyle}>{calcMode === 'length' ? 'Масса' : 'Длина L'}</div>
                <InputWithUnit
                  value={calcMode === 'length' ? (state.mass ?? '') : (state.length ?? '')}
                  unit={calcMode === 'length' ? 'кг.' : 'м.'}
                  onChange={handleSourceValueChange}
                />
              </div>

              <div>
                <div style={fieldLabelStyle}>{calcMode === 'length' ? 'Длина' : 'Масса'}</div>
                <ReadonlyValueWithUnit
                  value={calcMode === 'length' ? resultLength : resultMass}
                  unit={calcMode === 'length' ? 'м' : 'кг'}
                />
              </div>
            </>
          )}

          <div>
            <div style={fieldLabelStyle}>Количество</div>
            <div style={{
              display: 'flex', height: 30,
              border: '1px solid var(--outline)',
              borderRadius: 6, overflow: 'hidden',
            }}>
              <button onClick={decrementQty} style={qtyBtnStyle} aria-label="Уменьшить количество">−</button>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 'var(--text-sm)' as string, fontWeight: 600,
                color: 'var(--on-surface)',
                background: 'var(--surface)',
                borderInlineStart: '1px solid var(--outline-variant)',
                borderInlineEnd: '1px solid var(--outline-variant)',
              }}>
                {state.quantity} шт
              </div>
              <button onClick={incrementQty} style={qtyBtnStyle} aria-label="Увеличить количество">+</button>
            </div>
          </div>
        </div>

        <button
          onClick={calculate}
          style={{
            background: 'var(--primary)', color: '#fff', border: 'none',
            borderRadius: 6, padding: '7px 20px',
            fontSize: 'var(--text-sm)' as string,
            fontWeight: 600, fontFamily: 'Manrope, sans-serif',
            cursor: 'pointer', letterSpacing: '.04em',
            transition: 'background .15s',
            alignSelf: 'flex-start',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--primary-dark)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--primary)')}
        >
          Рассчитать
        </button>

        {state.error && (
          <div role="alert" style={{
            background: 'var(--error-container)',
            borderRadius: 6, padding: '7px 10px',
            fontSize: 'var(--text-xs)' as string,
            color: 'var(--error)',
          }}>
            {state.error.message}
          </div>
        )}

        {state.snackbar && (
          <div role="status" style={{
            background: 'var(--surface-container)',
            borderRadius: 6, padding: '7px 10px',
            fontSize: 'var(--text-xs)' as string,
            color: 'var(--on-surface)', lineHeight: 1.5,
          }}>
            {state.snackbar.message}
          </div>
        )}
      </div>

      <div style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--outline-variant)',
        padding: '10px 14px',
        display: 'flex', alignItems: 'flex-start', gap: 0,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={resLabelStyle}>{calcMode === 'length' ? 'Длина' : 'Вес'}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{
              fontSize: 'var(--text-xl)' as string, fontWeight: 700,
              color: 'var(--on-surface)',
              fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em',
            }}>
              {displayResult != null ? displayResult.toFixed(3) : '—'}
            </span>
            <span style={{ fontSize: 'var(--text-sm)' as string, color: 'var(--on-surface-variant)' }}>
              {calcMode === 'length' ? 'м' : 'кг'}
            </span>
          </div>
          {massMin != null && massMax != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
              <span style={{
                background: 'var(--success-container)', color: 'var(--success)',
                padding: '1px 5px', borderRadius: 4,
                fontSize: 'var(--text-xs)' as string, fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {massMin.toFixed(2)}
              </span>
              <span style={{ fontSize: 9, color: 'var(--outline)' }}>···</span>
              <span style={{
                background: 'var(--error-container)', color: 'var(--error)',
                padding: '1px 5px', borderRadius: 4,
                fontSize: 'var(--text-xs)' as string, fontWeight: 500,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {massMax.toFixed(2)}
              </span>
              <span style={{ fontSize: 'var(--text-xs)' as string, color: 'var(--on-surface-variant)' }}>кг</span>
            </div>
          )}
        </div>

        {state.result?.linearMass != null && state.result.linearMass > 0 && (
          <>
            <div style={{
              width: 1, background: 'var(--outline-variant)',
              alignSelf: 'stretch', margin: '0 14px',
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={resLabelStyle}>Погонный вес</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{
                  fontSize: 'var(--text-lg)' as string, fontWeight: 600,
                  color: 'var(--on-surface)', fontVariantNumeric: 'tabular-nums',
                }}>
                  {state.result.linearMass.toFixed(4)}
                </span>
                <span style={{ fontSize: 'var(--text-xs)' as string, color: 'var(--on-surface-variant)' }}>кг/м</span>
              </div>
            </div>
          </>
        )}

        {tolerance && calcMode === 'mass' && (
          <div style={{ marginInlineStart: 'auto', alignSelf: 'center' }}>
            <span style={{
              background: 'var(--primary-container)',
              color: 'var(--on-primary-container)',
              border: '1px solid var(--outline-variant)',
              borderRadius: 100,
              padding: '3px 10px',
              fontSize: 'var(--text-xs)' as string,
              fontWeight: 500, whiteSpace: 'nowrap',
            }}>
              {tolerance.label}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

function InputWithUnit({ value, unit, onChange }: {
  value: number | string
  unit: string
  onChange: (v: number | null) => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', height: 30,
      border: '1px solid var(--outline)', borderRadius: 6, overflow: 'hidden',
      background: 'var(--surface)',
    }}>
      <input
        type="number"
        value={value}
        min={0} step={0.1}
        onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : null)}
        style={{
          flex: 1, border: 'none', background: 'transparent',
          padding: '0 8px',
          fontSize: 'var(--text-sm)' as string,
          color: 'var(--on-surface)',
          fontFamily: 'Manrope, sans-serif', outline: 'none', minWidth: 0,
        }}
      />
      <span style={{
        padding: '0 7px',
        fontSize: 'var(--text-xs)' as string,
        fontWeight: 500,
        color: 'var(--on-surface-variant)',
        borderInlineStart: '1px solid var(--outline-variant)',
        display: 'flex', alignItems: 'center',
        background: 'var(--surface-container)',
        whiteSpace: 'nowrap',
      }}>
        {unit}
      </span>
    </div>
  )
}

function ReadonlyValueWithUnit({ value, unit }: {
  value: number | null
  unit: string
}) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'stretch',
      height: 30,
      border: '1px solid var(--outline-variant)',
      borderRadius: 6,
      overflow: 'hidden',
      background: 'var(--surface-container)',
      opacity: value == null ? 0.75 : 1,
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        padding: '0 8px',
        fontSize: 'var(--text-sm)' as string,
        color: 'var(--on-surface)',
        fontVariantNumeric: 'tabular-nums',
        minWidth: 0,
      }}>
        {value != null ? value.toFixed(3) : '—'}
      </div>
      <span style={{
        padding: '0 7px',
        fontSize: 'var(--text-xs)' as string,
        fontWeight: 500,
        color: 'var(--on-surface-variant)',
        borderInlineStart: '1px solid var(--outline-variant)',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--surface)',
        whiteSpace: 'nowrap',
      }}>
        {unit}
      </span>
    </div>
  )
}

const inlineLabelStyle: React.CSSProperties = {
  fontSize: 'var(--text-xs)' as string,
  fontWeight: 600,
  color: 'var(--on-surface-variant)',
  whiteSpace: 'nowrap', minWidth: 38,
}

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 'var(--text-xs)' as string,
  fontWeight: 600,
  color: 'var(--on-surface-variant)',
  textTransform: 'uppercase', letterSpacing: '.06em',
  marginBottom: 3,
}

const resLabelStyle: React.CSSProperties = {
  fontSize: 'var(--text-xs)' as string,
  fontWeight: 600,
  color: 'var(--on-surface-variant)',
  textTransform: 'uppercase', letterSpacing: '.06em',
}

const qtyBtnStyle: React.CSSProperties = {
  width: 28, border: 'none',
  background: 'var(--surface-container)' as string,
  color: 'var(--on-surface-variant)' as string,
  fontSize: 16, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
  flexShrink: 0, transition: 'background .1s',
}

const quickChipStyle: React.CSSProperties = {
  border: '1px solid var(--outline-variant)',
  background: 'var(--surface-container)',
  color: 'var(--on-surface)',
  borderRadius: 999,
  padding: '2px 8px',
  fontSize: 'var(--text-xs)' as string,
  fontWeight: 600,
}
