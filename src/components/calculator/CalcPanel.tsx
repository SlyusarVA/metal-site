'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getWeightTolerance } from '@/data/gost'
import { ProfileKey } from '@/data/profiles'
import ProfileDiagram from './ProfileDiagram'
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
  const { state, selectMetal, setParam, setLength, setMass, incrementQty, decrementQty, calculate, resetAll } = calc
  const [calcMode, setCalcMode] = useState<'mass' | 'length'>('mass')

  const grades = getGrades(state.metalGroup)
  const tolerance = getWeightTolerance(state.profileKey, Object.fromEntries(
    Object.entries(state.params).filter(([,v]) => v !== null) as [string, number][]
  ))

  const handleGradeChange = (grade: string) => {
    selectMetal(state.metalGroup, grade)
  }

  const handleCalculate = () => {
    calculate()
  }

  const resultMass = state.result?.target === 'mass' ? state.result.value : (state.mass ?? null)
  const resultLength = state.result?.target === 'length' ? state.result.value : (state.length ?? null)
  const displayResult = calcMode === 'mass' ? resultMass : resultLength

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--surface-variant)' }}>

      {/* Заголовок */}
      <div style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--outline-variant)',
        padding: '14px 24px 10px',
      }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)', margin: 0 }}>
          Расчёт веса {state.metalGroup.toLowerCase()} · {state.profile.name}
        </h2>
        <div style={{ marginTop: 8 }}>
          <GostTags
            profile={state.profile}
            density={state.density}
            onGostClick={(code) => router.push(`/gost/${encodeURIComponent(code)}`)}
          />
        </div>
      </div>

      {/* Тело */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Диаграмма + поиск ГОСТ */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          borderRight: '1px solid var(--outline-variant)',
          background: 'var(--surface)',
        }}>
          {/* Строка поиска */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--outline-variant)' }}>
            <GostSearchBar onResult={onGostResult} onClear={onGostClear} />
          </div>

          {/* Подсказка выбрать сортамент */}
          {needsSortament && (
            <div style={{
              background: '#FFF8E1',
              borderBottom: '1px solid #FFE082',
              padding: '8px 16px',
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 12, color: '#E65100', fontWeight: 500,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              Выберите сортамент в колонке слева
            </div>
          )}

          {/* Диаграмма */}
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <ProfileDiagram profileKey={state.profileKey} params={Object.fromEntries(
              Object.entries(state.params).map(([k,v]) => [k, v ?? 0])
            )} />
          </div>
        </div>

        {/* Форма */}
        <div style={{ width: 340, padding: '20px 20px', overflowY: 'auto', background: 'var(--surface)', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Переключатель режима */}
          <div style={{ display: 'flex', background: 'var(--surface-container)', borderRadius: 'var(--radius-full)', padding: 3 }}>
            {(['mass', 'length'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setCalcMode(mode)}
                style={{
                  flex: 1, border: 'none', cursor: 'pointer',
                  borderRadius: 'var(--radius-full)',
                  padding: '7px 8px',
                  fontSize: 12, fontWeight: 500,
                  fontFamily: 'Manrope, sans-serif',
                  background: calcMode === mode ? 'var(--surface)' : 'transparent',
                  color: calcMode === mode ? 'var(--primary)' : 'var(--on-surface-variant)',
                  boxShadow: calcMode === mode ? 'var(--shadow-1)' : 'none',
                  transition: 'all .2s var(--motion-standard)',
                }}
              >
                {mode === 'mass' ? 'Расчёт веса' : 'Расчёт длины'}
              </button>
            ))}
          </div>

          {/* Марка */}
          <Field label="Марка металла">
            <select
              value={state.grade}
              onChange={e => handleGradeChange(e.target.value)}
              style={selectStyle}
            >
              {grades.map(g => <option key={g.grade}>{g.grade}</option>)}
            </select>
          </Field>

          {/* Размерные поля */}
          {state.profile.params.map(p => (
            <Field key={p.key} label={p.label}>
              <input
                type="number"
                value={state.params[p.key] ?? ''}
                min={0}
                step={0.1}
                onChange={e => setParam(p.key, e.target.value ? parseFloat(e.target.value) : null)}
                style={inputStyle}
              />
              <Unit>{p.unit}</Unit>
            </Field>
          ))}

          {/* Количество */}
          <div>
            <div style={labelStyle}>Количество</div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <QtyBtn onClick={decrementQty}>−</QtyBtn>
              <div style={{ flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 600, background: 'var(--surface-container)', borderRadius: 'var(--radius-sm)', padding: '9px 0' }}>
                {state.quantity} шт
              </div>
              <QtyBtn onClick={incrementQty}>+</QtyBtn>
            </div>
          </div>

          {/* Длина или Масса (в зависимости от режима) */}
          {!state.profile.isVolume && (
            <Field label={calcMode === 'mass' ? 'Длина L' : 'Масса'}>
              <input
                type="number"
                value={calcMode === 'mass' ? (state.length ?? '') : (state.mass ?? '')}
                min={0}
                step={0.01}
                onChange={e => {
                  const v = e.target.value ? parseFloat(e.target.value) : null
                  calcMode === 'mass' ? setLength(v) : setMass(v)
                }}
                style={inputStyle}
              />
              <Unit>{calcMode === 'mass' ? 'м.' : 'кг.'}</Unit>
            </Field>
          )}

          {/* Кнопка рассчитать */}
          <button
            onClick={handleCalculate}
            style={{
              background: '#1565C0',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-full)',
              padding: '12px',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'Manrope, sans-serif',
              cursor: 'pointer',
              letterSpacing: '.06em',
              transition: 'background .15s',
              marginTop: 4,
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#1976D2')}
            onMouseLeave={e => (e.currentTarget.style.background = '#1565C0')}
          >
            РАССЧИТАТЬ
          </button>

          {/* Ошибка */}
          {state.error && (
            <div style={{ background: 'var(--error-container)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', fontSize: 13, color: 'var(--error)' }}>
              {state.error.message}
            </div>
          )}

          {/* Снэкбар автокоррекции */}
          {state.snackbar && (
            <div style={{ background: '#1A1C1E', borderRadius: 'var(--radius-sm)', padding: '10px 14px', fontSize: 12, color: '#fff', lineHeight: 1.5 }}>
              {state.snackbar.message}
            </div>
          )}
        </div>
      </div>

      {/* Строка результата */}
      <div style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--outline-variant)',
        padding: '12px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginBottom: 2 }}>
            {calcMode === 'mass' ? 'Вес' : 'Длина'}
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--on-surface)' }}>
            {displayResult != null ? displayResult.toFixed(3) : '0.000'}
            <span style={{ fontSize: 14, fontWeight: 400, color: 'var(--on-surface-variant)', marginLeft: 6 }}>
              {calcMode === 'mass' ? 'кг.' : 'м.'}
            </span>
          </div>
        </div>

        {state.result?.linearMass != null && state.result.linearMass > 0 && (
          <div style={{ borderLeft: '1px solid var(--outline-variant)', paddingLeft: 24 }}>
            <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', marginBottom: 2 }}>Погонный вес</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--on-surface)' }}>
              {state.result.linearMass.toFixed(4)}
              <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--on-surface-variant)', marginLeft: 4 }}>кг/м</span>
            </div>
          </div>
        )}

        {tolerance && (
          <div style={{ marginLeft: 'auto', background: 'var(--primary-container)', color: 'var(--on-primary-container)', borderRadius: 'var(--radius-full)', padding: '4px 14px', fontSize: 12, fontWeight: 500 }}>
            {tolerance.label}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Вспомогательные компоненты ─────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--outline)', borderRadius: 'var(--radius-sm)', overflow: 'hidden', background: 'var(--surface)' }}>
        {children}
      </div>
    </div>
  )
}

function Unit({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ padding: '0 10px', fontSize: 12, color: 'var(--on-surface-variant)', borderLeft: '1px solid var(--outline-variant)', whiteSpace: 'nowrap', flexShrink: 0 }}>
      {children}
    </span>
  )
}

function QtyBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 40, height: 40, border: 'none', borderRadius: 'var(--radius-sm)',
        background: '#1565C0', color: '#fff', fontSize: 18, fontWeight: 600,
        cursor: 'pointer', fontFamily: 'Manrope, sans-serif', flexShrink: 0,
        transition: 'background .12s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#1976D2')}
      onMouseLeave={e => (e.currentTarget.style.background = '#1565C0')}
    >
      {children}
    </button>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', marginBottom: 5,
}

const inputStyle: React.CSSProperties = {
  flex: 1, border: 'none', background: 'transparent', padding: '9px 10px',
  fontSize: 13, color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif', outline: 'none',
}

const selectStyle: React.CSSProperties = {
  flex: 1, border: 'none', background: 'transparent', padding: '9px 10px',
  fontSize: 13, color: 'var(--on-surface)', fontFamily: 'Manrope, sans-serif', outline: 'none', cursor: 'pointer',
}
