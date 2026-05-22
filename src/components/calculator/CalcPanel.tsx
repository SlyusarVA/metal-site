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

  // Мин/макс с допуском по ГОСТ — используем plus/minus из WeightTolerance
  const massMin = resultMass != null && tolerance != null
    ? resultMass * (1 - tolerance.minus)
    : null
  const massMax = resultMass != null && tolerance != null
    ? resultMass * (1 + tolerance.plus)
    : null

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'var(--surface-variant, #F3F4F6)',
      minWidth: 0,
    }}>

      {/* ── Шапка ── */}
      <div style={{
        background: 'var(--surface, #fff)',
        borderBottom: '1px solid var(--outline-variant, #E5E7EB)',
        padding: '10px 14px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface, #111827)', whiteSpace: 'nowrap' }}>
          {state.metalGroup} · {state.profile.name}
        </span>
        <GostTags
          profile={state.profile}
          density={state.density}
          onGostClick={(code) => router.push(`/gost/${encodeURIComponent(code)}`)}
        />
      </div>

      {/* ── Поиск ГОСТ ── */}
      <div style={{
        background: 'var(--surface, #fff)',
        borderBottom: '1px solid var(--outline-variant, #E5E7EB)',
        padding: '7px 14px',
        flexShrink: 0,
      }}>
        <GostSearchBar onResult={onGostResult} onClear={onGostClear} />
      </div>

      {/* ── Подсказка сортамент ── */}
      {needsSortament && (
        <div style={{
          background: '#FFF8E1',
          borderBottom: '1px solid #FFE082',
          padding: '7px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: '#E65100', fontWeight: 500,
          flexShrink: 0,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Выберите сортамент в колонке слева
        </div>
      )}

      {/* ── Форма ── */}
      <div style={{
        flex: 1,
        padding: '12px 14px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}>

        {/* Переключатель режима */}
        <div style={{
          display: 'flex',
          background: 'var(--surface-container, #F3F4F6)',
          borderRadius: 20,
          padding: 2,
          border: '1px solid var(--outline-variant, #E5E7EB)',
          width: 'fit-content',
        }}>
          {(['mass', 'length'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setCalcMode(mode)}
              style={{
                border: 'none', cursor: 'pointer',
                borderRadius: 18,
                padding: '5px 14px',
                fontSize: 11, fontWeight: 500,
                fontFamily: 'Manrope, sans-serif',
                background: calcMode === mode ? 'var(--surface, #fff)' : 'transparent',
                color: calcMode === mode ? '#1565C0' : 'var(--on-surface-variant, #6B7280)',
                boxShadow: calcMode === mode ? '0 1px 3px rgba(0,0,0,.1)' : 'none',
                transition: 'all .15s',
                whiteSpace: 'nowrap',
              }}
            >
              {mode === 'mass' ? 'Расчёт веса' : 'Расчёт длины'}
            </button>
          ))}
        </div>

        {/* Марка — компактная строка */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={inlineLabelStyle}>Марка</span>
          <select
            value={state.grade}
            onChange={e => selectMetal(state.metalGroup, e.target.value)}
            style={{
              flex: 1,
              height: 30,
              border: '1px solid var(--outline, #D1D5DB)',
              borderRadius: 6,
              background: 'var(--surface, #fff)',
              padding: '0 8px',
              fontSize: 12,
              color: 'var(--on-surface, #111827)',
              fontFamily: 'Manrope, sans-serif',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {grades.map(g => <option key={g.grade}>{g.grade}</option>)}
          </select>
        </div>

        {/* Размерные поля — сетка 2 колонки */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
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

          {/* Длина / Масса */}
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
            <div style={{ display: 'flex', height: 30, border: '1px solid var(--outline, #D1D5DB)', borderRadius: 6, overflow: 'hidden' }}>
              <button onClick={decrementQty} style={qtyBtnStyle}>−</button>
              <div style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600, color: 'var(--on-surface, #111827)',
                background: 'var(--surface, #fff)',
                borderLeft: '1px solid var(--outline-variant, #E5E7EB)',
                borderRight: '1px solid var(--outline-variant, #E5E7EB)',
              }}>
                {state.quantity} шт
              </div>
              <button onClick={incrementQty} style={qtyBtnStyle}>+</button>
            </div>
          </div>
        </div>

        {/* Кнопка расчёта */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={calculate}
            style={{
              background: '#1565C0', color: '#fff', border: 'none',
              borderRadius: 6, padding: '7px 20px',
              fontSize: 12, fontWeight: 600, fontFamily: 'Manrope, sans-serif',
              cursor: 'pointer', letterSpacing: '.04em',
              transition: 'background .15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1344B8')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1565C0')}
          >
            Рассчитать
          </button>
        </div>

        {state.error && (
          <div style={{
            background: 'var(--error-container, #FEE2E2)',
            borderRadius: 6, padding: '7px 10px',
            fontSize: 11, color: 'var(--error, #B91C1C)',
          }}>
            {state.error.message}
          </div>
        )}

        {state.snackbar && (
          <div style={{
            background: '#1A1C1E', borderRadius: 6,
            padding: '7px 10px', fontSize: 11, color: '#fff', lineHeight: 1.5,
          }}>
            {state.snackbar.message}
          </div>
        )}
      </div>

      {/* ── Строка результата ── */}
      <div style={{
        background: 'var(--surface, #fff)',
        borderTop: '1px solid var(--outline-variant, #E5E7EB)',
        padding: '10px 14px',
        display: 'flex', alignItems: 'flex-start', gap: 0,
        flexShrink: 0,
      }}>

        {/* Вес */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={resLabelStyle}>{calcMode === 'mass' ? 'Вес' : 'Длина'}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--on-surface, #111827)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-.02em' }}>
              {displayResult != null ? displayResult.toFixed(3) : '—'}
            </span>
            <span style={{ fontSize: 12, color: 'var(--on-surface-variant, #6B7280)' }}>
              {calcMode === 'mass' ? 'кг' : 'м'}
            </span>
          </div>
          {/* Мин / Макс по ГОСТ */}
          {massMin != null && massMax != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
              <span style={rangeTagStyle('#f0fdf4', '#166534')}>{massMin.toFixed(2)}</span>
              <span style={{ fontSize: 9, color: '#9CA3AF' }}>···</span>
              <span style={rangeTagStyle('#fef2f2', '#991b1b')}>{massMax.toFixed(2)}</span>
              <span style={{ fontSize: 10, color: '#9CA3AF' }}>кг</span>
            </div>
          )}
        </div>

        {/* Погонный вес */}
        {state.result?.linearMass != null && state.result.linearMass > 0 && (
          <>
            <div style={{ width: 1, background: 'var(--outline-variant, #E5E7EB)', alignSelf: 'stretch', margin: '0 14px' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={resLabelStyle}>Погонный вес</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface, #111827)', fontVariantNumeric: 'tabular-nums' }}>
                  {state.result.linearMass.toFixed(4)}
                </span>
                <span style={{ fontSize: 11, color: 'var(--on-surface-variant, #6B7280)' }}>кг/м</span>
              </div>
            </div>
          </>
        )}

        {/* Допуск ГОСТ */}
        {tolerance && (
          <div style={{ marginLeft: 'auto', alignSelf: 'center' }}>
            <span style={{
              background: '#EFF4FF',
              color: '#1E3A8A',
              border: '1px solid #D1DEFE',
              borderRadius: 100,
              padding: '3px 10px',
              fontSize: 11, fontWeight: 500,
              whiteSpace: 'nowrap',
            }}>
              {tolerance.label}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Вспомогательные компоненты ────────────────────────────────────────

function InputWithUnit({
  value, unit, onChange,
}: {
  value: number | string
  unit: string
  onChange: (v: number | null) => void
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch', height: 30,
      border: '1px solid var(--outline, #D1D5DB)', borderRadius: 6, overflow: 'hidden',
      background: 'var(--surface, #fff)',
    }}>
      <input
        type="number"
        value={value}
        min={0} step={0.1}
        onChange={e => onChange(e.target.value ? parseFloat(e.target.value) : null)}
        style={{
          flex: 1, border: 'none', background: 'transparent',
          padding: '0 8px', fontSize: 12,
          color: 'var(--on-surface, #111827)',
          fontFamily: 'Manrope, sans-serif', outline: 'none', minWidth: 0,
        }}
      />
      <span style={{
        padding: '0 7px', fontSize: 11, fontWeight: 500,
        color: 'var(--on-surface-variant, #6B7280)',
        borderLeft: '1px solid var(--outline-variant, #E5E7EB)',
        display: 'flex', alignItems: 'center',
        background: 'var(--surface-container, #F9FAFB)',
        whiteSpace: 'nowrap',
      }}>
        {unit}
      </span>
    </div>
  )
}

function rangeTagStyle(bg: string, color: string): React.CSSProperties {
  return {
    background: bg, color, padding: '1px 5px',
    borderRadius: 4, fontSize: 10, fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  }
}

const inlineLabelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600,
  color: 'var(--on-surface-variant, #6B7280)',
  whiteSpace: 'nowrap', minWidth: 38,
}

const fieldLabelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 600,
  color: 'var(--on-surface-variant, #6B7280)',
  textTransform: 'uppercase', letterSpacing: '.06em',
  marginBottom: 3,
}

const resLabelStyle: React.CSSProperties = {
  fontSize: 10, fontWeight: 600,
  color: 'var(--on-surface-variant, #6B7280)',
  textTransform: 'uppercase', letterSpacing: '.06em',
}

const qtyBtnStyle: React.CSSProperties = {
  width: 28, border: 'none', background: '#F3F4F6',
  color: '#374151', fontSize: 16, fontWeight: 600,
  cursor: 'pointer', fontFamily: 'Manrope, sans-serif',
  flexShrink: 0, transition: 'background .1s',
}
