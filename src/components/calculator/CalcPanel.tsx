'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getWeightTolerance } from '@/data/gost'
import { ProfileKey } from '@/data/profiles'
import GostTags from './GostTags'
import GostSearchBar from './GostSearchBar'

interface Props {
  calc: ReturnType<typeof import('@/hooks/useCalculator').useCalculator>
  getGrades: (group: string) => import('@/data/materials').MetalMaterial[]
  onGostResult: (metalGroups: string[], profileKeys: ProfileKey[], grade?: string) => void
  needsSortament?: boolean
  onGostClear: () => void
}

export default function CalcPanel({ calc, getGrades, onGostResult, onGostClear, needsSortament }: Props) {
  const router = useRouter()
  const { state, selectMetal, setParam, setLength, setMass, incrementQty, decrementQty, calculate } = calc
  const [calcMode, setCalcMode] = useState<'mass' | 'length'>('mass')

  const grades = getGrades(state.metalGroup)
  const tolerance = getWeightTolerance(state.profileKey, Object.fromEntries(
    Object.entries(state.params).filter(([, v]) => v !== null) as [string, number][]
  ))

  const resultMass = state.result?.target === 'mass' ? state.result.value : (state.mass ?? null)
  const resultLength = state.result?.target === 'length' ? state.result.value : (state.length ?? null)
  const displayResult = calcMode === 'mass' ? resultMass : resultLength

  const massMin = resultMass != null && tolerance != null ? resultMass * (1 - tolerance.minus) : null
  const massMax = resultMass != null && tolerance != null ? resultMass * (1 + tolerance.plus) : null

  // Адаптивная сетка: на узких экранах — 1 колонка
  const gridFieldCount =
    state.profile.params.length +
    (state.profile.isVolume ? 0 : 1) +
    1
  const gridCols = gridFieldCount <= 2
    ? '1fr'
    : 'repeat(auto-fill, minmax(140px, 1fr))'

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--surface-variant)',
      minWidth: 0,
    }}>

      {/* Шапка */}
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

      {/* Поиск ГОСТ */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--outline-variant)',
        padding: '7px 14px', flexShrink: 0,
      }}>
        <GostSearchBar onResult={onGostResult} onClear={onGostClear} />
      </div>

      {/* Подсказка выбрать сортамент */}
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

      {/* Форма */}
      <div style={{
        flex: 1, padding: '12px 14px',
        overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>

        {/* Переключатель режима */}
        <div style={{
          display: 'flex',
          background: 'var(--surface-container)',
          borderRadius: 20, padding: 2,
          border: '1px solid var(--outline-variant)',
          width: 'fit-content',
        }}>
          {(['mass', 'length'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setCalcMode(mode)}
              aria-pressed={calcMode === mode}
              style={{
                border: 'none', cursor: 'pointer',
                borderRadius: 18,
                padding: '5px 14px',
                fontSize: 'var(--text-xs)' as string,
                fontWeight: 500,
                fontFamily: 'Manrope, sans-serif',
                background: calcMode === mode ? 'var(--surface)' : 'transparent',
                color: calcMode === mode ? 'var(--primary)' : 'var(--on-surface-variant)',
                boxShadow: calcMode === mode ? 'var(--shadow-1)' : 'none',
                transition: 'all .15s',
                whiteSpace: 'nowrap',
              }}
            >
              {mode === 'mass' ? 'Расчёт веса' : 'Расчёт длины'}
            </button>
          ))}
        </div>

        {/* Марка */}
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

        {/* Размерные поля */}
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
            <div>
              <div style={fieldLabelStyle}>{calcMode === 'mass' ? 'Длина L' : 'Масса'}</div>
              <InputWithUnit
                value={calcMode === 'mass' ? (state.length ?? '') : (state.mass ?? '')}
                unit={calcMode === 'mass' ? 'м.' : 'кг.'}
                onChange={v => calcMode === 'mass' ? setLength(v) : setMass(v)}
              />
            </div>
          )}

          {/* Количество */}
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

        {/* Кнопка расчёта */}
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

      {/* Результат */}
      <div style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--outline-variant)',
        padding: '10px 14px',
        display: 'flex', alignItems: 'flex-start', gap: 0,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={resLabelStyle}>{calcMode === 'mass' ? 'Вес' : 'Длина'}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{
              fontSize: 'var(--text-xl)' as string, fontWeight: 700,
              color: 'var(--on-surface)',
              fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em',
            }}>
              {displayResult != null ? displayResult.toFixed(3) : '—'}
            </span>
            <span style={{ fontSize: 'var(--text-sm)' as string, color: 'var(--on-surface-variant)' }}>
              {calcMode === 'mass' ? 'кг' : 'м'}
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

        {tolerance && (
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
